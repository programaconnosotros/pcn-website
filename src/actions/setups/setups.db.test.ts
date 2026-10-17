import { randomUUID } from 'node:crypto';
import prisma from '@/lib/prisma';
import * as s3 from '@/lib/s3';
import { optimizePhoto } from '@/lib/photo-processing';
import {
  createSetup,
  deleteSetup,
  getSetupUploadForm,
  toggleSetupLike,
  updateSetup,
} from '@/actions/setups/setup-actions';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser, uid } from '@/test/db/actions-fixtures';

// Setups contra Postgres real. S3 y sharp se reemplazan: lo que se prueba es qué queda en la base
// y qué archivos se piden borrar.

jest.mock('@/lib/s3', () => ({
  getObjectBuffer: jest.fn(),
  putImmutableObject: jest.fn(),
  deleteObjects: jest.fn(),
  deleteObjectsOrLog: jest.fn(),
  getPresignedPost: jest.fn(),
  publicFileUrl: jest.fn((key: string) => `https://cdn.test/${key}`),
}));

jest.mock('@/lib/photo-processing', () => ({ optimizePhoto: jest.fn() }));

const mocked = s3 as jest.Mocked<typeof s3>;

beforeEach(() => {
  mocked.getObjectBuffer.mockResolvedValue(Buffer.from('original'));
  mocked.putImmutableObject.mockResolvedValue(undefined as never);
  mocked.deleteObjects.mockResolvedValue(undefined as never);
  mocked.deleteObjectsOrLog.mockResolvedValue(undefined as never);
  mocked.getPresignedPost.mockResolvedValue({ url: 'https://s3.test', fields: { a: 'b' } });
  (optimizePhoto as jest.Mock).mockResolvedValue({
    full: Buffer.from('full'),
    thumb: Buffer.from('thumb'),
    width: 1600,
    height: 900,
  });
});

const ownKey = (userId: string) => `setups/originals/${userId}/${randomUUID()}.jpg`;
const details = {
  title: 'Mi escritorio',
  description: 'Monitor ultrawide y teclado mecánico',
  date: '2026-05-10',
};

const makeSetup = (authorId: string) =>
  prisma.setup.create({
    data: {
      authorId,
      title: `Setup ${uid()}`,
      description: 'Una descripción del setup',
      imageUrl: 'https://cdn.test/old/full.webp',
      thumbUrl: 'https://cdn.test/old/thumb.webp',
      width: 800,
      height: 600,
      storageKeys: ['setups/old/full.webp', 'setups/old/thumb.webp'],
    },
  });

describe('getSetupUploadForm', () => {
  it('signs an upload into the user’s own originals folder', async () => {
    const user = await quickUser();
    await actAs(user.id);

    const form = await getSetupUploadForm('image/png');

    expect(form.key).toMatch(new RegExp(`^setups/originals/${user.id}/[0-9a-f-]{36}\\.png$`));
    expect(mocked.getPresignedPost).toHaveBeenCalledWith(form.key, 'image/png', expect.any(Number));
  });

  it('refuses unsupported formats and anonymous visitors', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await expect(getSetupUploadForm('image/gif')).rejects.toThrow('Formato no soportado');
    await actAs();
    await expect(getSetupUploadForm('image/png')).rejects.toThrow('Debes estar autenticado');
  });
});

