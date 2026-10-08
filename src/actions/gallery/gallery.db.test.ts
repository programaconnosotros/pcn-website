import prisma from '@/lib/prisma';
import { deleteObjects, getPresignedUploadUrl, headObject, putImmutableObject } from '@/lib/s3';
import {
  approveGalleryItems,
  bulkDeleteGalleryItems,
  bulkSetGalleryItemsEvent,
  createPhoto,
  createVideo,
  deleteGalleryItem,
  getPhotoUploadUrl,
  rejectGalleryItems,
  updateGalleryItem,
} from '@/actions/gallery/gallery-actions';
import {
  bulkTagGalleryItemsUser,
  bulkUntagGalleryItemsUser,
  tagGalleryItemUser,
  untagGalleryItemUser,
} from '@/actions/gallery/gallery-tags';
import { setEventCoverPhoto } from '@/actions/events/set-event-cover-photo';
import { fetchEvent } from '@/actions/events/fetch-event';
import {
  getEventCover,
  getEventMemories,
  getGalleryFilterOptions,
  getGalleryItem,
  getGalleryNeighbours,
  getPendingWorkingPhotos,
  getWorkingPhotos,
  listGalleryItems,
  listPendingGalleryItems,
} from '@/lib/gallery';
import type { Prisma } from '@/generated/prisma/client';
import { actAs } from '@/test/db/fixtures';
import { createAdmin, createTestEvent, createUser, uniqueId } from '@/test/db/content-fixtures';

// Galería contra Postgres real. S3 y el procesamiento de imágenes se reemplazan: lo que se prueba
// es qué filas quedan (visibilidad, etiquetas, operaciones en bloque). Sin CLOUDFRONT_URL las
// URLs se devuelven sin firmar.

jest.mock('@/lib/s3', () => ({
  CLOUDFRONT_URL: '',
  publicFileUrl: (key: string) => `https://cdn.test/${key}`,
  getObjectBuffer: jest.fn().mockResolvedValue(Buffer.from('original')),
  putImmutableObject: jest.fn().mockResolvedValue(undefined),
  deleteObjects: jest.fn().mockResolvedValue(undefined),
  deleteObjectsOrLog: jest.fn().mockResolvedValue(undefined),
  headObject: jest.fn().mockResolvedValue({ contentType: 'video/mp4' }),
  getPresignedPost: jest.fn().mockResolvedValue({ url: 'https://s3.test', fields: {} }),
  getPresignedUploadUrl: jest.fn().mockResolvedValue({
    uploadUrl: 'https://s3.test/put',
    fileUrl: 'https://cdn.test/gallery/originals/x.jpg',
    key: 'gallery/originals/x.jpg',
  }),
}));

jest.mock('@/lib/photo-processing', () => ({
  optimizePhoto: jest.fn().mockResolvedValue({
    full: Buffer.from('full'),
    thumb: Buffer.from('thumb'),
    width: 2000,
    height: 1000,
  }),
  optimizePoster: jest.fn().mockResolvedValue(Buffer.from('poster')),
}));

const createItem = (data: Partial<Prisma.GalleryItemUncheckedCreateInput> = {}) => {
  const id = uniqueId();
  return prisma.galleryItem.create({
    data: {
      src: `/test-gallery/${id}.webp`,
      thumbSrc: `/test-gallery/${id}-thumb.webp`,
      takenAt: new Date('2025-06-01T20:00:00Z'),
      storageKeys: [`gallery/${id}/full.webp`, `gallery/${id}/thumb.webp`],
      ...data,
    },
  });
};

let admin: Awaited<ReturnType<typeof createAdmin>>;

beforeAll(async () => {
  admin = await createAdmin();
});

