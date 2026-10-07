import { render, screen } from '@testing-library/react';
import { FlyerCredits } from './flyer-credits';

const ana = {
  id: 'c1',
  flyerSrc: '/a.png',
  name: 'Ana',
  user: { id: 'u1', name: 'Ana', image: null },
};
const beto = { id: 'c2', flyerSrc: '/a.png', name: 'Beto Sin Cuenta', user: null };

describe('FlyerCredits', () => {
  it('credits a flyer to people with and without an account', () => {
    render(<FlyerCredits flyers={['/a.png']} credits={[ana, beto]} />);
    expect(screen.getByText('diseño:')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '@Ana' })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.getByText('Beto Sin Cuenta')).toBeInTheDocument();
  });

  it('lists each flyer when they have different designers', () => {
    render(
      <FlyerCredits
        flyers={['/a.png', '/b.png']}
        credits={[ana, { ...beto, flyerSrc: '/b.png' }]}
      />,
    );
    expect(screen.getByText('flyer 1:')).toBeInTheDocument();
    expect(screen.getByText('flyer 2:')).toBeInTheDocument();
  });

  it('renders nothing without credits', () => {
    const { container } = render(<FlyerCredits flyers={['/a.png']} credits={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
