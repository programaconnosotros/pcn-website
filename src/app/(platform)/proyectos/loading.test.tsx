import { render } from '@testing-library/react';
import Loading from './loading';

describe('/proyectos loading', () => {
  it('shows only skeleton placeholders, no text', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container.textContent).toBe('');
  });
});
