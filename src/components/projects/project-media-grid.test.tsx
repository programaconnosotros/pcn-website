import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteProjectMedia, updateProjectMediaDetails } from '@/actions/projects/project-media';
import { ProjectMediaGrid, type ProjectMediaItem } from './project-media-grid';

jest.mock('@/actions/projects/project-media', () => ({
  deleteProjectMedia: jest.fn(),
  updateProjectMediaDetails: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const photo = (overrides: Partial<ProjectMediaItem> = {}): ProjectMediaItem => ({
  id: 'm1',
  kind: 'PHOTO',
  src: '/full.webp',
  thumbSrc: '/thumb.webp',
  width: 1600,
  height: 900,
  description: 'La demo del lanzamiento',
  takenAt: new Date('2025-05-12T00:00:00.000Z'),
  ...overrides,
});

const openFirst = () => userEvent.click(screen.getByRole('button', { name: /Ver foto 1 de PCN/ }));

jest.setTimeout(20_000);

describe('ProjectMediaGrid', () => {
  it('shows the day and the description in the viewer, without editing for visitors', async () => {
    render(<ProjectMediaGrid media={[photo()]} title="PCN" canEdit={false} />);
    await openFirst();

    // The stored day, never shifted by the time zone
    expect(screen.getByText('12 de mayo de 2025')).toBeInTheDocument();
    expect(screen.getByText('La demo del lanzamiento')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /editar/ })).not.toBeInTheDocument();
  });

  it('lets the team edit them', async () => {
    jest.mocked(updateProjectMediaDetails).mockResolvedValue({ success: true });
    render(<ProjectMediaGrid media={[photo()]} title="PCN" canEdit />);
    await openFirst();

    await userEvent.click(screen.getByRole('button', { name: /editar/ }));
    expect(screen.getByLabelText('Fecha')).toHaveValue('2025-05-12');
    fireEvent.change(screen.getByLabelText('Descripción'), { target: { value: 'Otra' } });
    await userEvent.click(screen.getByRole('button', { name: 'guardar' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Guardado'));
    expect(updateProjectMediaDetails).toHaveBeenCalledWith('m1', {
      takenAt: '2025-05-12',
      description: 'Otra',
    });
    expect(refresh).toHaveBeenCalled();
  });

  it('invites the team to add them when a photo has neither', async () => {
    render(
      <ProjectMediaGrid
        media={[photo({ description: null, takenAt: null })]}
        title="PCN"
        canEdit
      />,
    );
    await openFirst();
    expect(screen.getByRole('button', { name: /agregar fecha y descripción/ })).toBeInTheDocument();
  });

  it('removes a file', async () => {
    jest.mocked(deleteProjectMedia).mockResolvedValue({ success: true });
    render(<ProjectMediaGrid media={[photo()]} title="PCN" canEdit />);
    await userEvent.click(screen.getByRole('button', { name: /Eliminar foto/ }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Foto eliminada'));
    expect(deleteProjectMedia).toHaveBeenCalledWith('m1');
  });
});
