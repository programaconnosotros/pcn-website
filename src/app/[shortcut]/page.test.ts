import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import { findNextEventByShortcut } from '@/lib/event-shortcuts';
import { signGallerySrc } from '@/lib/gallery-signing';
import ShortcutPage, { dynamic, generateMetadata } from './page';

jest.mock('@/actions/analytics/track-page-visit', () => ({ trackPageVisit: jest.fn() }));
jest.mock('@/lib/event-shortcuts', () => ({
  ...jest.requireActual('@/lib/event-shortcuts'),
  findNextEventByShortcut: jest.fn(),
}));
jest.mock('@/lib/gallery-signing', () => ({
  signGallerySrc: jest.fn((src: string) => ({ url: `${src}?signed` })),
}));

type ShortcutEvent = NonNullable<Awaited<ReturnType<typeof findNextEventByShortcut>>>;

const event = (overrides: Partial<ShortcutEvent> = {}) =>
  ({
    id: 'ev1',
    name: 'Cowork de octubre',
    description: 'Vení a programar con la comunidad.',
    flyerImages: [],
    galleryItems: [],
    ...overrides,
  }) as ShortcutEvent;

const params = (shortcut: string) => ({ params: Promise.resolve({ shortcut }) });
const findEvent = jest.mocked(findNextEventByShortcut);

describe('/[shortcut] metadata', () => {
  it('is always rendered on demand', () => {
    expect(dynamic).toBe('force-dynamic');
  });

  it('invites to the next events when no event uses the shortcut', async () => {
    findEvent.mockResolvedValue(null);

    const metadata = await generateMetadata(params('nada'));

    expect(findEvent).toHaveBeenCalledWith('nada');
    expect(metadata).toMatchObject({
      title: { absolute: 'programaConNosotros:~$' },
      description: 'Participá de los próximos eventos de PCN.',
      openGraph: { title: 'programaConNosotros', url: expect.stringMatching(/\/nada$/) },
      twitter: { card: 'summary_large_image' },
    });
  });

  it('shares the next event with its flyer, labeled by the shortcut', async () => {
    findEvent.mockResolvedValue(event({ flyerImages: ['https://cdn.example.com/flyer.png'] }));

    const metadata = await generateMetadata(params('cowork'));

    expect(metadata).toMatchObject({
      title: 'cat ~/eventos/cowork-de-octubre',
      description: 'Vení a programar con la comunidad.',
      openGraph: {
        title: 'Cowork de octubre - Cowork',
        images: [expect.stringContaining('flyer.png')],
        url: expect.stringMatching(/\/cowork$/),
      },
      twitter: { title: 'Cowork de octubre', images: [expect.stringContaining('flyer.png')] },
    });
    expect(signGallerySrc).not.toHaveBeenCalled();
  });

  it('falls back to a signed gallery photo, then to the generated card', async () => {
    findEvent.mockResolvedValueOnce(event({ galleryItems: [{ src: 'gallery/1.jpg' }] }));
    const withPhoto = await generateMetadata(params('cowork'));
    expect(signGallerySrc).toHaveBeenCalledWith('gallery/1.jpg');
    expect(withPhoto.openGraph?.images).toEqual([expect.stringContaining('signed')]);

    findEvent.mockResolvedValueOnce(event());
    const withoutImages = await generateMetadata(params('cowork'));
    expect(withoutImages.openGraph?.images).toEqual([
      expect.stringMatching(/\/eventos\/ev1\/og-image$/),
    ]);
  });
});

describe('/[shortcut]', () => {
  it('tracks the visit and redirects to the next event with that shortcut', async () => {
    findEvent.mockResolvedValue(event());

    await expect(ShortcutPage(params('cowork'))).rejects.toThrow('NEXT_REDIRECT:/eventos/ev1');
    expect(trackPageVisit).toHaveBeenCalledWith('/cowork');
  });

  it('redirects to the events list when no event uses it', async () => {
    findEvent.mockResolvedValue(null);

    await expect(ShortcutPage(params('nada'))).rejects.toThrow('NEXT_REDIRECT:/eventos');
    expect(trackPageVisit).toHaveBeenCalledWith('/nada');
  });
});
