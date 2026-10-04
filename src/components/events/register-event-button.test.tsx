import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { registerEvent } from '@/actions/events/register-event';
import { mockRouter } from '@/test/dom';
import { RegisterEventButton } from './register-event-button';

jest.mock('@/actions/events/register-event', () => ({ registerEvent: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const mockRegister = jest.mocked(registerEvent);

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('RegisterEventButton', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

  it('sends anonymous visitors to log in with autoRegister', async () => {
    render(<RegisterEventButton eventId="e1" isAuthenticated={false} capacityAvailable />);

    await userEvent.click(screen.getByRole('button', { name: 'inscribirme();' }));

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/autenticacion/iniciar-sesion?redirect=/eventos/e1&autoRegister=true',
    );
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('opens the external url instead of registering', async () => {
    const open = jest.spyOn(window, 'open').mockReturnValue(null);
    render(
      <RegisterEventButton
        eventId="e1"
        isAuthenticated
        capacityAvailable
        externalUrl="https://x.dev"
        label="ir();"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'ir();' }));

    expect(open).toHaveBeenCalledWith('https://x.dev', '_blank', 'noopener,noreferrer');
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('registers, toasts and refreshes', async () => {
    mockRegister.mockResolvedValue({ status: 'registered' } as never);
    render(<RegisterEventButton eventId="e1" isAuthenticated capacityAvailable />);

    await userEvent.click(screen.getByRole('button', { name: 'inscribirme();' }));

    expect(mockRegister).toHaveBeenCalledWith('e1', { skipRedirect: true });
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('¡Te has inscrito exitosamente al evento! 🎉');
  });

  it('joins the waitlist when there is no capacity', async () => {
    mockRegister.mockResolvedValue({ status: 'waitlisted', position: 3 } as never);
    render(<RegisterEventButton eventId="e1" isAuthenticated capacityAvailable={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'unirmeAListaDeEspera();' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Te sumaste a la lista de espera (#3)'),
    );
  });

  it('hands the result to onSuccess instead of toasting', async () => {
    const onSuccess = jest.fn();
    mockRegister.mockResolvedValue({ status: 'registered' } as never);
    render(
      <RegisterEventButton eventId="e1" isAuthenticated capacityAvailable onSuccess={onSuccess} />,
    );

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ status: 'registered' }));
    expect(toast.success).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it('shows an error toast when the action rejects', async () => {
    mockRegister.mockRejectedValue(new Error('boom'));
    render(<RegisterEventButton eventId="e1" isAuthenticated capacityAvailable />);

    await userEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: 'inscribirme();' })).toBeEnabled();
  });

  it('is disabled while loading', () => {
    render(<RegisterEventButton eventId="e1" isAuthenticated capacityAvailable isLoading />);

    expect(screen.getByRole('button', { name: 'inscribiendo...' })).toBeDisabled();
  });
});
