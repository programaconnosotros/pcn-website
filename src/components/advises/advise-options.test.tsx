import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteAdvise } from '@actions/advises/delete-advise';
import { editAdvise } from '@/actions/advises/edit-advise';
import { AdviseOptions } from './advise-options';

jest.mock('@actions/advises/delete-advise', () => ({ deleteAdvise: jest.fn() }));
jest.mock('@/actions/advises/edit-advise', () => ({ editAdvise: jest.fn() }));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const choose = async (user: UserEvent, item: 'Editar' | 'Eliminar') => {
  await user.click(screen.getByRole('button', { name: 'Opciones' }));
  await user.click(await screen.findByRole('menuitem', { name: item }));
};

const original = 'Un consejo original y largo';

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('AdviseOptions', () => {
  describe('editing', () => {
    it('saves the new content and closes', async () => {
      (editAdvise as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<AdviseOptions adviseId="a1" content={original} />);

      await choose(user, 'Editar');
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(original);
      await user.clear(textarea);
      await user.paste('Un consejo editado y largo');
      await user.click(screen.getByRole('button', { name: 'guardarCambios();' }));

      expect(editAdvise).toHaveBeenCalledWith({ id: 'a1', content: 'Un consejo editado y largo' });
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Tu consejo fue editado exitosamente.'),
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('validates the content', async () => {
      const user = userEvent.setup();
      render(<AdviseOptions adviseId="a1" content={original} />);

      await choose(user, 'Editar');
      await user.clear(screen.getByRole('textbox'));
      await user.click(screen.getByRole('button', { name: 'guardarCambios();' }));

      expect(
        await screen.findByText('Tenés que escribir al menos 10 caracteres'),
      ).toBeInTheDocument();
      expect(editAdvise).not.toHaveBeenCalled();
    });

    it('reports a failed edit and stays open', async () => {
      (editAdvise as jest.Mock).mockRejectedValue(new Error('x'));
      const user = userEvent.setup();
      render(<AdviseOptions adviseId="a1" content={original} />);

      await choose(user, 'Editar');
      await user.click(screen.getByRole('button', { name: 'guardarCambios();' }));

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Ocurrió un error al editar el consejo'),
      );
      expect(screen.getByRole('dialog', { name: 'Editar consejo' })).toBeInTheDocument();
    });
  });

  describe('deleting', () => {
    it('deletes after confirming', async () => {
      (deleteAdvise as jest.Mock).mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<AdviseOptions adviseId="a1" content={original} />);

      await choose(user, 'Eliminar');
      expect(
        screen.getByRole('alertdialog', { name: '¿Estás seguro de eliminar este consejo?' }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      expect(deleteAdvise).toHaveBeenCalledWith('a1');
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith('Consejo eliminado correctamente'),
      );
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    });

    it('reports a failed delete', async () => {
      (deleteAdvise as jest.Mock).mockRejectedValue(new Error('x'));
      const user = userEvent.setup();
      render(<AdviseOptions adviseId="a1" content={original} />);

      await choose(user, 'Eliminar');
      await user.click(screen.getByRole('button', { name: 'Confirmar' }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al eliminar el consejo'));
    });

    it('cancels without deleting', async () => {
      const user = userEvent.setup();
      render(<AdviseOptions adviseId="a1" content={original} />);

      await choose(user, 'Eliminar');
      await user.click(screen.getByRole('button', { name: 'Cancelar' }));

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(deleteAdvise).not.toHaveBeenCalled();
    });
  });
});
