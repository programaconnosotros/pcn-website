import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { createTalkProposal } from '@/actions/talk-proposals/create-talk-proposal';
import type { SpeakerUserOption } from '@/actions/users/search-users-for-speaker';
import { mockRouter } from '@/test/dom';
import type { TalkProposalSpeakerFormData } from '@/schemas/talk-proposal-schema';
import { NewTalkProposalForm } from './new-talk-proposal-form';

jest.mock('@/actions/talk-proposals/create-talk-proposal', () => ({
  createTalkProposal: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const grace: SpeakerUserOption = {
  id: 'cuser00002',
  name: 'Grace Hopper',
  email: 'g@x.dev',
  image: null,
  phoneNumber: '5491112345678',
  jobTitle: null,
  enterprise: 'Navy',
  career: 'Matemática',
  studyPlace: null,
};
const bare: SpeakerUserOption = {
  ...grace,
  id: 'cuser00003',
  name: 'Sin datos',
  phoneNumber: null,
  enterprise: null,
  career: null,
};
jest.mock('@/components/talks/speaker-user-picker', () => ({
  SpeakerUserPicker: ({ onSelect }: { onSelect: (_u: SpeakerUserOption | null) => void }) => (
    <>
      <button type="button" onClick={() => onSelect(grace)}>
        elegir Grace
      </button>
      <button type="button" onClick={() => onSelect(bare)}>
        elegir sin datos
      </button>
      <button type="button" onClick={() => onSelect(null)}>
        quitar
      </button>
    </>
  ),
}));

const me: TalkProposalSpeakerFormData = {
  userId: 'cuser00001',
  speakerName: 'Ada Lovelace',
  speakerPhone: '5493510000000',
  isProfessional: true,
  isStudent: false,
  jobTitle: 'Dev',
  enterprise: 'Acme',
  career: '',
  studyPlace: '',
};

const renderForm = (firstSpeaker = me) =>
  render(<NewTalkProposalForm eventId="e1" defaults={{ firstSpeaker }} />);

const fillTalk = async () => {
  type(screen.getByLabelText('Título de la charla'), 'Intro a Rust');
  type(screen.getByLabelText('Descripción de la charla'), 'Ownership y borrowing');
};

// Long forms typed key by key: give them room on a busy machine
jest.setTimeout(20_000);

// Typing key by key is slow under load and these forms don't react per keystroke
const type = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });

describe('NewTalkProposalForm', () => {
  it('prefills the first speaker with the member and sends the proposal', async () => {
    jest.mocked(createTalkProposal).mockResolvedValue(undefined as never);
    renderForm();

    expect(screen.getByLabelText('Nombre del orador')).toHaveValue('Ada Lovelace');
    expect(screen.getByLabelText('Rol / Puesto')).toHaveValue('Dev');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/eventos/e1');
    await fillTalk();
    await userEvent.click(screen.getByRole('button', { name: 'enviarPropuesta();' }));

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/eventos/e1'));
    expect(toast.success).toHaveBeenCalledWith(
      '¡Propuesta enviada! Nos pondremos en contacto pronto.',
    );
    expect(createTalkProposal).toHaveBeenCalledWith('e1', {
      title: 'Intro a Rust',
      description: 'Ownership y borrowing',
      speakers: [
        expect.objectContaining({
          userId: 'cuser00001',
          speakerName: 'Ada Lovelace',
          speakerPhone: '5493510000000',
          isProfessional: true,
          jobTitle: 'Dev',
          enterprise: 'Acme',
          isStudent: false,
          career: undefined,
        }),
      ],
    });
  });

  it('validates the title, description and the speaker data', async () => {
    renderForm({
      ...me,
      userId: null,
      speakerName: '',
      speakerPhone: '+54 9 351',
      isProfessional: false,
      jobTitle: '',
      enterprise: '',
    });

    fireEvent.submit(screen.getByRole('button', { name: 'enviarPropuesta();' }).closest('form')!);

    expect(
      await screen.findByText('El nombre debe tener al menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert').map((a) => a.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('El teléfono debe contener solo dígitos'),
        expect.stringContaining('Debés seleccionar al menos una opción'),
      ]),
    );

    await userEvent.click(screen.getByLabelText('Soy profesional'));
    await userEvent.click(screen.getByLabelText('Soy estudiante'));
    fireEvent.submit(screen.getByRole('button', { name: 'enviarPropuesta();' }).closest('form')!);

    expect(await screen.findByText('El rol es requerido para profesionales')).toBeInTheDocument();
    expect(screen.getByText('La carrera es requerida para estudiantes')).toBeInTheDocument();
    expect(createTalkProposal).not.toHaveBeenCalled();
  });

  it('adds a co-speaker picked from the registered users and removes speakers', async () => {
    jest.mocked(createTalkProposal).mockResolvedValue(undefined as never);
    renderForm();
    await fillTalk();

    await userEvent.click(screen.getByRole('button', { name: 'agregarOrador();' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'elegir Grace' })[1]);

    const names = screen.getAllByLabelText('Nombre del orador');
    expect(names[1]).toHaveValue('Grace Hopper');
    expect(screen.getAllByLabelText('Teléfono (WhatsApp)')[1]).toHaveValue('5491112345678');
    expect(screen.getAllByLabelText('Empresa')[1]).toHaveValue('Navy');
    expect(screen.getByLabelText('Carrera')).toHaveValue('Matemática');

    // A user without profile data only fills the name
    await userEvent.click(screen.getByRole('button', { name: 'agregarOrador();' }));
    await userEvent.click(screen.getAllByRole('button', { name: 'elegir sin datos' })[2]);
    expect(screen.getAllByLabelText('Nombre del orador')[2]).toHaveValue('Sin datos');
    expect(screen.getAllByLabelText('Teléfono (WhatsApp)')[2]).toHaveValue('');
    await userEvent.click(screen.getAllByRole('button', { name: 'quitar' })[2]);

    // Remove the third speaker again
    const removeButtons = screen
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.parentElement!.querySelector('button'));
    await userEvent.click(removeButtons[2]!);
    expect(screen.getAllByLabelText('Nombre del orador')).toHaveLength(2);

    type(screen.getAllByLabelText('Rol / Puesto')[1], 'Admiral');
    type(screen.getByLabelText('Institución'), 'Yale');
    await userEvent.click(screen.getByRole('button', { name: 'enviarPropuesta();' }));

    await waitFor(() => expect(createTalkProposal).toHaveBeenCalled());
    expect(jest.mocked(createTalkProposal).mock.calls[0][1].speakers[1]).toMatchObject({
      userId: 'cuser00002',
      isProfessional: true,
      isStudent: true,
      jobTitle: 'Admiral',
      studyPlace: 'Yale',
    });
  });

  it('shows the server error and stays on the page', async () => {
    jest
      .mocked(createTalkProposal)
      .mockRejectedValue(new Error('El call for speakers está cerrado'));
    renderForm();
    await fillTalk();

    await userEvent.click(screen.getByRole('button', { name: 'enviarPropuesta();' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('El call for speakers está cerrado'),
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'enviarPropuesta();' })).toBeEnabled();
  });
});
