import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { updateAnnouncement } from '@/actions/announcements/update-announcement';
import { deleteAnnouncement } from '@/actions/announcements/delete-announcement';
import { AnnouncementCard } from './announcement-card';

jest.mock('@/actions/announcements/update-announcement', () => ({ updateAnnouncement: jest.fn() }));
jest.mock('@/actions/announcements/delete-announcement', () => ({ deleteAnnouncement: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const announcement = (overrides = {}) => ({
  id: 'a1',
  title: 'Se viene el meetup',
  content: 'Anotate que quedan pocos lugares',
  category: 'evento',
  pinned: false,
  published: true,
  authorId: 'u1',
  eventId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 'u1', name: 'Ada', image: null },
  ...overrides,
});

const openMenu = async (item: 'Editar' | 'Eliminar') => {
  await userEvent.click(screen.getByRole('button'));
  await userEvent.click(await screen.findByRole('menuitem', { name: item }));
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('AnnouncementCard', () => {
  it('shows category, pin, draft and author to visitors without actions', () => {
    render(
      <AnnouncementCard
        announcement={announcement({ pinned: true, published: false, category: 'actualizacion' })}
      />,
    );

    expect(screen.getByText('[actualización]')).toBeInTheDocument();
    expect(screen.getByText('destacado')).toBeInTheDocument();
    expect(screen.getByText('borrador')).toBeInTheDocument();
    expect(screen.getByText(/hace menos de un minuto/)).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows unknown categories as they are', () => {
    render(
      <AnnouncementCard
        announcement={announcement({
          category: 'otra',
          author: { id: 'u', name: '', image: 'https://cdn.dev/a.png' },
        })}
      />,
    );

    expect(screen.getByText('[otra]')).toBeInTheDocument();
  });

  it('lets admins edit the announcement', async () => {
    jest.mocked(updateAnnouncement).mockResolvedValueOnce(undefined as never);
    jest.mocked(updateAnnouncement).mockRejectedValueOnce(new Error('No autorizado'));
    jest.mocked(updateAnnouncement).mockRejectedValueOnce({});
    render(<AnnouncementCard announcement={announcement()} isAdmin />);

    await openMenu('Editar');
    expect(screen.getByRole('dialog', { name: 'Editar anuncio' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Se viene el meetup');
    await userEvent.click(screen.getByRole('button', { name: 'actualizar();' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Anuncio actualizado exitosamente'),
    );
    expect(updateAnnouncement).toHaveBeenCalledWith(
      'a1',
      expect.objectContaining({ title: 'Se viene el meetup', category: 'evento' }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await openMenu('Editar');
    await userEvent.click(screen.getByRole('button', { name: 'actualizar();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'actualizar();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al actualizar el anuncio'));
    await userEvent.click(screen.getByRole('button', { name: 'cancelar();' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('lets admins delete the announcement', async () => {
    jest.mocked(deleteAnnouncement).mockResolvedValue(undefined as never);
    render(<AnnouncementCard announcement={announcement()} isAdmin />);

    await openMenu('Eliminar');
    expect(screen.getByRole('alertdialog')).toHaveTextContent('"Se viene el meetup"');
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(deleteAnnouncement).toHaveBeenCalledWith('a1');
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Anuncio eliminado exitosamente'),
    );
  });
});
