import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { createTalk } from '@/actions/talks/create-talk';
import { updateTalk } from '@/actions/talks/update-talk';
import { fetchEventsForSelect } from '@/actions/talks/fetch-events-for-select';
import type { SpeakerUserOption } from '@/actions/users/search-users-for-speaker';
import { TalkForm } from './talk-form';

jest.mock('@/actions/talks/create-talk', () => ({ createTalk: jest.fn() }));
jest.mock('@/actions/talks/update-talk', () => ({ updateTalk: jest.fn() }));
jest.mock('@/actions/talks/fetch-events-for-select', () => ({ fetchEventsForSelect: jest.fn() }));
jest.mock('@/actions/talks/fetch-talks', () => ({}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/components/ui/file-upload', () => ({
  FileUpload: ({ onChange }: { onChange: (_v: string) => void }) => (
    <button type="button" onClick={() => onChange('https://cdn.dev/portrait.png')}>
      subir foto
    </button>
  ),
}));
jest.mock('@/components/ui/multi-file-upload', () => ({
  MultiFileUpload: ({ value, onChange }: { value: string[]; onChange: (_v: string[]) => void }) => (
    <button type="button" onClick={() => onChange([...value, 'https://cdn.dev/slide.png'])}>
      subir slides
    </button>
  ),
}));

const pickable: SpeakerUserOption = {
  id: 'cuser00001',
  name: 'Grace Hopper',
  email: 'grace@x.dev',
  image: null,
  phoneNumber: null,
  jobTitle: 'Admiral',
  enterprise: 'Navy',
  career: 'Matemática',
  studyPlace: 'Yale',
};
jest.mock('./speaker-user-picker', () => ({
  SpeakerUserPicker: ({ onSelect }: { onSelect: (_u: SpeakerUserOption | null) => void }) => (
    <>
      <button type="button" onClick={() => onSelect(pickable)}>
        elegir Grace
      </button>
      <button type="button" onClick={() => onSelect(null)}>
        quitar usuario
      </button>
    </>
  ),
}));

const events = [
  {
    id: 'cevent0001',
    name: 'Meetup PCN',
    date: new Date('2030-05-10T22:00:00Z'),
    placeName: 'Bar XYZ',
    city: 'Córdoba',
    isOnline: false,
  },
  {
    id: 'cevent0002',
    name: 'Online Night',
    date: new Date('2030-06-10T22:00:00Z'),
    placeName: null,
    city: null,
    isOnline: true,
  },
];

// Renders and lets the events of the selector load
const renderForm = async (ui: React.ReactElement) => {
  render(ui);
  await act(async () => {});
};

const submit = (label: string) =>
  fireEvent.submit(screen.getByRole('button', { name: label }).closest('form')!);

const fillTalk = async () => {
  type(screen.getByLabelText('Título de la charla'), 'Intro a Rust');
  type(screen.getByLabelText('Descripción'), 'Ownership y borrowing');
  type(screen.getByLabelText('Nombre del orador'), 'Ada Lovelace');
};

// Long forms typed key by key: give them room on a busy machine
jest.setTimeout(20_000);

// Typing key by key is slow under load and these forms don't react per keystroke
const type = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });

