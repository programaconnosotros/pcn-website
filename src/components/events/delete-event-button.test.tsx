import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteEvent } from '@/actions/events/delete-event';
import { DeleteEventButton } from './delete-event-button';

jest.mock('@/actions/events/delete-event', () => ({ deleteEvent: jest.fn() }));
jest.mock('@/actions/errors/log-error', () => ({ logError: jest.fn(), logClientError: jest.fn() }));
jest.mock('sonner', () => ({
  toast: { loading: jest.fn(() => 't'), success: jest.fn(), error: jest.fn() },
}));

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('DeleteEventButton', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

  it('asks for confirmation and can be cancelled', async () => {
    render(<DeleteEventButton eventId="e1" eventName="Meetup" />);

    await userEvent.click(screen.getByRole('button', { name: 'eliminarEvento();' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('"Meetup"');
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deleteEvent).not.toHaveBeenCalled();
  });

  it('deletes the event and shows an error toast when it fails', async () => {
    jest.mocked(deleteEvent).mockRejectedValue(new Error('No autorizado'));
    render(<DeleteEventButton eventId="e1" eventName="Meetup" />);

    await userEvent.click(screen.getByRole('button', { name: 'eliminarEvento();' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado', { id: 't' }));
    expect(deleteEvent).toHaveBeenCalledWith('e1');
  });

  it('uses a generic message for non-Error failures', async () => {
    jest.mocked(deleteEvent).mockRejectedValue('x');
    render(<DeleteEventButton eventId="e1" eventName="Meetup" />);

    await userEvent.click(screen.getByRole('button', { name: 'eliminarEvento();' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error al eliminar el evento', { id: 't' }),
    );
  });
});
