import { prismaMock } from '@/test/prisma';
import { mockCookies } from '@/test/cookies';
import {
  deleteObjects,
  deleteObjectsOrLog,
  getObjectBuffer,
  getPresignedPost,
  headObject,
  putImmutableObject,
} from '@/lib/s3';
import {
  bulkDeleteGalleryItems,
  bulkSetGalleryItemsEvent,
  createPhoto,
  createVideo,
  deleteGalleryItem,
  getPhotoUploadUrl,
  getVideoUploadUrl,
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
  deleteObjectsOrLog: jest.fn().mockResolvedValue(undefined),
  publicFileUrl: (key: string) => `https://cdn.example.com/${key}`,
  getPresignedPost: jest.fn().mockResolvedValue({ url: 'https://s3.example.com', fields: {} }),
  headObject: jest.fn().mockResolvedValue({ size: 1000, contentType: 'video/mp4' }),
}));

jest.mock('@/lib/photo-processing', () => ({
  optimizePhoto: jest.fn().mockResolvedValue({
    full: Buffer.from('full'),
    thumb: Buffer.from('thumb'),
    width: 2560,
    height: 1707,
  }),
  optimizePoster: jest.fn().mockResolvedValue(Buffer.from('poster')),
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
    expect(deleteObjectsOrLog).toHaveBeenCalledWith(['gallery/originals/a.jpg']);
    expect(prismaMock.galleryItem.create).toHaveBeenCalledWith({
      data: {
        takenAt: new Date('2026-05-12T20:30:00.000Z'),
        description: 'Cierre',
        eventId: null,
        src: `https://cdn.example.com/${fullKey}`,
        thumbSrc: `https://cdn.example.com/${thumbKey}`,
        mimeType: 'image/webp',
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

  it('keeps the photo when S3 cannot delete its files', async () => {
    loginAs(admin);
    prismaMock.galleryItem.findUnique.mockResolvedValue({
      eventId: null,
      storageKeys: ['gallery/x/full.webp'],
      tags: [],
    } as any);
    (deleteObjects as jest.Mock).mockRejectedValueOnce(new Error('No se pudieron borrar de S3'));

    await expect(deleteGalleryItem('photo-1')).rejects.toThrow('No se pudieron borrar de S3');
    expect(prismaMock.galleryItem.delete).not.toHaveBeenCalled();
  });
});

describe('bulk editing', () => {
  it('only lets admins edit or delete many items at once', async () => {
    loginAs(regular);

    await expect(bulkSetGalleryItemsEvent(['a'], null)).rejects.toThrow('No autorizado');
    await expect(bulkDeleteGalleryItems(['a'])).rejects.toThrow('No autorizado');
    expect(prismaMock.galleryItem.updateMany).not.toHaveBeenCalled();
    expect(prismaMock.galleryItem.deleteMany).not.toHaveBeenCalled();
  });

  it('requires a selection', async () => {
    loginAs(admin);

    await expect(bulkSetGalleryItemsEvent([], null)).rejects.toThrow('No hay nada seleccionado');
  });

  it('moves the existing items to the event', async () => {
    loginAs(admin);
    prismaMock.event.findFirst.mockResolvedValue({ id: 'event-2' } as any);
    prismaMock.galleryItem.findMany.mockResolvedValue([
      { id: 'a', eventId: 'event-1' },
      { id: 'b', eventId: null },
    ] as any);

    const result = await bulkSetGalleryItemsEvent(['a', 'b', 'a', 'ghost'], 'event-2');

    expect(prismaMock.galleryItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { in: ['a', 'b', 'ghost'] } } }),
    );
    expect(prismaMock.galleryItem.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['a', 'b'] } },
      data: { eventId: 'event-2' },
    });
    expect(result).toEqual({ updated: 2 });
  });

  it('does not move items to unknown events', async () => {
    loginAs(admin);
    prismaMock.event.findFirst.mockResolvedValue(null);

    await expect(bulkSetGalleryItemsEvent(['a'], 'ghost')).rejects.toThrow('Evento no encontrado');
    expect(prismaMock.galleryItem.updateMany).not.toHaveBeenCalled();
  });

  it('deletes the items and all their files', async () => {
    loginAs(admin);
    prismaMock.galleryItem.findMany.mockResolvedValue([
      { id: 'a', eventId: null, storageKeys: ['gallery/a/full.webp'], tags: [] },
      { id: 'b', eventId: 'e', storageKeys: ['gallery/b/video.mp4'], tags: [{ userId: 'u' }] },
    ] as any);

    const result = await bulkDeleteGalleryItems(['a', 'b']);

    expect(deleteObjects).toHaveBeenCalledWith(['gallery/a/full.webp', 'gallery/b/video.mp4']);
    expect(prismaMock.galleryItem.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['a', 'b'] } },
    });
    expect(result).toEqual({ deleted: 2 });
  });

  it('keeps the items when S3 cannot delete their files', async () => {
    loginAs(admin);
    prismaMock.galleryItem.findMany.mockResolvedValue([
      { id: 'a', eventId: null, storageKeys: ['gallery/a/full.webp'], tags: [] },
    ] as any);
    (deleteObjects as jest.Mock).mockRejectedValueOnce(new Error('No se pudieron borrar de S3'));

    await expect(bulkDeleteGalleryItems(['a'])).rejects.toThrow('No se pudieron borrar de S3');
    expect(prismaMock.galleryItem.deleteMany).not.toHaveBeenCalled();
  });
});

