import { screen } from '@testing-library/react';
import { requireAdminPage } from '@/lib/admin';
import { listRecommendationsForReview } from '@/lib/recommendations';
import { RecommendationReview } from '@/components/recommendations/recommendation-review';
import { renderInPlatform } from '@/test/platform';
import RecommendationsReviewPage, { metadata } from './page';

jest.mock('@/lib/admin', () => ({ requireAdminPage: jest.fn() }));
jest.mock('@/lib/recommendations', () => ({ listRecommendationsForReview: jest.fn() }));
jest.mock('@/components/recommendations/recommendation-review', () => ({
  RecommendationReview: jest.fn(() => <p>cola</p>),
}));

describe('/admin/recomendaciones', () => {
  it('is an admin page out of search results', () => {
    expect(metadata.title).toBe('sudo ls ~/admin/recomendaciones');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('checks the admin and hands every recommendation to the queue', async () => {
    const items = [
      { id: 'a', status: 'PENDING' },
      { id: 'b', status: 'PENDING' },
      { id: 'c', status: 'APPROVED' },
    ];
    jest.mocked(listRecommendationsForReview).mockResolvedValue(items as never);

    renderInPlatform(await RecommendationsReviewPage());

    expect(requireAdminPage).toHaveBeenCalled();
    expect(screen.getByText('2 para revisar · 1 revisadas')).toBeInTheDocument();
    expect(jest.mocked(RecommendationReview).mock.calls[0][0]).toEqual({ items });
  });

  it('sends everyone else away before reading anything', async () => {
    jest.mocked(requireAdminPage).mockRejectedValueOnce(new Error('NEXT_REDIRECT:/'));
    await expect(RecommendationsReviewPage()).rejects.toThrow('NEXT_REDIRECT:/');
    expect(listRecommendationsForReview).not.toHaveBeenCalled();
  });
});
