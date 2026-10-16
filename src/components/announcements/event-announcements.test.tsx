import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import {
  createEventAnnouncement,
  deleteEventAnnouncement,
} from '@/actions/announcements/event-announcement';
import { EventAnnouncements } from './event-announcements';

jest.mock('@/actions/announcements/event-announcement', () => ({
  createEventAnnouncement: jest.fn(),
  deleteEventAnnouncement: jest.fn(),
}));
jest.mock('sonner', () => require('@/test/platform').mockSonner());

const announcement = (overrides = {}) => ({
  id: 'a1',
  title: 'Cambio de sala',
  content: 'Nos mudamos al aula 2',
  category: 'evento',
  pinned: false,
  published: true,
  authorId: 'u1',
  eventId: 'e1',
  createdAt: new Date(),
  updatedAt: new Date(),
  author: { id: 'u1', name: 'Ada', image: null as string | null },
  ...overrides,
});

describe('EventAnnouncements', () => {
  it('renders nothing without announcements', () => {
    const { container } = render(<EventAnnouncements announcements={[]} eventId="e1" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('lists the event announcements with pins and authors', () => {
    render(
      <EventAnnouncements
        eventId="e1"
        announcements={[
          announcement({ pinned: true }),
          announcement({
            id: 'a2',
            title: 'Otro',
            author: { id: 'u2', name: '', image: 'https://cdn.dev/b.png' },
          }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('anuncios del evento[2]');
    expect(screen.getAllByText('Nos mudamos al aula 2')).toHaveLength(2);
    expect(screen.getAllByText('destacado')).toHaveLength(1);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('hides the tools from members who do not manage the event', () => {
    render(<EventAnnouncements eventId="e1" announcements={[announcement()]} />);

    expect(screen.queryByRole('button', { name: /nuevoAnuncio/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar anuncio' })).not.toBeInTheDocument();
  });

  it('lets organizers publish an announcement, even before the first one', async () => {
    jest.mocked(createEventAnnouncement).mockResolvedValue({ id: 'a9', notified: 12 });
    const user = userEvent.setup();
    render(<EventAnnouncements eventId="e1" announcements={[]} canManage />);

    await user.click(screen.getByRole('button', { name: /nuevoAnuncio/ }));
    await user.type(screen.getByLabelText('título'), 'Cambio de aula');
    await user.type(screen.getByLabelText('anuncio'), 'Nos vemos en el aula 204.');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'publicar();' }));

    await waitFor(() =>
      expect(createEventAnnouncement).toHaveBeenCalledWith({
        eventId: 'e1',
        title: 'Cambio de aula',
        content: 'Nos vemos en el aula 204.',
        pinned: true,
      }),
    );
    expect(toast.success).toHaveBeenCalledWith('Anuncio publicado: les avisamos a 12 inscriptos');
    expect(screen.getByRole('button', { name: /nuevoAnuncio/ })).toBeInTheDocument();
  });

  it('validates the announcement before publishing', async () => {
    const user = userEvent.setup();
    render(<EventAnnouncements eventId="e1" announcements={[]} canManage />);

    await user.click(screen.getByRole('button', { name: /nuevoAnuncio/ }));
    await user.click(screen.getByRole('button', { name: 'publicar();' }));

    expect(
      await screen.findByText('El título debe tener al menos 3 caracteres'),
    ).toBeInTheDocument();
    expect(createEventAnnouncement).not.toHaveBeenCalled();
  });

  it('lets organizers delete an announcement', async () => {
    jest.mocked(deleteEventAnnouncement).mockResolvedValue(undefined);
    render(<EventAnnouncements eventId="e1" announcements={[announcement()]} canManage />);

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar anuncio' }));

    expect(deleteEventAnnouncement).toHaveBeenCalledWith('a1');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Anuncio eliminado'));
  });
});
