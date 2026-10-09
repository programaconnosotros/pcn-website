import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInPlatform } from '@/test/platform';
import { VideoGrid } from './video-grid';
import type { Video } from './videos';

const mockMarks = { watched: new Set<string>(), toggle: jest.fn(), isAuthenticated: true };
jest.mock('@/hooks/use-content-marks', () => ({
  useContentMarks: () => ({
    ids: () => mockMarks.watched,
    toggle: mockMarks.toggle,
    isAuthenticated: mockMarks.isAuthenticated,
    isLoading: false,
  }),
}));

const videos: Video[] = [
  {
    id: 'v1',
    title: 'Arquitectura limpia',
    speaker: 'Ana López',
    channel: 'JSConf',
    date: '2024-05-10',
    durationSeconds: 3725,
    language: 'es',
    isTalk: true,
  },
  {
    id: 'v2',
    title: 'Rust in 100 seconds',
    channel: 'Fireship',
    date: '2023-01-02',
    durationSeconds: 125,
    language: 'en',
  },
];

const titles = () =>
  Array.from(document.querySelectorAll('[class*="line-clamp-2"]'), (b) => b.textContent);

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('VideoGrid', () => {
  beforeEach(() => {
    mockMarks.watched = new Set(['v2']);
    mockMarks.isAuthenticated = true;
  });

  it('shows the videos with duration, date, byline and watch progress', () => {
    renderInPlatform(<VideoGrid videos={videos} />);

    expect(titles()).toEqual(['Arquitectura limpia', 'Rust in 100 seconds']);
    expect(screen.getByText('1:02:05')).toBeInTheDocument();
    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('10/05/2024')).toBeInTheDocument();
    expect(screen.getByText('Ana López · JSConf')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.getByText('visto', { selector: 'span.bg-pcnGreen' })).toBeInTheDocument();
  });

  it('filters by watch state and language and explains empty results', async () => {
    const user = userEvent.setup();
    renderInPlatform(<VideoGrid videos={videos} />);

    await user.click(screen.getByRole('button', { name: 'vistos' }));
    expect(titles()).toEqual(['Rust in 100 seconds']);
    await user.click(screen.getByRole('button', { name: 'sin ver' }));
    expect(titles()).toEqual(['Arquitectura limpia']);

    await user.click(screen.getByRole('button', { name: 'en' }));
    expect(screen.getByText(/¡ya viste todo!/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'vistos' }));
    expect(titles()).toEqual(['Rust in 100 seconds']);
    await user.click(screen.getByRole('button', { name: 'es' }));
    expect(screen.getByText(/todavía no marcaste ningún video/)).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('group', { name: 'Filtrar por estado' })).getByRole('button', {
        name: 'todos',
      }),
    );
    expect(titles()).toEqual(['Arquitectura limpia']);
  });

  it('says when no video is in the chosen language', async () => {
    renderInPlatform(<VideoGrid videos={[videos[0]]} />);

    await userEvent.click(screen.getByRole('button', { name: 'en' }));

    expect(screen.getByText(/no hay videos en ese idioma/)).toBeInTheDocument();
  });

  it('searches by title, speaker, channel or year', async () => {
    const user = userEvent.setup();
    renderInPlatform(<VideoGrid videos={videos} searchable />);
    const search = screen.getByRole('textbox', { name: /Buscar por título/ });

    await user.type(search, 'jsconf');
    expect(titles()).toEqual(['Arquitectura limpia']);
    await user.clear(search);
    await user.type(search, '2023');
    expect(titles()).toEqual(['Rust in 100 seconds']);
    await user.type(search, 'x');
    expect(screen.getByText(/ningún video coincide/)).toBeInTheDocument();
  });

  it('plays a video in a dialog and marks it as watched', async () => {
    const user = userEvent.setup();
    mockMarks.isAuthenticated = false;
    renderInPlatform(<VideoGrid videos={videos} toolbar={false} />);

    expect(screen.queryByRole('group', { name: 'Filtrar por estado' })).not.toBeInTheDocument();
    await user.click(screen.getAllByTitle('Marcar como visto')[0]);
    expect(mockMarks.toggle).toHaveBeenCalledWith('v1', 'watched');

    await user.click(screen.getByRole('button', { name: 'Arquitectura limpia' }));
    const dialog = screen.getByRole('dialog', { name: 'Arquitectura limpia' });
    expect(within(dialog).getByTitle('Arquitectura limpia')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/v1?autoplay=1&rel=0',
    );
    expect(within(dialog).getByText(/Ana López · JSConf · 10\/05\/2024/)).toBeInTheDocument();
    await user.click(within(dialog).getByTitle('Marcar como visto'));
    expect(mockMarks.toggle).toHaveBeenCalledTimes(2);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks visitors to sign in to save progress', () => {
    mockMarks.isAuthenticated = false;
    renderInPlatform(<VideoGrid videos={videos} />);

    expect(screen.getByText(/iniciá sesión para guardar/)).toBeInTheDocument();
  });

  it('links the speakers who are platform users to their profiles', () => {
    renderInPlatform(
      <VideoGrid
        videos={[{ ...videos[0], speaker: 'Ana López (Acme) y Beto' }]}
        toolbar={false}
        speakerProfiles={{ 'Ana López': { id: 'u1', name: 'Ana López' } }}
      />,
    );
    expect(screen.getByRole('link', { name: 'Ana López' })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.queryByRole('link', { name: 'Beto' })).not.toBeInTheDocument();
    expect(screen.getByText(/Beto · JSConf/)).toBeInTheDocument();
  });
});
