import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { tagGalleryItemUser, untagGalleryItemUser } from './gallery-tags';

const admin = { id: 'admin-1', role: 'ADMIN' as const };
const member = { id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: { id: string }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

describe('photo tags', () => {
  beforeEach(() => {
    prismaMock.galleryItem.findUnique.mockResolvedValue({ id: 'photo-1' } as any);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);
  });

  it('requires a logged-in user', async () => {
    mockCookies({});

    await expect(tagGalleryItemUser('photo-1', 'user-1')).rejects.toThrow(
      'Debes estar autenticado',
    );
  });

  it('lets members tag themselves', async () => {
    loginAs(member);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);

    await tagGalleryItemUser('photo-1', 'user-1');

    expect(prismaMock.galleryItemTag.upsert).toHaveBeenCalledWith({
      where: { itemId_userId: { itemId: 'photo-1', userId: 'user-1' } },
      create: { itemId: 'photo-1', userId: 'user-1', taggedById: 'user-1' },
      update: {},
    });
  });

  it('does not let members tag or untag other people', async () => {
    loginAs(member);

    await expect(tagGalleryItemUser('photo-1', 'user-2')).rejects.toThrow('No autorizado');
    await expect(untagGalleryItemUser('photo-1', 'user-2')).rejects.toThrow('No autorizado');
    expect(prismaMock.galleryItemTag.upsert).not.toHaveBeenCalled();
    expect(prismaMock.galleryItemTag.deleteMany).not.toHaveBeenCalled();
  });

  it('lets admins tag and untag anyone', async () => {
    loginAs(admin);

    await tagGalleryItemUser('photo-1', 'user-2');
    await untagGalleryItemUser('photo-1', 'user-2');

    expect(prismaMock.galleryItemTag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { itemId: 'photo-1', userId: 'user-2', taggedById: 'admin-1' },
      }),
    );
    expect(prismaMock.galleryItemTag.deleteMany).toHaveBeenCalledWith({
      where: { itemId: 'photo-1', userId: 'user-2' },
    });
  });

  it('does not tag on missing photos', async () => {
    loginAs(admin);
    prismaMock.galleryItem.findUnique.mockResolvedValue(null);

    await expect(tagGalleryItemUser('ghost', 'user-2')).rejects.toThrow('Foto no encontrada');
  });
});
