import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { deleteSetup } from '@/actions/setups/setup-actions';
import { mockRouter } from '@/test/dom';
import { SetupOwnerActions } from './setup-owner-actions';

jest.mock('@/actions/setups/setup-actions', () => ({
  deleteSetup: jest.fn(),
  createSetup: jest.fn(),
  updateSetup: jest.fn(),
  getSetupUploadForm: jest.fn(),
}));
jest.mock('@/lib/upload-form', () => ({ postUploadForm: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const setup = {
  id: 's1',
  title: 'Mi escritorio',
  description: 'Dos monitores y un teclado',
  date: '2025-12-01',
  imageUrl: '/a.webp',
};

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('SetupOwnerActions', () => {
  it('lets the author edit', async () => {
    render(<SetupOwnerActions setup={setup} canEdit />);

    await userEvent.click(screen.getByRole('button', { name: 'editar' }));

    expect(screen.getByRole('dialog', { name: 'Editar setup' })).toBeInTheDocument();
  });

  it('only lets admins delete, not edit, someone else’s setup', async () => {
    jest.mocked(deleteSetup).mockResolvedValue(undefined as never);
    render(<SetupOwnerActions setup={setup} canEdit={false} />);

    expect(screen.queryByRole('button', { name: 'editar' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(deleteSetup).toHaveBeenCalledWith('s1');
    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/setups'));
    expect(toast.success).toHaveBeenCalledWith('Setup eliminado');
  });

  it('keeps the dialog open and toasts when deleting fails', async () => {
    jest.mocked(deleteSetup).mockRejectedValue(new Error('x'));
    render(<SetupOwnerActions setup={setup} canEdit />);

    await userEvent.click(screen.getByRole('button', { name: 'eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo eliminar el setup'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
