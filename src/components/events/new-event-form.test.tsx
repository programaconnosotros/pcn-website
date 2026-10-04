import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { createEvent } from '@/actions/events/create-event';
import type { EventFormData } from '@/schemas/event-schema';
import { NewEventForm } from './new-event-form';

jest.mock('@/actions/events/create-event', () => ({ createEvent: jest.fn() }));
jest.mock('@/actions/errors/log-error', () => ({ logError: jest.fn(), logClientError: jest.fn() }));
jest.mock('sonner', () => ({
  toast: { loading: jest.fn(() => 'toast-1'), success: jest.fn(), error: jest.fn() },
}));

const values = { name: 'Meetup' } as EventFormData;
let submit: (_values: EventFormData) => Promise<void>;
jest.mock('./event-form', () => ({
  EventForm: (props: { onSubmit: typeof submit; submitLabel: string; cancelHref: string }) => {
    submit = props.onSubmit;
    return (
      <button
        type="button"
        data-href={props.cancelHref}
        onClick={() => props.onSubmit(values).catch(() => {})}
      >
        {props.submitLabel}
      </button>
    );
  },
}));

const redirectError = () =>
  Object.assign(new Error('NEXT_REDIRECT'), { digest: 'NEXT_REDIRECT;push;/eventos/e1;307;' });

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('NewEventForm', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

  it('creates the event and celebrates when the action redirects', async () => {
    jest.mocked(createEvent).mockRejectedValue(redirectError());
    render(<NewEventForm />);
    expect(screen.getByRole('button')).toHaveAttribute('data-href', '/eventos');

    await expect(submit(values)).rejects.toMatchObject({
      digest: expect.stringContaining('REDIRECT'),
    });

    expect(createEvent).toHaveBeenCalledWith(values);
    expect(toast.success).toHaveBeenCalledWith('Evento creado exitosamente! 🎉', { id: 'toast-1' });
  });

  it('shows the action error message', async () => {
    jest.mocked(createEvent).mockRejectedValue(new Error('Ya existe un evento con ese slug'));
    render(<NewEventForm />);

    await userEvent.click(screen.getByRole('button', { name: 'crearEvento();' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Ya existe un evento con ese slug', {
        id: 'toast-1',
      }),
    );
  });

  it('falls back to a generic message for non-Error rejections', async () => {
    jest.mocked(createEvent).mockRejectedValue('nope');
    render(<NewEventForm />);

    await submit(values);

    expect(toast.error).toHaveBeenCalledWith('Ocurrió un error al crear el evento', {
      id: 'toast-1',
    });
  });
});
