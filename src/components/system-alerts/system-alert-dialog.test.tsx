import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { resolveSystemAlert } from '@/actions/system-alerts/resolve-system-alert';
import { SystemAlertDialog } from './system-alert-dialog';

jest.mock('@/actions/system-alerts/resolve-system-alert', () => ({
  resolveSystemAlert: jest.fn(),
}));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const alert = {
  id: 'alert-1',
  kind: 'email_quota',
  detail: 'Monthly quota reached',
  createdAt: '2026-10-16T12:00:00.000Z',
};

describe('SystemAlertDialog', () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.documentElement.removeAttribute('data-embedded');
  });

  it('shows the critical dialog with what is wrong and how to fix it', async () => {
    render(<SystemAlertDialog alerts={[alert]} />);

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Crítico: No están saliendo los emails');
    expect(dialog).toHaveTextContent('Monthly quota reached');
    expect(screen.getByRole('link', { name: /abrir Resend/ })).toHaveAttribute(
      'href',
      'https://resend.com/settings/billing',
    );
  });

  it('marks it as resolved', async () => {
    jest.mocked(resolveSystemAlert).mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<SystemAlertDialog alerts={[alert]} />);

    await user.click(await screen.findByRole('button', { name: 'ya lo resolví' }));

    expect(resolveSystemAlert).toHaveBeenCalledWith('alert-1');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(toast.success).toHaveBeenCalledWith('Marcado como resuelto');
  });

  it('reports a failure to resolve it and keeps the dialog', async () => {
    jest.mocked(resolveSystemAlert).mockRejectedValue(new Error('No autorizado'));
    const user = userEvent.setup();
    render(<SystemAlertDialog alerts={[alert]} />);

    await user.click(await screen.findByRole('button', { name: 'ya lo resolví' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('can wait until the next visit', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SystemAlertDialog alerts={[alert]} />);

    await user.click(await screen.findByRole('button', { name: 'más tarde' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    unmount();

    render(<SystemAlertDialog alerts={[alert]} />);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('stays out of PCN OS windows and falls back to a generic copy', async () => {
    document.documentElement.setAttribute('data-embedded', '');
    const { unmount } = render(<SystemAlertDialog alerts={[alert]} />);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    unmount();

    document.documentElement.removeAttribute('data-embedded');
    render(<SystemAlertDialog alerts={[{ ...alert, kind: 'otro' }]} />);
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('Problema en la plataforma');
  });
});
