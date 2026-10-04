import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildSpeaker, buildTalk } from '@/test/talks';
import { TalksList } from './talks-list';

jest.mock('@/actions/talks/fetch-talks', () => ({}));
jest.mock('./delete-talk-button', () => ({
  DeleteTalkButton: ({ talkTitle }: { talkTitle: string }) => (
    <button type="button">borrar {talkTitle}</button>
  ),
}));
jest.mock('./talk-form', () => ({
  TalkForm: ({
    eventId,
    talk,
    onSuccess,
    onCancel,
  }: {
    eventId: string;
    talk?: { title: string };
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div>
      <p>
        form {eventId} {talk?.title ?? 'nueva'}
      </p>
      <button type="button" onClick={onSuccess}>
        guardar
      </button>
      <button type="button" onClick={onCancel}>
        cancelar
      </button>
    </div>
  ),
}));

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('TalksList', () => {
  it('shows the empty state and creates a talk for the event', async () => {
    render(<TalksList talks={[]} eventId="e1" />);

    expect(screen.getByText('Aún no hay charlas para este evento.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'nuevaCharla();' }));
    expect(screen.getByRole('dialog', { name: 'Nueva charla' })).toHaveTextContent('form e1 nueva');
    await userEvent.click(screen.getByRole('button', { name: 'guardar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('lists talks with speaker profiles and resources, and edits one', async () => {
    const talks = [
      buildTalk({
        id: 't1',
        title: 'Pro',
        order: 1,
        slidesUrl: 'https://slides.dev',
        videoUrl: 'https://youtu.be/x',
        speakers: [
          buildSpeaker({ id: 's1', isProfessional: true, jobTitle: 'Dev', enterprise: 'Acme' }),
          buildSpeaker({
            id: 's2',
            speakerName: 'Bruno',
            isStudent: true,
            career: 'Sistemas',
            studyPlace: 'UTN',
          }),
        ],
      }),
      buildTalk({ id: 't2', title: 'Vacía', speakers: [] }),
    ];
    render(<TalksList talks={talks as never} eventId="e1" />);

    expect(screen.getByText(/charlas · 2 total/)).toBeInTheDocument();
    const pro = screen.getByRole('row', { name: /Pro/ });
    expect(pro).toHaveTextContent('Ada Lovelace, Bruno');
    expect(pro).toHaveTextContent('Rol: Dev');
    expect(pro).toHaveTextContent('Carrera: Sistemas');
    expect(within(pro).getByRole('link', { name: 'Slides' })).toHaveAttribute(
      'href',
      'https://slides.dev',
    );
    expect(within(pro).getByRole('link', { name: 'Video' })).toBeInTheDocument();
    const empty = screen.getByRole('row', { name: /Vacía/ });
    expect(empty).toHaveTextContent('Sin información');
    expect(within(empty).getAllByText('—')).toHaveLength(2);

    await userEvent.click(within(empty).getAllByRole('button')[0]);
    expect(screen.getByRole('dialog', { name: 'Editar charla' })).toHaveTextContent(
      'form e1 Vacía',
    );
    await userEvent.click(screen.getByRole('button', { name: 'cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes the create dialog with cancel and the edit dialog on success', async () => {
    render(<TalksList talks={[buildTalk()] as never} eventId="e1" />);

    await userEvent.click(screen.getByRole('button', { name: 'nuevaCharla();' }));
    await userEvent.click(screen.getByRole('button', { name: 'cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(within(screen.getAllByRole('row')[1]).getAllByRole('button')[0]);
    await userEvent.click(screen.getByRole('button', { name: 'guardar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
