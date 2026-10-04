import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteTalk } from '@/actions/talks/delete-talk';
import { fetchTalkForEdit } from '@/actions/talks/fetch-talks';
import { SidebarProvider } from '@/components/ui/sidebar';
import { buildTalk } from '@/test/talks';
import { CharlasAdminWrapper } from './charlas-admin-wrapper';

jest.mock('@/actions/talks/delete-talk', () => ({ deleteTalk: jest.fn() }));
jest.mock('@/actions/talks/fetch-talks', () => ({ fetchTalkForEdit: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/videos/videos', () => ({ externalTalks: [{ id: 'x' }, { id: 'y' }] }));
jest.mock('@/components/videos/video-grid', () => ({
  VideoGrid: ({ videos }: { videos: unknown[] }) => <p>{videos.length} videos externos</p>,
}));
jest.mock('./talk-form', () => ({
  TalkForm: ({
    talk,
    onSuccess,
    onCancel,
  }: {
    talk?: { title: string };
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <p>form {talk?.title ?? 'nueva'}</p>
      <button type="button" onClick={onSuccess}>
        guardar
      </button>
      <button type="button" onClick={onCancel}>
        cancelar
      </button>
    </div>
  ),
}));

const talks = [buildTalk({ id: 't1', title: 'Rust' })];

const renderWrapper = (isAdmin: boolean) =>
  render(<CharlasAdminWrapper talks={talks} isAdmin={isAdmin} />, { wrapper: SidebarProvider });

const openMenu = async (item: 'Editar' | 'Eliminar') => {
  const article = screen.getByText('Rust').closest('article')!;
  const buttons = article.querySelectorAll('button');
  await userEvent.click(buttons[buttons.length - 1]);
  await userEvent.click(await screen.findByRole('menuitem', { name: item }));
};

// Long forms typed key by key: give them room on a busy machine
jest.setTimeout(20_000);

describe('CharlasAdminWrapper', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('invites visitors to give a talk and shows the external talks tab', async () => {
    renderWrapper(false);

    expect(screen.getByText('1 de la comunidad · 2 recomendadas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /quiero dar una charla/ })).toHaveAttribute(
      'href',
      'https://wa.me/5493815777562',
    );
    expect(screen.queryByRole('button', { name: /nuevaCharla/ })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('[mantenimiento]');

    await userEvent.click(screen.getByRole('tab', { name: 'Externas' }));
    expect(screen.getByText('2 videos externos')).toBeInTheDocument();
  });

  it('opens the external tab from ?tab=externas', () => {
    window.history.replaceState(null, '', '/charlas?tab=externas');
    renderWrapper(false);

    expect(screen.getByRole('tab', { name: 'Externas' })).toHaveAttribute('aria-selected', 'true');
  });

  it('lets admins create a talk', async () => {
    renderWrapper(true);

    await userEvent.click(screen.getByRole('button', { name: /nuevaCharla/ }));
    expect(screen.getByRole('dialog', { name: 'Nueva charla' })).toHaveTextContent('form nueva');
    await userEvent.click(screen.getByRole('button', { name: 'guardar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: /nuevaCharla/ }));
    await userEvent.click(screen.getByRole('button', { name: 'cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('loads the full talk (with phones) before editing', async () => {
    jest
      .mocked(fetchTalkForEdit)
      .mockResolvedValue({ ...talks[0], title: 'Rust completo' } as never);
    renderWrapper(true);

    await openMenu('Editar');

    expect(fetchTalkForEdit).toHaveBeenCalledWith('t1');
    expect(await screen.findByRole('dialog', { name: 'Editar charla' })).toHaveTextContent(
      'form Rust completo',
    );
    await userEvent.click(screen.getByRole('button', { name: 'guardar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await openMenu('Editar');
    await userEvent.click(await screen.findByRole('button', { name: 'cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('toasts when the talk cannot be opened for editing', async () => {
    jest.mocked(fetchTalkForEdit).mockRejectedValue(new Error('x'));
    renderWrapper(true);

    await openMenu('Editar');

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al abrir la charla'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deletes a talk after confirming', async () => {
    jest.mocked(deleteTalk).mockResolvedValue(undefined as never);
    renderWrapper(true);

    await openMenu('Eliminar');
    expect(await screen.findByRole('alertdialog')).toHaveTextContent('"Rust"');
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(deleteTalk).toHaveBeenCalledWith('t1');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Charla eliminada'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('toasts when deleting fails, and can be cancelled', async () => {
    jest.mocked(deleteTalk).mockRejectedValueOnce(new Error('No autorizado'));
    jest.mocked(deleteTalk).mockRejectedValueOnce({});
    renderWrapper(true);

    await openMenu('Eliminar');
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));

    // Si falla, el diálogo queda abierto: se reintenta y se cancela desde ahí
    const retry = screen.getByRole('button', { name: 'Eliminar' });
    await waitFor(() => expect(retry).toBeEnabled());
    await userEvent.click(retry);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al eliminar la charla'));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deleteTalk).toHaveBeenCalledTimes(2);
  });
});
