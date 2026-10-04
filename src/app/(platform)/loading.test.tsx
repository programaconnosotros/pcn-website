import { render } from '@testing-library/react';
import { PageTitleSkeleton, RuledGridSkeleton } from '@/components/skeletons/page-skeletons';
import Loading from './loading';

jest.mock('@/components/skeletons/page-skeletons', () => ({
  PageTitleSkeleton: jest.fn(() => null),
  RuledGridSkeleton: jest.fn(() => null),
}));

describe('platform loading fallback', () => {
  it('shows the shape of a regular page: a title and a ruled grid', () => {
    render(<Loading />);
    expect(PageTitleSkeleton).toHaveBeenCalled();
    expect(jest.mocked(RuledGridSkeleton).mock.calls[0][0]).toEqual({ count: 8 });
  });
});
