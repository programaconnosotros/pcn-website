import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnnouncementForm } from './announcement-form';

const events = [{ id: 'e1', name: 'Meetup PCN', date: new Date('2030-05-10T22:00:00Z') }];

const choose = async (field: string, option: string | RegExp) => {
  await userEvent.click(screen.getByRole('combobox', { name: field }));
  await userEvent.click(await screen.findByRole('option', { name: option }));
};

const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('AnnouncementForm', () => {
  it('validates the required fields', async () => {
    const onSubmit = jest.fn();
    render(<AnnouncementForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'guardar();' }));

    expect(
      await screen.findByText('El título debe tener al menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(screen.getByText('El contenido debe tener al menos 10 caracteres')).toBeInTheDocument();
    expect(screen.getByText('La categoría es requerida')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits an event announcement linked to the chosen event, pinned and as a draft', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AnnouncementForm events={events} onSubmit={onSubmit} onCancel={jest.fn()} />);

    type('Título', 'Se viene el meetup');
    type('Contenido', 'Anotate que quedan pocos lugares');
    expect(screen.queryByText('Evento relacionado')).not.toBeInTheDocument();
    await choose('Categoría', 'Evento');
    await choose('Evento relacionado', /Meetup PCN/);
    await choose('Estado', 'Borrador');
    await choose('Destacar anuncio', 'Sí, destacar');
    await userEvent.click(screen.getByRole('button', { name: 'guardar();' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Se viene el meetup',
        content: 'Anotate que quedan pocos lugares',
        category: 'evento',
        eventId: 'e1',
        published: false,
        pinned: true,
      }),
    );
  });

  it('drops the event when the category is no longer "evento"', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<AnnouncementForm events={events} onSubmit={onSubmit} onCancel={jest.fn()} />);

    type('Título', 'Se viene el meetup');
    type('Contenido', 'Anotate que quedan pocos lugares');
    await choose('Categoría', 'Evento');
    await choose('Evento relacionado', /Meetup PCN/);
    await choose('Categoría', 'Noticia');
    await userEvent.click(screen.getByRole('button', { name: 'guardar();' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].eventId ?? null).toBeNull();
  });

  it('prefills the values when editing, and cancels', async () => {
    const onCancel = jest.fn();
    render(
      <AnnouncementForm
        defaultValues={{
          title: 'Viejo',
          content: 'Contenido anterior',
          category: 'importante',
          pinned: true,
          published: false,
          eventId: null,
        }}
        onSubmit={jest.fn()}
        onCancel={onCancel}
        submitLabel="actualizar();"
      />,
    );

    expect(screen.getByLabelText('Título')).toHaveValue('Viejo');
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveTextContent('Importante');
    expect(screen.getByRole('combobox', { name: 'Estado' })).toHaveTextContent('Borrador');
    expect(screen.getByRole('combobox', { name: 'Destacar anuncio' })).toHaveTextContent(
      'Sí, destacar',
    );
    await userEvent.click(screen.getByRole('button', { name: 'cancelar();' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('locks the buttons while saving', () => {
    render(<AnnouncementForm onSubmit={jest.fn()} onCancel={jest.fn()} isLoading />);

    expect(screen.getByRole('button', { name: /guardando/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'cancelar();' })).toBeDisabled();
  });
});
