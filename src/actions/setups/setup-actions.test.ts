import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { revalidatePath } from 'next/cache';
import {
  deleteObjects,
  deleteObjectsOrLog,
  getObjectBuffer,
  getPresignedPost,
  putImmutableObject,
} from '@/lib/s3';
import { optimizePhoto } from '@/lib/photo-processing';
import {
  createSetup,
  deleteSetup,
  getSetupUploadForm,
  toggleSetupLike,
  updateSetup,
} from './setup-actions';

jest.mock('@/lib/s3', () => ({
  getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from('original')),
  putImmutableObject: jest.fn().mockResolvedValue(undefined),
  deleteObjects: jest.fn().mockResolvedValue(undefined),
  deleteObjectsOrLog: jest.fn().mockResolvedValue(undefined),
  publicFileUrl: (key: string) => `https://cdn.example.com/${key}`,
  getPresignedPost: jest.fn().mockResolvedValue({ url: 'https://s3.example.com', fields: {} }),
}));

jest.mock('@/lib/photo-processing', () => ({
  optimizePhoto: jest.fn().mockResolvedValue({
    full: Buffer.from('full'),
    thumb: Buffer.from('thumb'),
    width: 2560,
    height: 1920,
  }),
}));

const author = { id: 'user-1', role: 'REGULAR' as const };
const other = { id: 'user-2', role: 'REGULAR' as const };
const admin = { id: 'admin-1', role: 'ADMIN' as const };

