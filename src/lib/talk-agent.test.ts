import { prismaMock } from '@/test/prisma';
import { getObjectBuffer } from '@/lib/s3';
import { talkAgent, talkDraftSchema } from './talk-agent';

// `ai` is ESM only and Jest runs CommonJS: a shim that keeps what the agent was built with.
jest.mock('ai', () => ({
  tool: (definition: unknown) => definition,
  isStepCount: (count: number) => count,
  Output: { object: (options: unknown) => options },
  ToolLoopAgent: class {
    tools: unknown;
    constructor(settings: { tools: unknown }) {
      this.tools = settings.tools;
    }
  },
}));
jest.mock('@/lib/s3', () => ({
  keyFromPublicUrl: (url: string) =>
    url.startsWith('https://cdn.dev/') ? url.slice('https://cdn.dev/'.length) : null,
  getObjectBuffer: jest.fn(),
}));
jest.mock('sharp', () =>
  jest.fn(() => {
    const pipeline = {
      rotate: () => pipeline,
      resize: () => pipeline,
      jpeg: () => pipeline,
      toBuffer: async () => Buffer.from('jpeg'),
    };
    return pipeline;
  }),
);

const { findEvents, getEventDetails, viewEventFlyers, searchUsers } = talkAgent.tools;
const run = <T>(t: { execute?: (..._args: any[]) => T }, input: unknown) =>
  t.execute!(input, { toolCallId: 'call', messages: [], context: {} });

const eventRow = {
  id: 'e1',
  name: 'Meetup',
  date: new Date('2026-09-12T21:00:00Z'),
  endDate: null,
  placeName: 'Once57',
  city: null,
  isOnline: false,
  flyerImages: ['https://cdn.dev/events/flyers/a.png'],
  _count: { talks: 1, talkProposals: 3 },
};

describe('talk agent tools', () => {
  it('finds events around the date the photo was taken', async () => {
    prismaMock.event.findMany.mockResolvedValue([eventRow] as never);

    const rows = await run(findEvents, { around: '2026-09-12' });

    expect(rows).toEqual([
      expect.objectContaining({ id: 'e1', flyers: 1, talks: 1, proposals: 3 }),
    ]);
    const { where } = prismaMock.event.findMany.mock.calls[0][0] as any;
    expect(where.deletedAt).toBeNull();
    expect(where.date.gte).toEqual(new Date('2026-09-09T12:00:00Z'));
    expect(where.date.lte).toEqual(new Date('2026-09-15T12:00:00Z'));
  });

  it('searches events by text, or lists the latest past ones', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);

    await run(findEvents, { query: 'rust' });
    expect((prismaMock.event.findMany.mock.calls[0][0] as any).where.OR).toContainEqual({
      name: { contains: 'rust', mode: 'insensitive' },
    });

    await run(findEvents, {});
    expect((prismaMock.event.findMany.mock.calls[1][0] as any).where.date.lte).toBeInstanceOf(Date);
  });

  it('details proposals and existing talks, never the speakers phones', async () => {
    prismaMock.event.findFirst.mockResolvedValueOnce({
      ...eventRow,
      description: 'Una noche de charlas',
      talkProposals: [
        { id: 'p1', title: 'Rust', status: 'ACCEPTED', talk: { id: 't1' }, speakers: [] },
      ],
      talks: [{ id: 't1', title: 'Rust', speakers: [{ speakerName: 'Ada' }] }],
    } as never);

    const details = await run(getEventDetails, { eventId: 'e1' });

    expect(details).toMatchObject({
      description: 'Una noche de charlas',
      proposals: [{ id: 'p1', alreadyHasTalk: true }],
      existingTalks: [{ id: 't1', speakers: ['Ada'] }],
    });
    const { select } = prismaMock.event.findFirst.mock.calls[0][0] as any;
    expect(select.talkProposals.select.speakers.select).not.toHaveProperty('speakerPhone');

    prismaMock.event.findFirst.mockResolvedValueOnce(null);
    await expect(run(getEventDetails, { eventId: 'nope' })).resolves.toEqual({
      error: 'No existe ese evento',
    });
  });

  it('shows the flyers stored in the bucket as images', async () => {
    prismaMock.event.findFirst.mockResolvedValueOnce({
      flyerImages: ['https://cdn.dev/events/flyers/a.png', 'https://elsewhere.dev/b.png'],
    } as never);
    jest.mocked(getObjectBuffer).mockResolvedValue(Buffer.from('png'));

    const output = await run(viewEventFlyers, { eventId: 'e1' });

    expect(getObjectBuffer).toHaveBeenCalledTimes(1);
    expect(getObjectBuffer).toHaveBeenCalledWith('events/flyers/a.png');
    expect(viewEventFlyers.toModelOutput!({ output, toolCallId: 'c', input: {} } as any)).toEqual({
      type: 'content',
      value: [
        {
          type: 'file',
          mediaType: 'image/jpeg',
          data: { type: 'data', data: Buffer.from('jpeg').toString('base64') },
        },
      ],
    });
    expect(
      viewEventFlyers.toModelOutput!({ output: { images: [] }, toolCallId: 'c', input: {} } as any),
    ).toEqual({ type: 'content', value: [{ type: 'text', text: 'El evento no tiene flyers.' }] });
  });

  it('searches users without exposing emails or phones', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: 'u1',
        name: 'Ada Lovelace',
        slogan: null,
        jobTitle: 'Engineer',
        enterprise: 'Acme',
        career: null,
        studyPlace: null,
        positions: [],
      },
    ] as never);

    await expect(run(searchUsers, { query: 'ada' })).resolves.toEqual([
      expect.objectContaining({ id: 'u1', name: 'Ada Lovelace' }),
    ]);
    const { select } = prismaMock.user.findMany.mock.calls[0][0] as any;
    expect(select).not.toHaveProperty('email');
    expect(select).not.toHaveProperty('phoneNumber');
  });
});

describe('talkDraftSchema', () => {
  it('accepts a "not found" answer', () => {
    expect(
      talkDraftSchema.safeParse({
        found: false,
        reason: 'No hay eventos cerca',
        eventId: null,
        proposalId: null,
        title: '',
        description: '',
        speakers: [],
      }).success,
    ).toBe(true);
  });
});
