import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  createPhoto,
  createVideo,
  getPhotoUploadUrl,
  getVideoUploadUrl,
} from '@/actions/gallery/gallery-actions';
import {
  compressVideo,
  placeholderPoster,
  postFile,
  putFile,
  readTakenAt,
  readVideo,
} from './upload-media';
import { PhotoUploader } from './photo-uploader';
import { heicTo } from 'heic-to/csp';

jest.mock('@/actions/gallery/gallery-actions', () => ({
  createPhoto: jest.fn(),
  createVideo: jest.fn(),
  getPhotoUploadUrl: jest.fn(),
  getVideoUploadUrl: jest.fn(),
}));
jest.mock('heic-to/csp', () => ({ heicTo: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('./upload-media', () => ({
  ...jest.requireActual('./upload-media'),
  readTakenAt: jest.fn(),
  readVideo: jest.fn(),
  placeholderPoster: jest.fn(),
  compressVideo: jest.fn(),
  postFile: jest.fn(),
  putFile: jest.fn(),
}));

const events = [
  { id: 'e1', name: 'Meetup', date: new Date(2030, 4, 10, 19), endDate: null },
  { id: 'e2', name: 'Hackatón', date: new Date(2030, 6, 1, 10), endDate: null },
];
const ON_MEETUP = new Date(2030, 4, 10, 21);
const NO_EVENT = new Date(2030, 0, 1, 12);

const file = (name: string, type: string, size?: number) => {
  const f = new File(['x'], name, { type, lastModified: NO_EVENT.getTime() });
  if (size) Object.defineProperty(f, 'size', { value: size });
  return f;
};
const poster = new Blob(['p'], { type: 'image/jpeg' });

const renderUploader = (defaultEventId: string | null = null) => {
  const view = render(<PhotoUploader events={events} defaultEventId={defaultEventId} />);
  const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
  const add = async (...files: File[]) => {
    await act(async () => {
      fireEvent.change(input, { target: { files } });
    });
  };
  return { ...view, input, add };
};

const row = (name: string) =>
  screen.getByText(name).closest('div.flex.flex-col.gap-3') as HTMLElement;

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('PhotoUploader', () => {
  beforeAll(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
  });
  beforeEach(() => {
    jest.mocked(readTakenAt).mockResolvedValue(NO_EVENT);
    jest
      .mocked(readVideo)
      .mockResolvedValue({ durationSeconds: 75, width: 1920, height: 1080, poster });
    jest.mocked(placeholderPoster).mockResolvedValue(poster);
    jest
      .mocked(getPhotoUploadUrl)
      .mockResolvedValue({ uploadUrl: 'https://s3/put', key: 'k-photo' } as never);
    jest
      .mocked(getVideoUploadUrl)
      .mockResolvedValue({ url: 'https://s3/post', fields: { a: 'b' }, key: 'k-video' } as never);
    jest.mocked(putFile).mockResolvedValue(undefined);
    jest
      .mocked(postFile)
      .mockImplementation(async (_url, _fields, _file, onProgress) => onProgress(0.5));
    jest.mocked(createPhoto).mockResolvedValue({ id: 'new-photo' } as never);
    jest.mocked(createVideo).mockResolvedValue({ id: 'new-video' } as never);
    jest.mocked(compressVideo).mockResolvedValue(null);
  });

  it('checks the picked files and explains which ones cannot be uploaded', async () => {
    jest.mocked(heicTo).mockRejectedValueOnce(new Error('libheif'));
    const { add } = renderUploader();

    await add(
      file('notas.txt', 'text/plain'),
      file('IMG_1.HEIC', ''),
      file('clip.avi', 'video/x-msvideo'),
      file('largo.mp4', 'video/mp4', 600 * 1024 * 1024),
    );

    expect(screen.queryByText('notas.txt')).not.toBeInTheDocument();
    expect(
      screen.getByText('No se pudo convertir la foto HEIC: exportala como JPG.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Formato de video no soportado: subí MP4, WebM o MOV.'),
    ).toBeInTheDocument();
    expect(screen.getByText('El video pesa más de 500 MB.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subir 0 archivos/ })).toBeDisabled();
  });

  it('converts HEIC photos to JPEG, keeping the date they were taken', async () => {
    jest.mocked(readTakenAt).mockResolvedValue(ON_MEETUP);
    jest.mocked(heicTo).mockResolvedValueOnce(new Blob(['jpeg'], { type: 'image/jpeg' }));
    const { add } = renderUploader();
    const heic = file('IMG_1.HEIC', '');

    await add(heic);

    expect(readTakenAt).toHaveBeenCalledWith(heic);
    expect(screen.getByText('evento elegido por la fecha del archivo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo/ }));

    await waitFor(() => expect(createPhoto).toHaveBeenCalled());
    expect(getPhotoUploadUrl).toHaveBeenCalledWith('IMG_1.jpg', 'image/jpeg');
  });

  it('uploads photos and compressed videos one by one', async () => {
    jest.mocked(readTakenAt).mockResolvedValue(ON_MEETUP);
    const compressed = file('clip.mp4', 'video/mp4', 2 * 1024 * 1024);
    jest.mocked(compressVideo).mockImplementation(async (_file, onProgress) => {
      onProgress(0.3);
      return { file: compressed, width: 1280, height: 720 };
    });
    const { add } = renderUploader();

    await add(
      file('foto.jpg', 'image/jpeg'),
      file('clip.mov', 'video/quicktime', 50 * 1024 * 1024),
    );

    // Taken during the meetup: they start in it
    expect(screen.getAllByText('evento elegido por la fecha del archivo')).toHaveLength(2);
    expect(within(row('clip.mov')).getByText('1:15')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Los videos se optimizan/);
    fireEvent.change(within(row('foto.jpg')).getByPlaceholderText('Descripción (opcional)'), {
      target: { value: 'Brindis' },
    });

    await userEvent.click(screen.getByRole('button', { name: /subir 2 archivos/ }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('2 archivos subidos'));
    expect(putFile).toHaveBeenCalledWith('https://s3/put', expect.any(File), 'image/jpeg');
    expect(createPhoto).toHaveBeenCalledWith('k-photo', {
      takenAt: ON_MEETUP.toISOString(),
      description: 'Brindis',
      eventId: 'e1',
      working: false,
    });
    expect(getVideoUploadUrl).toHaveBeenCalledWith('video/mp4', compressed.size);
    expect(postFile).toHaveBeenCalledWith(
      'https://s3/post',
      { a: 'b' },
      compressed,
      expect.any(Function),
    );
    expect(getPhotoUploadUrl).toHaveBeenCalledWith('poster.jpg', 'image/jpeg');
    expect(createVideo).toHaveBeenCalledWith('k-video', 'k-photo', expect.anything());
    expect(jest.mocked(createVideo).mock.calls[0][2]).toMatchObject({
      durationSeconds: 75,
      width: 1280,
      height: 720,
      eventId: 'e1',
    });
    expect(within(row('clip.mov')).getByText('→ 2.0 MB')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'ver y etiquetar personas →' })[0]).toHaveAttribute(
      'href',
      '/galeria/new-photo',
    );
    expect(screen.getByRole('link', { name: 'ver 2 subidas en la galería →' })).toHaveAttribute(
      'href',
      '/galeria?evento=e1',
    );
  });

  it('uploads the original video when it cannot be compressed or read', async () => {
    jest.mocked(readVideo).mockRejectedValue(new Error('codec'));
    jest.mocked(compressVideo).mockRejectedValue(new Error('no webcodecs'));
    const { add } = renderUploader();

    await add(file('clip.mp4', 'video/mp4'));
    expect(within(row('clip.mp4')).getByText('video')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo$/ }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('1 archivos subidos'));
    expect(placeholderPoster).toHaveBeenCalled();
    expect(jest.mocked(createVideo).mock.calls[0][2]).toMatchObject({
      durationSeconds: null,
      width: null,
      height: null,
      eventId: null,
    });
    expect(screen.getByRole('link', { name: 'ver 1 subidas en la galería →' })).toHaveAttribute(
      'href',
      '/galeria',
    );
  });

  it('marks failed files and lets you retry them', async () => {
    jest.mocked(createPhoto).mockRejectedValueOnce(new Error('S3 caído'));
    jest.mocked(createPhoto).mockRejectedValueOnce('x');
    const { add } = renderUploader();
    await add(file('foto.jpg', 'image/jpeg'));

    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo$/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Se subieron 0 de 1 archivos'));
    expect(screen.getByText('S3 caído')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo$/ }));
    expect(await screen.findByText('Error al subir el archivo')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo$/ }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('1 archivos subidos'));
  });

  it('applies the event for all to pending files, and re-picks the event when the date changes', async () => {
    const { add } = renderUploader('e2');
    jest.mocked(readTakenAt).mockResolvedValueOnce(ON_MEETUP).mockResolvedValueOnce(NO_EVENT);

    await add(file('a.jpg', 'image/jpeg'), file('b.jpg', 'image/jpeg'));

    // a.jpg was taken at the meetup, b.jpg goes to the event for all
    expect(within(row('a.jpg')).getByRole('combobox', { name: 'Evento' })).toHaveTextContent(
      'Meetup',
    );
    expect(within(row('b.jpg')).getByRole('combobox', { name: 'Evento' })).toHaveTextContent(
      'Hackatón',
    );
    expect(screen.getByText(/· hay varios/)).toBeInTheDocument();

    // Moving a.jpg's date off the meetup falls back to the event for all
    fireEvent.change(within(row('a.jpg')).getByLabelText('Fecha'), {
      target: { value: '2030-01-01T10:00' },
    });
    expect(within(row('a.jpg')).getByRole('combobox', { name: 'Evento' })).toHaveTextContent(
      'Hackatón',
    );
    expect(screen.queryByText('evento elegido por la fecha del archivo')).not.toBeInTheDocument();

    // b.jpg moved by hand
    await userEvent.click(within(row('b.jpg')).getByRole('combobox', { name: 'Evento' }));
    await userEvent.click(await screen.findByRole('option', { name: /Meetup/ }));
    expect(within(row('b.jpg')).getByRole('combobox', { name: 'Evento' })).toHaveTextContent(
      'Meetup',
    );
    // Its date no longer picks the event
    fireEvent.change(within(row('b.jpg')).getByLabelText('Fecha'), {
      target: { value: '2030-07-01T12:00' },
    });
    expect(within(row('b.jpg')).getByRole('combobox', { name: 'Evento' })).toHaveTextContent(
      'Meetup',
    );

    // The event for all re-tags every pending file
    await userEvent.click(screen.getAllByRole('combobox')[0]);
    await userEvent.click(await screen.findByRole('option', { name: 'sin evento' }));
    expect(within(row('a.jpg')).getByRole('combobox', { name: 'Evento' })).toHaveTextContent(
      'sin evento',
    );
    expect(within(row('b.jpg')).getByRole('combobox', { name: 'Evento' })).toHaveTextContent(
      'sin evento',
    );
  });

  it('removes files and accepts dropped ones', async () => {
    const { add } = renderUploader();
    await add(file('a.jpg', 'image/jpeg'));

    await userEvent.click(screen.getByRole('button', { name: 'Quitar a.jpg' }));
    expect(screen.queryByText('a.jpg')).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');

    const dropZone = screen.getByRole('button', { name: /arrastrá fotos y videos/ });
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('border-pcnGreen');
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('bg-pcnGreen/5');
    await act(async () => {
      fireEvent.drop(dropZone, { dataTransfer: { files: [file('b.png', 'image/png')] } });
    });
    expect(screen.getByText('b.png')).toBeInTheDocument();
  });

  it('opens the file picker from the drop zone', async () => {
    const { input } = renderUploader();
    const click = jest.spyOn(input, 'click').mockImplementation(() => {});

    await userEvent.click(screen.getByRole('button', { name: /arrastrá fotos y videos/ }));

    expect(click).toHaveBeenCalled();
  });

  it('keeps the screen on and asks before leaving while uploading', async () => {
    let finish!: () => void;
    jest
      .mocked(putFile)
      .mockImplementation(() => new Promise<void>((resolve) => (finish = resolve)));
    const release = jest.fn();
    const request = jest.fn().mockResolvedValue({ release });
    Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request } });
    const { add } = renderUploader();
    await add(file('a.jpg', 'image/jpeg'));

    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo$/ }));

    await waitFor(() => expect(request).toHaveBeenCalledWith('screen'));
    expect(screen.getByRole('status')).toHaveTextContent(/no bloquees la pantalla/);
    const leave = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(leave);
    expect(leave.defaultPrevented).toBe(true);
    // Coming back to the tab takes the lock again
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    await act(async () => finish());
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(release).toHaveBeenCalled();
    delete (navigator as { wakeLock?: unknown }).wakeLock;
  });

  it('lets members upload photos only, at work, and says they wait for review', async () => {
    const view = render(
      <PhotoUploader
        events={events}
        defaultEventId={null}
        canUploadVideos={false}
        needsReview
        defaultWorking
      />,
    );
    const input = view.container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', 'image/*');
    expect(screen.getByRole('note')).toHaveTextContent('cuando un admin las aprueba');
    expect(screen.getByLabelText(/son fotos mías trabajando/)).toBeChecked();

    await act(async () => {
      fireEvent.change(input, {
        target: { files: [file('mesa.jpg', 'image/jpeg'), file('clip.mp4', 'video/mp4')] },
      });
    });
    expect(screen.getByText('Por ahora solo se pueden subir fotos.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /subir 1 archivo/ }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        '1 foto enviada: se publican cuando un admin las apruebe',
      ),
    );
    expect(createPhoto).toHaveBeenCalledWith('k-photo', expect.objectContaining({ working: true }));
    expect(getVideoUploadUrl).not.toHaveBeenCalled();
    expect(
      screen.getByText('en revisión: se publica cuando un admin la apruebe'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver y etiquetar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /subidas en la galería/ })).not.toBeInTheDocument();
  });
});
