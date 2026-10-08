import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  addProjectPhoto,
  addProjectVideo,
  getProjectImageUploadForm,
  getProjectVideoUploadForm,
} from '@/actions/projects/project-media';
import {
  compressVideo,
  postFile,
  preparePhotoForUpload,
  readTakenAt,
  readVideo,
} from '@/components/photo-gallery/upload-media';
import { ProjectMediaUploader } from './project-media-uploader';

jest.mock('@/actions/projects/project-media', () => ({
  addProjectPhoto: jest.fn(),
  addProjectVideo: jest.fn(),
  getProjectImageUploadForm: jest.fn(),
  getProjectVideoUploadForm: jest.fn(),
}));
jest.mock('heic-to/csp', () => ({ heicTo: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
jest.mock('@/components/photo-gallery/upload-media', () => ({
  ...jest.requireActual('@/components/photo-gallery/upload-media'),
  // Shrinking and copying photos has its own tests; here they go up as picked.
  preparePhotoForUpload: jest.fn(async (file: File) => file),
  readTakenAt: jest.fn(),
  readVideo: jest.fn(),
  placeholderPoster: jest.fn(),
  compressVideo: jest.fn(),
  postFile: jest.fn(),
}));

const file = (name: string, type: string, size?: number) => {
  const f = new File(['x'], name, { type });
  if (size) Object.defineProperty(f, 'size', { value: size });
  return f;
};

const renderUploader = (count = 0) => {
  const view = render(<ProjectMediaUploader projectId="p1" count={count} />);
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
  const add = async (...files: File[]) => {
    await act(async () => {
      fireEvent.change(input, { target: { files } });
    });
  };
  return { ...view, add };
};

jest.setTimeout(20_000);

describe('ProjectMediaUploader', () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
  });
  beforeEach(() => {
    jest
      .mocked(getProjectImageUploadForm)
      .mockResolvedValue({ url: 'https://s3', fields: {}, key: 'k-photo' } as never);
    jest
      .mocked(getProjectVideoUploadForm)
      .mockResolvedValue({ url: 'https://s3', fields: {}, key: 'k-video' } as never);
    jest.mocked(postFile).mockResolvedValue(undefined as never);
    jest.mocked(addProjectPhoto).mockResolvedValue({ id: 'm1' } as never);
    jest.mocked(addProjectVideo).mockResolvedValue({ id: 'm2' } as never);
    jest
      .mocked(readVideo)
      .mockResolvedValue({ durationSeconds: 9, width: 1280, height: 720, poster: new Blob() });
    jest.mocked(compressVideo).mockResolvedValue(null);
    jest.mocked(readTakenAt).mockResolvedValue(new Date(2025, 4, 12, 21, 30));
  });

  it('lists the picked files and explains which ones cannot go up', async () => {
    const { add } = renderUploader();
    await add(file('foto.jpg', 'image/jpeg'), file('doc.pdf', 'application/pdf'));
    // Not an image or a video: ignored
    expect(screen.queryByText('doc.pdf')).not.toBeInTheDocument();

    await add(
      file('enorme.png', 'image/png', 20 * 1024 * 1024),
      file('clip.avi', 'video/x-msvideo'),
    );
    expect(screen.getByText('foto.jpg')).toBeInTheDocument();
    expect(screen.getByText('La foto pesa más de 15 MB.')).toBeInTheDocument();
    expect(screen.getByText(/Formato de video no soportado/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subir 1 archivo/ })).toBeEnabled();
  });

  it('uploads photos and videos one by one', async () => {
    const { add } = renderUploader();
    await add(file('foto.jpg', 'image/jpeg'), file('demo.mp4', 'video/mp4'));

    await userEvent.click(screen.getByRole('button', { name: /subir 2 archivos/ }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('2 archivos agregados'));
    const details = { takenAt: '2025-05-12', description: '' };
    expect(addProjectPhoto).toHaveBeenCalledWith('p1', 'k-photo', details);
    expect(addProjectVideo).toHaveBeenCalledWith('p1', 'k-video', 'k-photo', {
      durationSeconds: 9,
      width: 1280,
      height: 720,
      ...details,
    });
    expect(screen.getAllByText('agregado ✓')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /los 2 archivos en el proyecto/ })).toHaveAttribute(
      'href',
      '/proyectos/p1',
    );
    expect(refresh).toHaveBeenCalled();
  });

  it('keeps a failed file in the list to retry it without picking it again', async () => {
    jest.mocked(addProjectPhoto).mockRejectedValueOnce(new Error('S3 se cayó'));
    const { add } = renderUploader();
    await add(file('foto.jpg', 'image/jpeg'));

    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo/ }));
    await waitFor(() => expect(screen.getByText('S3 se cayó')).toBeInTheDocument());
    expect(toast.error).toHaveBeenCalledWith(
      'Se subieron 0 de 1: reintentá los que fallaron desde la lista.',
    );

    await userEvent.click(screen.getByRole('button', { name: /reintentar/ }));
    await waitFor(() => expect(screen.getByText('agregado ✓')).toBeInTheDocument());
    expect(addProjectPhoto).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('S3 se cayó')).not.toBeInTheDocument();
  });

  it('lets a waiting file be removed', async () => {
    const { add } = renderUploader();
    await add(file('foto.jpg', 'image/jpeg'));
    await userEvent.click(screen.getByRole('button', { name: 'Quitar foto.jpg' }));
    expect(screen.queryByText('foto.jpg')).not.toBeInTheDocument();
  });

  it('only uploads what fits under the project limit', async () => {
    const { add } = renderUploader(23);
    expect(screen.getByText(/lugar para 1 más/)).toBeInTheDocument();
    await add(file('a.jpg', 'image/jpeg'), file('b.jpg', 'image/jpeg'));

    await userEvent.click(screen.getByRole('button', { name: /subir 2 archivos/ }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Archivo agregado'));
    expect(addProjectPhoto).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/llegó al límite de 24/)).toBeInTheDocument();
  });

  it('takes the day from the photo and lets it be changed, with a description', async () => {
    const { add } = renderUploader();
    await add(file('foto.jpg', 'image/jpeg'));

    const date = screen.getByLabelText('Fecha de foto.jpg');
    expect(date).toHaveValue('2025-05-12');
    fireEvent.change(date, { target: { value: '2025-05-10' } });
    fireEvent.change(screen.getByLabelText('Descripción de foto.jpg'), {
      target: { value: 'La demo del día del lanzamiento' },
    });

    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo/ }));

    await waitFor(() =>
      expect(addProjectPhoto).toHaveBeenCalledWith('p1', 'k-photo', {
        takenAt: '2025-05-10',
        description: 'La demo del día del lanzamiento',
      }),
    );
    // Once it's up the fields go away
    expect(screen.queryByLabelText('Fecha de foto.jpg')).not.toBeInTheDocument();
  });

  it('shows each file as soon as it is ready, saying how many are still being prepared', async () => {
    let finishSecond!: (_file: File) => void;
    jest
      .mocked(preparePhotoForUpload)
      .mockImplementationOnce(async (picked) => picked)
      .mockImplementationOnce(
        (picked) => new Promise((resolve) => (finishSecond = () => resolve(picked))),
      );
    const { add } = renderUploader();

    void add(file('a.jpg', 'image/jpeg'), file('b.jpg', 'image/jpeg'));
    expect(await screen.findByText('a.jpg')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('preparando 1 archivo');
    expect(screen.queryByText('b.jpg')).not.toBeInTheDocument();

    await act(async () => finishSecond(file('b.jpg', 'image/jpeg')));
    expect(screen.getByText('b.jpg')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
