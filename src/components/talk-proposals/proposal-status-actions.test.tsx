import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { updateTalkProposalStatus } from '@/actions/talk-proposals/update-talk-proposal-status';
import { deleteTalkProposal } from '@/actions/talk-proposals/delete-talk-proposal';
import { createTalkFromProposal } from '@/actions/talks/create-talk-from-proposal';
import { ProposalStatusActions } from './proposal-status-actions';

jest.mock('@/actions/talk-proposals/update-talk-proposal-status', () => ({
  updateTalkProposalStatus: jest.fn(),
}));
jest.mock('@/actions/talk-proposals/delete-talk-proposal', () => ({
  deleteTalkProposal: jest.fn(),
}));
jest.mock('@/actions/talks/create-talk-from-proposal', () => ({
  createTalkFromProposal: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('ProposalStatusActions', () => {
  it('accepts a pending proposal', async () => {
    jest.mocked(updateTalkProposalStatus).mockResolvedValue(undefined as never);
    render(<ProposalStatusActions proposalId="p1" currentStatus="PENDING" speakerName="Ada" />);

    expect(screen.queryByRole('button', { name: /crearCharla/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'aceptar();' }));

    expect(updateTalkProposalStatus).toHaveBeenCalledWith('p1', 'ACCEPTED');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Propuesta aceptada'));
  });

  it('rejects a proposal and reports errors', async () => {
    jest.mocked(updateTalkProposalStatus).mockResolvedValueOnce(undefined as never);
    jest.mocked(updateTalkProposalStatus).mockRejectedValueOnce(new Error('No autorizado'));
    jest.mocked(updateTalkProposalStatus).mockRejectedValueOnce({});
    render(<ProposalStatusActions proposalId="p1" currentStatus="PENDING" speakerName="Ada" />);

    await userEvent.click(screen.getByRole('button', { name: 'rechazar();' }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Propuesta rechazada'));
    await userEvent.click(await screen.findByRole('button', { name: 'rechazar();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
    await userEvent.click(await screen.findByRole('button', { name: 'aceptar();' }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo actualizar la propuesta. Revisá que gestiones este evento.',
      ),
    );
  });

  it('disables the current status and promotes an accepted proposal to a talk', async () => {
    jest.mocked(createTalkFromProposal).mockResolvedValueOnce({ alreadyExists: false } as never);
    jest.mocked(createTalkFromProposal).mockResolvedValueOnce({ alreadyExists: true } as never);
    jest.mocked(createTalkFromProposal).mockRejectedValueOnce(new Error('Falló'));
    jest.mocked(createTalkFromProposal).mockRejectedValueOnce({});
    render(<ProposalStatusActions proposalId="p1" currentStatus="ACCEPTED" speakerName="Ada" />);

    expect(screen.getByRole('button', { name: 'aceptar();' })).toBeDisabled();
    const promote = () => screen.findByRole('button', { name: 'crearCharla();' });

    await userEvent.click(await promote());
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Charla creada a partir de la propuesta'),
    );
    await userEvent.click(await promote());
    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith('Esta propuesta ya tiene una charla creada'),
    );
    await userEvent.click(await promote());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Falló'));
    await userEvent.click(await promote());
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo crear la charla. Revisá que gestiones este evento.',
      ),
    );
  });

  it('marks proposals that already have a talk', () => {
    render(
      <ProposalStatusActions proposalId="p1" currentStatus="ACCEPTED" speakerName="Ada" hasTalk />,
    );

    expect(screen.getByRole('button', { name: '// charla creada' })).toBeDisabled();
  });

  it('deletes a proposal after confirming', async () => {
    jest.mocked(deleteTalkProposal).mockResolvedValueOnce(undefined as never);
    jest.mocked(deleteTalkProposal).mockRejectedValueOnce(new Error('No autorizado'));
    jest.mocked(deleteTalkProposal).mockRejectedValueOnce({});
    render(<ProposalStatusActions proposalId="p1" currentStatus="REJECTED" speakerName="Ada" />);
    expect(screen.getByRole('button', { name: 'rechazar();' })).toBeDisabled();
    const remove = async () => {
      const buttons = await screen.findAllByRole('button');
      await userEvent.click(buttons[buttons.length - 1]);
      expect(screen.getByRole('alertdialog')).toHaveTextContent('la propuesta de Ada');
      await userEvent.click(screen.getByRole('button', { name: 'eliminar();' }));
    };

    await remove();
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Propuesta eliminada'));
    expect(deleteTalkProposal).toHaveBeenCalledWith('p1');
    await waitFor(() => expect(screen.getByRole('button', { name: 'aceptar();' })).toBeEnabled());
    await remove();
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
    // Si falla, el diálogo queda abierto: se reintenta desde ahí
    const retry = screen.getByRole('button', { name: 'eliminar();' });
    await waitFor(() => expect(retry).toBeEnabled());
    await userEvent.click(retry);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo eliminar la propuesta. Revisá que gestiones este evento.',
      ),
    );
  });
});
