import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { createAnnouncement } from '@/actions/announcements/create-announcement';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AnnouncementsWrapper } from './announcements-wrapper';

jest.mock('@/actions/announcements/create-announcement', () => ({ createAnnouncement: jest.fn() }));
jest.mock('@/actions/announcements/update-announcement', () => ({ updateAnnouncement: jest.fn() }));
jest.mock('@/actions/announcements/delete-announcement', () => ({ deleteAnnouncement: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
// The form has its own tests; a Radix Select opened inside a Radix Dialog hangs jsdom.
jest.mock('./announcement-form', () => ({
  AnnouncementForm: ({
    onSubmit,
    onCancel,
    isLoading,
    submitLabel,
  }: {
    onSubmit: (_data: object) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
    submitLabel: string;
  }) => (
    <>
      <button
        type="button"
        disabled={isLoading}
        onClick={() =>
          onSubmit({
            title: 'Nuevo anuncio',
            content: 'Contenido del anuncio',
            category: 'noticia',
            pinned: false,
            published: true,
            eventId: null,
          })
        }
      >
        {submitLabel}
      </button>
      <button type="button" onClick={onCancel}>
        cancelar();
      </button>
    </>
  ),
}));

const announcement = {
  id: 'a1',
  title: 'Bienvenida',
  content: 'Hola comunidad',
  category: 'general',
  pinned: false,
  published: true,
  authorId: 'u1',
  eventId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 'u1', name: 'Ada', image: null },
};

const renderWrapper = (props: Partial<React.ComponentProps<typeof AnnouncementsWrapper>> = {}) =>
  render(<AnnouncementsWrapper announcements={[announcement]} {...props} />, {
    wrapper: SidebarProvider,
  });

const fillAndSubmit = () =>
  userEvent.click(screen.getByRole('button', { name: 'crearAnuncio();' }));

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('AnnouncementsWrapper', () => {
  it('lists announcements with the RSS link, without admin controls for members', () => {
    renderWrapper();

    expect(screen.getByText('1 anuncios de la comunidad')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'rss' })).toHaveAttribute('href', '/feed.xml');
    expect(screen.getByText('Bienvenida')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /nuevoAnuncio/ })).not.toBeInTheDocument();
  });

  it('shows the empty state', () => {
    renderWrapper({ announcements: [] });

    expect(screen.getByText(/Aún no se han publicado anuncios/)).toBeInTheDocument();
  });

  it('lets admins create an announcement', async () => {
    jest.mocked(createAnnouncement).mockResolvedValue(undefined as never);
    renderWrapper({ isAdmin: true });

    await userEvent.click(screen.getByRole('button', { name: /nuevoAnuncio/ }));
    await fillAndSubmit();

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Anuncio creado exitosamente'));
    expect(createAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Nuevo anuncio', category: 'noticia', published: true }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the dialog open when creating fails, and can be cancelled', async () => {
    jest.mocked(createAnnouncement).mockRejectedValueOnce(new Error('Límite alcanzado'));
    jest.mocked(createAnnouncement).mockRejectedValueOnce({});
    renderWrapper({ isAdmin: true });

    await userEvent.click(screen.getByRole('button', { name: /nuevoAnuncio/ }));
    await fillAndSubmit();
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Límite alcanzado'));
    await userEvent.click(await screen.findByRole('button', { name: 'crearAnuncio();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al crear el anuncio'));

    await userEvent.click(screen.getByRole('button', { name: 'cancelar();' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
