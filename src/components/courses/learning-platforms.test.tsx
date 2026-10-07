import { render, screen } from '@testing-library/react';
import { LearningPlatforms } from './learning-platforms';

describe('LearningPlatforms', () => {
  it("recommends O'Reilly Learning, linking to it", () => {
    render(<LearningPlatforms />);
    expect(screen.getByRole('link', { name: /O'Reilly Learning/ })).toHaveAttribute(
      'href',
      'https://www.oreilly.com/online-learning/',
    );
    expect(screen.getByText('labs interactivos')).toBeInTheDocument();
  });
});