const loginAs = (user: { id: string }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const originalKey = 'setups/originals/user-1/3f0c8a2e-5b1d-4c6a-9e2f-1a2b3c4d5e6f.jpg';
const details = {
  title: '  Mi escritorio  ',
  description: 'Dos monitores y un teclado split.',
  date: '2026-05-10',
};
const storedDate = new Date('2026-05-10T00:00:00Z');
const storedSetup = {
  authorId: 'user-1',
  storageKeys: ['setups/old/full.webp', 'setups/old/thumb.webp'],
};

describe('setup uploads', () => {
  it('requires a session', async () => {
    mockCookies();

    await expect(getSetupUploadForm('image/jpeg')).rejects.toThrow('Debes estar autenticado');
    await expect(createSetup(originalKey, details)).rejects.toThrow('Debes estar autenticado');
    expect(getPresignedPost).not.toHaveBeenCalled();
  });

  it('rejects formats sharp cannot read', async () => {
    loginAs(author);

    await expect(getSetupUploadForm('image/heic')).rejects.toThrow('Formato no soportado');
  });

  it("signs a size-limited upload to the user's own originals folder", async () => {
    loginAs(author);

    const { key } = await getSetupUploadForm('image/png');

    expect(key).toMatch(/^setups\/originals\/user-1\/[0-9a-f-]{36}\.png$/);
    expect(getPresignedPost).toHaveBeenCalledWith(key, 'image/png', 10 * 1024 * 1024);
  });

  it("only processes the user's own originals", async () => {
    loginAs(other);

    await expect(createSetup(originalKey, details)).rejects.toThrow('Archivo inválido');
    await expect(createSetup('profiles/x.jpg', details)).rejects.toThrow('Archivo inválido');
    await expect(createSetup('setups/originals/user-2/../user-1/x.jpg', details)).rejects.toThrow(
      'Archivo inválido',
    );
    expect(getObjectBuffer).not.toHaveBeenCalled();
  });

  it('validates the title and description', async () => {
    loginAs(author);

    await expect(
      createSetup(originalKey, { title: 'x', description: '', date: '2026-05-10' }),
    ).rejects.toThrow('al menos 3 caracteres');
    expect(getObjectBuffer).not.toHaveBeenCalled();
  });

  it('stores the optimized webp files, drops the original and saves the setup', async () => {
    loginAs(author);
    prismaMock.setup.create.mockResolvedValue({ id: 'setup-1' } as any);

    await expect(createSetup(originalKey, details)).resolves.toEqual({ id: 'setup-1' });

    const [[fullKey], [thumbKey]] = (putImmutableObject as jest.Mock).mock.calls;
    expect(fullKey).toMatch(/^setups\/[0-9a-f-]{36}\/full\.webp$/);
    expect(thumbKey).toMatch(/^setups\/[0-9a-f-]{36}\/thumb\.webp$/);
    expect(deleteObjectsOrLog).toHaveBeenCalledWith([originalKey]);
    expect(prismaMock.setup.create).toHaveBeenCalledWith({
      data: {
        title: 'Mi escritorio',
        description: 'Dos monitores y un teclado split.',
        date: storedDate,
        os: null,
        browser: null,
        editor: null,
        terminal: null,
        otherSoftware: null,
        imageUrl: `https://cdn.example.com/${fullKey}`,
        thumbUrl: `https://cdn.example.com/${thumbKey}`,
        width: 2560,
        height: 1920,
        storageKeys: [fullKey, thumbKey],
        authorId: 'user-1',
      },
      select: { id: true },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/setups');
  });

  it('drops the original when it is not a readable image', async () => {
    loginAs(author);
    (optimizePhoto as jest.Mock).mockRejectedValueOnce(new Error('unsupported image'));

    await expect(createSetup(originalKey, details)).rejects.toThrow('No pudimos leer la foto');
    expect(deleteObjectsOrLog).toHaveBeenCalledWith([originalKey]);
    expect(prismaMock.setup.create).not.toHaveBeenCalled();
  });
});

describe('setup software', () => {
  it('saves what was filled in and clears what was left empty', async () => {
    loginAs(author);
    prismaMock.setup.findUnique.mockResolvedValue(storedSetup as any);

    await updateSetup('setup-1', {
      ...details,
      os: ' macOS ',
      editor: 'Neovim',
      browser: '',
      otherSoftware: 'Raycast, Obsidian',
    });

    expect(prismaMock.setup.update).toHaveBeenCalledWith({
      where: { id: 'setup-1' },
      data: expect.objectContaining({
        os: 'macOS',
        editor: 'Neovim',
        browser: null,
        terminal: null,
        otherSoftware: 'Raycast, Obsidian',
      }),
    });
  });
});

describe('setup editing', () => {
  it('only lets the author edit', async () => {
    prismaMock.setup.findUnique.mockResolvedValue(storedSetup as any);

    for (const user of [other, admin]) {
      loginAs(user);
      await expect(updateSetup('setup-1', details)).rejects.toThrow('No tenés permisos');
    }
    expect(prismaMock.setup.update).not.toHaveBeenCalled();
  });

  it('updates the text and keeps the photo when there is no new one', async () => {
    loginAs(author);
    prismaMock.setup.findUnique.mockResolvedValue(storedSetup as any);

    await updateSetup('setup-1', details);

    expect(prismaMock.setup.update).toHaveBeenCalledWith({
      where: { id: 'setup-1' },
      data: {
        title: 'Mi escritorio',
        description: 'Dos monitores y un teclado split.',
        date: storedDate,
        os: null,
        browser: null,
        editor: null,
        terminal: null,
        otherSoftware: null,
      },
    });
    expect(deleteObjectsOrLog).not.toHaveBeenCalled();
  });

  it('replaces the photo and deletes the old files', async () => {
    loginAs(author);
    prismaMock.setup.findUnique.mockResolvedValue(storedSetup as any);

    await updateSetup('setup-1', details, originalKey);

    expect(prismaMock.setup.update).toHaveBeenCalledWith({
      where: { id: 'setup-1' },
      data: expect.objectContaining({ width: 2560, height: 1920 }),
    });
    expect(deleteObjectsOrLog).toHaveBeenCalledWith(storedSetup.storageKeys);
  });
});

describe('setup deletion', () => {
  it('does not let other users delete it', async () => {
    loginAs(other);
    prismaMock.setup.findUnique.mockResolvedValue(storedSetup as any);

    await expect(deleteSetup('setup-1')).rejects.toThrow('No tenés permisos');
    expect(prismaMock.setup.delete).not.toHaveBeenCalled();
  });

  it.each([
    ['the author', author],
    ['an admin', admin],
  ])('lets %s delete it along with its files', async (_, user) => {
    loginAs(user);
    prismaMock.setup.findUnique.mockResolvedValue(storedSetup as any);

    await deleteSetup('setup-1');

    expect(prismaMock.setup.delete).toHaveBeenCalledWith({ where: { id: 'setup-1' } });
    expect(deleteObjects).toHaveBeenCalledWith(storedSetup.storageKeys);
  });

  it('keeps the setup when S3 cannot delete its files', async () => {
    loginAs(author);
    prismaMock.setup.findUnique.mockResolvedValue(storedSetup as any);
    (deleteObjects as jest.Mock).mockRejectedValueOnce(new Error('No se pudieron borrar de S3'));

    await expect(deleteSetup('setup-1')).rejects.toThrow('No se pudieron borrar de S3');
    expect(prismaMock.setup.delete).not.toHaveBeenCalled();
  });
});

describe('setup likes', () => {
  it('requires a session', async () => {
    mockCookies();

    await expect(toggleSetupLike('setup-1')).rejects.toThrow('Debes estar autenticado');
  });

  it('likes a setup the user had not liked', async () => {
    loginAs(other);
    prismaMock.setupLike.findUnique.mockResolvedValue(null);

    await expect(toggleSetupLike('setup-1')).resolves.toEqual({ liked: true });
    expect(prismaMock.setupLike.create).toHaveBeenCalledWith({
      data: { setupId: 'setup-1', userId: 'user-2' },
    });
  });

  it('removes an existing like', async () => {
    loginAs(other);
    prismaMock.setupLike.findUnique.mockResolvedValue({ id: 'like-1' } as any);

    await expect(toggleSetupLike('setup-1')).resolves.toEqual({ liked: false });
    expect(prismaMock.setupLike.delete).toHaveBeenCalledWith({ where: { id: 'like-1' } });
  });
});