describe('createSetup', () => {
  it('stores the optimized photo and details under the session user', async () => {
    const user = await quickUser();
    await actAs(user.id);
    const key = ownKey(user.id);

    const { id } = await createSetup(key, { ...details, title: '  Mi escritorio  ' });

    const setup = await prisma.setup.findUniqueOrThrow({ where: { id } });
    expect(setup).toMatchObject({
      authorId: user.id,
      title: 'Mi escritorio',
      width: 1600,
      height: 900,
    });
    expect(setup.storageKeys).toHaveLength(2);
    expect(setup.imageUrl).toBe(`https://cdn.test/${setup.storageKeys[0]}`);
    expect(setup.thumbUrl).toBe(`https://cdn.test/${setup.storageKeys[1]}`);
    // El original se borra después de optimizarlo
    expect(mocked.deleteObjectsOrLog).toHaveBeenCalledWith([key]);
    expect(expiredModel('Setup')).toBe(true);
  });

  it('refuses an original uploaded by someone else, before touching S3 or the database', async () => {
    const user = await quickUser();
    const other = await quickUser();
    await actAs(user.id);

    await expect(createSetup(ownKey(other.id), details)).rejects.toThrow('Archivo inválido');
    await expect(createSetup(`setups/originals/${user.id}/../x.jpg`, details)).rejects.toThrow(
      'Archivo inválido',
    );
    expect(mocked.getObjectBuffer).not.toHaveBeenCalled();
    expect(await prisma.setup.count({ where: { authorId: user.id } })).toBe(0);
  });

  it('refuses invalid details without processing the photo', async () => {
    const user = await quickUser();
    await actAs(user.id);

    await expect(
      createSetup(ownKey(user.id), { title: 'ab', description: 'corta', date: '2026-05-10' }),
    ).rejects.toThrow();
    expect(mocked.getObjectBuffer).not.toHaveBeenCalled();
    expect(await prisma.setup.count({ where: { authorId: user.id } })).toBe(0);
  });

  it('deletes the original and stores nothing when the photo cannot be read', async () => {
    const user = await quickUser();
    await actAs(user.id);
    (optimizePhoto as jest.Mock).mockRejectedValueOnce(new Error('formato roto'));
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    const key = ownKey(user.id);

    await expect(createSetup(key, details)).rejects.toThrow('No pudimos leer la foto');
    expect(mocked.deleteObjectsOrLog).toHaveBeenCalledWith([key]);
    expect(await prisma.setup.count({ where: { authorId: user.id } })).toBe(0);
  });

  it('rejects anonymous visitors', async () => {
    await actAs();
    await expect(createSetup('setups/originals/x/y.jpg', details)).rejects.toThrow(
      'Debes estar autenticado',
    );
  });
});

describe('updateSetup', () => {
  it('lets the author change the details, keeping the photo', async () => {
    const user = await quickUser();
    const setup = await makeSetup(user.id);
    await actAs(user.id);

    await updateSetup(setup.id, details);

    const stored = await prisma.setup.findUniqueOrThrow({ where: { id: setup.id } });
    expect(stored).toMatchObject({
      ...details,
      date: new Date(`${details.date}T00:00:00Z`),
      imageUrl: setup.imageUrl,
    });
    expect(stored.storageKeys).toEqual(setup.storageKeys);
    expect(mocked.deleteObjectsOrLog).not.toHaveBeenCalled();
  });

  it('replaces the photo and deletes the old files', async () => {
    const user = await quickUser();
    const setup = await makeSetup(user.id);
    await actAs(user.id);

    await updateSetup(setup.id, details, ownKey(user.id));

    const stored = await prisma.setup.findUniqueOrThrow({ where: { id: setup.id } });
    expect(stored.storageKeys).not.toEqual(setup.storageKeys);
    expect(stored.width).toBe(1600);
    expect(mocked.deleteObjectsOrLog).toHaveBeenCalledWith(setup.storageKeys);
  });

  it('forbids anyone but the author, admins included', async () => {
    const user = await quickUser();
    const setup = await makeSetup(user.id);

    for (const other of [await quickUser(), await quickUser({ role: 'ADMIN' })]) {
      await actAs(other.id);
      await expect(updateSetup(setup.id, details)).rejects.toThrow(
        'No tenés permisos para editar este setup',
      );
    }
    expect((await prisma.setup.findUniqueOrThrow({ where: { id: setup.id } })).title).toBe(
      setup.title,
    );
  });

  it('refuses a new photo uploaded by someone else', async () => {
    const user = await quickUser();
    const other = await quickUser();
    const setup = await makeSetup(user.id);
    await actAs(user.id);

    await expect(updateSetup(setup.id, details, ownKey(other.id))).rejects.toThrow(
      'Archivo inválido',
    );
    expect((await prisma.setup.findUniqueOrThrow({ where: { id: setup.id } })).title).toBe(
      setup.title,
    );
  });

  it('fails for a setup that does not exist', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await expect(updateSetup('no-existe', details)).rejects.toThrow('Setup no encontrado');
  });
});

