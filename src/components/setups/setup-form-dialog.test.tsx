import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { createSetup, getSetupUploadForm, updateSetup } from '@/actions/setups/setup-actions';
import { postUploadForm } from '@/lib/upload-form';
import { mockRouter } from '@/test/dom';
import { SetupFormDialog } from './setup-form-dialog';
import { heicTo } from 'heic-to/csp';
import { todayInputValue } from '@/schemas/setup-schema';

jest.mock('@/actions/setups/setup-actions', () => ({
  createSetup: jest.fn(),
  getSetupUploadForm: jest.fn(),
  updateSetup: jest.fn(),
}));
jest.mock('@/lib/upload-form', () => ({ postUploadForm: jest.fn() }));
jest.mock('heic-to/csp', () => ({ heicTo: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const photo = (name = 'setup.jpg', type = 'image/jpeg', size?: number) => {
  const file = new File(['x'], name, { type });
  if (size) Object.defineProperty(file, 'size', { value: size });
  return file;
};

const pick = async (file: File) => {
  await act(async () => {
    fireEvent.change(screen.getByLabelText('Foto'), { target: { files: [file] } });
  });
};

const fill = () => {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Mi escritorio' } });
  fireEvent.change(screen.getByLabelText('Descripción'), {
    target: { value: 'Dos monitores y un teclado' },
  });
};

const existing = {
  id: 's1',
  title: 'Mi escritorio',
  description: 'Dos monitores y un teclado',
  date: '2025-12-01',
  imageUrl: '/actual.webp',
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('SetupFormDialog', () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
  });
  beforeEach(() => {
    jest
      .mocked(getSetupUploadForm)
      .mockResolvedValue({ url: 'https://s3', fields: { k: 'v' }, key: 'orig/1' } as never);
    jest.mocked(postUploadForm).mockResolvedValue(undefined as never);
  });

  it('publishes a new setup with its photo and opens it', async () => {
    jest.mocked(createSetup).mockResolvedValue({ id: 'new' } as never);
    render(<SetupFormDialog withTrigger />);

    await userEvent.click(screen.getByRole('button', { name: /compartirSetup/ }));
    expect(screen.getByRole('dialog', { name: 'Compartir tu setup' })).toBeInTheDocument();
    await pick(photo());
    expect(screen.getByText('cambiar foto')).toBeInTheDocument();
    fill();
    await userEvent.click(screen.getByRole('button', { name: 'publicar();' }));

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/setups/new'));
    expect(getSetupUploadForm).toHaveBeenCalledWith('image/jpeg');
    expect(postUploadForm).toHaveBeenCalledWith('https://s3', { k: 'v' }, expect.any(File));
    // Sin tocar la fecha, el setup queda con la de hoy.
    expect(createSetup).toHaveBeenCalledWith('orig/1', {
      title: 'Mi escritorio',
      description: 'Dos monitores y un teclado',
      date: todayInputValue(),
    });
    expect(toast.success).toHaveBeenCalledWith('¡Setup publicado! 🖥️');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('asks for a photo and validates the texts', async () => {
    render(<SetupFormDialog withTrigger />);

    await userEvent.click(screen.getByRole('button', { name: /compartirSetup/ }));
    await userEvent.click(screen.getByRole('button', { name: 'publicar();' }));
    expect(
      await screen.findByText('El título tiene que tener al menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByText('Contá un poco más: al menos 10 caracteres')).toBeInTheDocument();

    fill();
    await userEvent.click(screen.getByRole('button', { name: 'publicar();' }));
    expect(await screen.findByText('Subí una foto de tu setup.')).toBeInTheDocument();
    expect(createSetup).not.toHaveBeenCalled();
  });

  it('rejects HEIC that cannot be converted, unsupported and too big photos', async () => {
    jest.mocked(heicTo).mockRejectedValueOnce(new Error('libheif'));
    render(<SetupFormDialog open onOpenChange={jest.fn()} />);

    await pick(photo('IMG.HEIC', ''));
    expect(
      screen.getByText('No se pudo convertir la foto HEIC: exportala como JPG.'),
    ).toBeInTheDocument();
    await pick(photo('a.gif', 'image/gif'));
    expect(
      screen.getByText('Formato no soportado. Subí JPG, PNG, WebP, AVIF o HEIC.'),
    ).toBeInTheDocument();
    await pick(photo('big.png', 'image/png', 11 * 1024 * 1024));
    expect(screen.getByText('La foto pesa más de 10 MB.')).toBeInTheDocument();
    expect(screen.queryByText('cambiar foto')).not.toBeInTheDocument();
  });

  it('accepts a dropped photo and opens the picker on click', async () => {
    render(<SetupFormDialog open onOpenChange={jest.fn()} />);
    const zone = screen.getByRole('button', { name: /soltá la foto o hacé clic/ });
    const click = jest.spyOn(screen.getByLabelText('Foto'), 'click').mockImplementation(() => {});

    await userEvent.click(zone);
    expect(click).toHaveBeenCalled();

    fireEvent.dragOver(zone);
    expect(zone).toHaveClass('border-pcnGreen');
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveClass('border-pcnGreen');
    fireEvent.drop(zone, { dataTransfer: { files: [photo('d.webp', 'image/webp')] } });
    expect(await screen.findByText('cambiar foto')).toBeInTheDocument();
    // Nothing picked: nothing changes
    fireEvent.change(screen.getByLabelText('Foto'), { target: { files: [] } });
  });

  it('edits a setup keeping its photo, controlled from outside', async () => {
    jest.mocked(updateSetup).mockResolvedValue(undefined as never);
    const onOpenChange = jest.fn();
    render(<SetupFormDialog setup={existing} open onOpenChange={onOpenChange} />);

    expect(screen.getByRole('dialog', { name: 'Editar setup' })).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('Mi escritorio');
    expect(document.querySelector('img[src="/actual.webp"]')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'guardar();' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Setup actualizado'));
    expect(updateSetup).toHaveBeenCalledWith(
      's1',
      { title: 'Mi escritorio', description: 'Dos monitores y un teclado', date: '2025-12-01' },
      null,
    );
    expect(getSetupUploadForm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('uploads a replacement photo when editing', async () => {
    jest.mocked(updateSetup).mockResolvedValue(undefined as never);
    render(<SetupFormDialog setup={existing} open onOpenChange={jest.fn()} />);

    await pick(photo());
    await userEvent.click(screen.getByRole('button', { name: 'guardar();' }));

    await waitFor(() =>
      expect(updateSetup).toHaveBeenCalledWith('s1', expect.anything(), 'orig/1'),
    );
  });

  it('toasts when publishing or saving fails', async () => {
    jest.mocked(createSetup).mockRejectedValue(new Error('x'));
    jest.mocked(updateSetup).mockRejectedValue(new Error('x'));
    const { unmount } = render(<SetupFormDialog open onOpenChange={jest.fn()} />);

    await pick(photo());
    fill();
    await userEvent.click(screen.getByRole('button', { name: 'publicar();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo publicar el setup'));
    unmount();

    render(<SetupFormDialog setup={existing} open onOpenChange={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'guardar();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo guardar el setup'));
  });

  it('resets when closed, but cannot be closed while saving', async () => {
    let finish!: () => void;
    jest
      .mocked(updateSetup)
      .mockReturnValue(new Promise<void>((resolve) => (finish = resolve)) as never);
    render(<SetupFormDialog setup={existing} withTrigger />);

    await userEvent.click(screen.getByRole('button', { name: /compartirSetup/ }));
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Otro título' } });
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: /compartirSetup/ }));
    expect(screen.getByLabelText('Título')).toHaveValue('Mi escritorio');

    await userEvent.click(screen.getByRole('button', { name: 'guardar();' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(async () => finish());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
