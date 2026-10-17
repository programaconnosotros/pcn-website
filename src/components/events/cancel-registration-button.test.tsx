import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { cancelRegistration } from '@/actions/events/cancel-registration';
import { mockRouter } from '@/test/dom';
import { CancelRegistrationButton } from './cancel-registration-button';

jest.mock('@/actions/events/cancel-registration', () => ({ cancelRegistration: jest.fn() }));
jest.mock('sonner', () => ({ toast: { promise: jest.fn() } }));

type PromiseOptions = {
  loading: string;
  success: string;
  error: (_e: unknown) => string;
};
const mockPromise = jest.mocked(toast.promise) as unknown as jest.Mock;

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('CancelRegistrationButton', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Behaves like sonner: resolves/rejects with the wrapped promise
    mockPromise.mockImplementation((promise: Promise<unknown>) => promise);
  });

  it('cancels the registration, calls onCancel and refreshes', async () => {
    jest.mocked(cancelRegistration).mockResolvedValue(undefined as never);
    const onCancel = jest.fn();
    render(<CancelRegistrationButton eventId="e1" registrationId="r1" onCancel={onCancel} />);

    await userEvent.click(screen.getByRole('button', { name: 'cancelarInscripcion();' }));

    expect(cancelRegistration).toHaveBeenCalledWith({ registrationId: 'r1', eventId: 'e1' });
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalled());
    expect(onCancel).toHaveBeenCalled();
    const options = mockPromise.mock.calls[0][1] as PromiseOptions;
    expect(options.loading).toBe('Cancelando inscripción...');
    expect(options.success).toBe('Inscripción cancelada exitosamente');
  });

  it('uses waitlist copy and maps errors to a message', async () => {
    jest.mocked(cancelRegistration).mockRejectedValue(new Error('No estás en la lista'));
    render(<CancelRegistrationButton eventId="e1" mode="waitlist" />);

    await userEvent.click(screen.getByRole('button', { name: 'salirDeLaListaDeEspera();' }));

    const options = mockPromise.mock.calls[0][1] as PromiseOptions;
    expect(options.loading).toBe('Saliendo de la lista de espera...');
    expect(options.success).toBe('Saliste de la lista de espera');
    expect(options.error(new Error('No estás en la lista'))).toBe('No estás en la lista');
    expect(options.error('raro')).toBe('Ocurrió un error al cancelar la inscripción');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'salirDeLaListaDeEspera();' })).toBeEnabled(),
    );
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});
