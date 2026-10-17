import prisma from '@/lib/prisma';
import { createAnnouncement } from '@/actions/announcements/create-announcement';
import { updateAnnouncement } from '@/actions/announcements/update-announcement';
import { deleteAnnouncement } from '@/actions/announcements/delete-announcement';
import {
  fetchAllAnnouncements,
  fetchAnnouncements,
} from '@/actions/announcements/get-announcements';
import { getEventAnnouncements } from '@/actions/announcements/get-event-announcements';
import { getEventsForSelect } from '@/actions/announcements/get-events-for-select';
import type { AnnouncementFormData } from '@/schemas/announcement-schema';
import { actAs } from '@/test/db/fixtures';
import {
  createAdmin,
  createAmbassador,
  createTestEvent,
  createUser,
  daysFromNow,
  uniqueId,
} from '@/test/db/content-fixtures';

// Anuncios contra Postgres real: borradores vs publicados, fijados primero y anuncios de evento.

const announcementForm = (overrides: Partial<AnnouncementFormData> = {}): AnnouncementFormData => ({
  title: `Anuncio ${uniqueId()}`,
  content: 'Contenido del anuncio para la comunidad',
  category: 'general',
  pinned: false,
  published: true,
  ...overrides,
});

let admin: Awaited<ReturnType<typeof createAdmin>>;

beforeAll(async () => {
  admin = await createAdmin();
});

beforeEach(async () => {
  await actAs(admin.id);
});

const publicIds = async () => (await fetchAnnouncements()).map((a) => a.id);

describe('drafts vs published', () => {
  it('a draft is only visible to admins until it is published', async () => {
    const draft = await createAnnouncement(announcementForm({ published: false }));

    expect(draft.authorId).toBe(admin.id);
    expect(await publicIds()).not.toContain(draft.id);
    expect((await fetchAllAnnouncements()).map((a) => a.id)).toContain(draft.id);

    await updateAnnouncement(draft.id, announcementForm({ title: draft.title, published: true }));
    expect(await publicIds()).toContain(draft.id);

    await updateAnnouncement(draft.id, announcementForm({ title: draft.title, published: false }));
    expect(await publicIds()).not.toContain(draft.id);
  });

  it('fetchAllAnnouncements is only for admins', async () => {
    for (const userId of [(await createUser()).id, (await createAmbassador()).id, undefined]) {
      await actAs(userId);
      await expect(fetchAllAnnouncements()).rejects.toThrow('No autorizado');
    }
  });

  it('lists pinned announcements first, then newest first, with only public author data', async () => {
    const old = await createAnnouncement(announcementForm());
    const pinned = await createAnnouncement(announcementForm({ pinned: true }));
    const latest = await createAnnouncement(announcementForm());
    await prisma.announcement.update({
      where: { id: pinned.id },
      data: { createdAt: daysFromNow(-365) },
    });

    const listed = await fetchAnnouncements();
    const ids = listed.map((a) => a.id);
    expect(ids.indexOf(pinned.id)).toBeLessThan(ids.indexOf(latest.id));
    expect(ids.indexOf(latest.id)).toBeLessThan(ids.indexOf(old.id));
    expect(Object.keys(listed.find((a) => a.id === old.id)!.author).sort()).toEqual([
      'id',
      'image',
      'name',
    ]);
  });
});

describe('event announcements', () => {
  it('links the announcement to the event only for the "evento" category', async () => {
    const event = await createTestEvent();

    const forEvent = await createAnnouncement(
      announcementForm({ category: 'evento', eventId: event.id }),
    );
    const general = await createAnnouncement(
      announcementForm({ category: 'general', eventId: event.id }),
    );
    const draft = await createAnnouncement(
      announcementForm({ category: 'evento', eventId: event.id, published: false }),
    );

    expect(forEvent.eventId).toBe(event.id);
    expect(general.eventId).toBeNull();
    expect((await getEventAnnouncements(event.id)).map((a) => a.id)).toEqual([forEvent.id]);
    expect(draft.eventId).toBe(event.id);
  });

  it('changing the category to another one unlinks the event', async () => {
    const event = await createTestEvent();
    const announcement = await createAnnouncement(
      announcementForm({ category: 'evento', eventId: event.id }),
    );

    await updateAnnouncement(
      announcement.id,
      announcementForm({ title: announcement.title, category: 'noticia', eventId: event.id }),
    );

    expect(
      (await prisma.announcement.findUniqueOrThrow({ where: { id: announcement.id } })).eventId,
    ).toBeNull();
    expect(await getEventAnnouncements(event.id)).toEqual([]);
  });

  it('getEventsForSelect lists live events only', async () => {
    const live = await createTestEvent();
    const deleted = await createTestEvent({ deletedAt: new Date() });
    const ids = (await getEventsForSelect()).map((e) => e.id);
    expect(ids).toContain(live.id);
    expect(ids).not.toContain(deleted.id);
  });
});

describe('permissions and validation', () => {
  it('only admins create, edit or delete announcements', async () => {
    const announcement = await createAnnouncement(announcementForm());
    const title = `No debería existir ${uniqueId()}`;

    for (const userId of [(await createUser()).id, (await createAmbassador()).id]) {
      await actAs(userId);
      await expect(createAnnouncement(announcementForm({ title }))).rejects.toThrow(
        'No tienes permisos',
      );
      await expect(
        updateAnnouncement(announcement.id, announcementForm({ title })),
      ).rejects.toThrow('No tienes permisos');
      await expect(deleteAnnouncement(announcement.id)).rejects.toThrow('No tienes permisos');
    }
    await actAs();
    await expect(createAnnouncement(announcementForm({ title }))).rejects.toThrow('No autorizado');
    await expect(deleteAnnouncement(announcement.id)).rejects.toThrow('No autorizado');

    expect(await prisma.announcement.count({ where: { title } })).toBe(0);
    expect(await prisma.announcement.findUnique({ where: { id: announcement.id } })).toMatchObject({
      title: announcement.title,
    });
  });

  it('rejects invalid data without writing', async () => {
    const title = `Inválido ${uniqueId()}`;
    await expect(
      createAnnouncement(announcementForm({ title, content: 'corto' })),
    ).rejects.toThrow();
    await expect(createAnnouncement(announcementForm({ title, category: '' }))).rejects.toThrow();
    expect(await prisma.announcement.count({ where: { title } })).toBe(0);
  });

  it('deletes an announcement, and fails for missing ones', async () => {
    const announcement = await createAnnouncement(announcementForm());

    await expect(deleteAnnouncement(announcement.id)).resolves.toEqual({ success: true });
    expect(await prisma.announcement.findUnique({ where: { id: announcement.id } })).toBeNull();
    expect(await publicIds()).not.toContain(announcement.id);
    await expect(deleteAnnouncement(announcement.id)).rejects.toThrow();
    await expect(updateAnnouncement(announcement.id, announcementForm())).rejects.toThrow();
  });
});
