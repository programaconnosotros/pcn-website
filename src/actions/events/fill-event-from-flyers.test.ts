import { fillEventFromFlyers } from './fill-event-from-flyers';
import { requireAdmin } from '@/lib/admin';
import { enforceRateLimit } from '@/lib/rate-limit';
import { bucketImagesForModel } from '@/lib/agents';
import { eventFlyerAgent, type EventDraft } from '@/lib/event-flyer-agent';
import { partners } from '@/data/partners';

jest.mock('@/lib/admin', () => ({ requireAdmin: jest.fn() }));
jest.mock('@/lib/rate-limit', () => ({ enforceRateLimit: jest.fn() }));
jest.mock('@/lib/s3', () => ({
  keyFromPublicUrl: (url: string) =>
    url.startsWith('https://cdn.dev/') ? url.slice('https://cdn.dev/'.length) : null,
}));
jest.mock('@/lib/agents', () => ({
  MISSING_AGENT_KEY: 'Falta configurar AI_GATEWAY_API_KEY',
  bucketImagesForModel: jest.fn(async () => ['b64']),
}));
jest.mock('@/lib/event-flyer-agent', () => ({ eventFlyerAgent: { generate: jest.fn() } }));

const FLYER = 'https://cdn.dev/events/flyers/a.png';
const generate = jest.mocked(eventFlyerAgent.generate);

const draft = (overrides: Partial<EventDraft> = {}): EventDraft => ({
  notes: 'Leí fecha, lugar y sponsors.',
  name: 'PCN Meetup #12',
  description: 'Una noche de charlas sobre Rust y sistemas distribuidos.',
  date: '2026-11-14T19:00',
  endDate: '2026-11-14T22:00',
  isOnline: false,
  city: 'San Miguel de Tucumán',
  placeName: 'Once57',
  address: 'Calle 123',
  googleMapsUrl: 'https://maps.app.goo.gl/abc',
  streamingUrl: null,
  externalRegistrationUrl: 'https://lu.ma/pcn',
  capacity: 80,
  sponsors: [],
  ...overrides,
});

beforeEach(() => {
  process.env.AI_GATEWAY_API_KEY = 'test-key';
});
afterEach(() => {
  delete process.env.AI_GATEWAY_API_KEY;
});

describe('fillEventFromFlyers', () => {
  it('requires an admin before anything else', async () => {
    jest.mocked(requireAdmin).mockRejectedValueOnce(new Error('No autorizado'));
    await expect(fillEventFromFlyers([FLYER])).rejects.toThrow('No autorizado');
    expect(enforceRateLimit).not.toHaveBeenCalled();
  });

  it('only reads flyers uploaded to the event flyers folder', async () => {
    for (const urls of [
      [],
      ['https://evil.example.com/events/flyers/a.png'],
      [FLYER, 'https://cdn.dev/profiles/me.png'],
      'nope' as never,
    ]) {
      await expect(fillEventFromFlyers(urls)).resolves.toEqual({
        status: 'failed',
        reason: 'Subí los flyers desde este formulario',
      });
    }
    expect(bucketImagesForModel).not.toHaveBeenCalled();
    expect(enforceRateLimit).not.toHaveBeenCalled();
  });

  it('explains when the model key is missing', async () => {
    delete process.env.AI_GATEWAY_API_KEY;
    await expect(fillEventFromFlyers([FLYER])).resolves.toEqual({
      status: 'failed',
      reason: 'Falta configurar AI_GATEWAY_API_KEY',
    });
    expect(enforceRateLimit).toHaveBeenCalledWith('aiAgent');
    expect(generate).not.toHaveBeenCalled();
  });

  it('returns the form values read from the flyers', async () => {
    generate.mockResolvedValue({ output: draft() } as never);

    await expect(fillEventFromFlyers([FLYER])).resolves.toEqual({
      status: 'ok',
      notes: 'Leí fecha, lugar y sponsors.',
      values: {
        name: 'PCN Meetup #12',
        description: 'Una noche de charlas sobre Rust y sistemas distribuidos.',
        date: '2026-11-14T19:00',
        endDate: '2026-11-14T22:00',
        isOnline: false,
        city: 'San Miguel de Tucumán',
        placeName: 'Once57',
        address: 'Calle 123',
        googleMapsUrl: 'https://maps.app.goo.gl/abc',
        externalRegistrationUrl: 'https://lu.ma/pcn',
        capacity: '80',
      },
    });
    expect(bucketImagesForModel).toHaveBeenCalledWith([FLYER]);
    const content = (generate.mock.calls[0][0] as any).messages[0].content;
    expect(content[1]).toEqual({ type: 'file', mediaType: 'image/jpeg', data: 'b64' });
  });

  it('drops what the form would reject and only trusts partner logos', async () => {
    const partner = partners[0];
    generate.mockResolvedValue({
      output: draft({
        description: 'corta',
        date: '14/11 19hs',
        endDate: '2026-11-14T22:00',
        googleMapsUrl: 'https://example.com/maps',
        externalRegistrationUrl: 'javascript:alert(1)',
        capacity: 0,
        sponsors: [
          { name: partner.name.toUpperCase(), website: null, logo: 'https://evil.dev/x.png' },
          { name: 'Otra empresa', website: 'https://otra.dev', logo: 'https://evil.dev/y.png' },
          { name: '  ', website: null, logo: null },
        ],
      }),
    } as never);

    const result = await fillEventFromFlyers([FLYER]);

    expect(result.status).toBe('ok');
    const { values } = result as Extract<typeof result, { status: 'ok' }>;
    for (const field of [
      'description',
      'date',
      'endDate',
      'googleMapsUrl',
      'externalRegistrationUrl',
      'capacity',
    ]) {
      expect(values).not.toHaveProperty(field);
    }
    expect(values.sponsors).toEqual([
      { name: partner.name, website: partner.url, logo: partner.logo },
      { name: 'Otra empresa', website: 'https://otra.dev', logo: '' },
    ]);
  });

  it('fails with the agent notes when nothing could be read', async () => {
    generate.mockResolvedValue({
      output: {
        ...draft(),
        name: null,
        description: null,
        date: null,
        endDate: null,
        isOnline: null,
        city: null,
        placeName: null,
        address: null,
        googleMapsUrl: null,
        externalRegistrationUrl: null,
        capacity: null,
        notes: 'Los flyers no tienen texto legible.',
      },
    } as never);
    await expect(fillEventFromFlyers([FLYER])).resolves.toEqual({
      status: 'failed',
      reason: 'Los flyers no tienen texto legible.',
    });
  });

  it('fails gracefully when the agent errors', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    generate.mockRejectedValue(new Error('gateway down'));
    await expect(fillEventFromFlyers([FLYER])).resolves.toEqual({
      status: 'failed',
      reason: 'El agente no pudo leer los flyers. Probá de nuevo.',
    });
  });
});
