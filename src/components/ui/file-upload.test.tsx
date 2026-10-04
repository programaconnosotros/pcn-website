import { useState } from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from './file-upload';
import { FileUploadPublic } from './file-upload-public';
import { MultiFileUpload } from './multi-file-upload';
import { getPresignedUrl } from '@/actions/upload/get-presigned-url';
import { getPresignedUrlPublic } from '@/actions/upload/get-presigned-url-public';
import { postUploadForm } from '@/lib/upload-form';

jest.mock('@/actions/upload/get-presigned-url', () => ({ getPresignedUrl: jest.fn() }));
jest.mock('@/actions/upload/get-presigned-url-public', () => ({
  getPresignedUrlPublic: jest.fn(),
}));
jest.mock('@/lib/upload-form', () => ({ postUploadForm: jest.fn() }));

const presigned = getPresignedUrl as jest.Mock;
const presignedPublic = getPresignedUrlPublic as jest.Mock;
const post = postUploadForm as jest.Mock;

const image = (name = 'foto.png', size = 1024) => {
  const file = new File(['x'], name, { type: 'image/png' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

const fileInput = (container: HTMLElement) =>
  container.querySelector<HTMLInputElement>('input[type="file"]')!;

const pick = (container: HTMLElement, ...files: File[]) =>
  act(async () => {
    fireEvent.change(fileInput(container), { target: { files } });
  });

beforeAll(() => {
  URL.createObjectURL = jest.fn(() => 'blob:local');
});

beforeEach(() => {
  presigned.mockImplementation(async ({ contentType }: { contentType: string }) => ({
    url: 'https://s3',
    fields: { key: contentType },
    fileUrl: 'https://cdn/subida.png',
  }));
  presignedPublic.mockResolvedValue({
    url: 'https://s3',
    fields: {},
    fileUrl: 'https://cdn/p.png',
  });
  post.mockResolvedValue(undefined);
});

describe('FileUpload', () => {
  it('uploads the picked image and shows it', async () => {
    const onChange = jest.fn();
    const { container } = render(<FileUpload onChange={onChange} folder="talks" />);
    expect(screen.getByText('Haz clic para subir una imagen')).toBeInTheDocument();
    expect(screen.getByText(/máx\. 10MB/)).toBeInTheDocument();

    const click = jest.spyOn(fileInput(container), 'click');
    await userEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalled();

    const file = image();
    await pick(container, file);
    expect(presigned).toHaveBeenCalledWith({ contentType: 'image/png', folder: 'talks' });
    expect(post).toHaveBeenCalledWith('https://s3', { key: 'image/png' }, file);
    expect(onChange).toHaveBeenCalledWith('https://cdn/subida.png');
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute(
      'src',
      'https://cdn/subida.png',
    );
  });

  it('shows a spinner over the local preview while uploading', async () => {
    let finish!: () => void;
    post.mockReturnValueOnce(new Promise<void>((resolve) => (finish = resolve)));
    const { container } = render(<FileUpload onChange={jest.fn()} />);
    await pick(container, image());
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute('src', 'blob:local');
    expect(fileInput(container)).toBeDisabled();
    expect(screen.queryByRole('button')).toBeNull();
    await act(async () => finish());
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('rejects files over the size limit without uploading', async () => {
    const { container } = render(<FileUpload onChange={jest.fn()} maxSize={1024 * 1024} />);
    await pick(container, image('big.png', 5 * 1024 * 1024));
    expect(screen.getByText('El archivo es demasiado grande. Máximo 1MB')).toBeInTheDocument();
    expect(presigned).not.toHaveBeenCalled();
  });

  it('does nothing when the picker is cancelled', async () => {
    const onChange = jest.fn();
    const { container } = render(<FileUpload onChange={onChange} />);
    await pick(container);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the upload error and clears the value when the upload fails', async () => {
    post.mockRejectedValueOnce(new Error('Error al subir el archivo a S3'));
    const onChange = jest.fn();
    const { container } = render(<FileUpload onChange={onChange} />);
    await pick(container, image());
    expect(screen.getByText('Error al subir el archivo a S3')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('shows the current value and removes it', async () => {
    const onChange = jest.fn();
    const { container, rerender } = render(
      <FileUpload onChange={onChange} value="https://cdn/a.png" variant="profile" />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/a.png');
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('https://cdn/a.png');

    rerender(<FileUpload onChange={onChange} value="https://cdn/b.png" variant="profile" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/b.png');

    await userEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('is disabled and compact in the profile variant', () => {
    render(<FileUpload onChange={jest.fn()} disabled variant="profile" />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.queryByText(/Haz clic/)).toBeNull();
  });

  describe('with several files', () => {
    it('uploads every valid file and reports the ones that failed or were too large', async () => {
      const onChangeMultiple = jest.fn();
      post.mockImplementation(async (_url: string, _fields: unknown, file: File) => {
        if (file.name === 'mala.png') throw new Error('boom');
      });
      const { container } = render(
        <FileUpload
          onChange={jest.fn()}
          onChangeMultiple={onChangeMultiple}
          maxSize={1024 * 1024}
        />,
      );
      expect(screen.getByText('Haz clic para subir una o más imágenes')).toBeInTheDocument();
      expect(fileInput(container)).toHaveAttribute('multiple');

      await pick(container, image('a.png'), image('mala.png'), image('grande.png', 9e6));
      expect(onChangeMultiple).toHaveBeenCalledWith(['https://cdn/subida.png']);
      expect(
        screen.getByText('grande.png: demasiado grande (máx. 1MB). mala.png: error al subir'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('img')).toBeNull();
    });

    it('does not report URLs when every upload fails', async () => {
      const onChangeMultiple = jest.fn();
      post.mockRejectedValue(new Error('boom'));
      const { container } = render(
        <FileUpload onChange={jest.fn()} onChangeMultiple={onChangeMultiple} />,
      );
      await pick(container, image('a.png'));
      expect(onChangeMultiple).not.toHaveBeenCalled();
      expect(screen.getByText('a.png: error al subir')).toBeInTheDocument();
    });

    it('only reports the size error when every file is too large, and handles no files', async () => {
      const onChangeMultiple = jest.fn();
      const { container } = render(
        <FileUpload onChange={jest.fn()} onChangeMultiple={onChangeMultiple} maxSize={10} />,
      );
      await pick(container, image('a.png', 100));
      expect(screen.getByText('a.png: demasiado grande (máx. 0MB)')).toBeInTheDocument();
      expect(presigned).not.toHaveBeenCalled();
      await act(async () => {
        fireEvent.change(fileInput(container), { target: { files: null } });
      });
      expect(onChangeMultiple).not.toHaveBeenCalled();
    });
  });
});

describe('FileUploadPublic', () => {
  it('uploads through the public action', async () => {
    const onChange = jest.fn();
    const { container } = render(<FileUploadPublic onChange={onChange} />);
    expect(screen.getByText('JPEG, PNG, WebP (máx. 10MB)')).toBeInTheDocument();
    const click = jest.spyOn(fileInput(container), 'click');
    await userEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalled();

    await pick(container, image());
    expect(presignedPublic).toHaveBeenCalledWith({ contentType: 'image/png' });
    expect(onChange).toHaveBeenCalledWith('https://cdn/p.png');
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/p.png');
  });

  it('shows the spinner while uploading', async () => {
    let finish!: () => void;
    post.mockReturnValueOnce(new Promise<void>((resolve) => (finish = resolve)));
    const { container } = render(<FileUploadPublic onChange={jest.fn()} />);
    await pick(container, image());
    expect(screen.queryByRole('button')).toBeNull();
    await act(async () => finish());
  });

  it('validates the size, ignores a cancelled picker and reports failures', async () => {
    const onChange = jest.fn();
    const { container } = render(<FileUploadPublic onChange={onChange} maxSize={1024 * 1024} />);
    await pick(container);
    await pick(container, image('big.png', 3 * 1024 * 1024));
    expect(screen.getByText('El archivo es demasiado grande. Máximo 1MB')).toBeInTheDocument();

    presignedPublic.mockRejectedValueOnce(new Error('No permitido'));
    await pick(container, image());
    expect(screen.getByText('No permitido')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('syncs with the value and removes it', async () => {
    const onChange = jest.fn();
    const { rerender, container } = render(
      <FileUploadPublic onChange={onChange} value="https://cdn/1.png" />,
    );
    rerender(<FileUploadPublic onChange={onChange} value="https://cdn/2.png" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/2.png');
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('https://cdn/2.png');
    await userEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledWith('');
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<FileUploadPublic onChange={jest.fn()} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('MultiFileUpload', () => {
  const Harness = ({ initial, disabled }: { initial: string[]; disabled?: boolean }) => {
    const [urls, setUrls] = useState(initial);
    return (
      <>
        <MultiFileUpload value={urls} onChange={setUrls} disabled={disabled} folder="fotos" />
        <output>{urls.join(',')}</output>
      </>
    );
  };
  const output = () => screen.getByRole('status');

  it('reorders images with the arrow buttons', async () => {
    render(<Harness initial={['a', 'b', 'c']} />);
    const left = screen.getAllByRole('button', { name: 'Mover a la izquierda' });
    const right = screen.getAllByRole('button', { name: 'Mover a la derecha' });
    expect(left[0]).toBeDisabled();
    expect(right[2]).toBeDisabled();

    await userEvent.click(right[0]);
    expect(output()).toHaveTextContent('b,a,c');
    await userEvent.click(screen.getAllByRole('button', { name: 'Mover a la izquierda' })[2]);
    expect(output()).toHaveTextContent('b,c,a');
  });

  it('reorders images by dragging them', () => {
    const { container } = render(<Harness initial={['a', 'b', 'c']} />);
    const tiles = () => [...container.querySelectorAll<HTMLElement>('[draggable="true"]')];
    const dataTransfer = { effectAllowed: '' };

    // Dragging over a tile with nothing being dragged does nothing.
    fireEvent.dragOver(tiles()[1]);
    expect(tiles()[1]).not.toHaveClass('ring-2');

    fireEvent.dragStart(tiles()[0], { dataTransfer });
    expect(dataTransfer.effectAllowed).toBe('move');
    expect(tiles()[0]).toHaveClass('opacity-40');
    fireEvent.dragOver(tiles()[2]);
    expect(tiles()[2]).toHaveClass('ring-2');
    fireEvent.drop(tiles()[2]);
    expect(output()).toHaveTextContent('b,c,a');
    expect(tiles()[2]).not.toHaveClass('opacity-40');

    // Dropping a tile on itself or without a drag keeps the order.
    fireEvent.dragStart(tiles()[1], { dataTransfer });
    fireEvent.drop(tiles()[1]);
    fireEvent.drop(tiles()[0]);
    fireEvent.dragEnd(tiles()[0]);
    expect(output()).toHaveTextContent('b,c,a');
  });

  it('adds new uploads at the end, replaces and removes images', async () => {
    const { container } = render(<Harness initial={['https://cdn/x.png']} />);
    expect(screen.queryByRole('button', { name: 'Mover a la izquierda' })).toBeNull();

    const inputs = () => container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    await act(async () => {
      fireEvent.change(inputs()[1], { target: { files: [image()] } });
    });
    expect(output()).toHaveTextContent('https://cdn/x.png,https://cdn/subida.png');

    presigned.mockResolvedValueOnce({ url: 'u', fields: {}, fileUrl: 'https://cdn/nueva.png' });
    await act(async () => {
      fireEvent.change(inputs()[0], { target: { files: [image()] } });
    });
    expect(output()).toHaveTextContent('https://cdn/nueva.png,https://cdn/subida.png');

    const removeButtons = container.querySelectorAll<HTMLButtonElement>(
      '[draggable] .absolute.z-10',
    );
    await userEvent.click(removeButtons[0]);
    expect(output()).toHaveTextContent(/^https:\/\/cdn\/subida\.png$/);
  });

  it('locks dragging and reordering when disabled', () => {
    const { container } = render(<Harness initial={['a', 'b']} disabled />);
    expect(container.querySelector('[draggable="true"]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Mover a la derecha' })).toBeNull();
  });
});
