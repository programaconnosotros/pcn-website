import { render, screen } from '@testing-library/react';
import { partners } from '@/data/partners';
import { EventSponsors } from './event-sponsors';

describe('EventSponsors', () => {
  it('shows each sponsor logo linked to its site, or its name without a logo', () => {
    render(
      <EventSponsors
        sponsors={[
          { id: 's1', name: 'Acme', website: 'https://acme.dev', logo: '/acme.webp' },
          { id: 's2', name: 'Kiosco', website: null, logo: null },
        ]}
      />,
    );
    expect(screen.getByText(/Gracias a quienes hacen posible/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Acme' })).toHaveAttribute('src', '/acme.webp');
    // In color, not the monochrome partner marks
    const logo = screen.getByRole('img', { name: 'Acme' });
    expect(logo.closest('[class*="grayscale"]')).toBeNull();
    expect(screen.getByRole('link', { name: /Acme/ })).toHaveAttribute('href', 'https://acme.dev');
    expect(screen.getByText('Kiosco')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Kiosco/ })).not.toBeInTheDocument();
  });

  it('turns dark partner logos white, like the partners page', () => {
    const dark = partners.find((partner) => partner.monochromeOnDark);
    if (!dark) return;
    render(
      <EventSponsors
        sponsors={[{ id: 's1', name: dark.name, website: dark.url, logo: dark.logo }]}
      />,
    );
    expect(screen.getByRole('img', { name: dark.name })).toHaveClass('invert');
  });
});
