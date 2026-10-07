import { render, screen } from '@testing-library/react';
import { FlyerCredits } from './flyer-credits';

const ana = { id: 'c1', name: 'Ana', user: { id: 'u1', name: 'Ana', image: null } };
const beto = { id: 'c2', name: 'Beto Sin Cuenta', user: null };

describe('FlyerCredits', () => {
  it('credits the flyer to people with and without an account', () => {
    render(<FlyerCredits credits={[ana, beto]} />);
    expect(screen.getByText('diseño:')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@Ana' })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.getByText('Beto Sin Cuenta')).toBeInTheDocument();
  });

  it('renders nothing without credits', () => {
    const { container } = render(<FlyerCredits credits={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
