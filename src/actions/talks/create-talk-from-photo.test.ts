import { createTalkFromPhoto } from './create-talk-from-photo';
import { prismaMock } from '@/test/prisma';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getObjectBuffer, publicFileUrl } from '@/lib/s3';
import { talkAgent, type TalkDraft } from '@/lib/talk-agent';

jest.mock('@/lib/admin', () => ({ requireAdmin: jest.fn() }));
jest.mock('@/lib/rate-limit', () => ({ enforceRateLimit: jest.fn() }));
jest.mock('@/lib/s3', () => ({
  publicFileUrl: (key: string) => `https://cdn.dev/${key}`,
  keyFromPublicUrl: (url: string) =>
    url.startsWith('https://cdn.dev/') ? url.slice('https://cdn.dev/'.length) : null,
  getObjectBuffer: jest.fn(),
}));
jest.mock('@/lib/talk-agent', () => ({
  talkAgent: { generate: jest.fn() },
  imageForModel: jest.fn(async () => Buffer.from('small')),
}));
jest.mock('exifr', () => ({
  parse: jest.fn(async () => ({ DateTimeOriginal: new Date('2026-09-12T20:00:00Z') })),
}));

const EVENT_ID = 'ctesteventid1234';
const PHOTO = publicFileUrl('talks/portraits/photo.jpg');

const draft = (overrides: Partial<TalkDraft> = {}): TalkDraft => ({
  found: true,
  reason: 'La slide dice "Rust en producción" y coincide con la propuesta aceptada.',
  eventId: EVENT_ID,
  proposalId: 'proposal-1',
  title: 'Rust en producción',
  description: 'Cómo migramos un servicio crítico a Rust.',
  speakers: [
    {
      userId: 'cuseradalove1234',
      speakerName: 'Ada Lovelace',
      isProfessional: true,
      jobTitle: 'Engineer',
      enterprise: 'Acme',
      isStudent: false,
      career: null,
      studyPlace: null,
    },
  ],
  ...overrides,
});

const generate = jest.mocked(talkAgent.generate);

beforeEach(() => {
  process.env.AI_GATEWAY_API_KEY = 'test-key';
  jest.mocked(getObjectBuffer).mockResolvedValue(Buffer.from('photo'));
  prismaMock.event.findFirst.mockResolvedValue({ id: EVENT_ID } as never);
  prismaMock.talkProposal.findFirst.mockResolvedValue({
    id: 'proposal-1',
    talk: null,
    speakers: [
      { userId: 'cuseradalove1234', speakerName: 'Ada Lovelace', speakerPhone: '+54 381 1' },
    ],
  } as never);
  prismaMock.user.findMany.mockResolvedValue([
    { id: 'cuseradalove1234', phoneNumber: null },
  ] as never);
  prismaMock.talk.create.mockResolvedValue({ id: 'talk-1', title: 'Rust en producción' } as never);
});

afterEach(() => {
  delete process.env.AI_GATEWAY_API_KEY;
});

