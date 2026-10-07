import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  confirmTwoFactorSetup,
  disableTwoFactor,
  regenerateRecoveryCodes,
  startTwoFactorSetup,
} from '@/actions/auth/two-factor';
import { TwoFactorSettings } from './two-factor-settings';

const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/actions/auth/two-factor', () => ({
  startTwoFactorSetup: jest.fn(async () => ({
    secret: 'JBSWY3DP',
    qr: 'data:image/svg+xml;utf8,x',
  })),
  confirmTwoFactorSetup: jest.fn(async () => ({ recoveryCodes: ['aaaa-bbbb', 'cccc-dddd'] })),
  disableTwoFactor: jest.fn(),
  regenerateRecoveryCodes: jest.fn(async () => ({ recoveryCodes: ['eeee-ffff'] })),
}));

describe('TwoFactorSettings', () => {
  it('sets it up with the QR and a first code, then shows the recovery codes once', async () => {
    const user = userEvent.setup();
    render(<TwoFactorSettings enabledAt={null} recoveryCodesLeft={0} />);
    expect(screen.getByText('desactivada')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'activar();' }));
    expect(
      await screen.findByAltText('Código QR para la app de autenticación'),
    ).toBeInTheDocument();
    expect(screen.getByText('JBSWY3DP')).toBeInTheDocument();
    expect(startTwoFactorSetup).toHaveBeenCalled();

    await user.type(screen.getByLabelText('Código de la app'), '123456');
    await user.click(screen.getByRole('button', { name: 'activar();' }));
    expect(await screen.findByText('aaaa-bbbb')).toBeInTheDocument();
    expect(confirmTwoFactorSetup).toHaveBeenCalledWith('123456');
    expect(screen.getByRole('link', { name: /descargar/ })).toHaveAttribute(
      'download',
      'pcn-codigos-de-recuperacion.txt',
    );

    await user.click(screen.getByRole('button', { name: 'ya los guardé' }));
    expect(refresh).toHaveBeenCalled();
    expect(screen.queryByText('aaaa-bbbb')).not.toBeInTheDocument();
  });

  it('reports a wrong first code', async () => {
    jest.mocked(confirmTwoFactorSetup).mockRejectedValueOnce(new Error('x'));
    const user = userEvent.setup();
    render(<TwoFactorSettings enabledAt={null} recoveryCodesLeft={0} />);
    await user.click(screen.getByRole('button', { name: 'activar();' }));
    await user.type(await screen.findByLabelText('Código de la app'), '000000');
    await user.click(screen.getByRole('button', { name: 'activar();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });

  it('shows the codes left, regenerates them and turns it off with a code', async () => {
    const user = userEvent.setup();
    render(<TwoFactorSettings enabledAt="2026-10-01T12:00:00.000Z" recoveryCodesLeft={7} />);
    expect(screen.getByText(/activada desde el 1 de octubre de 2026/)).toBeInTheDocument();
    expect(screen.getByText(/7 códigos de recuperación/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'generar códigos nuevos' }));
    await user.type(screen.getByLabelText('Código de la app'), '123456');
    await user.click(screen.getByRole('button', { name: 'generarCódigos();' }));
    expect(await screen.findByText('eeee-ffff')).toBeInTheDocument();
    expect(regenerateRecoveryCodes).toHaveBeenCalledWith('123456');
    await user.click(screen.getByRole('button', { name: 'ya los guardé' }));

    await user.click(screen.getByRole('button', { name: 'desactivar' }));
    await user.type(screen.getByLabelText('Código de la app o de recuperación'), 'abcd-efgh');
    await user.click(screen.getByRole('button', { name: 'desactivar();' }));
    await waitFor(() => expect(disableTwoFactor).toHaveBeenCalledWith('abcd-efgh'));
    expect(toast.success).toHaveBeenCalledWith('Verificación en dos pasos desactivada');
  });
});
