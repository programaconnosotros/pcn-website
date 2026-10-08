import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { createTalkFromPhoto } from '@/actions/talks/create-talk-from-photo';
import { TalkFromPhotoDialog } from './talk-from-photo-dialog';

jest.mock('@/actions/talks/create-talk-from-photo', () => ({ createTalkFromPhoto: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), info: jest.fn() } }));
jest.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ onChange, disabled }: { onChange: (_v: string) => void; disabled?: boolean }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange('https://cdn.dev/talks/portraits/p.jpg')}
    >
      subir foto
    </button>
  ),
}));

const renderDialog = () => {
  const onOpenChange = jest.fn();
  const onDraft = jest.fn();
  render(<TalkFromPhotoDialog open onOpenChange={onOpenChange} onDraft={onDraft} />);
  return { onOpenChange, onDraft };
};

describe('TalkFromPhotoDialog', () => {
  it('creates the talk from the uploaded photo and closes', async () => {
    jest.mocked(createTalkFromPhoto).mockResolvedValue({
      status: 'created',
      talkId: 't1',
      title: 'Rust',
      reason: 'Coincide con la propuesta.',
    });
    const { onOpenChange } = renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'subir foto' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(createTalkFromPhoto).toHaveBeenCalledWith('https://cdn.dev/talks/portraits/p.jpg');
    expect(toast.success).toHaveBeenCalledWith('Charla cargada: Rust', {
      description: 'Coincide con la propuesta.',
    });
  });

  it('hands the draft over to the form when data is missing', async () => {
    const draft = { title: 'Rust', description: 'x', speakers: [] };
    jest
      .mocked(createTalkFromPhoto)
      .mockResolvedValue({ status: 'draft', draft, reason: 'Falta la empresa.' });
    const { onDraft, onOpenChange } = renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'subir foto' }));

    await waitFor(() => expect(onDraft).toHaveBeenCalledWith(draft));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows why the agent could not load the talk', async () => {
    jest
      .mocked(createTalkFromPhoto)
      .mockResolvedValueOnce({ status: 'failed', reason: 'No encontré el evento.' })
      .mockRejectedValueOnce(new Error('No autorizado'));
    renderDialog();

    await userEvent.click(screen.getByRole('button', { name: 'subir foto' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No encontré el evento.');

    await userEvent.click(screen.getByRole('button', { name: 'subir foto' }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar la charla'),
    );
  });
});
