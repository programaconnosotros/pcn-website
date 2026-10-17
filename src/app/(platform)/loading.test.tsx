import { render } from '@testing-library/react';
import Loading from './loading';

describe('platform loading fallback', () => {
  it('shows the shape of the home page with placeholders only', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container.textContent).toBe('');
  });
});
