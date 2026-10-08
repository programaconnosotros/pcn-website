import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { fillEventFromFlyers } from '@/actions/events/fill-event-from-flyers';
import type { EventFormData } from '@/schemas/event-schema';
import { FillFromFlyersButton } from './fill-from-flyers-button';

jest.mock('@/actions/events/fill-event-from-flyers', () => ({ fillEventFromFlyers: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), info: jest.fn(), error: jest.fn() } }));

const FLYER = 'https://cdn.dev/events/flyers/a.png';

function Harness({ values }: { values: Partial<EventFormData> }) {
  const form = useForm<EventFormData>({
    defaultValues: {
      name: '',
      description: '',
      date: '',
      city: '',
      isOnline: false,
      sponsors: [],
      ...values,
    } as EventFormData,
  });
  const watched = useWatch({ control: form.control });
  return (
    <FormProvider {...form}>
      <pre data-testid="values">{JSON.stringify(watched)}</pre>
      <FillFromFlyersButton />
    </FormProvider>
  );
}

const current = () => JSON.parse(screen.getByTestId('values').textContent!);

const button = () => screen.getByRole('button', { name: /completarConFlyers/ });

describe('FillFromFlyersButton', () => {
  it('is disabled until there are flyers', () => {
    render(<Harness values={{ flyerImages: [] }} />);
    expect(button()).toBeDisabled();
    expect(screen.getByText(/Subí los flyers/)).toBeInTheDocument();
  });

  it('fills only the empty fields and appends the missing sponsors', async () => {
    jest.mocked(fillEventFromFlyers).mockResolvedValue({
      status: 'ok',
      notes: 'Leí todo.',
      values: {
        name: 'PCN Meetup #12',
        description: 'Una noche de charlas.',
        date: '2026-11-14T19:00',
        city: 'Tucumán',
        isOnline: true,
        sponsors: [
          { name: 'Acme', website: '', logo: '' },
          { name: 'Dizenz', website: 'https://dizenz.com', logo: '/dizenz-logo.webp' },
        ],
      },
    });
    render(
      <Harness
        values={{
          flyerImages: [FLYER],
          city: 'Córdoba',
          sponsors: [{ name: 'acme', website: '', logo: '' }],
        }}
      />,
    );

    await userEvent.click(button());

    await waitFor(() => expect(current().name).toBe('PCN Meetup #12'));
    expect(fillEventFromFlyers).toHaveBeenCalledWith([FLYER]);
    expect(current()).toMatchObject({
      description: 'Una noche de charlas.',
      date: '2026-11-14T19:00',
      city: 'Córdoba',
      isOnline: true,
      sponsors: [
        { name: 'acme', website: '', logo: '' },
        { name: 'Dizenz', website: 'https://dizenz.com', logo: '/dizenz-logo.webp' },
      ],
    });
    // name, description, date, isOnline and one sponsor
    expect(toast.success).toHaveBeenCalledWith('Completé 5 campos con los flyers', {
      description: 'Leí todo. Revisalos antes de guardar.',
    });
  });

  it('says so when everything was already filled', async () => {
    jest.mocked(fillEventFromFlyers).mockResolvedValue({
      status: 'ok',
      notes: 'Leí el nombre.',
      values: { name: 'Otro nombre' },
    });
    render(<Harness values={{ flyerImages: [FLYER], name: 'Mi evento' }} />);

    await userEvent.click(button());

    await waitFor(() => expect(toast.info).toHaveBeenCalled());
    expect(current().name).toBe('Mi evento');
  });

  it('shows why the flyers could not be read', async () => {
    jest
      .mocked(fillEventFromFlyers)
      .mockResolvedValueOnce({ status: 'failed', reason: 'No se lee nada.' })
      .mockRejectedValueOnce(new Error('boom'));
    render(<Harness values={{ flyerImages: [FLYER] }} />);

    await userEvent.click(button());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se lee nada.'));

    await userEvent.click(button());
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudieron leer los flyers'));
    expect(button()).toBeEnabled();
  });
});
