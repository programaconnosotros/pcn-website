import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { currentSubscription, pushSupport, turnOffPush, turnOnPush } from '@/lib/push-client';
import { PushSettings } from './push-settings';

jest.mock('@/lib/push-client', () => ({
  pushSupport: jest.fn(),
  currentSubscription: jest.fn(),
  turnOnPush: jest.fn(),
  turnOffPush: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const setPermission = (permission: NotificationPermission) =>
  Object.defineProperty(window, 'Notification', {
    configurable: true,
    value: { permission },
  });

beforeEach(() => {
  jest.mocked(pushSupport).mockReturnValue('supported');
  jest.mocked(currentSubscription).mockResolvedValue(null);
  setPermission('default');
});

it('turns push on in this browser', async () => {
  jest.mocked(turnOnPush).mockResolvedValue('granted');
  render(<PushSettings publicKey="public-key" />);

  await userEvent.click(await screen.findByRole('button', { name: 'activar();' }));

  expect(turnOnPush).toHaveBeenCalledWith('public-key');
  expect(await screen.findByText('activadas en este dispositivo')).toBeInTheDocument();
  expect(toast.success).toHaveBeenCalledWith('Notificaciones push activadas');
});

it('turns it off where it was on', async () => {
  jest.mocked(currentSubscription).mockResolvedValue({} as PushSubscription);
  render(<PushSettings publicKey="public-key" />);

  await userEvent.click(await screen.findByRole('button', { name: 'desactivar' }));

  expect(turnOffPush).toHaveBeenCalled();
  expect(await screen.findByText('desactivadas')).toBeInTheDocument();
});

it('explains how to unblock them when the member said no', async () => {
  jest.mocked(turnOnPush).mockResolvedValue('denied');
  render(<PushSettings publicKey="public-key" />);

  await userEvent.click(await screen.findByRole('button', { name: 'activar();' }));

  expect(await screen.findByText(/Las bloqueaste para este sitio/)).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('asks iPhone users to add the site to the home screen first', () => {
  jest.mocked(pushSupport).mockReturnValue('needs-install');
  render(<PushSettings publicKey="public-key" />);

  expect(screen.getByText(/agregá el sitio a la pantalla de inicio/)).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('shows why it failed', async () => {
  jest.mocked(turnOnPush).mockRejectedValue(new Error('El sitio todavía no terminó de instalarse'));
  render(<PushSettings publicKey="public-key" />);

  await userEvent.click(await screen.findByRole('button', { name: 'activar();' }));

  expect(toast.error).toHaveBeenCalled();
});
