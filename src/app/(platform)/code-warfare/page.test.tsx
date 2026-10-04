import { render, screen } from '@testing-library/react';
import { ProseSkeleton } from '@/components/skeletons/page-skeletons';
import { renderInPlatform } from '@/test/platform';
import Loading from './loading';
import CodeWarfare, { metadata } from './page';

jest.mock('@/components/skeletons/page-skeletons', () => ({
  PageTitleSkeleton: () => null,
  ProseSkeleton: jest.fn(() => null),
}));

describe('CodeWarfare page', () => {
  it('announces the competitions as coming soon', () => {
    renderInPlatform(<CodeWarfare />);

    expect(screen.getByText('próximamente')).toBeInTheDocument();
    expect(screen.getByText(/coming soon/)).toBeInTheDocument();
  });

  it('has a terminal tab title and a readable share card', () => {
    expect(metadata.title).toBe('./code-warfare');
    expect(metadata.openGraph).toMatchObject({
      title: 'Code Warfare | programaConNosotros',
      url: expect.stringMatching(/\/code-warfare$/),
    });
  });
});

describe('code-warfare loading', () => {
  it('shows placeholder paragraphs', () => {
    render(<Loading />);
    expect(jest.mocked(ProseSkeleton).mock.calls[0][0]).toEqual({ paragraphs: 3 });
  });
});