describe('TalkForm', () => {
  beforeEach(() => jest.mocked(fetchEventsForSelect).mockResolvedValue(events as never));

  it('validates the talk and the speaker before creating', async () => {
    await renderForm(<TalkForm />);

    submit('crearCharla();');

    expect(
      await screen.findByText('El título debe tener al menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La descripción debe tener al menos 10 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument();
    expect(
      screen.getByText('Debés seleccionar al menos una opción: profesional o estudiante'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Es profesional'));
    await userEvent.click(screen.getByLabelText('Es estudiante'));
    type(screen.getByLabelText('URL del video'), 'no-es-url');
    submit('crearCharla();');

    expect(await screen.findByText('El rol es requerido para profesionales')).toBeInTheDocument();
    expect(screen.getByText('La empresa es requerida para profesionales')).toBeInTheDocument();
    expect(screen.getByText('La carrera es requerida para estudiantes')).toBeInTheDocument();
    expect(screen.getByText('La universidad es requerida para estudiantes')).toBeInTheDocument();
    expect(screen.getByText('La URL del video no es válida')).toBeInTheDocument();
    expect(createTalk).not.toHaveBeenCalled();
  });

  it('creates a talk with a manual event, two speakers and media', async () => {
    jest.mocked(createTalk).mockResolvedValue(undefined as never);
    const onSuccess = jest.fn();
    await renderForm(<TalkForm onSuccess={onSuccess} />);

    await fillTalk();
    type(screen.getByLabelText('Título del evento'), 'Meetup viejo');
    type(screen.getByLabelText('Fecha del evento'), '2024-03-01');
    type(screen.getByLabelText('Ubicación'), 'Once57');
    await userEvent.click(screen.getByLabelText('Es estudiante'));
    type(screen.getByLabelText('Carrera'), 'Sistemas');
    type(screen.getByLabelText('Institución'), 'UTN');

    await userEvent.click(screen.getByRole('button', { name: 'agregarOrador();' }));
    expect(screen.getByText('Orador 2')).toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'elegir Grace' })[1]);
    expect(screen.getAllByLabelText('Nombre del orador')[1]).toHaveValue('Grace Hopper');
    expect(screen.getAllByLabelText('Rol / Puesto')[0]).toHaveValue('Admiral');
    expect(screen.getAllByLabelText('Carrera')[1]).toHaveValue('Matemática');

    await userEvent.click(screen.getByRole('button', { name: 'subir foto' }));
    await userEvent.click(screen.getByRole('button', { name: 'subir slides' }));
    type(screen.getByLabelText('URL del video'), 'https://youtu.be/abcdefghijk');
    type(screen.getByLabelText('URL de slides'), 'https://slides.dev/x');
    type(screen.getByLabelText('Orden'), '2');

    await userEvent.click(screen.getByRole('button', { name: 'crearCharla();' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith('Charla creada');
    expect(jest.mocked(createTalk).mock.calls[0][0]).toMatchObject({
      eventId: null,
      manualEventTitle: 'Meetup viejo',
      manualEventDate: '2024-03-01',
      manualEventLocation: 'Once57',
      title: 'Intro a Rust',
      order: 2,
      portraitUrl: 'https://cdn.dev/portrait.png',
      slideImages: ['https://cdn.dev/slide.png'],
      videoUrl: 'https://youtu.be/abcdefghijk',
      slidesUrl: 'https://slides.dev/x',
      speakers: [
        expect.objectContaining({
          speakerName: 'Ada Lovelace',
          isStudent: true,
          career: 'Sistemas',
        }),
        expect.objectContaining({
          userId: 'cuser00001',
          speakerName: 'Grace Hopper',
          isProfessional: true,
          jobTitle: 'Admiral',
          enterprise: 'Navy',
          isStudent: true,
          studyPlace: 'Yale',
        }),
      ],
    });
  });

  it('fills and locks the event fields from the chosen event', async () => {
    await renderForm(<TalkForm />);

    await userEvent.click(await screen.findByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Online Night/ }));

    expect(screen.getByLabelText('Título del evento')).toHaveValue('Online Night');
    expect(screen.getByLabelText('Título del evento')).toBeDisabled();
    expect(screen.getByLabelText('Fecha del evento')).toHaveValue('2030-06-10');
    expect(screen.getByLabelText('Ubicación')).toHaveValue('Online');

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: /Meetup PCN/ }));
    expect(screen.getByLabelText('Ubicación')).toHaveValue('Bar XYZ, Córdoba');

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByRole('option', { name: 'Sin evento' }));
    expect(screen.getByLabelText('Título del evento')).toBeEnabled();
  });

  it('starts from a draft, like the one the photo agent leaves', async () => {
    jest.mocked(createTalk).mockResolvedValue(undefined as never);
    const onSuccess = jest.fn();
    await renderForm(
      <TalkForm
        onSuccess={onSuccess}
        draft={{
          eventId: null,
          title: 'Rust en producción',
          description: 'Cómo migramos un servicio a Rust.',
          portraitUrl: 'https://cdn.dev/talks/portraits/p.jpg',
          order: 0,
          slideImages: [],
          speakers: [
            {
              userId: null,
              speakerName: 'Ada Lovelace',
              speakerPhone: '',
              isProfessional: true,
              jobTitle: '',
              enterprise: '',
              isStudent: false,
              career: '',
              studyPlace: '',
            },
          ],
        }}
      />,
    );

    expect(screen.getByLabelText('Título de la charla')).toHaveValue('Rust en producción');
    type(screen.getByLabelText('Rol / Puesto'), 'Engineer');
    type(screen.getByLabelText('Empresa'), 'Acme');
    await userEvent.click(screen.getByRole('button', { name: 'crearCharla();' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(jest.mocked(createTalk).mock.calls[0][0]).toMatchObject({
      title: 'Rust en producción',
      portraitUrl: 'https://cdn.dev/talks/portraits/p.jpg',
      speakers: [{ speakerName: 'Ada Lovelace', jobTitle: 'Engineer', enterprise: 'Acme' }],
    });
  });

  it('updates an existing talk inside an event and can be cancelled', async () => {
    jest.mocked(updateTalk).mockResolvedValue(undefined as never);
    const onCancel = jest.fn();
    const talk = {
      id: 't1',
      eventId: 'cevent0001',
      manualEventTitle: null,
      manualEventDate: new Date('2030-05-10T12:00:00Z'),
      manualEventLocation: null,
      title: 'Charla vieja',
      description: 'Una descripción larga',
      order: 1,
      portraitUrl: null,
      slidesUrl: null,
      slideImages: [],
      videoUrl: null,
      speakers: [
        {
          userId: null,
          speakerName: 'Ada Lovelace',
          speakerPhone: '',
          isProfessional: true,
          jobTitle: 'Dev',
          enterprise: 'Acme',
          isStudent: false,
          career: null,
          studyPlace: null,
        },
        {
          userId: null,
          speakerName: 'Bruno Díaz',
          speakerPhone: '',
          isProfessional: true,
          jobTitle: 'QA',
          enterprise: 'Acme',
          isStudent: false,
          career: null,
          studyPlace: null,
        },
      ],
    };
    await renderForm(<TalkForm eventId="cevent0001" talk={talk as never} onCancel={onCancel} />);

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Título de la charla')).toHaveValue('Charla vieja');
    await waitFor(() =>
      expect(screen.getByLabelText('Título del evento')).toHaveValue('Meetup PCN'),
    );

    // Remove the second speaker (each speaker can be removed while there are two)
    await userEvent.click(screen.getAllByRole('button', { name: '' }).at(-1)!);
    expect(screen.queryByDisplayValue('Bruno Díaz')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'actualizarCharla();' }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Charla actualizada'));
    expect(updateTalk).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({ eventId: 'cevent0001', manualEventTitle: 'Meetup PCN' }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'cancelar();' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows the action error', async () => {
    jest.mocked(createTalk).mockRejectedValueOnce(new Error('No autorizado'));
    jest.mocked(createTalk).mockRejectedValueOnce({});
    await renderForm(<TalkForm eventId="cevent0001" />);

    await fillTalk();
    await userEvent.click(screen.getByLabelText('Es profesional'));
    type(screen.getByLabelText('Rol / Puesto'), 'Dev');
    type(screen.getByLabelText('Empresa'), 'Acme');
    await userEvent.click(screen.getByRole('button', { name: 'quitar usuario' }));
    await userEvent.click(screen.getByRole('button', { name: 'crearCharla();' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No autorizado'));
    await userEvent.click(screen.getByRole('button', { name: 'crearCharla();' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Error al guardar la charla'));
  });
});
