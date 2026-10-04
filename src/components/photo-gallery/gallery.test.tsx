import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { GalleryTile } from '@/lib/gallery';
import { buildTile } from '@/test/gallery';
import { Gallery } from './gallery';

jest.mock('./gallery-bulk-bar', () => ({
  GalleryBulkBar: (props: {
    selected: GalleryTile[];
    visibleCount: number;
    onSelectAll: () => void;
    onClear: () => void;
    onExit: () => void;
    onDeleted: (_ids: string[]) => void;
  }) => (
    <div role="region" aria-label="Edición masiva">
      <output>
        {props.selected.map((item) => item.id).join(',') || 'nada'} de {props.visibleCount}
      </output>
      <button type="button" onClick={props.onSelectAll}>
        todos
      </button>
      <button type="button" onClick={props.onClear}>
        limpiar
      </button>
      <button type="button" onClick={props.onExit}>
        salir
      </button>
      <button type="button" onClick={() => props.onDeleted(['a'])}>
        borrar a
      </button>
    </div>
  ),
}));

const items = [
  buildTile({
    id: 'a',
    description: 'Brindis en Tafí',
    tags: [{ user: { id: 'u1', name: 'Ada' } }],
  }),
  buildTile({ id: 'b', kind: 'VIDEO', event: { id: 'e1', name: 'Meetup' } }),
  buildTile({ id: 'c', takenAt: new Date(2029, 0, 2) }),
  buildTile({ id: 'd', description: 'Asado' }),
];
const options = {
  events: [{ id: 'e1', name: 'Meetup', date: new Date(2030, 4, 10), count: 1 }],
  people: [],
};
const events = [{ id: 'e1', name: 'Meetup', date: new Date(2030, 4, 10) }];

const renderGallery = (props: Partial<React.ComponentProps<typeof Gallery>> = {}) =>
  render(
    <Gallery
      items={items}
      filter={{ type: 'todo' }}
      options={options}
      canUpload={false}
      events={null}
      {...props}
    />,
    { wrapper: SidebarProvider },
  );

const select = (caption: string, shiftKey = false) =>
  fireEvent.click(screen.getByRole('button', { name: `Seleccionar ${caption}` }), { shiftKey });

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('Gallery', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('counts photos and videos and links each tile within the filter', () => {
    renderGallery({ filter: { type: 'todo', eventId: 'e1' } });

    expect(screen.getByText('3 fotos · 1 video')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'galeria' })).toHaveAttribute('href', '/galeria');
    expect(screen.getByText('./galeria?evento=e1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver foto: Brindis en Tafí' })).toHaveAttribute(
      'href',
      '/galeria/a?evento=e1',
    );
    expect(screen.queryByRole('button', { name: /seleccionar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /subir/ })).not.toBeInTheDocument();
  });

  it('searches descriptions, events, people and dates ignoring accents', async () => {
    renderGallery();
    const search = screen.getByRole('textbox', { name: 'Buscar en la galería' });

    await userEvent.type(search, 'tafi');
    expect(screen.getAllByRole('link', { name: /^Ver/ })).toHaveLength(1);
    expect(screen.getByText(/coincidencias/)).toHaveTextContent('1/4 coincidencias');

    await userEvent.clear(search);
    await userEvent.type(search, 'ada');
    expect(screen.getByRole('link', { name: /Brindis/ })).toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, 'meetup');
    expect(screen.getByRole('link', { name: 'Ver video: Meetup' })).toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, 'zzz');
    expect(screen.getByText(/grep: sin coincidencias para/)).toHaveTextContent('"zzz"');
  });

  it('shows empty states with and without filters', () => {
    const { unmount } = renderGallery({ items: [] });
    expect(screen.getByText('Todavía no hay fotos ni videos.')).toBeInTheDocument();
    unmount();

    renderGallery({ items: [], filter: { type: 'videos' } });
    expect(screen.getByText(/No hay nada con estos filtros/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ver todo' })).toHaveAttribute('href', '/galeria');
  });

  it('links uploads to the filtered event', () => {
    renderGallery({ canUpload: true, filter: { type: 'todo', eventId: 'e1' } });

    expect(screen.getByRole('link', { name: /subir/ })).toHaveAttribute(
      'href',
      '/galeria/subir?evento=e1',
    );
  });

  it('links uploads to the general uploader without an event', () => {
    renderGallery({ canUpload: true });

    expect(screen.getByRole('link', { name: /subir/ })).toHaveAttribute('href', '/galeria/subir');
  });

  it('opens the share dialog for a tile', async () => {
    renderGallery();

    await userEvent.click(screen.getAllByRole('button', { name: 'Compartir' })[3]);

    expect(screen.getByRole('dialog')).toHaveTextContent('"Asado"');
    expect(screen.getByRole('textbox', { name: '' })).toHaveValue(
      `${window.location.origin}/galeria/d`,
    );
    await userEvent.click(screen.getByRole('button', { name: 'cerrar();' }));
  });

  it('lets admins select tiles one by one, by range, all, and leave', async () => {
    renderGallery({ events });
    const toggle = screen.getByRole('button', { name: 'seleccionar' });

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const bar = screen.getByRole('region', { name: 'Edición masiva' });

    select('Brindis en Tafí');
    expect(within(bar).getByRole('status')).toHaveTextContent('a de 4');
    // Shift + click selects the range from the last click
    select('Foto de la comunidad', true);
    expect(within(bar).getByRole('status')).toHaveTextContent('a,b,c de 4');
    expect(screen.getByRole('button', { name: 'Seleccionar Meetup' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // Clicking a selected tile unselects it, and a range from there unselects too
    select('Foto de la comunidad');
    select('Brindis en Tafí', true);
    expect(within(bar).getByRole('status')).toHaveTextContent('nada de 4');

    await userEvent.click(within(bar).getByRole('button', { name: 'todos' }));
    expect(within(bar).getByRole('status')).toHaveTextContent('a,b,c,d de 4');
    await userEvent.click(within(bar).getByRole('button', { name: 'borrar a' }));
    expect(within(bar).getByRole('status')).toHaveTextContent('b,c,d de 4');
    await userEvent.click(within(bar).getByRole('button', { name: 'limpiar' }));
    expect(within(bar).getByRole('status')).toHaveTextContent('nada de 4');

    await userEvent.click(within(bar).getByRole('button', { name: 'salir' }));
    expect(screen.queryByRole('region', { name: 'Edición masiva' })).not.toBeInTheDocument();
  });

  it('leaves the selection with Esc, or with the toggle', async () => {
    renderGallery({ events });

    await userEvent.click(screen.getByRole('button', { name: 'seleccionar' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('region', { name: 'Edición masiva' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'seleccionar' }));
    fireEvent.keyDown(window, { key: 'a' });
    expect(screen.getByRole('region', { name: 'Edición masiva' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'listo' }));
    expect(screen.queryByRole('region', { name: 'Edición masiva' })).not.toBeInTheDocument();
  });
});
