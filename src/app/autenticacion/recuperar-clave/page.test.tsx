import { act, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { requestPasswordReset } from '@/actions/auth/request-password-reset';
import { verifyResetCode } from '@/actions/auth/verify-reset-code';
import { completePasswordReset } from '@/actions/auth/complete-password-reset';
import ResetPasswordPage from './page';

jest.mock('@/actions/auth/request-password-reset', () => ({ requestPasswordReset: jest.fn() }));
jest.mock('@/actions/auth/verify-reset-code', () => ({ verifyResetCode: jest.fn() }));
jest.mock('@/actions/auth/complete-password-reset', () => ({ completePasswordReset: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const requestMock = requestPasswordReset as jest.Mock;
const verifyMock = verifyResetCode as jest.Mock;
const completeMock = completePasswordReset as jest.Mock;

const sendEmail = async (user: UserEvent, email = 'ana@example.com') => {
  await user.type(screen.getByLabelText('Correo electrónico'), email);
  await user.click(screen.getByRole('button', { name: /enviarCodigo/ }));
};

const sendCode = async (user: UserEvent, code = '123456') => {
  await user.type(screen.getByLabelText('Código de verificación'), code);
  await user.click(screen.getByRole('button', { name: /verificarCodigo/ }));
};

const sendPassword = async (user: UserEvent, password = 'nuevaclave1', confirm = password) => {
  await user.type(screen.getByLabelText('Nueva contraseña'), password);
  await user.type(screen.getByLabelText('Confirmar contraseña'), confirm);
  await user.click(screen.getByRole('button', { name: /actualizarClave/ }));
};

const toPasswordStep = async (user: UserEvent) => {
  requestMock.mockResolvedValue({ success: true, waitSeconds: 0 });
  verifyMock.mockResolvedValue({ success: true });
  render(<ResetPasswordPage />);
  await sendEmail(user);
  await sendCode(user);
  await screen.findByLabelText('Nueva contraseña');
};

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('ResetPasswordPage', () => {
  it('validates the email before requesting a code', async () => {
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await sendEmail(user, 'nope');

    expect(await screen.findByText('Correo electrónico inválido')).toBeInTheDocument();
    expect(requestMock).not.toHaveBeenCalled();
  });

  it.each([
    [{ success: false, error: 'RATE_LIMIT', waitSeconds: 30 }, /30 segundos/],
    [{ success: false, error: 'SEND_FAILED' }, /No pudimos enviar el código/],
  ])('reports request failures (%o)', async (result, message) => {
    requestMock.mockResolvedValue(result);
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await sendEmail(user);

    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(message));
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
  });

  it('reports a thrown request error', async () => {
    requestMock.mockRejectedValue(new Error('down'));
    const user = userEvent.setup();
    render(<ResetPasswordPage />);

    await sendEmail(user);

    expect(toast.error).toHaveBeenCalledWith('Error al enviar el código. Intentá de nuevo.');
  });

  it('walks the whole flow until the password is updated', async () => {
    const user = userEvent.setup();
    completeMock.mockResolvedValue({ success: true });
    await toPasswordStep(user);

    expect(requestMock).toHaveBeenCalledWith('ana@example.com');
    expect(verifyMock).toHaveBeenCalledWith('ana@example.com', '123456');

    await sendPassword(user);

    expect(completeMock).toHaveBeenCalledWith('ana@example.com', '123456', 'nuevaclave1');
    expect(screen.getByRole('heading', { name: '¡Contraseña actualizada!' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /iniciarSesion/ })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion',
    );
  });

  it('validates the code format', async () => {
    requestMock.mockResolvedValue({ success: true, waitSeconds: 0 });
    const user = userEvent.setup();
    render(<ResetPasswordPage />);
    await sendEmail(user);

    await sendCode(user, '12ab');

    expect(await screen.findByText('El código debe tener 6 dígitos')).toBeInTheDocument();
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it.each([
    [{ success: false, error: 'RATE_LIMIT', waitSeconds: 3600 }, /1 hora/],
    [{ success: false, error: 'INVALID_CODE' }, /Código inválido o vencido/],
  ])('reports code failures (%o)', async (result, message) => {
    requestMock.mockResolvedValue({ success: true, waitSeconds: 0 });
    verifyMock.mockResolvedValue(result);
    const user = userEvent.setup();
    render(<ResetPasswordPage />);
    await sendEmail(user);

    await sendCode(user);

    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(message));
    expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument();
  });

  it('reports a thrown verification error', async () => {
    requestMock.mockResolvedValue({ success: true, waitSeconds: 0 });
    verifyMock.mockRejectedValue(new Error('x'));
    const user = userEvent.setup();
    render(<ResetPasswordPage />);
    await sendEmail(user);

    await sendCode(user);

    expect(toast.error).toHaveBeenCalledWith('No pudimos verificar el código. Intentá de nuevo.');
  });

  it('goes back to change the email and back to the code', async () => {
    const user = userEvent.setup();
    await toPasswordStep(user);

    await user.click(screen.getByRole('button', { name: '← Volver al código' }));
    expect(screen.getByLabelText('Código de verificación')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '← Cambiar email' }));
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
  });

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup();
    await toPasswordStep(user);

    await sendPassword(user, 'nuevaclave1', 'otraclave22');

    expect(await screen.findByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(completeMock).not.toHaveBeenCalled();
  });

  it('shows a weak password error on the field', async () => {
    completeMock.mockResolvedValue({
      success: false,
      error: 'WEAK_PASSWORD',
      message: 'Esa contraseña es muy común',
    });
    const user = userEvent.setup();
    await toPasswordStep(user);

    await sendPassword(user);

    expect(await screen.findByText('Esa contraseña es muy común')).toBeInTheDocument();
  });

  it('returns to the code step when the code expired', async () => {
    completeMock.mockResolvedValue({ success: false, error: 'INVALID_CODE' });
    const user = userEvent.setup();
    await toPasswordStep(user);

    await sendPassword(user);

    expect(toast.error).toHaveBeenCalledWith('El código venció o ya no es válido. Pedí uno nuevo.');
    expect(screen.getByLabelText('Código de verificación')).toHaveValue('');
  });

  it('reports a rate limit and a thrown error while updating', async () => {
    completeMock.mockResolvedValueOnce({ success: false, error: 'RATE_LIMIT', waitSeconds: 5 });
    completeMock.mockRejectedValueOnce(new Error('x'));
    const user = userEvent.setup();
    await toPasswordStep(user);

    await sendPassword(user);
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/5 segundos/));

    await user.click(screen.getByRole('button', { name: /actualizarClave/ }));
    expect(toast.error).toHaveBeenCalledWith(
      'Error al actualizar la contraseña. Intentá de nuevo.',
    );
  });

  describe('resending the code', () => {
    afterEach(() => jest.useRealTimers());

    it('counts the cooldown down before allowing a resend', async () => {
      jest.useFakeTimers();
      requestMock.mockResolvedValue({ success: true, waitSeconds: 2 });
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ResetPasswordPage />);
      await sendEmail(user);

      expect(await screen.findByRole('button', { name: 'Reenviar en 2s' })).toBeDisabled();
      act(() => jest.advanceTimersByTime(1000));
      expect(screen.getByRole('button', { name: 'Reenviar en 1s' })).toBeDisabled();
      act(() => jest.advanceTimersByTime(1000));

      requestMock.mockResolvedValue({ success: true, waitSeconds: 0 });
      await user.click(screen.getByRole('button', { name: 'Reenviar código' }));

      expect(requestMock).toHaveBeenCalledTimes(2);
      expect(toast.success).toHaveBeenCalledWith(
        'Nuevo código enviado. Revisá tu correo electrónico.',
      );
    });

    it.each([
      [{ success: false, error: 'RATE_LIMIT', waitSeconds: 0 }, /esperá 0 segundos/],
      [{ success: false, error: 'SEND_FAILED' }, /No pudimos reenviar el código/],
    ])('reports resend failures (%o)', async (result, message) => {
      requestMock.mockResolvedValueOnce({ success: true, waitSeconds: 0 });
      requestMock.mockResolvedValueOnce(result);
      const user = userEvent.setup();
      render(<ResetPasswordPage />);
      await sendEmail(user);

      await user.click(screen.getByRole('button', { name: 'Reenviar código' }));

      expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(message));
    });

    it('reports a thrown resend error', async () => {
      requestMock.mockResolvedValueOnce({ success: true, waitSeconds: 0 });
      requestMock.mockRejectedValueOnce(new Error('x'));
      const user = userEvent.setup();
      render(<ResetPasswordPage />);
      await sendEmail(user);

      await user.click(screen.getByRole('button', { name: 'Reenviar código' }));

      expect(toast.error).toHaveBeenCalledWith('Error al reenviar el código.');
    });
  });
});
