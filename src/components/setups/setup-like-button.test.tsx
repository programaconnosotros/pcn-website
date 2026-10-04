import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { toggleSetupLike } from '@/actions/setups/setup-actions';
import { SetupLikeButton } from './setup-like-button';

jest.mock('@/actions/setups/setup-actions', () => ({ toggleSetupLike: jest.fn() }));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => (resolve = res));
  return { promise, resolve };
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('SetupLikeButton', () => {
  it('sends anonymous visitors to log in and come back', () => {
    render(<SetupLikeButton setupId="s1" likes={4} liked={false} isLoggedIn={false} />);

    const link = screen.getByRole('link', { name: /Me gusta/ });
    expect(link).toHaveAttribute('href', '/autenticacion/iniciar-sesion?redirect=/setups/s1');
    expect(link).toHaveTextContent('4');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('likes optimistically while the server saves it', async () => {
    const pending = deferred();
    jest.mocked(toggleSetupLike).mockReturnValue(pending.promise as never);
    render(<SetupLikeButton setupId="s1" likes={4} liked={false} isLoggedIn />);

    await userEvent.click(screen.getByRole('button', { name: /Me gusta/ }));

    expect(toggleSetupLike).toHaveBeenCalledWith('s1');
    const button = screen.getByRole('button', { name: /Me gusta/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('5');
    expect(button).toBeDisabled();
    pending.resolve();
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('unlikes, and goes back with a toast when saving fails', async () => {
    jest.mocked(toggleSetupLike).mockRejectedValue(new Error('x'));
    render(<SetupLikeButton setupId="s1" likes={4} liked isLoggedIn />);

    await userEvent.click(screen.getByRole('button', { name: /Me gusta/ }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo guardar el me gusta'));
    const button = screen.getByRole('button', { name: /Me gusta/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('4');
  });
});
