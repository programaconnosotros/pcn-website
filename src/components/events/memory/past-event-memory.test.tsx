import { render, screen, within } from '@testing-library/react';
import { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';
import { getEventCover, getEventMemories } from '@/lib/gallery';
import { getEventCounts } from '@/lib/event-index';
import { getIdentityMap } from '@/lib/identity-links';
import { SidebarProvider } from '@/components/ui/sidebar';
import { buildEvent } from '@/test/events';
import { PastEventMemory } from './past-event-memory';

jest.mock('@/actions/talks/fetch-public-talks', () => ({ fetchPublicTalks: jest.fn() }));
jest.mock('@/actions/events/set-event-cover-photo', () => ({ setEventCoverPhoto: jest.fn() }));
jest.mock('@/actions/events/set-event-cover-framing', () => ({ setEventCoverFraming: jest.fn() }));
jest.mock('@/lib/gallery', () => ({ getEventCover: jest.fn(), getEventMemories: jest.fn() }));
jest.mock('@/lib/event-index', () => ({ getEventCounts: jest.fn() }));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('@/data/whatsapp-conversations', () => ({
  conversations: [
    { title: 'Charla de IA', date: '2030-05-10', summary: 's', eventId: 'e1', participants: [] },
    { title: 'Otra', date: '2030-05-11', summary: 's', eventId: 'otro', participants: [] },
  ],
}));
jest.mock('./memory-talks', () => ({
  MemoryTalks: ({ talks }: { talks: { title: string }[] }) => (
    <ol aria-label="charlas">
      {talks.map((t) => (
        <li key={t.title}>{t.title}</li>
      ))}
    </ol>
  ),
}));
jest.mock('./memory-conversations', () => ({
  MemoryConversations: ({ conversations }: { conversations: { title: string }[] }) => (
    <p>{conversations.map((c) => c.title).join(',')}</p>
  ),
}));

const photo = (id: string, width = 1600, height = 900) => ({
  id,
  src: `${id}.jpg`,
  thumbSrc: `${id}-t.jpg`,
  thumbUrl: `/t/${id}`,
  fullUrl: `/f/${id}`,
  width,
  height,
});
const item = (id: string, kind: 'PHOTO' | 'VIDEO' = 'PHOTO') => ({
  ...photo(id),
  kind,
  durationSeconds: null,
  takenAt: new Date('2030-05-10T22:00:00Z'),
  description: null,
});
const person = (id: string) => ({ id, name: `Persona ${id}`, image: null });

const event = {
  ...buildEvent({
    flyerImages: ['/flyer.png'],
    endDate: new Date('2030-05-11T01:00:00Z'),
    googleMapsUrl: 'https://maps.app.goo.gl/x',
    callForSpeakersEnabled: true,
  }),
  organizers: [{ user: person('o1') }],
  flyerDesigners: [],
  sponsors: [
    { id: 's1', name: 'Acme', website: 'https://acme.dev' },
    { id: 's2', name: 'Sin web', website: null },
  ],
} as never;

const renderMemory = async (props: { event?: never; canEdit?: boolean; isAdmin?: boolean }) =>
  render(
    await PastEventMemory({
      event: props.event ?? event,
      canEdit: props.canEdit ?? false,
      isAdmin: props.isAdmin ?? false,
    }),
    { wrapper: SidebarProvider },
  );

describe('PastEventMemory', () => {
  beforeEach(() => {
    jest.mocked(getEventMemories).mockResolvedValue({
      items: [item('c'), item('a'), item('v', 'VIDEO')],
      photoCount: 2,
      videoCount: 1,
      people: Array.from({ length: 26 }, (_, i) => person(`p${i}`)),
    } as never);
    jest.mocked(getEventCover).mockResolvedValue({
      chosenId: 'c',
      covers: [photo('c')],
      photos: [photo('c'), photo('a')],
    } as never);
    jest.mocked(fetchPublicTalks).mockResolvedValue([
      { id: 't2', title: 'Segunda', order: 2 },
      { id: 't1', title: 'Primera', order: 1 },
    ] as never);
    jest.mocked(getEventCounts).mockResolvedValue({
      activeRegistrations: 1,
      totalRegistrations: 3,
      waitlist: 0,
      catalogNumber: 9,
    });
    jest.mocked(getIdentityMap).mockResolvedValue({});
  });

  it('remembers the event with stats, album, talks, conversations and details', async () => {
    await renderMemory({});

    const hero = screen.getByRole('banner');
    expect(hero).toHaveTextContent('Nº 009 · así fue');
    // Who appears in the photos has its own section below, not a number in the hero.
    expect(within(hero).getByRole('list')).toHaveTextContent(
      '1inscripto2charlas1conversación2fotos1video',
    );
    expect(within(hero).getByRole('list')).not.toHaveTextContent('en las fotos');
    // The chosen cover opens the page and is not repeated in the album
    expect(screen.queryByRole('link', { name: /Foto 1 de 2$/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^(Foto|Video) \d de 2/ })).toHaveLength(2);
    expect(screen.getByRole('link', { name: /ver los 3 en la galería/ })).toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: 'charlas' }))
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Primera', 'Segunda']);
    expect(screen.getByText('Charla de IA')).toBeInTheDocument();
    expect(getIdentityMap).toHaveBeenCalledWith('whatsapp');
    expect(screen.getByText('y 2 más')).toBeInTheDocument();
    expect(screen.getByText('Bar XYZ · Av. Siempre Viva 742 · Córdoba')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'abrir en Google Maps' })).toHaveAttribute(
      'href',
      'https://maps.app.goo.gl/x',
    );
    expect(screen.getByRole('link', { name: /Persona o1/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute('href', 'https://acme.dev');
    expect(screen.getByText('Sin web')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Flyer de Meetup PCN' })).toBeInTheDocument();
    // Visitors get neither management tools nor the cover picker
    expect(screen.queryByText('editarEvento();')).not.toBeInTheDocument();
    expect(screen.queryByText(/portada:/)).not.toBeInTheDocument();
    expect(screen.queryByText('gestión')).not.toBeInTheDocument();
  });

  it('gives managers and admins their tools', async () => {
    await renderMemory({ canEdit: true, isAdmin: true });

    expect(screen.getByRole('link', { name: /editarEvento/ })).toHaveAttribute(
      'href',
      '/eventos/e1/editar',
    );
    expect(screen.getByText('portada: elegida')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'subir' })).toHaveAttribute(
      'href',
      '/galeria/subir?evento=e1',
    );
    expect(screen.getByRole('link', { name: /1 activas · 3 total/ })).toHaveAttribute(
      'href',
      '/eventos/e1/inscripciones',
    );
    expect(screen.getByRole('link', { name: /propuestas de charlas/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /organizadores/ })).toBeInTheDocument();
  });

  it('shows an empty album to admins of an online external event without photos', async () => {
    jest.mocked(getEventMemories).mockResolvedValue({
      items: [],
      photoCount: 0,
      videoCount: 0,
      people: [],
    } as never);
    jest
      .mocked(getEventCover)
      .mockResolvedValue({ chosenId: null, covers: [], photos: [] } as never);
    jest.mocked(fetchPublicTalks).mockResolvedValue([]);
    const online = {
      ...buildEvent({
        id: 'x',
        isOnline: true,
        externalRegistrationUrl: 'https://lu.ma/x',
        description: '',
      }),
      organizers: [],
      sponsors: [],
    } as never;

    await renderMemory({ event: online, canEdit: true, isAdmin: true });

    expect(screen.getByText('Todavía no hay fotos ni videos de este evento.')).toBeInTheDocument();
    expect(screen.getByText('portada: aleatoria')).toBeInTheDocument();
    expect(screen.getByText('modo')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /inscripciones/ })).not.toBeInTheDocument();
    expect(screen.queryByText('de qué se trató')).not.toBeInTheDocument();
    expect(screen.queryByText('el flyer')).not.toBeInTheDocument();
    expect(getIdentityMap).not.toHaveBeenCalled();
    // External registrations don't count people
    expect(screen.getByRole('banner')).not.toHaveTextContent('inscripto');
  });

  it('hides the photo section from visitors without photos and falls back to any photo as cover', async () => {
    jest.mocked(getEventMemories).mockResolvedValue({
      items: [],
      photoCount: 0,
      videoCount: 0,
      people: [],
    } as never);
    jest.mocked(getEventCover).mockResolvedValue({
      chosenId: null,
      covers: [],
      photos: [photo('portrait', 600, 900)],
    } as never);
    const noPlace = {
      ...buildEvent({ city: null, placeName: null, address: null, flyerImages: [] }),
      organizers: [],
      sponsors: [],
    } as never;

    await renderMemory({ event: noPlace });

    expect(screen.queryByText('fotos y videos')).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows the single item link copy', async () => {
    jest.mocked(getEventMemories).mockResolvedValue({
      items: [item('a')],
      photoCount: 1,
      videoCount: 0,
      people: [],
    } as never);
    jest
      .mocked(getEventCover)
      .mockResolvedValue({ chosenId: null, covers: [], photos: [] } as never);

    await renderMemory({});

    expect(screen.getByRole('link', { name: /ver en la galería/ })).toBeInTheDocument();
  });
});
