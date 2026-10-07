import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteUser } from '@/actions/users/delete-user';
import { DeleteUserButton } from './delete-user-button';

const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/actions/users/delete-user', () => ({ deleteUser: jest.fn() }));

const confirmDelete = async () => {
  const user = userEvent.setup();
  render(<DeleteUserButton userId="u1" userName="Ana" />);
  await user.click(screen.getByRole('button', { name: /eliminar/ }));
  expect(screen.getByText('¿Eliminar la cuenta de Ana?')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Eliminar' }));
};

describe('DeleteUserButton', () => {
  it('deletes the account after confirming and refreshes the table', async () => {
    jest.mocked(deleteUser).mockResolvedValue({ success: true });

    await confirmDelete();

    expect(deleteUser).toHaveBeenCalledWith('u1');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Eliminaste la cuenta de Ana'));
    expect(refresh).toHaveBeenCalled();
  });

  it('shows the error the action returns, like deleting an admin, and keeps the dialog', async () => {
    jest
      .mocked(deleteUser)
      .mockResolvedValue({ success: false, error: 'Quitale el rol de admin antes de eliminarlo' });

    await confirmDelete();

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Quitale el rol de admin antes de eliminarlo'),
    );
    expect(refresh).not.toHaveBeenCalled();
    expect(screen.getByText('¿Eliminar la cuenta de Ana?')).toBeInTheDocument();
  });

  it('reports a failure', async () => {
    jest.mocked(deleteUser).mockRejectedValue('raro');

    await confirmDelete();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar la cuenta'));
  });
});
