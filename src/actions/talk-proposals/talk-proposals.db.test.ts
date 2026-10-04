import prisma from '@/lib/prisma';
import { createTalkProposal } from '@/actions/talk-proposals/create-talk-proposal';
import { fetchTalkProposals } from '@/actions/talk-proposals/fetch-talk-proposals';
import { updateTalkProposalStatus } from '@/actions/talk-proposals/update-talk-proposal-status';
import { deleteTalkProposal } from '@/actions/talk-proposals/delete-talk-proposal';
import { createTalkFromProposal } from '@/actions/talks/create-talk-from-proposal';
import { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';
import type { TalkProposalStatus } from '@/generated/prisma/client';
import type { TalkProposalFormData } from '@/schemas/talk-proposal-schema';
import { actAs } from '@/test/db/fixtures';
import {
  createAdmin,
  createAmbassador,
  createOrganizer,
  createTestEvent,
  createUser,
  professionalSpeaker,
  queueSessions,
  studentSpeaker,
  uniqueId,
} from '@/test/db/content-fixtures';

// Propuestas de charlas (call for speakers) y su conversión en charla, contra Postgres real.

const proposalForm = (overrides: Partial<TalkProposalFormData> = {}): TalkProposalFormData => ({
  title: `Propuesta ${uniqueId()}`,
  description: 'Quiero contar cómo migramos a Prisma 7',
  speakers: [professionalSpeaker()],
  ...overrides,
});

const openEvent = () => createTestEvent({ callForSpeakersEnabled: true });

/** Una propuesta enviada por un usuario cualquiera al evento. */
const submitProposal = async (eventId: string, overrides: Partial<TalkProposalFormData> = {}) => {
  const author = await createUser();
  await actAs(author.id);
  const { proposalId } = await createTalkProposal(eventId, proposalForm(overrides));
  return { proposalId, author };
};

describe('createTalkProposal', () => {
  it('stores the proposal with its speakers and notifies the admins', async () => {
    const admin = await createAdmin();
    const event = await openEvent();

    const { proposalId, author } = await submitProposal(event.id, {
      speakers: [
        professionalSpeaker({ speakerName: 'Uno' }),
        studentSpeaker({ speakerName: 'Dos' }),
      ],
    });

    const proposal = await prisma.talkProposal.findUniqueOrThrow({
      where: { id: proposalId },
      include: { speakers: { orderBy: { order: 'asc' }, omit: { speakerPhone: false } } },
    });
    expect(proposal).toMatchObject({ eventId: event.id, userId: author.id, status: 'PENDING' });
    expect(proposal.speakers.map((s) => [s.order, s.speakerName, s.speakerPhone])).toEqual([
      [0, 'Uno', '5493815123456'],
      [1, 'Dos', '5493815999999'],
    ]);
    const notification = await prisma.notification.findFirstOrThrow({
      where: {
        userId: admin.id,
        type: 'talk_proposal_created',
        metadata: { contains: proposalId },
      },
    });
    expect(notification.message).toContain(proposal.title);
  });

  it('only accepts proposals for live events with call for speakers enabled', async () => {
    const closed = await createTestEvent();
    const deleted = await createTestEvent({ callForSpeakersEnabled: true, deletedAt: new Date() });
    const user = await createUser();
    await actAs(user.id);

    await expect(createTalkProposal(closed.id, proposalForm())).rejects.toThrow(
      'no tiene call for speakers',
    );
    await expect(createTalkProposal(deleted.id, proposalForm())).rejects.toThrow(
      'Evento no encontrado',
    );
    expect(await prisma.talkProposal.count({ where: { userId: user.id } })).toBe(0);
  });

  it('requires a session and valid data', async () => {
    const event = await openEvent();
    const title = `Inválida ${uniqueId()}`;

    await actAs();
    await expect(createTalkProposal(event.id, proposalForm({ title }))).rejects.toThrow(
      'Debes estar autenticado',
    );
    await actAs((await createUser()).id);
    await expect(
      createTalkProposal(
        event.id,
        proposalForm({ title, speakers: [professionalSpeaker({ speakerPhone: '+54 381 555' })] }),
      ),
    ).rejects.toThrow('solo dígitos');
    await expect(
      createTalkProposal(event.id, proposalForm({ title, speakers: [] })),
    ).rejects.toThrow('Agregá al menos un orador');

    expect(await prisma.talkProposal.count({ where: { title } })).toBe(0);
  });
});

describe('fetchTalkProposals', () => {
  it('gives managers every proposal of the event, with phones and the talk it became', async () => {
    const event = await openEvent();
    const organizer = await createOrganizer(event.id);
    const { proposalId } = await submitProposal(event.id);
    await submitProposal((await openEvent()).id); // otra, de otro evento

    await actAs(organizer.id);
    const proposals = await fetchTalkProposals(event.id);

    expect(proposals.map((p) => p.id)).toEqual([proposalId]);
    expect(proposals[0].speakers[0].speakerPhone).toBe('5493815123456');
    expect(proposals[0].talk).toBeNull();
  });

  it('rejects everyone else', async () => {
    const event = await openEvent();
    const { author } = await submitProposal(event.id);

    // Ni siquiera quien la propuso ve el listado del evento
    for (const userId of [author.id, (await createAmbassador()).id, undefined]) {
      await actAs(userId);
      await expect(fetchTalkProposals(event.id)).rejects.toThrow('No autorizado');
    }
  });
});

describe('updateTalkProposalStatus', () => {
  it('lets the organizers accept or reject a proposal', async () => {
    const event = await openEvent();
    const organizer = await createOrganizer(event.id);
    const { proposalId } = await submitProposal(event.id);
    await actAs(organizer.id);

    await updateTalkProposalStatus(proposalId, 'ACCEPTED');
    expect(
      (await prisma.talkProposal.findUniqueOrThrow({ where: { id: proposalId } })).status,
    ).toBe('ACCEPTED');
    await updateTalkProposalStatus(proposalId, 'REJECTED');
    expect(
      (await prisma.talkProposal.findUniqueOrThrow({ where: { id: proposalId } })).status,
    ).toBe('REJECTED');
  });

  it('rejects outsiders, unknown statuses and missing proposals', async () => {
    const event = await openEvent();
    const { proposalId, author } = await submitProposal(event.id);
    const otherOrganizer = await createOrganizer((await openEvent()).id);

    for (const userId of [author.id, otherOrganizer.id]) {
      await actAs(userId);
      await expect(updateTalkProposalStatus(proposalId, 'ACCEPTED')).rejects.toThrow(
        'No tenés permisos',
      );
    }
    await actAs((await createAdmin()).id);
    await expect(
      updateTalkProposalStatus(proposalId, 'APPROVED' as TalkProposalStatus),
    ).rejects.toThrow();
    await expect(updateTalkProposalStatus('no-existe', 'ACCEPTED')).rejects.toThrow(
      'Propuesta no encontrada',
    );
    expect(
      (await prisma.talkProposal.findUniqueOrThrow({ where: { id: proposalId } })).status,
    ).toBe('PENDING');
  });
});

describe('deleteTalkProposal', () => {
  it('deletes the proposal and its speakers', async () => {
    const event = await openEvent();
    const organizer = await createOrganizer(event.id);
    const { proposalId } = await submitProposal(event.id);
    await actAs(organizer.id);

    await expect(deleteTalkProposal(proposalId)).resolves.toEqual({ success: true });
    expect(await prisma.talkProposal.findUnique({ where: { id: proposalId } })).toBeNull();
    expect(await prisma.talkProposalSpeaker.count({ where: { talkProposalId: proposalId } })).toBe(
      0,
    );
  });

  it('keeps the talk it became, unlinked', async () => {
    const event = await openEvent();
    const admin = await createAdmin();
    const { proposalId } = await submitProposal(event.id);
    await actAs(admin.id);
    const { talkId } = await createTalkFromProposal(proposalId);

    await deleteTalkProposal(proposalId);

    expect(await prisma.talk.findUniqueOrThrow({ where: { id: talkId } })).toMatchObject({
      proposalId: null,
      eventId: event.id,
    });
  });

  it('rejects outsiders and missing proposals', async () => {
    const event = await openEvent();
    const { proposalId, author } = await submitProposal(event.id);

    await actAs(author.id);
    await expect(deleteTalkProposal(proposalId)).rejects.toThrow('No tenés permisos');
    await actAs((await createAdmin()).id);
    await expect(deleteTalkProposal('no-existe')).rejects.toThrow('Propuesta no encontrada');
    expect(await prisma.talkProposal.findUnique({ where: { id: proposalId } })).not.toBeNull();
  });
});

describe('createTalkFromProposal', () => {
  it('turns a proposal into a talk, copying its speakers with their phones', async () => {
    const event = await openEvent();
    const organizer = await createOrganizer(event.id);
    const speakerUser = await createUser();
    const { proposalId } = await submitProposal(event.id, {
      title: 'De propuesta a charla',
      speakers: [
        studentSpeaker({ speakerName: 'Primera', userId: speakerUser.id }),
        professionalSpeaker({ speakerName: 'Segundo' }),
      ],
    });
    await actAs(organizer.id);

    const result = await createTalkFromProposal(proposalId);

    expect(result).toMatchObject({ success: true, alreadyExists: false });
    const talk = await prisma.talk.findUniqueOrThrow({
      where: { id: result.talkId },
      include: { speakers: { orderBy: { order: 'asc' }, omit: { speakerPhone: false } } },
    });
    expect(talk).toMatchObject({ title: 'De propuesta a charla', eventId: event.id, proposalId });
    expect(talk.speakers.map((s) => [s.order, s.speakerName, s.userId, s.speakerPhone])).toEqual([
      [0, 'Primera', speakerUser.id, '5493815999999'],
      [1, 'Segundo', null, '5493815123456'],
    ]);
    // Ya aparece en el listado público, sin teléfonos
    const listed = (await fetchPublicTalks(event.id)).find((t) => t.id === talk.id);
    expect(listed?.speakers[0]).not.toHaveProperty('speakerPhone');
    // Y la propuesta ahora apunta a su charla
    expect((await fetchTalkProposals(event.id))[0].talk).toEqual({ id: talk.id });
  });

  it('converting twice returns the same talk instead of creating another', async () => {
    const event = await openEvent();
    const admin = await createAdmin();
    const { proposalId } = await submitProposal(event.id);
    await actAs(admin.id);

    const first = await createTalkFromProposal(proposalId);
    const second = await createTalkFromProposal(proposalId);

    expect(second).toEqual({ success: true, talkId: first.talkId, alreadyExists: true });
    expect(await prisma.talk.count({ where: { proposalId } })).toBe(1);
  });

  // BUG: createTalkFromProposal (src/actions/talks/create-talk-from-proposal.ts) checks
  // `proposal.talk` and then creates the talk outside a transaction, so a double click (two
  // requests at once) both pass the check and the second one fails with Prisma's raw unique
  // constraint error on Talk.proposalId (P2002) instead of returning `alreadyExists`.
  it.failing(
    'a double click (two conversions at once) answers both with the same talk',
    async () => {
      const event = await openEvent();
      const admin = await createAdmin();
      const { proposalId } = await submitProposal(event.id);
      await queueSessions([admin.id, admin.id]);

      const results = await Promise.allSettled([
        createTalkFromProposal(proposalId),
        createTalkFromProposal(proposalId),
      ]);

      expect(results.map((r) => r.status)).toEqual(['fulfilled', 'fulfilled']);
      expect(await prisma.talk.count({ where: { proposalId } })).toBe(1);
    },
  );

  it('rejects outsiders, organizers of other events and missing proposals', async () => {
    const event = await openEvent();
    const { proposalId, author } = await submitProposal(event.id);
    const otherOrganizer = await createOrganizer((await openEvent()).id);

    for (const userId of [author.id, otherOrganizer.id]) {
      await actAs(userId);
      await expect(createTalkFromProposal(proposalId)).rejects.toThrow('No tenés permisos');
    }
    await actAs();
    await expect(createTalkFromProposal(proposalId)).rejects.toThrow('Debes estar autenticado');
    await actAs((await createAdmin()).id);
    await expect(createTalkFromProposal('no-existe')).rejects.toThrow('Propuesta no encontrada');

    expect(await prisma.talk.count({ where: { proposalId } })).toBe(0);
  });
});
