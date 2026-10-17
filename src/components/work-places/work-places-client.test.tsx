import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  createWorkPlace,
  deleteWorkPlace,
  updateWorkPlace,
} from '@/actions/work-places/work-places';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { WorkPlaceWithAuthor } from '@/lib/work-places';
import { WorkPlacesClient } from './work-places-client';

jest.mock('@/actions/work-places/work-places', () => ({
  createWorkPlace: jest.fn(),
  updateWorkPlace: jest.fn(),
  deleteWorkPlace: jest.fn(),
}));
jest.mock('sonner', () => require('@/test/platform').mockSonner());
jest.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ onChange }: { onChange: (_value: string) => void }) => (
    <button type="button" onClick={() => onChange('https://cdn.pcn.dev/work-places/1.webp')}>
      subir foto
    </button>
  ),
}));

const place = (overrides: Partial<WorkPlaceWithAuthor> = {}) =>
  ({
    id: 'wp1',
    name: 'Café Tortoni',
    city: 'Buenos Aires',
    address: 'Av. de Mayo 825',
    googleMapsUrl: 'https://maps.app.goo.gl/abc',
    wifi: 4,
    plugs: 3,
    calls: 2,
    foodQuality: null,
    foodVariety: null,
    notes: 'Hermoso pero ruidoso',
    photoUrl: 'https://cdn.pcn.dev/work-places/1.webp',
    authorId: 'u1',
    author: { id: 'u1', name: 'Ana', image: null },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as WorkPlaceWithAuthor;

const places = [
  place(),
  place({ id: 'wp2', name: 'Cowork Norte', city: 'Tucumán', authorId: 'u2', photoUrl: null }),
];

const renderClient = (viewer: { id: string; isAdmin: boolean } | null) =>
  render(<WorkPlacesClient places={places} viewer={viewer} />, { wrapper: SidebarProvider });

jest.setTimeout(20_000);

describe('WorkPlacesClient', () => {
  it('shows each place with its scores, photo and map, and asks visitors to sign in', () => {
    renderClient(null);

    expect(screen.getByText('2 lugares para laburar en 2 ciudades')).toBeInTheDocument();
    const tortoni = screen.getByText('Café Tortoni').closest('article')!;
    expect(within(tortoni).getByLabelText('wifi: 4 de 5')).toBeInTheDocument();
    expect(within(tortoni).getByLabelText('para llamadas: 2 de 5')).toBeInTheDocument();
    expect(within(tortoni).getAllByText('—')).toHaveLength(2);
    expect(within(tortoni).getByRole('img')).toHaveAttribute(
      'src',
      'https://cdn.pcn.dev/work-places/1.webp',
    );
    expect(within(tortoni).getByRole('link', { name: /ver en el mapa/ })).toHaveAttribute(
      'href',
      'https://maps.app.goo.gl/abc',
    );
    expect(screen.getByRole('link', { name: /iniciá sesión/ })).toHaveAttribute(
      'href',
      '/iniciar-sesion?redirect=/lugares',
    );
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
  });

  it('searches by name or city, ignoring accents', async () => {
    renderClient(null);

    await userEvent.type(screen.getByRole('textbox'), 'tucuman');

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText('Cowork Norte')).toBeInTheDocument();
  });

  it('lets members add a place with its scores', async () => {
    jest.mocked(createWorkPlace).mockResolvedValue({ id: 'wp3' });
    const user = userEvent.setup();
    renderClient({ id: 'u3', isAdmin: false });

    await user.click(screen.getByRole('button', { name: /sumarLugar/ }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('nombre'), 'La Biblioteca');
    await user.type(within(dialog).getByLabelText('ciudad'), 'Salta');
    await user.click(within(dialog).getByRole('radio', { name: 'wifi: 5' }));
    await user.click(within(dialog).getByRole('radio', { name: 'enchufes: 4' }));
    await user.click(within(dialog).getByRole('radio', { name: 'para llamadas: 1' }));
    await user.click(within(dialog).getByRole('checkbox', { name: 'tiene comida' }));
    await user.click(within(dialog).getByRole('button', { name: 'subir foto' }));
    await user.click(within(dialog).getByRole('button', { name: 'sumarLugar();' }));

    await waitFor(() =>
      expect(createWorkPlace).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'La Biblioteca',
          city: 'Salta',
          wifi: 5,
          plugs: 4,
          calls: 1,
          foodQuality: null,
          foodVariety: null,
          photoUrl: 'https://cdn.pcn.dev/work-places/1.webp',
        }),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith('¡Gracias! Ya está en la lista');
  });

  it('asks for the scores before saving', async () => {
    const user = userEvent.setup();
    renderClient({ id: 'u3', isAdmin: false });

    await user.click(screen.getByRole('button', { name: /sumarLugar/ }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'sumarLugar();' }),
    );

    expect(await screen.findAllByText('Elegí un puntaje')).toHaveLength(5);
    expect(createWorkPlace).not.toHaveBeenCalled();
  });

  it('lets the author edit and delete only their own places, and admins any', async () => {
    jest.mocked(updateWorkPlace).mockResolvedValue(undefined);
    jest.mocked(deleteWorkPlace).mockResolvedValue(undefined);
    const user = userEvent.setup();
    const { unmount } = renderClient({ id: 'u1', isAdmin: false });

    expect(screen.getAllByRole('button', { name: /Editar/ })).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Editar Café Tortoni' }));
    await user.click(screen.getByRole('radio', { name: 'wifi: 2' }));
    await user.click(screen.getByRole('button', { name: 'guardar();' }));
    await waitFor(() =>
      expect(updateWorkPlace).toHaveBeenCalledWith('wp1', expect.objectContaining({ wifi: 2 })),
    );
    unmount();

    renderClient({ id: 'admin', isAdmin: true });
    await user.click(screen.getByRole('button', { name: 'Eliminar Cowork Norte' }));
    expect(deleteWorkPlace).toHaveBeenCalledWith('wp2');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Lugar eliminado'));
  });
});
