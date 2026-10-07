import { render, screen } from '@testing-library/react';
import { RuledGridSkeleton } from '@/components/skeletons/page-skeletons';
import { fetchFeed, toFeedDay } from '@/lib/feed';
import { FeedClient } from './feed-client';
import FeedLayout, { metadata } from './layout';
import Loading from './loading';
import FeedPage from './page';

jest.mock('@/lib/feed', () => ({ fetchFeed: jest.fn(), toFeedDay: jest.fn() }));
jest.mock('./feed-aside', () => ({ FeedAside: () => null }));
jest.mock('./feed-client', () => ({ FeedClient: jest.fn(() => null) }));
jest.mock('@/components/skeletons/page-skeletons', () => ({
  PageTitleSkeleton: () => null,
  RuledGridSkeleton: jest.fn(() => null),
}));

describe('FeedPage', () => {
  afterEach(() => jest.useRealTimers());

  it('passes the feed and the current feed day to the client', async () => {
    const now = new Date('2026-05-02T01:30:00Z');
    jest.useFakeTimers({ now });
    const items = [{ id: 'i1' }];
    jest.mocked(fetchFeed).mockResolvedValue(items as never);
    jest.mocked(toFeedDay).mockReturnValue('2026-05-01');
    render(await FeedPage());

    expect(toFeedDay).toHaveBeenCalledWith(now);
    expect(jest.mocked(FeedClient).mock.calls[0][0]).toEqual({
      items,
      today: '2026-05-01',
      aside: expect.anything(),
    });
  });
});

describe('feed layout', () => {
  it('titles the tab like tail -f and shares a readable card', () => {
    expect(metadata.title).toBe('tail -f ~/feed');
    expect(metadata.openGraph).toMatchObject({
      title: 'Feed | programaConNosotros',
      url: expect.stringMatching(/\/feed$/),
    });
  });

  it('renders its page untouched', () => {
    render(
      <FeedLayout>
        <p>novedades</p>
      </FeedLayout>,
    );
    expect(screen.getByText('novedades')).toBeInTheDocument();
  });
});

describe('feed loading', () => {
  it('shows a single column of placeholder rows', () => {
    render(<Loading />);
    expect(jest.mocked(RuledGridSkeleton).mock.calls[0][0]).toEqual({
      count: 10,
      className: 'grid-cols-1',
    });
  });
});
