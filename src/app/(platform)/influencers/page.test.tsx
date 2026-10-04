import { render, screen } from '@testing-library/react';
import { InfluencerCard } from '@/components/influencers/influencer-card';
import { renderInPlatform } from '@/test/platform';
import Loading from './loading';
import InfluencersPage, { metadata } from './page';

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
