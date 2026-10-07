import { render, screen } from '@testing-library/react';
import { SetupTile } from './setup-tile';

jest.mock('@/actions/setups/setup-actions', () => ({ toggleSetupLike: jest.fn() }));

const setup = {
  id: 's1',
  title: 'Mi escritorio',
  description: 'Dos monitores y un teclado mecánico',
  imageUrl: '/full.webp',
  thumbUrl: '/thumb.webp',
  width: 1600,
  height: 1200,
  date: new Date('2030-05-10T00:00:00Z'),
  createdAt: new Date(2031, 0, 1),
  author: { id: 'u1', name: 'Ada', image: null },
  likes: [{ userId: 'u1' }, { userId: 'u2' }],
};

describe('SetupTile', () => {
  it('shows the photo, title, author, date and likes, liked by the viewer', () => {
    render(<SetupTile setup={setup} viewerId="u2" />);

    expect(screen.getByRole('link', { name: 'Ver setup: Mi escritorio' })).toHaveAttribute(
      'href',
      '/setups/s1',
    );
    expect(screen.getByRole('link', { name: /Ada/ })).toHaveAttribute('href', '/perfil/u1');
    expect(screen.getByText(/10 may 2030/)).toBeInTheDocument();
    const like = screen.getByRole('button', { name: /Me gusta/ });
    expect(like).toHaveTextContent('2');
    expect(like).toHaveAttribute('aria-pressed', 'true');
  });

  it('hides the author on their own profile and asks visitors to log in to like', () => {
    render(<SetupTile setup={setup} viewerId={null} showAuthor={false} />);

    expect(screen.queryByRole('link', { name: /Ada/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Me gusta/ })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion?redirect=/setups/s1',
    );
  });
});
