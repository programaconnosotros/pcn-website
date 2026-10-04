import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { setEventCoverPhoto } from '@/actions/events/set-event-cover-photo';
import { mockRouter } from '@/test/dom';
import { MemoryCoverPicker } from './memory-cover-picker';

jest.mock('@/actions/events/set-event-cover-photo', () => ({ setEventCoverPhoto: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const photos = [
  { id: 'tall', thumbUrl: '/tall.jpg', width: 600, height: 900 },
  { id: 'wide', thumbUrl: '/wide.jpg', width: 1600, height: 900 },
  { id: 'nodim', thumbUrl: '/n.jpg', width: null, height: null },
];

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('MemoryCoverPicker', () => {
  it('lists landscape photos first, marking the chosen one, and picks a new cover', async () => {
    jest.mocked(setEventCoverPhoto).mockResolvedValue(undefined as never);
    render(<MemoryCoverPicker eventId="e1" chosenId="wide" photos={photos} />);

    await userEvent.click(screen.getByRole('button', { name: /portada: elegida/ }));
    const tiles = screen.getAllByRole('button', { name: /portada/i, pressed: undefined });
    expect(tiles.map((t) => t.getAttribute('aria-label'))).toEqual([
      'Portada actual',
      'Usar como portada',
      'Usar como portada',
    ]);
    expect(screen.getByRole('button', { name: 'Portada actual' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(screen.getAllByRole('button', { name: 'Usar como portada' })[0]);

    expect(setEventCoverPhoto).toHaveBeenCalledWith('e1', 'tall');
    await waitFor(() => expect(mockRouter.refresh).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Portada actualizada');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('goes back to a random cover', async () => {
    jest.mocked(setEventCoverPhoto).mockResolvedValue(undefined as never);
    render(<MemoryCoverPicker eventId="e1" chosenId="wide" photos={photos} />);

    await userEvent.click(screen.getByRole('button', { name: /portada: elegida/ }));
    await userEvent.click(screen.getByRole('button', { name: 'aleatoria' }));

    expect(setEventCoverPhoto).toHaveBeenCalledWith('e1', null);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('La portada vuelve a ser aleatoria'),
    );
  });

  it('keeps the dialog open and toasts when it fails, and says when there are no photos', async () => {
    jest.mocked(setEventCoverPhoto).mockRejectedValue(new Error('x'));
    render(<MemoryCoverPicker eventId="e1" chosenId={null} photos={[]} />);

    await userEvent.click(screen.getByRole('button', { name: /portada: aleatoria/ }));
    expect(screen.getByText('Este evento todavía no tiene fotos.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'aleatoria' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar la portada'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});
