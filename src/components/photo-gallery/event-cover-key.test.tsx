import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { setEventCoverPhoto } from '@/actions/events/set-event-cover-photo';
import { mockRouter } from '@/test/dom';
import { EventCoverKey } from './event-cover-key';

jest.mock('@/actions/events/set-event-cover-photo', () => ({ setEventCoverPhoto: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('EventCoverKey', () => {
  it('makes the photo the event cover', async () => {
    jest.mocked(setEventCoverPhoto).mockResolvedValue(undefined as never);
    render(<EventCoverKey eventId="e1" photoId="p1" isCover={false} />);

    const key = screen.getByRole('button', { name: 'Usar como portada del evento' });
    expect(key).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(key);

    expect(setEventCoverPhoto).toHaveBeenCalledWith('e1', 'p1');
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Es la portada del evento');
  });

  it('goes back to a random cover, and toasts failures', async () => {
    jest.mocked(setEventCoverPhoto).mockResolvedValueOnce(undefined as never);
    jest.mocked(setEventCoverPhoto).mockRejectedValueOnce(new Error('x'));
    render(<EventCoverKey eventId="e1" photoId="p1" isCover />);
    const key = screen.getByRole('button', { name: 'Quitar como portada del evento' });

    await userEvent.click(key);
    expect(setEventCoverPhoto).toHaveBeenCalledWith('e1', null);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('La portada vuelve a ser aleatoria'),
    );

    await waitFor(() => expect(key).toBeEnabled());
    await userEvent.click(key);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar la portada'));
  });
});
