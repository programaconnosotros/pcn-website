import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteTalk } from '@/actions/talks/delete-talk';
import { DeleteTalkButton } from './delete-talk-button';

jest.mock('@/actions/talks/delete-talk', () => ({ deleteTalk: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const confirm = async () => {
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('alertdialog')).toHaveTextContent('"Intro a Rust"');
  await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('DeleteTalkButton', () => {
  it('deletes the talk after confirming', async () => {
    jest.mocked(deleteTalk).mockResolvedValue(undefined as never);
    render(<DeleteTalkButton talkId="t1" talkTitle="Intro a Rust" />);

    await confirm();

    expect(deleteTalk).toHaveBeenCalledWith('t1');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Charla eliminada'));
  });

  it('toasts the error message or a fallback', async () => {
    jest.mocked(deleteTalk).mockRejectedValueOnce(new Error('No autorizado'));
    jest.mocked(deleteTalk).mockRejectedValueOnce({});
    render(<DeleteTalkButton talkId="t1" talkTitle="Intro a Rust" />);

    await confirm();
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
    // Si falla, el diálogo queda abierto para reintentar
    const retry = screen.getByRole('button', { name: 'Eliminar' });
    await waitFor(() => expect(retry).toBeEnabled());
    await userEvent.click(retry);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al eliminar la charla'));
  });
});
