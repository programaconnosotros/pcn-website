import { screen } from '@testing-library/react';
import { MusicGrid } from '@/components/music/music-grid';
import { externalPlaylists, radios } from '@/components/music/music-sets';
import { renderSectionCard } from '@/lib/og/section-cards';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import Music, { metadata } from './page';

jest.mock('@/components/music/music-grid', () => ({
  MusicGrid: jest.fn(({ sets }: { sets: { title: string }[] }) => (
    <ul>
      {sets.map((set) => (
        <li key={set.title}>{set.title}</li>
      ))}
    </ul>
  )),
}));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

describe('/music', () => {
  it('has its title, description and share cards', () => {
    expect(metadata.title).toBe('mpv ~/music');
    expect(metadata.openGraph).toMatchObject({
      title: 'Música | programaConNosotros',
      url: expect.stringMatching(/\/music$/),
    });
    expect(metadata.twitter).toMatchObject({ title: 'Música | programaConNosotros' });
  });

  it('shows the community radios and the recommended playlists apart', async () => {
    await renderPage(Music());

    expect(
      screen.getByText(`${radios.length + externalPlaylists.length} sets para programar`),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /radios de la comunidad/ })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /playlists externas recomendadas/ }),
    ).toBeInTheDocument();
    const grids = jest.mocked(MusicGrid).mock.calls.map(([props]) => props.sets);
    expect(grids).toEqual([radios, externalPlaylists]);
    expect(screen.getByText(radios[0].title)).toBeInTheDocument();
  });

  it('uses the music section card for link previews', async () => {
    expect(alt).toBe('music · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'music' });
    expect(renderSectionCard).toHaveBeenCalledWith('music');
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