describe('creating photos and videos', () => {
  it('createPhoto stores the optimized photo for the event, uploaded by the admin', async () => {
    const event = await createTestEvent();
    await actAs(admin.id);

    const { id } = await createPhoto('gallery/originals/abc.jpg', {
      takenAt: '2025-03-01T22:00:00.000Z',
      description: '  En el escenario  ',
      eventId: event.id,
    });

    const item = await prisma.galleryItem.findUniqueOrThrow({ where: { id } });
    expect(item).toMatchObject({
      kind: 'PHOTO',
      eventId: event.id,
      uploadedById: admin.id,
      description: 'En el escenario',
      width: 2000,
      height: 1000,
      mimeType: 'image/webp',
      takenAt: new Date('2025-03-01T22:00:00.000Z'),
    });
    expect(item.storageKeys).toHaveLength(2);
    expect(item.src).toBe(`https://cdn.test/${item.storageKeys[0]}`);
    expect((await listGalleryItems({ eventId: event.id })).map((i) => i.id)).toEqual([id]);
  });

  it('createVideo stores the video and its poster', async () => {
    await actAs(admin.id);
    const key = `gallery/${crypto.randomUUID()}/video.mp4`;

    const { id } = await createVideo(key, 'gallery/originals/frame.jpg', {
      takenAt: '2025-03-01T22:00:00.000Z',
      durationSeconds: 42,
      width: 1920,
      height: 1080,
    });

    const item = await prisma.galleryItem.findUniqueOrThrow({ where: { id } });
    expect(item).toMatchObject({ kind: 'VIDEO', durationSeconds: 42, mimeType: 'video/mp4' });
    expect(item.storageKeys).toEqual([key, key.replace('video.mp4', 'poster.webp')]);
    expect((await listGalleryItems({ type: 'videos' })).map((i) => i.id)).toContain(id);
    expect((await listGalleryItems({ type: 'fotos' })).map((i) => i.id)).not.toContain(id);
  });

  it('does not create anything for invalid keys, deleted events or unfinished uploads', async () => {
    const deleted = await createTestEvent({ deletedAt: new Date() });
    await actAs(admin.id);
    const before = await prisma.galleryItem.count();

    await expect(createPhoto('profiles/../x.jpg', { takenAt: '2025-01-01' })).rejects.toThrow(
      'Archivo inválido',
    );
    await expect(
      createPhoto('gallery/originals/a.jpg', { takenAt: '2025-01-01', eventId: deleted.id }),
    ).rejects.toThrow('Evento no encontrado');
    await expect(createPhoto('gallery/originals/a.jpg', { takenAt: 'ayer' })).rejects.toThrow(
      'Fecha inválida',
    );
    (headObject as jest.Mock).mockResolvedValueOnce(null);
    await expect(
      createVideo(`gallery/${crypto.randomUUID()}/video.webm`, 'gallery/originals/f.jpg', {
        takenAt: '2025-01-01',
        durationSeconds: 1,
        width: 10,
        height: 10,
      }),
    ).rejects.toThrow('El video no se terminó de subir');

    expect(await prisma.galleryItem.count()).toBe(before);
    expect(putImmutableObject).not.toHaveBeenCalled();
  });

  it('members upload photos that stay hidden until an admin approves them', async () => {
    const user = await createUser();
    await actAs(user.id);

    await expect(getPhotoUploadUrl('a.jpg', 'image/jpeg')).resolves.toMatchObject({
      key: 'gallery/originals/x.jpg',
    });
    const working = await createPhoto('gallery/originals/a.jpg', {
      takenAt: '2025-01-01',
      working: true,
    });
    const other = await createPhoto('gallery/originals/b.jpg', { takenAt: '2025-01-02' });
    expect(working.status).toBe('PENDING');

    // Hidden everywhere public; only the uploader sees their photo at work in review
    expect((await listGalleryItems()).map((i) => i.id)).not.toContain(working.id);
    expect(await getGalleryItem(working.id)).toBeNull();
    expect(await getWorkingPhotos(user.id)).toEqual([]);
    expect((await getPendingWorkingPhotos(user.id)).map((i) => i.id)).toEqual([working.id]);
    expect(
      (await listPendingGalleryItems()).filter((i) => i.uploadedBy?.id === user.id),
    ).toHaveLength(2);
    expect(
      await prisma.notification.count({
        where: { type: 'gallery_item_pending', userId: admin.id },
      }),
    ).toBeGreaterThan(0);

    // Members can't review their own uploads
    await expect(approveGalleryItems([working.id])).rejects.toThrow('No autorizado');

    await actAs(admin.id);
    await expect(approveGalleryItems([working.id])).resolves.toEqual({ approved: 1 });
    await expect(rejectGalleryItems([other.id])).resolves.toEqual({ rejected: 1 });

    expect((await listGalleryItems({ type: 'trabajando' })).map((i) => i.id)).toContain(working.id);
    expect((await listGalleryItems({ type: 'trabajando' })).map((i) => i.id)).not.toContain(
      other.id,
    );
    expect((await getWorkingPhotos(user.id)).map((i) => i.id)).toEqual([working.id]);
    expect(await prisma.galleryItem.findUnique({ where: { id: other.id } })).toBeNull();
    // An approved photo isn't rejected (deleted) by a stale review
    await expect(rejectGalleryItems([working.id])).resolves.toEqual({ rejected: 0 });
  });

  it('asks visitors to log in and checks the format', async () => {
    await actAs();
    const before = await prisma.galleryItem.count();

    await expect(getPhotoUploadUrl('a.jpg', 'image/jpeg')).rejects.toThrow('Iniciá sesión');
    await expect(createPhoto('gallery/originals/a.jpg', { takenAt: '2025-01-01' })).rejects.toThrow(
      'Iniciá sesión',
    );
    await actAs(admin.id);
    await expect(getPhotoUploadUrl('a.pdf', 'application/pdf')).rejects.toThrow(
      'Formato no soportado',
    );
    await expect(getPhotoUploadUrl('a.jpg', 'image/jpeg')).resolves.toEqual({
      uploadUrl: 'https://s3.test/put',
      key: 'gallery/originals/x.jpg',
    });
    expect(getPresignedUploadUrl).toHaveBeenCalledWith('a.jpg', 'image/jpeg', 'gallery/originals');
    expect(await prisma.galleryItem.count()).toBe(before);
  });
});

