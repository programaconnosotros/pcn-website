import { render, screen } from '@testing-library/react';
import { AuthLinks, AuthSection, AuthShell, AuthStatus } from './auth-shell';
import { PasswordResetCodeEmail } from './reset-password-email';
import { EmailVerificationEmail } from './verification-email';

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('AuthShell', () => {
  it('renders the prompt, title, description and children', () => {
    render(
      <AuthShell command="login" title="Entrar" description="hola" wide>
        <p>formulario</p>
      </AuthShell>,
    );

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    expect(screen.getByText('~/pcn/auth $ login')).toBeInTheDocument();
    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText('formulario')).toBeInTheDocument();
    expect(screen.getByText('500+')).toBeInTheDocument();
  });

  it('omits the description when there is none', () => {
    render(
      <AuthShell command="x" title="T">
        <p>c</p>
      </AuthShell>,
    );

    expect(screen.queryByText('hola')).not.toBeInTheDocument();
  });

  it('renders links, sections and status blocks', () => {
    render(
      <>
        <AuthLinks links={[{ href: '/a', label: 'Ir a A' }]} />
        <AuthSection title="Datos" optional>
          <p>campo</p>
        </AuthSection>
        <AuthSection title="Otros">
          <p>otro</p>
        </AuthSection>
        <AuthStatus>listo</AuthStatus>
      </>,
    );

    expect(screen.getByRole('link', { name: /Ir a A/ })).toHaveAttribute('href', '/a');
    expect(screen.getByRole('group', { name: /Datos/ })).toHaveTextContent('[opcional]');
    expect(screen.getByRole('group', { name: /Otros/ })).not.toHaveTextContent('[opcional]');
    expect(screen.getByText('listo')).toBeInTheDocument();
  });
});

describe('auth emails', () => {
  it('renders the verification code email', () => {
    const { container } = render(<EmailVerificationEmail userName="Ana" code="123456" />);

    expect(container).toHaveTextContent('¡Hola Ana!');
    expect(container).toHaveTextContent('123456');
  });

  it('renders the password reset email without a name', () => {
    const { container } = render(<PasswordResetCodeEmail userName="" code="654321" />);

    expect(container).toHaveTextContent('654321');
  });
});
