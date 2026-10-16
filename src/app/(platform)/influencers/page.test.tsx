import { render, screen } from '@testing-library/react';
import { InfluencerCard } from '@/components/influencers/influencer-card';
import { renderInPlatform } from '@/test/platform';
import Loading from './loading';
import { getCommunityInfluencers } from '@/lib/recommendations';
import { platformsOf } from '@/components/influencers/influencers';
import InfluencersPage, { metadata } from './page';

jest.mock('@/lib/recommendations', () => ({ getCommunityInfluencers: jest.fn(async () => []) }));
jest.mock('@/components/recommendations/recommend-button', () => ({
  RecommendButton: ({ kind }: { kind: string }) => <button type="button">recomendar {kind}</button>,
}));
jest.mock('@/components/influencers/influencer-card', () => ({
  InfluencerCard: jest.fn(({ influencer }) => <article>{influencer.name}</article>),
}));

describe('InfluencersPage', () => {
  it('renders a card per influencer and counts them in the title', async () => {
    renderInPlatform(await InfluencersPage());
    const cards = jest.mocked(InfluencerCard).mock.calls.map(([props]) => props.influencer);
    expect(cards.length).toBeGreaterThan(0);
    expect(new Set(cards.map(({ id }) => id)).size).toBe(cards.length);
    expect(screen.getByText(`${cards.length} referentes para seguir`)).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(cards.length);
  });

  it('adds the creators members recommended after the curated ones', async () => {
    jest.mocked(getCommunityInfluencers).mockResolvedValueOnce([
      {
        id: 'rec-1',
        name: 'Nueva Creadora',
        image: '',
        description: 'Habla de Rust',
        platforms: { youtube: 'https://youtube.com/@nueva' },
        specialties: ['rust'],
      },
    ]);
    jest.mocked(InfluencerCard).mockClear();
    renderInPlatform(await InfluencersPage());
    const names = jest.mocked(InfluencerCard).mock.calls.map(([props]) => props.influencer.name);
    expect(names.at(-1)).toBe('Nueva Creadora');
    expect(screen.getByRole('button', { name: 'recomendar INFLUENCER' })).toBeInTheDocument();
  });

  it('describes the page for search', () => {
    expect(metadata.description).toEqual(expect.any(String));
  });
});

describe('influencers route files', () => {
  it('renders a loading skeleton', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).not.toBeNull();
  });
});

describe('platformsOf', () => {
  it('tells the platform of a link by its host', () => {
    expect(platformsOf('https://www.youtube.com/@midudev')).toEqual({
      youtube: 'https://www.youtube.com/@midudev',
    });
    expect(platformsOf('https://x.com/dan')).toEqual({ twitter: 'https://x.com/dan' });
    expect(platformsOf('https://blog.dev')).toEqual({ page: 'https://blog.dev' });
    expect(platformsOf(null)).toEqual({});
  });
});
