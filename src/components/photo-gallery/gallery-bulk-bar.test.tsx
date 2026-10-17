import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  bulkDeleteGalleryItems,
  bulkSetGalleryItemsEvent,
} from '@/actions/gallery/gallery-actions';
import { bulkTagGalleryItemsUser, bulkUntagGalleryItemsUser } from '@/actions/gallery/gallery-tags';
import { mockRouter } from '@/test/dom';
import { buildTile } from '@/test/gallery';
import { GalleryBulkBar } from './gallery-bulk-bar';

jest.mock('@/actions/gallery/gallery-actions', () => ({
  bulkDeleteGalleryItems: jest.fn(),
  bulkSetGalleryItemsEvent: jest.fn(),
}));
jest.mock('@/actions/gallery/gallery-tags', () => ({
  bulkTagGalleryItemsUser: jest.fn(),
  bulkUntagGalleryItemsUser: jest.fn(),
}));
jest.mock('@/actions/users/search-community-members', () => ({
  searchCommunityMembers: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/admin/user-combobox', () => ({
  UserCombobox: ({
    onSelect,
    disabled,
  }: {
    onSelect: (_u: { id: string; name: string; image: null }) => void;
    disabled: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect({ id: 'u9', name: 'Zoe', image: null })}
    >
      etiquetar Zoe
    </button>
  ),
}));

const ada = { user: { id: 'u1', name: 'Ada' } };
const bruno = { user: { id: 'u2', name: 'Bruno' } };
const selected = [
  buildTile({ id: 'a', tags: [ada, bruno] }),
  buildTile({ id: 'b', tags: [bruno] }),
];
const events = [{ id: 'e1', name: 'Meetup', date: new Date(2030, 4, 10) }];

const renderBar = (props: Partial<React.ComponentProps<typeof GalleryBulkBar>> = {}) => {
  const handlers = {
    onSelectAll: jest.fn(),
    onClear: jest.fn(),
    onExit: jest.fn(),
    onDeleted: jest.fn(),
  };
  render(
    <GalleryBulkBar
      selected={selected}
      visibleCount={5}
      events={events}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('GalleryBulkBar', () => {
  it('disables every action without a selection', () => {
    renderBar({ selected: [], visibleCount: 0 });

    expect(screen.getByText('seleccionados', { exact: false })).toHaveTextContent(
      '0 seleccionados',
    );
    expect(screen.getByRole('button', { name: 'asignar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'eliminar' })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: 'Quitar persona' })).toHaveTextContent(
      'nadie etiquetado',
    );
    expect(screen.queryByRole('button', { name: 'limpiar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /seleccionar los/ })).not.toBeInTheDocument();
  });

  it('selects all, clears and exits', async () => {
    const handlers = renderBar();

    await userEvent.click(screen.getByRole('button', { name: 'seleccionar los 5 visibles' }));
    await userEvent.click(screen.getByRole('button', { name: 'limpiar' }));
    await userEvent.click(screen.getByRole('button', { name: /salir/ }));

    expect(handlers.onSelectAll).toHaveBeenCalled();
    expect(handlers.onClear).toHaveBeenCalled();
    expect(handlers.onExit).toHaveBeenCalled();
  });

  it('moves the selection to an event or out of every event', async () => {
    jest.mocked(bulkSetGalleryItemsEvent).mockResolvedValueOnce({ updated: 2 } as never);
    jest.mocked(bulkSetGalleryItemsEvent).mockResolvedValueOnce({ updated: 1 } as never);
    renderBar();

    expect(screen.getByRole('button', { name: 'asignar' })).toBeDisabled();
    await userEvent.click(screen.getByRole('combobox', { name: 'Evento para los seleccionados' }));
    await userEvent.click(await screen.findByRole('option', { name: /Meetup/ }));
    await userEvent.click(screen.getByRole('button', { name: 'asignar' }));

    expect(bulkSetGalleryItemsEvent).toHaveBeenCalledWith(['a', 'b'], 'e1');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('2 archivos movidos a Meetup'));
    expect(mockRouter.refresh).toHaveBeenCalled();

    await waitFor(() => expect(screen.getByRole('button', { name: 'asignar' })).toBeEnabled());
    await userEvent.click(screen.getByRole('combobox', { name: 'Evento para los seleccionados' }));
    await userEvent.click(await screen.findByRole('option', { name: 'sin evento' }));
    await userEvent.click(screen.getByRole('button', { name: 'asignar' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('1 archivo quedó sin evento'));
    expect(bulkSetGalleryItemsEvent).toHaveBeenLastCalledWith(['a', 'b'], null);
  });

  it('tags a person in every selected file', async () => {
    jest.mocked(bulkTagGalleryItemsUser).mockResolvedValueOnce({ tagged: 2 } as never);
    jest.mocked(bulkTagGalleryItemsUser).mockResolvedValueOnce({ tagged: 0 } as never);
    renderBar({ selected: [selected[0]] });

    expect(screen.getByText(/seleccionado$/)).toHaveTextContent('1 seleccionado');
    await userEvent.click(screen.getByRole('button', { name: 'etiquetar Zoe' }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Etiquetaste a Zoe en 2 archivos'),
    );
    expect(bulkTagGalleryItemsUser).toHaveBeenCalledWith(['a'], 'u9');

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'etiquetar Zoe' })).toBeEnabled(),
    );
    await userEvent.click(screen.getByRole('button', { name: 'etiquetar Zoe' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Zoe ya estaba en todos'));
  });

  it('untags someone tagged in the selection, showing in how many files they are', async () => {
    jest.mocked(bulkUntagGalleryItemsUser).mockResolvedValue({ untagged: 1 } as never);
    renderBar();

    const untag = screen.getByRole('combobox', { name: 'Quitar persona' });
    expect(untag).toHaveTextContent('2 etiquetadas');
    await userEvent.click(untag);
    expect(await screen.findByRole('option', { name: 'Bruno · 2/2' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: 'Ada · 1/2' }));

    expect(bulkUntagGalleryItemsUser).toHaveBeenCalledWith(['a', 'b'], 'u1');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Quitaste a Ada de 1 archivo'));
  });

  it('deletes the selection after confirming', async () => {
    jest.mocked(bulkDeleteGalleryItems).mockResolvedValue({ deleted: 2 } as never);
    const { onDeleted } = renderBar();

    await userEvent.click(screen.getByRole('button', { name: 'eliminar' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent('¿Eliminar 2 archivos?');
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('2 archivos eliminados'));
    expect(onDeleted).toHaveBeenCalledWith(['a', 'b']);
  });

  it('toasts the error when an action fails', async () => {
    jest.mocked(bulkDeleteGalleryItems).mockRejectedValue(new Error('No autorizado'));
    const { onDeleted } = renderBar();

    await userEvent.click(screen.getByRole('button', { name: 'eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
    expect(onDeleted).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});
