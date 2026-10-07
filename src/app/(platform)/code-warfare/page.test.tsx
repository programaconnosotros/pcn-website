import { render, screen } from '@testing-library/react';
import { renderInPlatform } from '@/test/platform';
import Loading from './loading';
import CodeWarfare, { metadata } from './page';

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
  it('renders only placeholders', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
  });
});
