import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import SeriesYPeliculasLayout, { metadata } from './layout';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import SeriesYPeliculasPage from './page';

jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

const titles = () => screen.queryAllByRole('heading', { level: 2 }).map((h) => h.textContent);

describe('/series-y-peliculas', () => {
  it('sets the title and share cards in its layout', () => {
    expect(metadata.title).toBe('ls ~/series-y-peliculas');
    expect(metadata.openGraph).toMatchObject({ title: 'Series y Películas | programaConNosotros' });
    render(<SeriesYPeliculasLayout>lista</SeriesYPeliculasLayout>);
    expect(screen.getByText('lista')).toBeInTheDocument();
  });

  it('lists the featured titles first, then the rest alphabetically', async () => {
    await renderPage(<SeriesYPeliculasPage />);

    expect(screen.getByText('6 series · 11 películas')).toBeInTheDocument();
    const all = titles();
    expect(all).toHaveLength(17);
    expect(all.slice(0, 7)).toEqual([
      'Silicon Valley',
      'Mr. Robot',
      'The Social Network',
      'Jobs',
      'Snowden',
      'The Imitation Game',
      'General Magic',
    ]);
    expect(all.at(-1)).toBe('WeCrashed');
    expect(screen.getByRole('img', { name: 'Póster de Mr. Robot' })).toBeInTheDocument();
  });

  it('searches by title, director or description', async () => {
    const user = userEvent.setup();
    await renderPage(<SeriesYPeliculasPage />);
    const search = screen.getByRole('textbox', { name: /Buscar por título/ });

    await user.type(search, 'FINCHER');
    expect(titles()).toEqual(['The Social Network']);

    await user.clear(search);
    await user.type(search, 'theranos');
    expect(titles()).toEqual(['The Dropout']);
  });

  it('filters by genre and says when nothing matches', async () => {
    const user = userEvent.setup();
    await renderPage(<SeriesYPeliculasPage />);

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Comedia' }));
    expect(titles()).toEqual(['Silicon Valley', 'The Internship']);
    expect(screen.getByRole('button', { name: /filtros/ })).toHaveTextContent('[1]');

    await user.type(screen.getByRole('textbox', { name: /Buscar por título/ }), 'robot');
    expect(titles()).toEqual([]);
    expect(
      screen.getByText('No se encontraron títulos con los filtros seleccionados.'),
    ).toBeInTheDocument();
  });

  it('uses the series section card for link previews', async () => {
    expect(alt).toBe('series-y-peliculas · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'series-y-peliculas' });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
