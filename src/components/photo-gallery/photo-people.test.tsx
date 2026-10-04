import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { tagGalleryItemUser, untagGalleryItemUser } from '@/actions/gallery/gallery-tags';
import type { Person } from '@/components/people/person-link';
import { PhotoPeople } from './photo-people';

jest.mock('@/actions/gallery/gallery-tags', () => ({
  tagGalleryItemUser: jest.fn(),
  untagGalleryItemUser: jest.fn(),
}));
jest.mock('@/actions/users/search-community-members', () => ({
  searchCommunityMembers: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/admin/user-combobox', () => ({
  UserCombobox: ({
    onSelect,
    excludeIds,
  }: {
    onSelect: (_u: { id: string; name: string; image: null }) => void;
    excludeIds: string[];
  }) => (
    <button
      type="button"
      data-exclude={excludeIds.join(',')}
      onClick={() => onSelect({ id: 'u3', name: 'Carla', image: null })}
    >
      etiquetar Carla
    </button>
  ),
}));

const ada: Person = { id: 'u1', name: 'Ada', image: null };
const bruno: Person = { id: 'u2', name: 'Bruno', image: null };

const deferred = <T,>() => {
  let resolve!: (_v: T) => void;
  let reject!: (_e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('PhotoPeople', () => {
  it('invites anonymous visitors to log in to tag themselves', () => {
    render(<PhotoPeople photoId="p1" people={[]} viewer={null} isAdmin={false} />);

    expect(screen.getByText('Todavía no hay nadie etiquetado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciá sesión' })).toHaveAttribute(
      'href',
      '/autenticacion/iniciar-sesion?redirect=/galeria/p1',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('lets members tag themselves optimistically', async () => {
    const pending = deferred<{ person: typeof ada }>();
    jest.mocked(tagGalleryItemUser).mockReturnValue(pending.promise as never);
    render(<PhotoPeople photoId="p1" people={[bruno]} viewer={ada} isAdmin={false} />);

    expect(
      screen.queryByRole('button', { name: 'Quitar a Bruno de la foto' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /aparezco en esta foto/ }));

    expect(screen.getByRole('link', { name: /Ada/ })).toBeInTheDocument();
    expect(tagGalleryItemUser).toHaveBeenCalledWith('p1', 'u1');
    pending.resolve({ person: { ...ada, image: 'https://cdn.dev/ada.png' } });
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('¡Listo! Ya aparecés en la foto'),
    );
    expect(screen.queryByRole('button', { name: /aparezco/ })).not.toBeInTheDocument();
  });

  it('undoes the tag when the server rejects it', async () => {
    jest.mocked(tagGalleryItemUser).mockRejectedValue(new Error('Límite'));
    render(<PhotoPeople photoId="p1" people={[]} viewer={ada} isAdmin={false} />);

    await userEvent.click(screen.getByRole('button', { name: /aparezco en esta foto/ }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Límite'));
    expect(screen.queryByRole('link', { name: /Ada/ })).not.toBeInTheDocument();
  });

  it('lets members untag themselves and puts them back in place if it fails', async () => {
    jest.mocked(untagGalleryItemUser).mockRejectedValueOnce(new Error('x'));
    jest.mocked(untagGalleryItemUser).mockResolvedValueOnce(undefined as never);
    render(<PhotoPeople photoId="p1" people={[ada, bruno]} viewer={ada} isAdmin={false} />);

    await userEvent.click(screen.getByRole('button', { name: 'Quitar a Ada de la foto' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('x'));
    expect(screen.getAllByRole('link').map((l) => l.textContent)).toEqual(['AAda', 'BBruno']);

    await userEvent.click(screen.getByRole('button', { name: 'Quitar a Ada de la foto' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Te quitaste de la foto'));
    expect(screen.queryByRole('link', { name: /Ada/ })).not.toBeInTheDocument();
  });

  it('lets admins tag and untag anyone, ignoring double clicks while saving', async () => {
    const pending = deferred<void>();
    jest.mocked(untagGalleryItemUser).mockReturnValue(pending.promise as never);
    jest.mocked(tagGalleryItemUser).mockImplementation(
      async (_photo, id) =>
        ({
          person: { id, name: 'Carla', image: null },
        }) as never,
    );
    render(<PhotoPeople photoId="p1" people={[bruno]} viewer={null} isAdmin />);

    expect(screen.getByRole('button', { name: 'etiquetar Carla' })).toHaveAttribute(
      'data-exclude',
      'u2',
    );
    await userEvent.click(screen.getByRole('button', { name: 'etiquetar Carla' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Etiquetaste a Carla'));
    expect(screen.getByRole('link', { name: /Carla/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Quitar a Bruno de la foto' }));
    expect(screen.queryByRole('link', { name: /Bruno/ })).not.toBeInTheDocument();
    pending.resolve();
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Quitaste a Bruno'));
  });

  it('resyncs with a fresh list from the server', () => {
    const { rerender } = render(
      <PhotoPeople photoId="p1" people={[ada]} viewer={null} isAdmin={false} />,
    );

    rerender(<PhotoPeople photoId="p2" people={[bruno]} viewer={null} isAdmin={false} />);

    expect(screen.getByRole('link', { name: /Bruno/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ada/ })).not.toBeInTheDocument();
  });
});
