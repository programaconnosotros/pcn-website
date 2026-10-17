import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteAnnouncement } from '@/actions/announcements/delete-announcement';
import { DeleteAnnouncementDialog } from './delete-announcement-dialog';

jest.mock('@/actions/announcements/delete-announcement', () => ({ deleteAnnouncement: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('DeleteAnnouncementDialog', () => {
  it('closes after deleting', async () => {
    jest.mocked(deleteAnnouncement).mockResolvedValue(undefined as never);
    const onOpenChange = jest.fn();
    render(
      <DeleteAnnouncementDialog
        announcementId="a1"
        announcementTitle="Hola"
        open
        onOpenChange={onOpenChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Anuncio eliminado exitosamente'),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('toasts the error or a fallback', async () => {
    jest.mocked(deleteAnnouncement).mockRejectedValueOnce(new Error('No autorizado'));
    jest.mocked(deleteAnnouncement).mockRejectedValueOnce({});
    render(
      <DeleteAnnouncementDialog
        announcementId="a1"
        announcementTitle="Hola"
        open
        onOpenChange={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al eliminar el anuncio'));
  });

  it('can be cancelled', async () => {
    const onOpenChange = jest.fn();
    render(
      <DeleteAnnouncementDialog
        announcementId="a1"
        announcementTitle="Hola"
        open
        onOpenChange={onOpenChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(deleteAnnouncement).not.toHaveBeenCalled();
  });
});
