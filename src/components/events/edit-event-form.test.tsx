import { render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { updateEvent } from '@/actions/events/update-event';
import type { EventFormData } from '@/schemas/event-schema';
import { EditEventForm } from './edit-event-form';

jest.mock('@/actions/events/update-event', () => ({ updateEvent: jest.fn() }));
jest.mock('@/actions/errors/log-error', () => ({ logError: jest.fn(), logClientError: jest.fn() }));
jest.mock('sonner', () => ({
  toast: { loading: jest.fn(() => 'toast-1'), success: jest.fn(), error: jest.fn() },
}));

let received: { defaultValues: EventFormData; cancelHref: string; submitLabel: string };
let submit: (_values: EventFormData) => Promise<void>;
jest.mock('./event-form', () => ({
  EventForm: (props: typeof received & { onSubmit: typeof submit }) => {
    received = props;
    submit = props.onSubmit;
    return <p>{props.submitLabel}</p>;
  },
}));

const base = { name: 'Meetup', description: 'Una descripción', city: 'Rosario' };
const values = { name: 'Meetup' } as EventFormData;

describe('EditEventForm', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));

  it('formats the ISO dates as datetime-local values for the form', () => {
    const date = '2026-11-01T22:30:00.000Z';
    render(
      <EditEventForm
        eventId="e1"
        defaultValues={{ ...base, date, endDate: '2026-11-02T01:05:00.000Z' }}
      />,
    );

    expect(screen.getByText('guardarCambios();')).toBeInTheDocument();
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, '0');
    expect(received.defaultValues).toMatchObject({
      ...base,
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`,
    });
    expect(received.defaultValues.endDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(received.cancelHref).toBe('/eventos/e1');
  });

  it('leaves empty dates empty', () => {
    render(<EditEventForm eventId="e1" defaultValues={{ ...base, date: '', endDate: '' }} />);

    expect(received.defaultValues).toMatchObject({ date: '', endDate: '' });
  });

  it('updates the event and toasts success on redirect', async () => {
    jest
      .mocked(updateEvent)
      .mockRejectedValue(Object.assign(new Error('x'), { digest: 'NEXT_REDIRECT;push;/e;307;' }));
    render(<EditEventForm eventId="e1" defaultValues={{ ...base, date: '', endDate: '' }} />);

    await expect(submit(values)).rejects.toBeDefined();

    expect(updateEvent).toHaveBeenCalledWith('e1', values);
    expect(toast.success).toHaveBeenCalledWith('Evento actualizado exitosamente! 🎉', {
      id: 'toast-1',
    });
  });

  it('toasts the error when the update fails', async () => {
    jest.mocked(updateEvent).mockRejectedValue(new Error('Sin permisos'));
    render(<EditEventForm eventId="e1" defaultValues={{ ...base, date: '', endDate: '' }} />);

    await submit(values);

    expect(toast.error).toHaveBeenCalledWith('Sin permisos', { id: 'toast-1' });
  });
});