describe('visibility', () => {
  it('legacy photos stay in the database but never show up', async () => {
    const event = await createTestEvent();
    const visible = await createItem({ eventId: event.id });
    const legacy = await createItem({
      eventId: event.id,
      legacyId: Math.floor(Math.random() * 1e9),
    });

    expect((await listGalleryItems({ eventId: event.id })).map((i) => i.id)).toEqual([visible.id]);
    expect(await getGalleryItem(legacy.id)).toBeNull();
    expect((await getGalleryItem(visible.id))?.fullUrl).toBe(visible.src);
    const memories = await getEventMemories(event.id, 10);
    expect(memories.items.map((i) => i.id)).toEqual([visible.id]);
    expect(memories.photoCount).toBe(1);
    expect((await fetchEvent(event.id))?._count.galleryItems).toBe(1);
  });

  it('filter options only list live events and people with visible items', async () => {
    const event = await createTestEvent();
    const deleted = await createTestEvent({ deletedAt: new Date() });
    const [shown, hiddenPerson] = [await createUser(), await createUser()];
    const item = await createItem({ eventId: event.id });
    await createItem({ eventId: deleted.id });
    const legacy = await createItem({ legacyId: Math.floor(Math.random() * 1e9) });
    await prisma.galleryItemTag.createMany({
      data: [
        { itemId: item.id, userId: shown.id },
        { itemId: legacy.id, userId: hiddenPerson.id },
      ],
    });

    const { events, people } = await getGalleryFilterOptions();
    expect(events.find((e) => e.id === event.id)?.count).toBe(1);
    expect(events.map((e) => e.id)).not.toContain(deleted.id);
    expect(people.find((p) => p.id === shown.id)?.count).toBe(1);
    expect(people.map((p) => p.id)).not.toContain(hiddenPerson.id);
  });

  it('neighbours wrap around within the filter, newest first', async () => {
    const event = await createTestEvent();
    const [first, second, third] = [
      await createItem({ eventId: event.id, takenAt: new Date('2025-01-03') }),
      await createItem({ eventId: event.id, takenAt: new Date('2025-01-02') }),
      await createItem({ eventId: event.id, takenAt: new Date('2025-01-01') }),
    ];

    expect(await getGalleryNeighbours(second.id, { eventId: event.id })).toEqual({
      previousId: first.id,
      nextId: third.id,
      previous: expect.objectContaining({ id: first.id, kind: 'PHOTO' }),
      next: expect.objectContaining({ id: third.id, kind: 'PHOTO' }),
      index: 1,
      total: 3,
    });
    expect(await getGalleryNeighbours(third.id, { eventId: event.id })).toMatchObject({
      nextId: first.id,
    });
  });
});

