import { screen } from '@testing-library/react';
import { VideoGrid } from '@/components/videos/video-grid';
import { testVideos as videos } from '@/test/recommendations';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import VideosPage, { metadata } from './page';
import { renderSectionCard } from '@/lib/og/section-cards';
import { getVideos } from '@/lib/recommendations';

jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn(async () => ({})) }));
jest.mock('@/components/videos/video-grid', () => ({
  VideoGrid: jest.fn(() => <p>grilla</p>),
}));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());
jest.mock('@/lib/recommendations', () => require('@/test/recommendations').mockRecommendations());
jest.mock('@/components/recommendations/recommend-button', () =>
  require('@/test/recommendations').mockRecommendButton(),
);

describe('/videos', () => {
  it('has its title and share cards', () => {
    expect(metadata.title).toBe('ls ~/videos');
    expect(metadata.openGraph).toMatchObject({ title: 'Videos | programaConNosotros' });
    expect(metadata.twitter).toMatchObject({ description: metadata.description });
  });

  it('shows every recommended video in a searchable grid, with a button to recommend one', async () => {
    await renderPage(VideosPage());
    expect(screen.getByRole('button', { name: 'recomendar VIDEO' })).toBeInTheDocument();

    expect(
      screen.getByText(`${videos.length} videos recomendados por la comunidad`),
    ).toBeInTheDocument();
    expect(jest.mocked(VideoGrid).mock.calls[0][0]).toEqual({
      videos,
      searchable: true,
      speakerProfiles: {},
    });
  });

  it('uses the videos section card for link previews, with the count from the database', async () => {
    expect(alt).toBe('videos · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'videos' });
    expect(renderSectionCard).toHaveBeenCalledWith('videos', [`${videos.length} videos`]);
  });

  it('falls back to the static card when the database is down', async () => {
    jest.mocked(getVideos).mockRejectedValueOnce(new Error('db down'));
    await Image();
    expect(renderSectionCard).toHaveBeenCalledWith('videos', undefined);
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
