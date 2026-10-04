import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { toggleLike } from '@/actions/advises/like-advise';
import { buildSession } from '@/test/platform';
import { LikeButton } from './like-button';

jest.mock('@/actions/advises/like-advise', () => ({ toggleLike: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const toggleMock = toggleLike as jest.Mock;
const session = buildSession({ id: 'me' });

let consoleError: jest.SpyInstance;

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('LikeButton', () => {
  // The optimistic update logs a React warning (see the failing test at the end)
  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it('asks anonymous visitors to sign in', async () => {
    render(<LikeButton adviseId="a1" likes={[{ userId: 'x' }]} session={null} />);

    const button = screen.getByRole('button', { name: /Me gusta/ });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveTextContent('1');

    await userEvent.click(button);

    expect(toast.info).toHaveBeenCalledWith('Iniciá sesión para dar me gusta');
    expect(toggleMock).not.toHaveBeenCalled();
  });

  it('shows when the user already liked it', () => {
    render(<LikeButton adviseId="a1" likes={[{ userId: 'me' }]} session={session} />);

    expect(screen.getByRole('button', { name: /Me gusta/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTitle('Quitar me gusta')).toBeInTheDocument();
  });

  it('toggles the like through the action', async () => {
    toggleMock.mockResolvedValue(undefined);
    render(<LikeButton adviseId="a1" likes={[]} session={session} />);

    await userEvent.click(screen.getByRole('button', { name: /Me gusta/ }));

    expect(toggleMock).toHaveBeenCalledWith('a1');
  });

  it('logs and recovers when the action fails', async () => {
    toggleMock.mockRejectedValue(new Error('offline'));
    render(<LikeButton adviseId="a1" likes={[{ userId: 'me' }]} session={session} />);

    await userEvent.click(screen.getByRole('button', { name: /Me gusta/ }));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith('Error toggling like:', expect.any(Error)),
    );
    expect(screen.getByRole('button', { name: /Me gusta/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('ignores clicks while a like is in flight', async () => {
    toggleMock.mockReturnValue(new Promise(() => {}));
    render(<LikeButton adviseId="a1" likes={[]} session={session} />);
    const button = screen.getByRole('button', { name: /Me gusta/ });

    await userEvent.click(button);
    await userEvent.click(button);

    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  it('shows the like optimistically while the action runs', async () => {
    toggleMock.mockReturnValue(new Promise(() => {}));
    render(<LikeButton adviseId="a1" likes={[]} session={session} />);

    await userEvent.click(screen.getByRole('button', { name: /Me gusta/ }));

    const button = screen.getByRole('button', { name: /Me gusta/ });
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveTextContent('1');
  });
});