describe('editing and deleting', () => {
  it('updateGalleryItem moves an item to another event and rejects deleted events', async () => {
    const [from, to] = [await createTestEvent(), await createTestEvent()];
    const deleted = await createTestEvent({ deletedAt: new Date() });
    const item = await createItem({ eventId: from.id });
    await actAs(admin.id);

    await updateGalleryItem(item.id, {
      takenAt: '2025-02-02T00:00:00Z',
      eventId: to.id,
      description: '',
    });
    expect(await prisma.galleryItem.findUniqueOrThrow({ where: { id: item.id } })).toMatchObject({
      eventId: to.id,
      description: null,
    });

    await expect(
      updateGalleryItem(item.id, { takenAt: '2025-02-02T00:00:00Z', eventId: deleted.id }),
    ).rejects.toThrow('Evento no encontrado');
    await expect(updateGalleryItem('no-existe', { takenAt: '2025-02-02' })).rejects.toThrow(
      'Foto no encontrada',
    );
    expect((await prisma.galleryItem.findUniqueOrThrow({ where: { id: item.id } })).eventId).toBe(
      to.id,
    );
  });

  it('deleteGalleryItem removes the files, the row and its tags', async () => {
    const item = await createItem();
    const tagged = await createUser();
    await prisma.galleryItemTag.create({ data: { itemId: item.id, userId: tagged.id } });
    await actAs(admin.id);

    await deleteGalleryItem(item.id);

    expect(deleteObjects).toHaveBeenCalledWith(item.storageKeys);
    expect(await prisma.galleryItem.findUnique({ where: { id: item.id } })).toBeNull();
    expect(await prisma.galleryItemTag.count({ where: { itemId: item.id } })).toBe(0);
  });

  it('keeps the row when S3 fails, so it can be retried', async () => {
    const item = await createItem();
    await actAs(admin.id);
    (deleteObjects as jest.Mock).mockRejectedValueOnce(new Error('S3 caído'));

    await expect(deleteGalleryItem(item.id)).rejects.toThrow('S3 caído');
    expect(await prisma.galleryItem.findUnique({ where: { id: item.id } })).not.toBeNull();
  });

  it('non-admins cannot edit or delete', async () => {
    const item = await createItem();
    await actAs((await createUser()).id);

    await expect(updateGalleryItem(item.id, { takenAt: '2025-01-01' })).rejects.toThrow(
      'No autorizado',
    );
    await expect(deleteGalleryItem(item.id)).rejects.toThrow('No autorizado');
    await expect(bulkDeleteGalleryItems([item.id])).rejects.toThrow('No autorizado');
    await expect(bulkSetGalleryItemsEvent([item.id], null)).rejects.toThrow('No autorizado');
    expect(await prisma.galleryItem.findUnique({ where: { id: item.id } })).not.toBeNull();
  });
});

describe('bulk operations', () => {
  it('bulkSetGalleryItemsEvent moves only the items that exist, ignoring duplicates', async () => {
    const event = await createTestEvent();
    const [a, b] = [await createItem(), await createItem()];
    await actAs(admin.id);

    await expect(
      bulkSetGalleryItemsEvent([a.id, b.id, a.id, 'no-existe'], event.id),
    ).resolves.toEqual({ updated: 2 });
    expect(await prisma.galleryItem.count({ where: { eventId: event.id } })).toBe(2);

    await expect(bulkSetGalleryItemsEvent([a.id], null)).resolves.toEqual({ updated: 1 });
    expect(
      (await prisma.galleryItem.findUniqueOrThrow({ where: { id: a.id } })).eventId,
    ).toBeNull();
  });

  it('bulk operations validate the selection and the event before writing', async () => {
    const item = await createItem();
    const deleted = await createTestEvent({ deletedAt: new Date() });
    await actAs(admin.id);

    await expect(bulkSetGalleryItemsEvent([], null)).rejects.toThrow('No hay nada seleccionado');
    await expect(bulkSetGalleryItemsEvent([item.id], deleted.id)).rejects.toThrow(
      'Evento no encontrado',
    );
    await expect(
      bulkDeleteGalleryItems(Array.from({ length: 501 }, (_, i) => `id-${i}`)),
    ).rejects.toThrow('Máximo 500');
    expect(
      (await prisma.galleryItem.findUniqueOrThrow({ where: { id: item.id } })).eventId,
    ).toBeNull();
  });

  it('bulkDeleteGalleryItems deletes every file and row at once', async () => {
    const [a, b] = [await createItem(), await createItem()];
    await actAs(admin.id);

    await expect(bulkDeleteGalleryItems([a.id, b.id, 'no-existe'])).resolves.toEqual({
      deleted: 2,
    });
    expect(deleteObjects).toHaveBeenCalledWith([...a.storageKeys, ...b.storageKeys]);
    expect(await prisma.galleryItem.count({ where: { id: { in: [a.id, b.id] } } })).toBe(0);
  });
});