describe('createTalkFromPhoto', () => {
  it('requires an admin and applies the rate limit before doing anything', async () => {
    jest.mocked(requireAdmin).mockRejectedValueOnce(new Error('No autorizado'));
    await expect(createTalkFromPhoto(PHOTO)).rejects.toThrow('No autorizado');
    expect(enforceRateLimit).not.toHaveBeenCalled();
    expect(getObjectBuffer).not.toHaveBeenCalled();

    await createTalkFromPhoto(PHOTO);
    expect(enforceRateLimit).toHaveBeenCalledWith('talkAgent');
  });

  it('only reads photos uploaded to the talk portraits folder', async () => {
    for (const url of [
      'https://evil.example.com/talks/portraits/x.jpg',
      publicFileUrl('profiles/x.jpg'),
      42 as never,
    ]) {
      await expect(createTalkFromPhoto(url)).resolves.toMatchObject({ status: 'failed' });
    }
    expect(getObjectBuffer).not.toHaveBeenCalled();
  });

  it('explains when the model key is missing', async () => {
    delete process.env.AI_GATEWAY_API_KEY;
    await expect(createTalkFromPhoto(PHOTO)).resolves.toEqual({
      status: 'failed',
      reason: expect.stringContaining('AI_GATEWAY_API_KEY'),
    });
    expect(generate).not.toHaveBeenCalled();
  });

  it('creates the talk from the proposal the agent found, with the phones from the proposal', async () => {
    generate.mockResolvedValue({ output: draft() } as never);

    await expect(createTalkFromPhoto(PHOTO)).resolves.toEqual({
      status: 'created',
      talkId: 'talk-1',
      title: 'Rust en producción',
      reason: draft().reason,
    });

    const prompt = JSON.stringify(generate.mock.calls[0][0]);
    expect(prompt).toContain('La foto se sacó el 2026-09-12');
    expect(prismaMock.talk.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventId: EVENT_ID,
        proposalId: 'proposal-1',
        portraitUrl: PHOTO,
        speakers: {
          create: [
            expect.objectContaining({
              userId: 'cuseradalove1234',
              speakerName: 'Ada Lovelace',
              speakerPhone: '+54 381 1',
              order: 0,
            }),
          ],
        },
      }),
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/eventos/${EVENT_ID}/charlas`);
    expect(revalidatePath).toHaveBeenCalledWith('/charlas');
  });

  it('drops user ids that do not exist and proposals from another event', async () => {
    generate.mockResolvedValue({ output: draft() } as never);
    prismaMock.talkProposal.findFirst.mockResolvedValue(null);
    prismaMock.user.findMany.mockResolvedValue([]);

    await createTalkFromPhoto(PHOTO);

    expect(prismaMock.talkProposal.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'proposal-1', eventId: EVENT_ID } }),
    );
    const { data } = prismaMock.talk.create.mock.calls[0][0] as any;
    expect(data.proposalId).toBeNull();
    expect(data.speakers.create[0]).toMatchObject({ userId: null, speakerPhone: '' });
  });

  it('reports what the agent could not find', async () => {
    generate.mockResolvedValue({
      output: draft({ found: false, reason: 'No hay eventos cerca de esa fecha.' }),
    } as never);
    await expect(createTalkFromPhoto(PHOTO)).resolves.toEqual({
      status: 'failed',
      reason: 'No hay eventos cerca de esa fecha.',
    });
    expect(prismaMock.talk.create).not.toHaveBeenCalled();
  });

  it('refuses events that do not exist and talks already loaded', async () => {
    generate.mockResolvedValue({ output: draft() } as never);
    prismaMock.event.findFirst.mockResolvedValueOnce(null);
    await expect(createTalkFromPhoto(PHOTO)).resolves.toMatchObject({ status: 'failed' });

    prismaMock.talkProposal.findFirst.mockResolvedValueOnce({
      id: 'proposal-1',
      talk: { id: 'talk-0' },
      speakers: [],
    } as never);
    await expect(createTalkFromPhoto(PHOTO)).resolves.toEqual({
      status: 'failed',
      reason: 'Esa charla ya está cargada',
    });

    // Dos cargas a la vez de la misma propuesta
    prismaMock.talk.create.mockRejectedValueOnce({ code: 'P2002' });
    await expect(createTalkFromPhoto(PHOTO)).resolves.toEqual({
      status: 'failed',
      reason: 'Esa charla ya está cargada',
    });
  });

  it('returns a draft for the form when the speakers miss required data', async () => {
    generate.mockResolvedValue({
      output: draft({
        speakers: [{ ...draft().speakers[0], jobTitle: null, enterprise: null }],
      }),
    } as never);

    const result = await createTalkFromPhoto(PHOTO);

    expect(result).toMatchObject({
      status: 'draft',
      draft: {
        eventId: EVENT_ID,
        title: 'Rust en producción',
        portraitUrl: PHOTO,
        speakers: [{ speakerName: 'Ada Lovelace', jobTitle: '', enterprise: '' }],
      },
    });
    expect(prismaMock.talk.create).not.toHaveBeenCalled();
  });

  it('fails gracefully when the agent errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    generate.mockRejectedValue(new Error('gateway down'));
    await expect(createTalkFromPhoto(PHOTO)).resolves.toEqual({
      status: 'failed',
      reason: 'El agente no pudo analizar la foto. Probá de nuevo.',
    });
  });
});
