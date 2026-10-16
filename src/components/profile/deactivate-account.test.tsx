import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deactivateAccount } from '@/actions/users/deactivate-account';
import { DeactivateAccount } from './deactivate-account';

const replace = jest.fn();
const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/actions/users/deactivate-account', () => ({ deactivateAccount: jest.fn() }));

const open = async () => {
  const user = userEvent.setup();
  render(<DeactivateAccount />);
  await user.click(screen.getByRole('button', { name: /desactivarCuenta/ }));
  return user;
};

describe('DeactivateAccount', () => {
  it('only enables the button with the password and the phrase, and explains what happens', async () => {
    const user = await open();
    expect(screen.getByText(/donde estabas etiquetado siguen ahí/)).toBeInTheDocument();
    const confirm = screen.getAllByRole('button', { name: /desactivarCuenta/ }).at(-1)!;
    expect(confirm).toBeDisabled();

    await user.type(screen.getByLabelText('Tu contraseña'), 'secreta');
    await user.type(screen.getByLabelText(/para confirmar/), 'desact');
    expect(confirm).toBeDisabled();
    await user.type(screen.getByLabelText(/para confirmar/), 'ivar');
    expect(confirm).toBeEnabled();
  });

  it('deactivates and goes home, or shows why it could not', async () => {
    jest
      .mocked(deactivateAccount)
      .mockResolvedValueOnce({ success: false, error: 'La contraseña no es correcta.' })
      .mockResolvedValueOnce({ success: true });
    const user = await open();
    await user.type(screen.getByLabelText('Tu contraseña'), 'mala');
    await user.type(screen.getByLabelText(/para confirmar/), 'desactivar');
    const confirm = screen.getAllByRole('button', { name: /desactivarCuenta/ }).at(-1)!;

    await user.click(confirm);
    expect(await screen.findByRole('alert')).toHaveTextContent('La contraseña no es correcta.');
    expect(replace).not.toHaveBeenCalled();

    await user.click(confirm);
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
    expect(deactivateAccount).toHaveBeenLastCalledWith({
      password: 'mala',
      confirmation: 'desactivar',
    });
    expect(toast.success).toHaveBeenCalled();
  });
});
