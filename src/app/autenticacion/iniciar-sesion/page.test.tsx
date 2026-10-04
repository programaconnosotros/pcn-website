import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { signIn } from '@/actions/auth/sign-in';
import { notifyOsSessionChange } from '@/components/os/os-env';
import { rateLimitDigest } from '@/lib/rate-limit-messages';
import { mockRouter, setLocation } from '@/test/dom';
import SignInPage from './page';

jest.mock('@/actions/auth/sign-in', () => ({ signIn: jest.fn() }));
jest.mock('@/components/os/os-env', () => ({ notifyOsSessionChange: jest.fn() }));
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

const signInMock = signIn as jest.MockedFunction<typeof signIn>;

const fillAndSubmit = async (email = 'ana@example.com', password = 'secreta') => {
  const user = userEvent.setup();
  const emailInput = screen.getByLabelText('Correo electrónico');
  await user.clear(emailInput);
  if (email) await user.type(emailInput, email);
  if (password) await user.type(screen.getByLabelText('Contraseña'), password);
  await user.click(screen.getByRole('button', { name: /ingresar/ }));
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('SignInPage', () => {
  beforeEach(() => {
    setLocation('/autenticacion/iniciar-sesion');
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('shows validation errors and does not call the action', async () => {
    render(<SignInPage />);

    await fillAndSubmit('no-es-email', '');

    expect(await screen.findByText('Correo electrónico inválido')).toBeInTheDocument();
    expect(screen.getByText('Ingresá tu contraseña')).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it('signs in and redirects to the returned path', async () => {
    signInMock.mockResolvedValue({ success: true, redirectTo: '/perfil' } as never);
    render(<SignInPage />);

    await fillAndSubmit();

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/perfil'));
    expect(signInMock).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'secreta',
      redirectTo: '',
    });
    expect(toast.success).toHaveBeenCalled();
    expect(notifyOsSessionChange).toHaveBeenCalled();
  });

  it('prefills the email and forwards redirect with autoRegister', async () => {
    setLocation(
      '/autenticacion/iniciar-sesion',
      'email=bob@example.com&redirect=/eventos/1?x=1&autoRegister=true',
    );
    signInMock.mockResolvedValue({ success: true, redirectTo: '/eventos/1' } as never);
    render(<SignInPage />);

    expect(screen.getByLabelText('Correo electrónico')).toHaveValue('bob@example.com');
    expect(screen.getByRole('link', { name: /No tenés cuenta/ })).toHaveAttribute(
      'href',
      `/autenticacion/registro?redirect=${encodeURIComponent('/eventos/1?x=1')}&autoRegister=true`,
    );

    await fillAndSubmit('bob@example.com');

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(
        expect.objectContaining({ redirectTo: '/eventos/1?x=1&autoRegister=true' }),
      ),
    );
  });

  it('appends autoRegister with ? when the redirect has no query', async () => {
    setLocation('/autenticacion/iniciar-sesion', 'redirect=/eventos/1&autoRegister=true');
    signInMock.mockResolvedValue({ success: true, redirectTo: '/eventos/1' } as never);
    render(<SignInPage />);

    await fillAndSubmit();

    await waitFor(() =>
      expect(signInMock).toHaveBeenCalledWith(
        expect.objectContaining({ redirectTo: '/eventos/1?autoRegister=true' }),
      ),
    );
  });

  it('sends unverified users to the verification page', async () => {
    setLocation('/autenticacion/iniciar-sesion', 'redirect=/eventos');
    signInMock.mockResolvedValue({
      success: false,
      error: 'EMAIL_NOT_VERIFIED',
      email: 'otro@example.com',
    } as never);
    render(<SignInPage />);

    await fillAndSubmit();

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith(
        `/autenticacion/verificar-email?email=${encodeURIComponent('otro@example.com')}&redirect=${encodeURIComponent('/eventos')}`,
      ),
    );
    expect(toast.info).toHaveBeenCalled();
  });

  it('falls back to the typed email when the result has none', async () => {
    signInMock.mockResolvedValue({ success: false, error: 'EMAIL_NOT_VERIFIED' } as never);
    render(<SignInPage />);

    await fillAndSubmit();

    await waitFor(() =>
      expect(mockRouter.push).toHaveBeenCalledWith(
        `/autenticacion/verificar-email?email=${encodeURIComponent('ana@example.com')}`,
      ),
    );
  });

  it('reports invalid credentials', async () => {
    signInMock.mockResolvedValue({ success: false, error: 'INVALID_CREDENTIALS' } as never);
    render(<SignInPage />);

    await fillAndSubmit();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Credenciales incorrectas.'));
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /ingresar/ })).toBeEnabled();
  });

  it('reports unknown errors', async () => {
    signInMock.mockResolvedValue({ success: false, error: 'OTHER' } as never);
    render(<SignInPage />);

    await fillAndSubmit();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No pudimos iniciar la sesión.'));
  });

  it('shows the rate-limit message when the action throws one', async () => {
    const error = Object.assign(new Error('x'), { digest: rateLimitDigest('signIn', 60) });
    signInMock.mockRejectedValue(error);
    render(<SignInPage />);

    await fillAndSubmit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('demasiados intentos de inicio de sesión'),
      ),
    );
  });

  it('shows a generic message when the action throws', async () => {
    signInMock.mockRejectedValue(new Error('boom'));
    render(<SignInPage />);

    await fillAndSubmit();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Ocurrió un error inesperado. Por favor, intentá nuevamente.',
      ),
    );
  });
});
