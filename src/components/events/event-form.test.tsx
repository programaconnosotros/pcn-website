import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventForm } from './event-form';

jest.mock('@/components/ui/multi-file-upload', () => ({
  MultiFileUpload: ({ value, onChange }: { value: string[]; onChange: (_v: string[]) => void }) => (
    <button type="button" onClick={() => onChange([...value, '/flyer.png'])}>
      subir flyer ({value.length})
    </button>
  ),
}));

const fillBasics = async () => {
  type(screen.getByLabelText('Nombre del evento'), 'Meetup PCN');
  type(screen.getByLabelText('Descripción'), 'Una juntada para programar');
  type(screen.getByLabelText('Inicio'), '2026-11-01T19:00');
};

// Long forms typed key by key: give them room on a busy machine
jest.setTimeout(20_000);

// Typing key by key is slow under load and these forms don't react per keystroke
const type = (input: HTMLElement, value: string) => fireEvent.change(input, { target: { value } });

describe('EventForm', () => {
  it('shows validation messages and does not submit an empty in-person event', async () => {
    const onSubmit = jest.fn();
    render(<EventForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'guardarEvento();' }));

    expect(
      await screen.findByText('El nombre debe tener al menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('La descripción debe tener al menos 10 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByText('La fecha es requerida')).toBeInTheDocument();
    expect(screen.getByText('La ciudad debe tener al menos 2 caracteres')).toBeInTheDocument();
    expect(
      screen.getByText('El nombre del lugar debe tener al menos 2 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByText('La dirección debe tener al menos 5 caracteres')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits an in-person event with dates converted to UTC ISO and sponsors', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<EventForm onSubmit={onSubmit} submitLabel="crear();" />);

    await fillBasics();
    type(screen.getByLabelText('Fin (opcional)'), '2026-11-01T22:00');
    type(screen.getByLabelText('Ciudad'), 'Córdoba');
    type(screen.getByLabelText('Nombre del lugar'), 'Bar XYZ');
    type(screen.getByLabelText('Dirección'), 'Av. Siempre Viva 742');
    type(screen.getByLabelText('Cupo máximo (opcional)'), '40');
    type(screen.getByLabelText('URL corta para flyers (opcional)'), 'cowork');
    expect(screen.getByText('/cowork')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('Marcar como cupo completo'));
    await userEvent.click(screen.getByLabelText('Habilitar call for speakers'));
    await userEvent.click(screen.getByRole('button', { name: 'subir flyer (0)' }));

    expect(screen.getByText(/No hay sponsors agregados/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'agregarSponsor();' }));
    type(screen.getByPlaceholderText('Nombre del sponsor'), 'Acme');
    type(screen.getByPlaceholderText('https://ejemplo.com'), 'https://acme.dev');

    await userEvent.click(screen.getByRole('button', { name: 'crear();' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      name: 'Meetup PCN',
      description: 'Una juntada para programar',
      date: new Date('2026-11-01T19:00').toISOString(),
      endDate: new Date('2026-11-01T22:00').toISOString(),
      city: 'Córdoba',
      placeName: 'Bar XYZ',
      address: 'Av. Siempre Viva 742',
      capacity: 40,
      shortcut: 'cowork',
      markedAsFull: true,
      callForSpeakersEnabled: true,
      isOnline: false,
      flyerImages: ['/flyer.png'],
      sponsors: [{ name: 'Acme', website: 'https://acme.dev' }],
    });
    expect(await screen.findByRole('button', { name: 'crear();' })).toBeEnabled();
  });

  it('switches to online fields and submits without a physical location', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<EventForm onSubmit={onSubmit} />);

    await fillBasics();
    await userEvent.click(screen.getByLabelText('Es un evento online'));

    expect(screen.queryByLabelText('Ciudad')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('URL de Google Maps (opcional)')).not.toBeInTheDocument();
    type(screen.getByLabelText('Link de transmisión (opcional)'), 'https://meet.google.com/abc');
    await userEvent.click(screen.getByRole('button', { name: 'guardarEvento();' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      isOnline: true,
      streamingUrl: 'https://meet.google.com/abc',
      endDate: '',
    });
  });

  it('rejects invalid capacity, shortcut, maps url and sponsor name', async () => {
    const onSubmit = jest.fn();
    render(<EventForm onSubmit={onSubmit} />);

    await fillBasics();
    type(screen.getByLabelText('Cupo máximo (opcional)'), '-1');
    type(screen.getByLabelText('URL corta para flyers (opcional)'), 'con espacio');
    type(screen.getByLabelText('URL de Google Maps (opcional)'), 'https://example.com/map');
    await userEvent.click(screen.getByRole('button', { name: 'agregarSponsor();' }));
    // The browser's own min=1 check would block the click, so submit the form directly
    fireEvent.submit(screen.getByRole('button', { name: 'guardarEvento();' }).closest('form')!);

    expect(await screen.findByText('El cupo debe ser un número mayor a 0')).toBeInTheDocument();
    expect(
      screen.getByText('Solo minúsculas, números y guiones (sin espacios)'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Pegá un link de Google Maps/)).toBeInTheDocument();
    expect(screen.getByText('El nombre del sponsor es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('removes a sponsor row and prefills default values', async () => {
    render(
      <EventForm
        onSubmit={jest.fn()}
        cancelHref="/eventos/e1"
        defaultValues={{
          name: 'Editado',
          capacity: 30 as never,
          sponsors: [{ name: 'Acme', website: '' }],
          isOnline: true,
          streamingUrl: 'https://yt.com/x',
        }}
      />,
    );

    expect(screen.getByLabelText('Nombre del evento')).toHaveValue('Editado');
    expect(screen.getByLabelText('Cupo máximo (opcional)')).toHaveValue(30);
    expect(screen.getByLabelText('Link de transmisión (opcional)')).toHaveValue('https://yt.com/x');
    expect(screen.getByRole('link')).toHaveAttribute('href', '/eventos/e1');

    const sponsorInput = screen.getByDisplayValue('Acme');
    const row = sponsorInput.closest('div.flex') as HTMLElement;
    await userEvent.click(row.querySelector('button') as HTMLElement);

    expect(screen.queryByDisplayValue('Acme')).not.toBeInTheDocument();
    expect(screen.getByText(/No hay sponsors agregados/)).toBeInTheDocument();
  });
});
