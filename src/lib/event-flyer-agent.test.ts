import { prismaMock } from '@/test/prisma';
import { partners } from '@/data/partners';
import { eventDraftSchema, eventFlyerAgent } from './event-flyer-agent';

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
jest.mock('@/lib/agents', () => ({ AGENT_MODEL: 'test/model' }));

const { findVenues, listPartners, recentEvents } = eventFlyerAgent.tools;
const run = <T>(t: { execute?: (..._args: any[]) => T }, input: unknown = {}) =>
  t.execute!(input, { toolCallId: 'call', messages: [], context: {} });

describe('event flyer agent tools', () => {
  it('finds venues already used, one per place with its latest data', async () => {
    prismaMock.event.findMany.mockResolvedValue([
      {
        placeName: 'Once57',
        address: 'Calle 1',
        city: 'Tucumán',
        googleMapsUrl: 'https://maps.app.goo.gl/new',
        date: new Date('2026-09-01'),
      },
      {
        placeName: 'once57',
        address: 'calle 1',
        city: 'Tucumán',
        googleMapsUrl: 'https://maps.app.goo.gl/old',
        date: new Date('2025-01-01'),
      },
    ] as never);

    await expect(run(findVenues, { query: 'once' })).resolves.toEqual([
      {
        placeName: 'Once57',
        address: 'Calle 1',
        city: 'Tucumán',
        googleMapsUrl: 'https://maps.app.goo.gl/new',
        lastUsed: new Date('2026-09-01'),
      },
    ]);
    const { where, orderBy } = prismaMock.event.findMany.mock.calls[0][0] as any;
    expect(where.deletedAt).toBeNull();
    expect(where.OR).toContainEqual({ placeName: { contains: 'once', mode: 'insensitive' } });
    expect(orderBy).toEqual({ date: 'desc' });
  });

  it('lists the site partners with their logos', async () => {
    const list = (await run(listPartners)) as { name: string }[];
    expect(list).toHaveLength(partners.length);
    expect(list[0]).toEqual({
      name: partners[0].name,
      kind: partners[0].kind,
      url: partners[0].url,
      logo: partners[0].logo,
    });
  });

  it('shows the latest events for naming and tone', async () => {
    prismaMock.event.findMany.mockResolvedValue([]);
    await run(recentEvents);
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { deletedAt: null }, take: 6 }),
    );
  });
});

describe('eventDraftSchema', () => {
  it('accepts a draft where nothing could be read', () => {
    expect(
      eventDraftSchema.safeParse({
        notes: 'Nada legible',
        name: null,
        description: null,
        date: null,
        endDate: null,
        isOnline: null,
        city: null,
        placeName: null,
        address: null,
        googleMapsUrl: null,
        streamingUrl: null,
        externalRegistrationUrl: null,
        capacity: null,
        sponsors: [],
      }).success,
    ).toBe(true);
  });
});
