import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildSpeaker, buildTalk } from '@/test/talks';
import { CommunityTalks } from './community-talks';

const talks = [
  buildTalk({
    id: 'video',
    title: 'Rust en producción',
    videoUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
    speakers: [
      buildSpeaker({
        id: 's1',
        speakerName: 'Ada Lovelace',
        user: { id: 'u1', name: 'Ada', image: 'https://cdn.dev/ada.png' },
      }),
      buildSpeaker({ id: 's2', speakerName: 'Bruno Díaz' }),
    ],
  }),
  buildTalk({
    id: 'slides',
    title: 'Slides en imágenes',
    slideImages: ['/s1.png', '/s2.png'],
    portraitUrl: '/portrait.png',
    event: { ...buildTalk().event!, isOnline: true, name: 'Online Night' },
  }),
  buildTalk({
    id: 'external',
    title: 'Video en Vimeo',
    videoUrl: 'https://vimeo.com/1',
    slidesUrl: 'https://slides.dev/x',
    event: null,
    eventId: null,
    manualEventTitle: 'Meetup histórico',
    manualEventDate: new Date('2023-04-01T12:00:00Z'),
    manualEventLocation: 'Once57',
  }),
  buildTalk({
    id: 'nothing',
    title: 'sin nada',
    event: null,
    eventId: null,
    speakers: [],
  }),
];

const renderTalks = (isAdmin = false) => {
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  render(<CommunityTalks talks={talks} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />);
  return { onEdit, onDelete };
};

const cell = (title: string) => screen.getByText(title).closest('article') as HTMLElement;

// Long forms typed key by key: give them room on a busy machine
jest.setTimeout(20_000);

describe('CommunityTalks', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('groups talks by year, numbering them oldest first', () => {
    renderTalks();

    expect(screen.getByRole('heading', { name: /## 2030/ })).toHaveTextContent('2 charlas');
    expect(screen.getByRole('heading', { name: /## 2023/ })).toHaveTextContent('1 charla');
    expect(screen.getByRole('heading', { name: /## sin fecha/ })).toBeInTheDocument();
    expect(within(cell('Rust en producción')).getByText('#004')).toBeInTheDocument();
    expect(within(cell('sin nada')).getByText('#001')).toBeInTheDocument();
  });

  it('shows speakers, event and location for each talk', () => {
    renderTalks();

    const rust = cell('Rust en producción');
    expect(within(rust).getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute(
      'href',
      '/perfil/u1',
    );
    expect(rust).toHaveTextContent('Ada Lovelace, Bruno Díaz');
    expect(within(rust).getByRole('link', { name: 'Meetup PCN' })).toHaveAttribute(
      'href',
      '/eventos/e1',
    );
    expect(rust).toHaveTextContent('Bar XYZ, Córdoba');
    expect(cell('Slides en imágenes')).toHaveTextContent('online');
    const vimeo = cell('Video en Vimeo');
    expect(vimeo).toHaveTextContent('Meetup histórico');
    expect(vimeo).toHaveTextContent('Once57');
    expect(within(vimeo).getByRole('link', { name: /video/ })).toHaveAttribute(
      'href',
      'https://vimeo.com/1',
    );
    expect(within(vimeo).getByRole('link', { name: /slides/ })).toHaveAttribute(
      'href',
      'https://slides.dev/x',
    );
    // Without video or slides there is nothing to play: the title is a plain heading
    expect(within(cell('sin nada')).getByRole('heading', { name: 'sin nada' })).toBeInTheDocument();
    expect(within(cell('sin nada')).getByText('SN')).toBeInTheDocument();
  });

  it('shows every title whole, in a grid of three per row on large screens', () => {
    renderTalks();

    // Playable talks title a button; the others, a heading. Neither is ever cut.
    for (const title of ['Rust en producción', 'sin nada']) {
      expect(screen.getByText(title).className).not.toMatch(/line-clamp|truncate/);
    }
    const grid = cell('Rust en producción').parentElement!;
    expect(grid).toHaveClass('lg:grid-cols-3', '2xl:grid-cols-4');
    expect(grid.className).not.toMatch(/(^|\s)xl:grid-cols-4/);
  });

  it('filters by video, slides and search text', async () => {
    renderTalks();

    await userEvent.click(screen.getByRole('button', { name: 'con video' }));
    expect(screen.getByRole('button', { name: 'con video' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.queryByText('Slides en imágenes')).not.toBeInTheDocument();
    expect(screen.getByText('Video en Vimeo')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'con slides' }));
    expect(screen.queryByText('Rust en producción')).not.toBeInTheDocument();
    expect(screen.getByText('Video en Vimeo')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'todas' }));
    const search = screen.getByRole('textbox', { name: /Buscar charlas/ });
    await userEvent.type(search, 'bruno');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    await userEvent.clear(search);
    await userEvent.type(search, 'once57');
    expect(screen.getByText('Video en Vimeo')).toBeInTheDocument();
    await userEvent.type(search, 'xyz-no-existe');
    expect(screen.getByText(/ninguna charla coincide con la búsqueda/)).toBeInTheDocument();
  });

  it('plays YouTube talks and opens image slides in place', async () => {
    renderTalks();

    await userEvent.click(screen.getByRole('button', { name: 'Rust en producción' }));
    const player = screen.getByRole('dialog');
    expect(within(player).getByTitle('Rust en producción')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1&rel=0',
    );
    expect(player).toHaveTextContent('Ada Lovelace, Bruno Díaz · ');
    expect(within(player).getByRole('link', { name: /youtube/ })).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=abcdefghijk',
    );
    await userEvent.keyboard('{Escape}');

    await userEvent.click(
      within(cell('Rust en producción')).getByRole('button', { name: 'video' }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(screen.getByRole('button', { name: 'Slides en imágenes' }));
    expect(screen.getByRole('img', { name: 'Slide 1 de 2' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'slides · 2' }));
    expect(screen.getByRole('dialog', { name: 'Slides en imágenes' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('gives admins edit and delete actions per talk', async () => {
    const { onEdit, onDelete } = renderTalks(true);
    const menu = () => within(cell('sin nada')).getAllByRole('button').at(-1)!;

    await userEvent.click(menu());
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Editar' }));
    expect(onEdit).toHaveBeenCalledWith(talks[3]);

    await userEvent.click(menu());
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Eliminar' }));
    expect(onDelete).toHaveBeenCalledWith(talks[3]);
  });

  it('hides admin actions from everyone else', () => {
    renderTalks();

    expect(within(cell('sin nada')).queryByRole('button')).not.toBeInTheDocument();
  });
});
