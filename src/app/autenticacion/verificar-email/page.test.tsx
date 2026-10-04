import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { sendVerificationCode } from '@/actions/auth/send-verification-code';
import { verifyEmailCode } from '@/actions/auth/verify-email-code';
import { notifyOsSessionChange } from '@/components/os/os-env';
import { rateLimitDigest } from '@/lib/rate-limit-messages';
import { mockRouter, setLocation } from '@/test/dom';
import VerifyEmailPage from './page';

jest.mock('@/actions/auth/send-verification-code', () => ({ sendVerificationCode: jest.fn() }));
jest.mock('@/actions/auth/verify-email-code', () => ({ verifyEmailCode: jest.fn() }));
jest.mock('@/components/os/os-env', () => ({ notifyOsSessionChange: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const sendMock = sendVerificationCode as jest.Mock;
const verifyMock = verifyEmailCode as jest.Mock;

const rateLimitError = (seconds: number) =>
  Object.assign(new Error('x'), { digest: rateLimitDigest('sendCode', seconds) });

const submitCode = async (user: UserEvent, code = '123456') => {
  await user.type(screen.getByLabelText('Código de verificación'), code);
  await user.click(screen.getByRole('button', { name: /verificarEmail/ }));
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('VerifyEmailPage', () => {
  afterEach(() => jest.useRealTimers());

  it('asks to sign in when there is no email', () => {
    setLocation('/autenticacion/verificar-email');
    render(<VerifyEmailPage />);

    expect(screen.getByText('No se especificó un email para verificar.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /irAIniciarSesion/ })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion',
    );
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends a code on load and starts the cooldown', async () => {
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    sendMock.mockResolvedValue({ waitSeconds: 45 });
    render(<VerifyEmailPage />);

    expect(await screen.findByRole('button', { name: 'Reenviar en 45s' })).toBeDisabled();
    expect(sendMock).toHaveBeenCalledWith('ana@example.com');
    expect(screen.getByText('ana@example.com')).toBeInTheDocument();
  });

  it('defaults the cooldown to 60s', async () => {
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    sendMock.mockResolvedValue({});
    render(<VerifyEmailPage />);

    expect(await screen.findByRole('button', { name: 'Reenviar en 60s' })).toBeDisabled();
  });

  it('uses the rate-limit wait when the initial send is limited', async () => {
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    sendMock.mockRejectedValue(rateLimitError(90));
    render(<VerifyEmailPage />);

    expect(await screen.findByRole('button', { name: 'Reenviar en 90s' })).toBeDisabled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('validates the code', async () => {
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    sendMock.mockResolvedValue({ waitSeconds: 10 });
    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    await submitCode(user, 'abcdef');

    expect(await screen.findByText('El código solo puede contener números')).toBeInTheDocument();
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it('verifies the code and redirects after a pause', async () => {
    jest.useFakeTimers();
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com&redirect=/eventos/3');
    sendMock.mockResolvedValue({ waitSeconds: 10 });
    verifyMock.mockResolvedValue(undefined);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<VerifyEmailPage />);

    await submitCode(user);

    expect(verifyMock).toHaveBeenCalledWith('ana@example.com', '123456');
    expect(await screen.findByRole('heading', { name: '¡Email verificado!' })).toBeInTheDocument();
    expect(notifyOsSessionChange).toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(1500));
    expect(mockRouter.push).toHaveBeenCalledWith('/eventos/3');
  });

  it('reports an invalid code', async () => {
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    sendMock.mockResolvedValue({ waitSeconds: 10 });
    verifyMock.mockRejectedValue(new Error('bad'));
    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    await submitCode(user);

    expect(toast.error).toHaveBeenCalledWith('Código inválido o expirado. Intentá de nuevo.');
    expect(screen.getByRole('button', { name: /verificarEmail/ })).toBeEnabled();
  });

  it('resends a code once the cooldown is over', async () => {
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    // The initial send fails without a rate limit, so the cooldown stays at 0
    sendMock.mockRejectedValueOnce(new Error('down'));
    sendMock.mockResolvedValueOnce({ waitSeconds: 30 });
    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    await user.click(await screen.findByRole('button', { name: 'Reenviar código' }));

    expect(toast.success).toHaveBeenCalledWith(
      'Nuevo código enviado. Revisá tu correo electrónico.',
    );
    expect(screen.getByRole('button', { name: 'Reenviar en 30s' })).toBeDisabled();
  });

  it('reports a rate-limited resend and waits', async () => {
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    sendMock.mockRejectedValueOnce(new Error('down'));
    sendMock.mockRejectedValueOnce(rateLimitError(120));
    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    await user.click(await screen.findByRole('button', { name: 'Reenviar código' }));

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('2 minutos'));
    expect(screen.getByRole('button', { name: 'Reenviar en 120s' })).toBeDisabled();
  });

  it('reports a failed resend', async () => {
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    sendMock.mockRejectedValue(new Error('down'));
    const user = userEvent.setup();
    render(<VerifyEmailPage />);

    await user.click(await screen.findByRole('button', { name: 'Reenviar código' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al reenviar el código.'));
    expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeEnabled();
  });

  it('counts the cooldown down every second', async () => {
    jest.useFakeTimers();
    setLocation('/autenticacion/verificar-email', 'email=ana@example.com');
    sendMock.mockResolvedValue({ waitSeconds: 2 });
    render(<VerifyEmailPage />);

    expect(await screen.findByRole('button', { name: 'Reenviar en 2s' })).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: 'Reenviar código' })).toBeEnabled();
  });
});
