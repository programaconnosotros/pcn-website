import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import { signGallerySrc } from '@/lib/gallery-signing';
import { prismaMock } from '@/test/prisma';
import AgentsPage, { dynamic, generateMetadata } from './page';

jest.mock('@/actions/analytics/track-page-visit', () => ({ trackPageVisit: jest.fn() }));
jest.mock('@/lib/gallery-signing', () => ({
  signGallerySrc: jest.fn((src: string) => ({ url: src })),
}));

const EVENT_ID = 'cmo9h0hwm00i2620uj1vixr1t';

const event = (overrides: Record<string, unknown> = {}) =>
  ({
    id: EVENT_ID,
    name: 'Zero to Agent',
    description: 'Construí tu primer agente.',
    flyerImages: [],
    galleryItems: [],
    ...overrides,
  }) as never;

describe('/agents metadata', () => {
  it('is always rendered on demand', () => {
    expect(dynamic).toBe('force-dynamic');
  });

  it('points to the events when the event is gone', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);

    const metadata = await generateMetadata();

    expect(prismaMock.event.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: EVENT_ID } }),
    );
    expect(metadata).toMatchObject({
      title: 'ls ~/eventos',
      description: 'Participá del próximo evento de PCN.',
      openGraph: { title: 'Eventos', url: expect.stringMatching(/\/agents$/) },
    });
  });

  it('shares the event with its flyer and a description cut to 160 characters', async () => {
    prismaMock.event.findUnique.mockResolvedValue(
      event({ flyerImages: ['https://cdn.example.com/flyer.png'], description: 'd'.repeat(200) }),
    );

    const metadata = await generateMetadata();

    expect(metadata).toMatchObject({
      title: 'cat ~/eventos/zero-to-agent',
      description: `${'d'.repeat(157)}...`,
      openGraph: { title: 'Zero to Agent', images: ['https://cdn.example.com/flyer.png'] },
      twitter: { title: 'Zero to Agent', images: ['https://cdn.example.com/flyer.png'] },
    });
  });

  it('falls back to a gallery photo and then to the generated card, as absolute URLs', async () => {
    prismaMock.event.findUnique.mockResolvedValueOnce(
      event({ galleryItems: [{ src: '/api/gallery/1.jpg' }] }),
    );
    const withPhoto = await generateMetadata();
    expect(signGallerySrc).toHaveBeenCalledWith('/api/gallery/1.jpg');
    expect(withPhoto.openGraph?.images).toEqual([
      expect.stringMatching(/^https?:\/\/.+\/api\/gallery\/1\.jpg$/),
    ]);

    prismaMock.event.findUnique.mockResolvedValueOnce(event());
    const withoutImages = await generateMetadata();
    expect(withoutImages.description).toBe('Construí tu primer agente.');
    expect(withoutImages.openGraph?.images).toEqual([
      expect.stringMatching(new RegExp(`^https?://.+/eventos/${EVENT_ID}/og-image$`)),
    ]);
  });
});

describe('/agents', () => {
  it('tracks the visit and redirects to the event', async () => {
    prismaMock.event.findUnique.mockResolvedValue(event());

    await expect(AgentsPage()).rejects.toThrow(`NEXT_REDIRECT:/eventos/${EVENT_ID}`);
    expect(trackPageVisit).toHaveBeenCalledWith('/agents');
  });

  it('redirects to the events list when the event is gone', async () => {
    prismaMock.event.findUnique.mockResolvedValue(null);

    await expect(AgentsPage()).rejects.toThrow(/^NEXT_REDIRECT:\/eventos$/);
  });
});
