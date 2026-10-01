import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { tagPhotoUser, untagPhotoUser } from './photo-tags';

const admin = { id: 'admin-1', role: 'ADMIN' as const };
const member = { id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: { id: string }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('photo tags', () => {
  beforeEach(() => {
    prismaMock.photo.findUnique.mockResolvedValue({ id: 'photo-1' } as any);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);
  });

  it('requires a logged-in user', async () => {
    mockCookies({});

    await expect(tagPhotoUser('photo-1', 'user-1')).rejects.toThrow('Debes estar autenticado');
  });

  it('lets members tag themselves', async () => {
    loginAs(member);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);

    await tagPhotoUser('photo-1', 'user-1');

    expect(prismaMock.photoTag.upsert).toHaveBeenCalledWith({
      where: { photoId_userId: { photoId: 'photo-1', userId: 'user-1' } },
      create: { photoId: 'photo-1', userId: 'user-1', taggedById: 'user-1' },
      update: {},
    });
  });

  it('does not let members tag or untag other people', async () => {
    loginAs(member);

    await expect(tagPhotoUser('photo-1', 'user-2')).rejects.toThrow('No autorizado');
    await expect(untagPhotoUser('photo-1', 'user-2')).rejects.toThrow('No autorizado');
    expect(prismaMock.photoTag.upsert).not.toHaveBeenCalled();
    expect(prismaMock.photoTag.deleteMany).not.toHaveBeenCalled();
  });

  it('lets admins tag and untag anyone', async () => {
    loginAs(admin);

    await tagPhotoUser('photo-1', 'user-2');
    await untagPhotoUser('photo-1', 'user-2');

    expect(prismaMock.photoTag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { photoId: 'photo-1', userId: 'user-2', taggedById: 'admin-1' },
      }),
    );
    expect(prismaMock.photoTag.deleteMany).toHaveBeenCalledWith({
      where: { photoId: 'photo-1', userId: 'user-2' },
    });
  });

  it('does not tag on missing photos', async () => {
    loginAs(admin);
    prismaMock.photo.findUnique.mockResolvedValue(null);

    await expect(tagPhotoUser('ghost', 'user-2')).rejects.toThrow('Foto no encontrada');
  });
});
