import { screen } from '@testing-library/react';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import PodcastPage, { metadata } from './page';

jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

describe('/podcast', () => {
  it('has its title and share cards', () => {
    expect(metadata.title).toBe('ls ~/podcast');
    expect(metadata.openGraph).toMatchObject({
      title: 'Podcast | programaConNosotros',
      url: expect.stringMatching(/\/podcast$/),
    });
  });

  it('announces that the episodes are coming soon', async () => {
    await renderPage(PodcastPage());

    expect(screen.getByText('0 episodios')).toBeInTheDocument();
    expect(screen.getByText(/próximamente/)).toBeInTheDocument();
  });

  it('uses the podcast section card for link previews', async () => {
    expect(alt).toBe('podcast · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'podcast' });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
