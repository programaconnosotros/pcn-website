import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteGalleryItem, updateGalleryItem } from '@/actions/gallery/gallery-actions';
import { mockRouter } from '@/test/dom';
import { PhotoEditForm } from './photo-edit-form';

jest.mock('@/actions/gallery/gallery-actions', () => ({
  deleteGalleryItem: jest.fn(),
  updateGalleryItem: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const photo = {
  id: 'p1',
  takenAt: new Date(2030, 4, 10, 20, 30),
  description: null,
  eventId: null,
  thumbUrl: '/t.jpg',
};
const events = [{ id: 'e1', name: 'Meetup', date: new Date(2030, 4, 10, 19) }];

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('PhotoEditForm', () => {
  it('saves the date, description and event, then goes back to the photo', async () => {
    jest.mocked(updateGalleryItem).mockResolvedValue(undefined as never);
    render(<PhotoEditForm photo={photo} events={events} />);

    const date = screen.getByLabelText('Fecha');
    expect(date).toHaveValue('2030-05-10 20:30');
    fireEvent.change(date, { target: { value: '2030-05-10 21:00' } });
    fireEvent.change(document.querySelector('textarea')!, { target: { value: 'Brindis' } });
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Meetup/ }));
    await userEvent.click(screen.getByRole('button', { name: 'guardarCambios();' }));

    expect(updateGalleryItem).toHaveBeenCalledWith('p1', {
      takenAt: new Date('2030-05-10T21:00').toISOString(),
      description: 'Brindis',
      eventId: 'e1',
    });
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/galeria/p1'));
    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Foto actualizada');
  });

  it('toasts when saving fails', async () => {
    jest.mocked(updateGalleryItem).mockRejectedValueOnce(new Error('Sin permisos'));
    jest.mocked(updateGalleryItem).mockRejectedValueOnce('x');
    render(
      <PhotoEditForm photo={{ ...photo, description: 'Hola', eventId: 'e1' }} events={events} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'guardarCambios();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Sin permisos'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'guardarCambios();' })).toBeEnabled(),
    );
    await userEvent.click(screen.getByRole('button', { name: 'guardarCambios();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo guardar'));
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('deletes the photo after confirming', async () => {
    jest.mocked(deleteGalleryItem).mockResolvedValue(undefined as never);
    render(<PhotoEditForm photo={photo} events={events} />);

    await userEvent.click(screen.getByRole('button', { name: 'eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(deleteGalleryItem).toHaveBeenCalledWith('p1');
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/galeria'));
    expect(toast.success).toHaveBeenCalledWith('Foto eliminada');
  });

  it('toasts when deleting fails', async () => {
    jest.mocked(deleteGalleryItem).mockRejectedValueOnce(new Error('No'));
    jest.mocked(deleteGalleryItem).mockRejectedValueOnce('x');
    render(<PhotoEditForm photo={photo} events={events} />);

    await userEvent.click(screen.getByRole('button', { name: 'eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'eliminar' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar'));
  });
});
