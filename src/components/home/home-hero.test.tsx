import { render, screen } from '@testing-library/react';
import { HomeHero } from './home-hero';

jest.mock('@/components/ui/install-app-button', () => ({
  HeroInstallButton: () => <div data-testid="install" />,
}));

describe('HomeHero', () => {
  it('invites guests to sign up, log in or just join WhatsApp', () => {
    render(<HomeHero userName={null} title={<h2>Inicio</h2>} />);

    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Programácon nosotros.');
    expect(screen.getByText('guest@pcn')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /crearCuenta/ })).toHaveAttribute(
      'href',
      '/autenticacion/registro',
    );
    expect(screen.getByRole('link', { name: /iniciarSesion/ })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion',
    );
    expect(screen.getByRole('link', { name: /Solo quiero el WhatsApp/ })).toBeInTheDocument();
    expect(screen.getByText(/Gratis · Sin spam · Desde 2020/)).toBeInTheDocument();
    expect(screen.getByTestId('install')).toBeInTheDocument();
  });

  it('greets a member by first name with a shell-safe user name', () => {
    render(<HomeHero userName="Agustín Sánchez" />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hola, Agustín.');
    expect(screen.getByText('agustin@pcn')).toBeInTheDocument();
    expect(screen.getByText('sesión iniciada como agustin@pcn')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /verProximosEventos/ })).toHaveAttribute(
      'href',
      '/eventos',
    );
    expect(screen.getByRole('link', { name: /abrirWhatsApp/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /crearCuenta/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Gratis · Sin spam/)).not.toBeInTheDocument();
  });

  it('shows the community figures, counting its own age', () => {
    render(<HomeHero userName={null} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText(String(new Date().getFullYear() - 2020))).toBeInTheDocument();
    expect(screen.getByText('Años de comunidad')).toBeInTheDocument();
  });
});
