import { render, screen } from '@testing-library/react';
import { LifeBuoy } from 'lucide-react';
import { NavSecondary } from './nav-secondary';

describe('NavSecondary', () => {
  it('renders each item as an external link', () => {
    render(
      <NavSecondary
        className="p-0"
        items={[
          { title: 'Soporte', url: 'https://wa.me/1', icon: LifeBuoy },
          { title: 'Feedback', url: 'https://wa.me/2', icon: LifeBuoy },
        ]}
      />,
    );
    const link = screen.getByRole('link', { name: 'Soporte' });
    expect(link).toHaveAttribute('href', 'https://wa.me/1');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
