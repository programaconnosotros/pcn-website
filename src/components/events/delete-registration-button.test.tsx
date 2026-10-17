import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteRegistration } from '@/actions/events/delete-registration';
import { mockRouter } from '@/test/dom';
import { DeleteRegistrationButton } from './delete-registration-button';

jest.mock('@/actions/events/delete-registration', () => ({ deleteRegistration: jest.fn() }));
jest.mock('sonner', () => ({ toast: { promise: jest.fn() } }));

const mockPromise = toast.promise as unknown as jest.Mock;

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('DeleteRegistrationButton', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockPromise.mockImplementation((promise: Promise<unknown>) => promise);
  });

  it('confirms, deletes the registration, closes and refreshes', async () => {
    jest.mocked(deleteRegistration).mockResolvedValue(undefined as never);
    render(<DeleteRegistrationButton registrationId="r1" userName="Ada" />);

    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Ada');
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(deleteRegistration).toHaveBeenCalledWith('r1');
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('maps the error and does not refresh when deletion fails', async () => {
    jest.mocked(deleteRegistration).mockRejectedValue(new Error('No autorizado'));
    render(<DeleteRegistrationButton registrationId="r1" userName="Ada" />);

    await userEvent.click(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    // Si falla, el diálogo queda abierto (con el botón habilitado para reintentar)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Eliminar' })).toBeEnabled());
    const { error } = mockPromise.mock.calls[0][1] as { error: (_e: Error) => string };
    expect(error(new Error('No autorizado'))).toBe('No autorizado');
    expect(error(new Error(''))).toBe('Ocurrió un error al eliminar la inscripción');
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});