describe('tags', () => {
  it('a user can tag and untag themselves, idempotently', async () => {
    const item = await createItem();
    const user = await createUser();
    await actAs(user.id);

    await expect(tagGalleryItemUser(item.id, user.id)).resolves.toEqual({
      person: { id: user.id, name: user.name, image: null },
    });
    await tagGalleryItemUser(item.id, user.id);
    const tags = await prisma.galleryItemTag.findMany({ where: { itemId: item.id } });
    expect(tags.map((t) => [t.userId, t.taggedById])).toEqual([[user.id, user.id]]);
    expect((await listGalleryItems({ userId: user.id })).map((i) => i.id)).toEqual([item.id]);

    await untagGalleryItemUser(item.id, user.id);
    expect(await prisma.galleryItemTag.count({ where: { itemId: item.id } })).toBe(0);
  });

  it('only admins tag or untag other people', async () => {
    const item = await createItem();
    const [user, other] = [await createUser(), await createUser()];

    await actAs(user.id);
    await expect(tagGalleryItemUser(item.id, other.id)).rejects.toThrow('No autorizado');
    await actAs();
    await expect(tagGalleryItemUser(item.id, other.id)).rejects.toThrow('Debes estar autenticado');
    await actAs(admin.id);
    await tagGalleryItemUser(item.id, other.id);
    await actAs(user.id);
    await expect(untagGalleryItemUser(item.id, other.id)).rejects.toThrow('No autorizado');

    const tags = await prisma.galleryItemTag.findMany({ where: { itemId: item.id } });
    expect(tags.map((t) => [t.userId, t.taggedById])).toEqual([[other.id, admin.id]]);
  });

  it('reports missing items and users', async () => {
    const item = await createItem();
    await actAs(admin.id);
    await expect(tagGalleryItemUser('no-existe', admin.id)).rejects.toThrow('Foto no encontrada');
    await expect(tagGalleryItemUser(item.id, 'no-existe')).rejects.toThrow('Usuario no encontrado');
  });

  it('bulk tagging skips items already tagged and missing ones; bulk untag counts removals', async () => {
    const [a, b, c] = [await createItem(), await createItem(), await createItem()];
    const user = await createUser();
    await prisma.galleryItemTag.create({ data: { itemId: a.id, userId: user.id } });
    await actAs(admin.id);

    await expect(
      bulkTagGalleryItemsUser([a.id, b.id, c.id, 'no-existe'], user.id),
    ).resolves.toEqual({
      tagged: 2,
    });
    expect(await prisma.galleryItemTag.count({ where: { userId: user.id } })).toBe(3);
    await expect(bulkUntagGalleryItemsUser([a.id, b.id], user.id)).resolves.toEqual({
      untagged: 2,
    });
    expect(await prisma.galleryItemTag.count({ where: { userId: user.id } })).toBe(1);

    await expect(bulkTagGalleryItemsUser([a.id], 'no-existe')).rejects.toThrow(
      'Usuario no encontrado',
    );
    await actAs(user.id);
    await expect(bulkTagGalleryItemsUser([a.id], user.id)).rejects.toThrow('No autorizado');
  });
});

describe('setEventCoverPhoto', () => {
  it("picks one of the event's photos as cover, and goes back to random with null", async () => {
    const event = await createTestEvent();
    const [wide, tall] = [
      await createItem({ eventId: event.id, width: 2000, height: 1000 }),
      await createItem({ eventId: event.id, width: 1000, height: 2000 }),
    ];
    await actAs(admin.id);

    await setEventCoverPhoto(event.id, tall.id);
    expect((await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).coverPhotoId).toBe(
      tall.id,
    );
    const chosen = await getEventCover(event.id, tall.id);
    expect(chosen.chosenId).toBe(tall.id);
    expect(chosen.covers.map((c) => c.id)).toEqual([tall.id]);

    await setEventCoverPhoto(event.id, null);
    const random = await getEventCover(event.id, null);
    // Sin elegir, solo las horizontales
    expect(random.covers.map((c) => c.id)).toEqual([wide.id]);
    expect(random.photos).toHaveLength(2);
  });

  it('rejects photos of other events, videos, legacy photos and non-admins', async () => {
    const event = await createTestEvent();
    const other = await createTestEvent();
    const foreign = await createItem({ eventId: other.id });
    const video = await createItem({ eventId: event.id, kind: 'VIDEO' });
    const legacy = await createItem({
      eventId: event.id,
      legacyId: Math.floor(Math.random() * 1e9),
    });
    const own = await createItem({ eventId: event.id });
    await actAs(admin.id);

    for (const photo of [foreign, video, legacy]) {
      await expect(setEventCoverPhoto(event.id, photo.id)).rejects.toThrow(
        'La foto no es de este evento',
      );
    }
    await actAs((await createUser()).id);
    await expect(setEventCoverPhoto(event.id, own.id)).rejects.toThrow('No autorizado');
    expect(
      (await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).coverPhotoId,
    ).toBeNull();
  });

  it('deleting the cover photo clears it from the event', async () => {
    const event = await createTestEvent();
    const photo = await createItem({ eventId: event.id });
    await actAs(admin.id);
    await setEventCoverPhoto(event.id, photo.id);

    await deleteGalleryItem(photo.id);

    expect(
      (await prisma.event.findUniqueOrThrow({ where: { id: event.id } })).coverPhotoId,
    ).toBeNull();
  });
});
