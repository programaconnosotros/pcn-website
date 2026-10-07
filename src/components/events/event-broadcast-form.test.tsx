import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sendEventBroadcast } from '@/actions/events/event-broadcast';
import { EventBroadcastForm } from './event-broadcast-form';

jest.mock('@/actions/events/event-broadcast', () => ({ sendEventBroadcast: jest.fn() }));
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), warning: jest.fn(), error: jest.fn() },
}));
jest.setTimeout(20_000);

const counts = { confirmados: 4, 'lista-de-espera': 0, todos: 4 };

describe('EventBroadcastForm', () => {
  it('sends to the chosen group after confirming', async () => {
    jest.mocked(sendEventBroadcast).mockResolvedValue({ sent: 4, failed: 0 });
    render(<EventBroadcastForm eventId="e1" counts={counts} history={[]} />);

    expect(screen.getByRole('button', { name: /enviarMails/ })).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Asunto'), 'Cambio de aula');
    await userEvent.type(screen.getByLabelText('Mensaje'), 'Nos vemos en el aula 3.');
    expect(screen.getByText('le llega a 4 personas')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /enviarMails/ }));
    await userEvent.click(screen.getByRole('button', { name: 'mandar' }));
    await waitFor(() =>
      expect(sendEventBroadcast).toHaveBeenCalledWith('e1', {
        audience: 'confirmados',
        subject: 'Cambio de aula',
        message: 'Nos vemos en el aula 3.',
      }),
    );
  });

  it('says when a group is empty and lists past sends', async () => {
    render(
      <EventBroadcastForm
        eventId="e1"
        counts={counts}
        history={[
          {
            id: 'b1',
            audience: 'todos',
            subject: 'Recordatorio',
            recipients: 12,
            failed: 1,
            createdAt: new Date(2026, 9, 1, 10, 0),
            author: 'Ana',
          },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('radio', { name: /lista de espera/ }));
    expect(screen.getByText('no hay nadie en este grupo')).toBeInTheDocument();
    expect(screen.getByText('Recordatorio')).toBeInTheDocument();
    expect(screen.getByText(/1 fallaron/)).toBeInTheDocument();
  });
});
