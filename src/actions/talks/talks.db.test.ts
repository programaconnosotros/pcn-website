import prisma from '@/lib/prisma';
import { createTalk } from '@/actions/talks/create-talk';
import { updateTalk } from '@/actions/talks/update-talk';
import { deleteTalk } from '@/actions/talks/delete-talk';
import { fetchTalks, fetchTalkForEdit } from '@/actions/talks/fetch-talks';
import { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';
import { fetchEventsForSelect } from '@/actions/talks/fetch-events-for-select';
import type { TalkFormData } from '@/schemas/talk-schema';
import { actAs } from '@/test/db/fixtures';
import {
  createAdmin,
  createAmbassador,
  createOrganizer,
  createTestEvent,
  createUser,
  daysFromNow,
  professionalSpeaker,
  studentSpeaker,
  uniqueId,
} from '@/test/db/content-fixtures';

// Charlas y sus oradores contra Postgres real. El teléfono de cada orador solo sale de la base
// para quien gestiona el evento: el listado público no lo trae nunca.

const talkForm = (overrides: Partial<TalkFormData> = {}): TalkFormData => ({
  title: `Charla ${uniqueId()}`,
  description: 'Una charla sobre cómo testear contra una base real',
  speakers: [professionalSpeaker()],
  ...overrides,
});

const createTalkRow = (eventId: string | null, speakerPhone = '5491100000000') =>
  prisma.talk.create({
    data: {
      eventId,
      title: `Charla ${uniqueId()}`,
      description: 'Descripción de la charla',
      slideImages: [],
      speakers: { create: [{ speakerName: 'Ada Lovelace', speakerPhone, isProfessional: true }] },
    },
  });

describe('createTalk', () => {
  it("lets an organizer add a talk to their event, keeping the speakers' order and phones", async () => {
    const event = await createTestEvent();
    const organizer = await createOrganizer(event.id);
    const speakerUser = await createUser();
    await actAs(organizer.id);

    const { talkId } = await createTalk(
      talkForm({
        eventId: event.id,
        speakers: [
          professionalSpeaker({ speakerName: 'Primera', userId: speakerUser.id }),
          studentSpeaker({ speakerName: 'Segunda' }),
        ],
      }),
    );

    const speakers = await prisma.talkSpeaker.findMany({
      where: { talkId },
      orderBy: { order: 'asc' },
      omit: { speakerPhone: false },
    });
    expect(speakers.map((s) => [s.order, s.speakerName, s.userId, s.speakerPhone])).toEqual([
      [0, 'Primera', speakerUser.id, '5493815123456'],
      [1, 'Segunda', null, '5493815999999'],
    ]);
    expect((await prisma.talk.findUniqueOrThrow({ where: { id: talkId } })).eventId).toBe(event.id);
  });

  it('lets admins add talks without an event (manual event data)', async () => {
    const admin = await createAdmin();
    await actAs(admin.id);

    const { talkId } = await createTalk(
      talkForm({ manualEventTitle: 'Conferencia externa', manualEventDate: '2024-05-10' }),
    );

    expect(await prisma.talk.findUniqueOrThrow({ where: { id: talkId } })).toMatchObject({
      eventId: null,
      manualEventTitle: 'Conferencia externa',
      manualEventDate: new Date('2024-05-10T12:00:00.000Z'),
    });
  });

  it('rejects organizers of other events, ambassadors without that event and regular users', async () => {
    const event = await createTestEvent();
    const other = await createTestEvent();
    const title = `No debería existir ${uniqueId()}`;

    for (const user of [
      await createOrganizer(other.id),
      await createAmbassador(),
      await createUser(),
    ]) {
      await actAs(user.id);
      await expect(createTalk(talkForm({ title, eventId: event.id }))).rejects.toThrow(
        'No tenés permisos',
      );
    }
    // Sin evento, solo los admins
    await actAs((await createOrganizer(other.id)).id);
    await expect(createTalk(talkForm({ title }))).rejects.toThrow('No tenés permisos');
    await actAs();
    await expect(createTalk(talkForm({ title }))).rejects.toThrow('Debes estar autenticado');

    expect(await prisma.talk.count({ where: { title } })).toBe(0);
  });

  it('rejects invalid data before touching the database', async () => {
    const admin = await createAdmin();
    await actAs(admin.id);
    const title = `Inválida ${uniqueId()}`;

    await expect(createTalk(talkForm({ title, speakers: [] }))).rejects.toThrow(
      'Agregá al menos un orador',
    );
    await expect(
      createTalk(talkForm({ title, speakers: [professionalSpeaker({ enterprise: '' })] })),
    ).rejects.toThrow('La empresa es requerida');
    await expect(createTalk(talkForm({ title, videoUrl: 'no-es-url' }))).rejects.toThrow(
      'La URL del video no es válida',
    );

    expect(await prisma.talk.count({ where: { title } })).toBe(0);
  });
});

describe('speaker phones', () => {
  it('the public list of talks never includes phones', async () => {
    const event = await createTestEvent();
    const talk = await createTalkRow(event.id, '5491112345678');

    const listed = (await fetchPublicTalks(event.id)).find((t) => t.id === talk.id);

    expect(listed?.speakers).toHaveLength(1);
    expect(listed?.speakers[0]).not.toHaveProperty('speakerPhone');
    expect(JSON.stringify(await fetchPublicTalks())).not.toContain('5491112345678');
  });

  it('managers get the phones through fetchTalks and fetchTalkForEdit', async () => {
    const event = await createTestEvent();
    const organizer = await createOrganizer(event.id);
    const talk = await createTalkRow(event.id, '5491187654321');
    await actAs(organizer.id);

    const [listed] = await fetchTalks(event.id);
    expect(listed.speakers[0].speakerPhone).toBe('5491187654321');
    expect((await fetchTalkForEdit(talk.id)).speakers[0].speakerPhone).toBe('5491187654321');
  });

  it('everyone else is rejected', async () => {
    const event = await createTestEvent();
    const talk = await createTalkRow(event.id);
    const orphan = await createTalkRow(null);
    const organizer = await createOrganizer(event.id);

    for (const userId of [(await createUser()).id, (await createAmbassador()).id, undefined]) {
      await actAs(userId);
      await expect(fetchTalks(event.id)).rejects.toThrow('No autorizado');
      await expect(fetchTalkForEdit(talk.id)).rejects.toThrow('No autorizado');
    }
    // Una charla sin evento solo la editan los admins
    await actAs(organizer.id);
    await expect(fetchTalkForEdit(orphan.id)).rejects.toThrow('No autorizado');
    await expect(fetchTalkForEdit('no-existe')).rejects.toThrow('Charla no encontrada');
  });
});

describe('fetchPublicTalks', () => {
  it('filters by event and sorts by the event date (or the manual one), newest first', async () => {
    const older = await createTestEvent({ date: daysFromNow(-60) });
    const newer = await createTestEvent({ date: daysFromNow(-5) });
    const tOld = await createTalkRow(older.id);
    const tNew = await createTalkRow(newer.id);
    const manual = await prisma.talk.create({
      data: {
        title: 'Manual',
        description: 'Charla en otro lado',
        manualEventDate: daysFromNow(-30),
        slideImages: [],
      },
    });

    const ids = (await fetchPublicTalks()).map((t) => t.id);
    expect(ids.indexOf(tNew.id)).toBeLessThan(ids.indexOf(manual.id));
    expect(ids.indexOf(manual.id)).toBeLessThan(ids.indexOf(tOld.id));
    expect((await fetchPublicTalks(older.id)).map((t) => t.id)).toEqual([tOld.id]);
  });
});

describe('updateTalk', () => {
  it('replaces the speakers and the talk data', async () => {
    const event = await createTestEvent();
    const organizer = await createOrganizer(event.id);
    const talk = await createTalkRow(event.id);
    await actAs(organizer.id);

    await updateTalk(
      talk.id,
      talkForm({
        eventId: event.id,
        title: 'Título nuevo',
        slidesUrl: 'https://slides.test/1',
        speakers: [
          studentSpeaker({ speakerName: 'Grace' }),
          professionalSpeaker({ speakerName: 'Linus' }),
        ],
      }),
    );

    const updated = await prisma.talk.findUniqueOrThrow({
      where: { id: talk.id },
      include: { speakers: { orderBy: { order: 'asc' } } },
    });
    expect(updated).toMatchObject({ title: 'Título nuevo', slidesUrl: 'https://slides.test/1' });
    expect(updated.speakers.map((s) => s.speakerName)).toEqual(['Grace', 'Linus']);
  });

  it('does not let an organizer move a talk to an event they do not manage', async () => {
    const event = await createTestEvent();
    const other = await createTestEvent();
    const organizer = await createOrganizer(event.id);
    const talk = await createTalkRow(event.id);
    await actAs(organizer.id);

    await expect(updateTalk(talk.id, talkForm({ eventId: other.id }))).rejects.toThrow(
      'No tenés permisos',
    );
    await expect(updateTalk(talk.id, talkForm({ eventId: null }))).rejects.toThrow(
      'No tenés permisos',
    );
    expect((await prisma.talk.findUniqueOrThrow({ where: { id: talk.id } })).eventId).toBe(
      event.id,
    );
  });

  it('rejects outsiders, invalid data and missing talks', async () => {
    const event = await createTestEvent();
    const talk = await createTalkRow(event.id);
    const admin = await createAdmin();

    await actAs((await createAmbassador()).id);
    await expect(updateTalk(talk.id, talkForm({ eventId: event.id }))).rejects.toThrow(
      'No tenés permisos',
    );
    await actAs(admin.id);
    await expect(updateTalk(talk.id, talkForm({ title: 'x' }))).rejects.toThrow(
      'al menos 3 caracteres',
    );
    await expect(updateTalk('no-existe', talkForm())).rejects.toThrow('Charla no encontrada');
    expect((await prisma.talk.findUniqueOrThrow({ where: { id: talk.id } })).title).toBe(
      talk.title,
    );
  });
});

describe('deleteTalk', () => {
  it('deletes the talk and its speakers', async () => {
    const event = await createTestEvent();
    const organizer = await createOrganizer(event.id);
    const talk = await createTalkRow(event.id);
    await actAs(organizer.id);

    await expect(deleteTalk(talk.id)).resolves.toEqual({ success: true });
    expect(await prisma.talk.findUnique({ where: { id: talk.id } })).toBeNull();
    expect(await prisma.talkSpeaker.count({ where: { talkId: talk.id } })).toBe(0);
  });

  it('rejects outsiders and missing talks', async () => {
    const event = await createTestEvent();
    const other = await createTestEvent();
    const talk = await createTalkRow(event.id);

    await actAs((await createOrganizer(other.id)).id);
    await expect(deleteTalk(talk.id)).rejects.toThrow('No tenés permisos');
    await actAs((await createUser()).id);
    await expect(deleteTalk(talk.id)).rejects.toThrow('No tenés permisos');
    await actAs((await createAdmin()).id);
    await expect(deleteTalk('no-existe')).rejects.toThrow('Charla no encontrada');
    expect(await prisma.talk.findUnique({ where: { id: talk.id } })).not.toBeNull();
  });
});

describe('fetchEventsForSelect', () => {
  it('lists live events, newest first, without the deleted ones', async () => {
    const a = await createTestEvent({ date: daysFromNow(100) });
    const b = await createTestEvent({ date: daysFromNow(101) });
    const deleted = await createTestEvent({ deletedAt: new Date() });

    const ids = (await fetchEventsForSelect()).map((e) => e.id);
    expect(ids.indexOf(b.id)).toBeLessThan(ids.indexOf(a.id));
    expect(ids).not.toContain(deleted.id);
  });
});
