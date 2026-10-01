import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import { deleteObjects, getObjectBuffer, putImmutableObject } from '@/lib/s3';
import {
  createPhoto,
  deleteGalleryItem,
  getPhotoUploadUrl,
  updateGalleryItem,
} from './gallery-actions';

jest.mock('@/lib/s3', () => ({
  getPresignedUploadUrl: jest.fn().mockResolvedValue({
    uploadUrl: 'https://s3.example.com/presigned',
    fileUrl: 'https://cdn.example.com/gallery/originals/a.jpg',
    key: 'gallery/originals/a.jpg',
  }),
  getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from('original')),
  putImmutableObject: jest.fn().mockResolvedValue(undefined),
  deleteObjects: jest.fn().mockResolvedValue(undefined),
  publicFileUrl: (key: string) => `https://cdn.example.com/${key}`,
}));

jest.mock('@/lib/photo-processing', () => ({
  optimizePhoto: jest.fn().mockResolvedValue({
    full: Buffer.from('full'),
    thumb: Buffer.from('thumb'),
    width: 2560,
    height: 1707,
  }),
}));

const admin = { id: 'admin-1', role: 'ADMIN' as const };
const regular = { id: 'user-1', role: 'REGULAR' as const };

const loginAs = (user: { id: string }) => {
  mockCookies({ sessionId: `session-${user.id}` });
  prismaMock.session.findUnique.mockResolvedValue({ id: 's', userId: user.id, user } as any);
};

const details = { takenAt: '2026-05-12T20:30:00.000Z', description: '  Cierre  ', eventId: '' };

describe('photo uploads', () => {
  it('only lets admins upload photos', async () => {
    loginAs(regular);

    await expect(getPhotoUploadUrl('a.jpg', 'image/jpeg')).rejects.toThrow('No autorizado');
    await expect(createPhoto('gallery/originals/a.jpg', details)).rejects.toThrow('No autorizado');
    expect(getObjectBuffer).not.toHaveBeenCalled();
  });

  it('rejects formats sharp cannot read', async () => {
    loginAs(admin);

    await expect(getPhotoUploadUrl('a.heic', 'image/heic')).rejects.toThrow('Formato no soportado');
  });

  it('only processes originals from the uploads folder', async () => {
    loginAs(admin);

    await expect(createPhoto('profiles/someone.jpg', details)).rejects.toThrow('Archivo inválido');
    await expect(createPhoto('gallery/originals/../x.jpg', details)).rejects.toThrow(
      'Archivo inválido',
    );
    expect(getObjectBuffer).not.toHaveBeenCalled();
  });

  it('stores the optimized webp files, drops the original and saves the photo', async () => {
    loginAs(admin);
    prismaMock.galleryItem.create.mockResolvedValue({ id: 'photo-1' } as any);

    await expect(createPhoto('gallery/originals/a.jpg', details)).resolves.toEqual({
      id: 'photo-1',
    });

    const [[fullKey], [thumbKey]] = (putImmutableObject as jest.Mock).mock.calls;
    expect(fullKey).toMatch(/^gallery\/[\w-]+\/full\.webp$/);
    expect(thumbKey).toMatch(/^gallery\/[\w-]+\/thumb\.webp$/);
    expect(deleteObjects).toHaveBeenCalledWith(['gallery/originals/a.jpg']);
    expect(prismaMock.galleryItem.create).toHaveBeenCalledWith({
      data: {
        takenAt: new Date('2026-05-12T20:30:00.000Z'),
        description: 'Cierre',
        eventId: null,
        src: `https://cdn.example.com/${fullKey}`,
        thumbSrc: `https://cdn.example.com/${thumbKey}`,
        width: 2560,
        height: 1707,
        storageKeys: [fullKey, thumbKey],
        uploadedById: 'admin-1',
      },
      select: { id: true },
    });
  });

  it('does not attach photos to unknown events', async () => {
    loginAs(admin);
    prismaMock.event.findFirst.mockResolvedValue(null);

    await expect(
      createPhoto('gallery/originals/a.jpg', { ...details, eventId: 'ghost' }),
    ).rejects.toThrow('Evento no encontrado');
    expect(prismaMock.galleryItem.create).not.toHaveBeenCalled();
  });
});

describe('photo editing', () => {
  it('only lets admins edit or delete photos', async () => {
    loginAs(regular);

    await expect(updateGalleryItem('photo-1', details)).rejects.toThrow('No autorizado');
    await expect(deleteGalleryItem('photo-1')).rejects.toThrow('No autorizado');
    expect(prismaMock.galleryItem.update).not.toHaveBeenCalled();
    expect(prismaMock.galleryItem.delete).not.toHaveBeenCalled();
  });

  it('updates the date, description and event', async () => {
    loginAs(admin);
    prismaMock.galleryItem.findUnique.mockResolvedValue({ eventId: 'old-event' } as any);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'event-2' } as any);

    await updateGalleryItem('photo-1', { ...details, description: '', eventId: 'event-2' });

    expect(prismaMock.galleryItem.update).toHaveBeenCalledWith({
      where: { id: 'photo-1' },
      data: {
        takenAt: new Date('2026-05-12T20:30:00.000Z'),
        description: null,
        eventId: 'event-2',
      },
    });
  });

  it('deletes the photo and its files', async () => {
    loginAs(admin);
    prismaMock.galleryItem.findUnique.mockResolvedValue({
      eventId: null,
      storageKeys: ['gallery/x/full.webp', 'gallery/x/thumb.webp'],
      tags: [],
    } as any);

    await deleteGalleryItem('photo-1');

    expect(prismaMock.galleryItem.delete).toHaveBeenCalledWith({ where: { id: 'photo-1' } });
    expect(deleteObjects).toHaveBeenCalledWith(['gallery/x/full.webp', 'gallery/x/thumb.webp']);
  });
});