describe('deleteSetup', () => {
  it('lets the author delete it with its files and likes', async () => {
    const user = await quickUser();
    const fan = await quickUser();
    const setup = await makeSetup(user.id);
    await prisma.setupLike.create({ data: { setupId: setup.id, userId: fan.id } });
    await actAs(user.id);

    await deleteSetup(setup.id);

    expect(await prisma.setup.findUnique({ where: { id: setup.id } })).toBeNull();
    expect(await prisma.setupLike.count({ where: { setupId: setup.id } })).toBe(0);
    expect(mocked.deleteObjects).toHaveBeenCalledWith(setup.storageKeys);
  });

  it('lets an admin delete it', async () => {
    const setup = await makeSetup((await quickUser()).id);
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await deleteSetup(setup.id);

    expect(await prisma.setup.findUnique({ where: { id: setup.id } })).toBeNull();
  });

  it('keeps the setup when S3 fails, so it can be retried', async () => {
    const user = await quickUser();
    const setup = await makeSetup(user.id);
    await actAs(user.id);
    mocked.deleteObjects.mockRejectedValueOnce(new Error('S3 caído'));

    await expect(deleteSetup(setup.id)).rejects.toThrow('S3 caído');
    expect(await prisma.setup.findUnique({ where: { id: setup.id } })).not.toBeNull();
  });

  it('forbids another regular user', async () => {
    const setup = await makeSetup((await quickUser()).id);
    await actAs((await quickUser()).id);

    await expect(deleteSetup(setup.id)).rejects.toThrow(
      'No tenés permisos para eliminar este setup',
    );
    expect(mocked.deleteObjects).not.toHaveBeenCalled();
    expect(await prisma.setup.findUnique({ where: { id: setup.id } })).not.toBeNull();
  });
});

describe('toggleSetupLike', () => {
  it('toggles one like per user and reports how it ended', async () => {
    const setup = await makeSetup((await quickUser()).id);
    const fan = await quickUser();
    const otherFan = await quickUser();

    await actAs(fan.id);
    await expect(toggleSetupLike(setup.id)).resolves.toEqual({ liked: true });
    await actAs(otherFan.id);
    await toggleSetupLike(setup.id);
    expect(await prisma.setupLike.count({ where: { setupId: setup.id } })).toBe(2);

    await actAs(fan.id);
    await expect(toggleSetupLike(setup.id)).resolves.toEqual({ liked: false });
    const likes = await prisma.setupLike.findMany({ where: { setupId: setup.id } });
    expect(likes.map((like) => like.userId)).toEqual([otherFan.id]);
  });

  it('cannot store a duplicate like (unique constraint)', async () => {
    const setup = await makeSetup((await quickUser()).id);
    const fan = await quickUser();
    await prisma.setupLike.create({ data: { setupId: setup.id, userId: fan.id } });

    await expect(
      prisma.setupLike.create({ data: { setupId: setup.id, userId: fan.id } }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('fails on a setup that does not exist and for anonymous visitors', async () => {
    const fan = await quickUser();
    await actAs(fan.id);
    await expect(toggleSetupLike('no-existe')).rejects.toThrow();
    expect(await prisma.setupLike.count({ where: { userId: fan.id } })).toBe(0);

    await actAs();
    await expect(toggleSetupLike('no-existe')).rejects.toThrow('Debes estar autenticado');
  });
});