describe('video uploads', () => {
  const videoKey = 'gallery/3f0c8a2e-5b1d-4c6a-9e2f-1a2b3c4d5e6f/video.mp4';
  const metadata = { durationSeconds: 42, width: 1920, height: 1080 };

  it('only lets admins upload videos', async () => {
    loginAs(regular);

    await expect(getVideoUploadUrl('video/mp4', 1000)).rejects.toThrow('No autorizado');
    await expect(
      createVideo(videoKey, 'gallery/originals/p.jpg', { ...details, ...metadata }),
    ).rejects.toThrow('No autorizado');
  });

  it('only accepts MP4, WebM and MOV up to 500 MB', async () => {
    loginAs(admin);

    await expect(getVideoUploadUrl('video/x-msvideo', 1000)).rejects.toThrow(
      'Formato no soportado',
    );
    await expect(getVideoUploadUrl('video/mp4', 600 * 1024 * 1024)).rejects.toThrow(
      'más de 500 MB',
    );
  });

  it('signs a size-limited upload to a fresh gallery folder', async () => {
    loginAs(admin);

    const { key } = await getVideoUploadUrl('video/quicktime', 1000);

    expect(key).toMatch(/^gallery\/[0-9a-f-]{36}\/video\.mov$/);
    expect(getPresignedPost).toHaveBeenCalledWith(key, 'video/quicktime', 500 * 1024 * 1024);
  });

  it('rejects keys it did not hand out', async () => {
    loginAs(admin);

    await expect(
      createVideo('profiles/x.mp4', 'gallery/originals/p.jpg', { ...details, ...metadata }),
    ).rejects.toThrow('Archivo inválido');
    await expect(
      createVideo(videoKey, 'events/flyer.jpg', { ...details, ...metadata }),
    ).rejects.toThrow('Archivo inválido');
  });

  it('requires the video to be uploaded', async () => {
    loginAs(admin);
    (headObject as jest.Mock).mockResolvedValueOnce(null);

    await expect(
      createVideo(videoKey, 'gallery/originals/p.jpg', { ...details, ...metadata }),
    ).rejects.toThrow('El video no se terminó de subir');
    expect(prismaMock.galleryItem.create).not.toHaveBeenCalled();
  });

  it('stores the poster next to the video and saves the item', async () => {
    loginAs(admin);
    prismaMock.galleryItem.create.mockResolvedValue({ id: 'video-1' } as any);
    const posterKey = videoKey.replace('video.mp4', 'poster.webp');

    await createVideo(videoKey, 'gallery/originals/p.jpg', { ...details, ...metadata });

    expect(putImmutableObject).toHaveBeenCalledWith(posterKey, Buffer.from('poster'), 'image/webp');
    expect(deleteObjectsOrLog).toHaveBeenCalledWith(['gallery/originals/p.jpg']);
    expect(prismaMock.galleryItem.create).toHaveBeenCalledWith({
      data: {
        takenAt: new Date('2026-05-12T20:30:00.000Z'),
        description: 'Cierre',
        eventId: null,
        ...metadata,
        kind: 'VIDEO',
        src: `https://cdn.example.com/${videoKey}`,
        thumbSrc: `https://cdn.example.com/${posterKey}`,
        mimeType: 'video/mp4',
        storageKeys: [videoKey, posterKey],
        uploadedById: 'admin-1',
      },
      select: { id: true },
    });
  });
});

describe('getPhotoUploadUrl', () => {
  it('returns a presigned URL for supported formats', async () => {
    loginAs(admin);

    await expect(getPhotoUploadUrl('a.jpg', 'image/jpeg')).resolves.toEqual({
      uploadUrl: 'https://s3.example.com/presigned',
      key: 'gallery/originals/a.jpg',
    });
  });
});
