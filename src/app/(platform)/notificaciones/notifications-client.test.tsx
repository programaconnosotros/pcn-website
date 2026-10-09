import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { markNotificationAsRead } from '@/actions/notifications/mark-as-read';
import { markAllNotificationsAsRead } from '@/actions/notifications/mark-all-as-read';
import { mockRouter } from '@/test/dom';
import { NotificationsClient } from './notifications-client';

jest.mock('@/actions/notifications/mark-as-read', () => ({ markNotificationAsRead: jest.fn() }));
jest.mock('@/actions/notifications/mark-all-as-read', () => ({
  markAllNotificationsAsRead: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

type Notification = Parameters<typeof NotificationsClient>[0]['notifications'][number];

const ago = (ms: number) => new Date(Date.now() - ms);
const MIN = 60_000;

const notification = (overrides: Partial<Notification> = {}): Notification => ({
  id: 'n1',
  type: 'generic',
  title: 'Hola',
  message: 'Bienvenida',
  read: false,
  metadata: null,
  createdAt: ago(0),
  ...overrides,
});

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('NotificationsClient', () => {
  it('shows an empty state', () => {
    render(<NotificationsClient notifications={[]} />);

    expect(screen.getByText('No tienes notificaciones')).toBeInTheDocument();
  });

  it('groups unread and read notifications with relative times', () => {
    render(
      <NotificationsClient
        notifications={[
          notification({ id: 'a', title: 'A' }),
          notification({ id: 'b', title: 'B', createdAt: ago(1 * MIN) }),
          notification({ id: 'c', title: 'C', createdAt: ago(5 * MIN), read: true }),
          notification({ id: 'd', title: 'D', createdAt: ago(60 * MIN), read: true }),
          notification({ id: 'e', title: 'E', createdAt: ago(3 * 60 * MIN), read: true }),
          notification({ id: 'f', title: 'F', createdAt: ago(24 * 60 * MIN), read: true }),
          notification({ id: 'g', title: 'G', createdAt: ago(3 * 24 * 60 * MIN), read: true }),
        ]}
      />,
    );

    expect(screen.getByText(/sin leer \[2\]/)).toBeInTheDocument();
    expect(screen.getByText(/leídas \[5\]/)).toBeInTheDocument();
    for (const text of [
      'hace menos de un minuto',
      'hace 1 minuto',
      'hace 5 minutos',
      'hace 1 hora',
      'hace 3 horas',
      'hace 1 día',
      'hace 3 días',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
    expect(screen.getAllByTitle('Marcar como leída')).toHaveLength(2);
  });

  it('hides the unread section when everything is read', () => {
    render(<NotificationsClient notifications={[notification({ read: true })]} />);

    expect(screen.queryByText(/sin leer/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /marcar todas/ })).not.toBeInTheDocument();
  });

  it('links testimonial and event notifications', () => {
    render(
      <NotificationsClient
        notifications={[
          notification({
            id: 't',
            type: 'testimonial_created',
            metadata: JSON.stringify({ testimonialId: 't9' }),
          }),
          notification({
            id: 'e',
            type: 'event_waitlist_promoted',
            metadata: JSON.stringify({ eventId: 'ev3' }),
          }),
          notification({ id: 'bad', type: 'testimonial_updated', metadata: '{bad' }),
          notification({ id: 'bad2', type: 'event_registration_created', metadata: '{bad' }),
          notification({ id: 'none', type: 'testimonial_deleted', metadata: null }),
          notification({ id: 'none2', type: 'event_waitlist_joined', metadata: '{}' }),
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: /ver testimonio/ })).toHaveAttribute(
      'href',
      '/testimonios/t9',
    );
    expect(screen.getByRole('link', { name: /ver evento/ })).toHaveAttribute(
      'href',
      '/eventos/ev3',
    );
    expect(screen.getByRole('link', { name: /ver inscripciones/ })).toHaveAttribute(
      'href',
      '/eventos/ev3/inscripciones',
    );
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('links a new recommendation to the review queue', () => {
    render(
      <NotificationsClient
        notifications={[notification({ type: 'recommendation_pending', title: 'Nueva' })]}
      />,
    );

    expect(screen.getByRole('link', { name: /revisar recomendaciones/ })).toHaveAttribute(
      'href',
      '/admin/recomendaciones',
    );
  });

  it('marks one notification as read', async () => {
    (markNotificationAsRead as jest.Mock).mockResolvedValue(undefined);
    render(<NotificationsClient notifications={[notification()]} />);

    await userEvent.click(screen.getByTitle('Marcar como leída'));

    expect(markNotificationAsRead).toHaveBeenCalledWith('n1');
    expect(toast.success).toHaveBeenCalledWith('Notificación marcada como leída');
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it.each([
    [new Error('No autorizado'), 'No autorizado'],
    [{}, 'Error al marcar la notificación como leída'],
  ])('reports a failure to mark one as read', async (error, message) => {
    (markNotificationAsRead as jest.Mock).mockRejectedValue(error);
    render(<NotificationsClient notifications={[notification()]} />);

    await userEvent.click(screen.getByTitle('Marcar como leída'));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(screen.getByTitle('Marcar como leída')).toBeEnabled();
  });

  it('marks all as read', async () => {
    (markAllNotificationsAsRead as jest.Mock).mockResolvedValue(undefined);
    render(<NotificationsClient notifications={[notification(), notification({ id: 'n2' })]} />);

    await userEvent.click(screen.getByRole('button', { name: /marcar todas/ }));

    expect(markAllNotificationsAsRead).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Todas las notificaciones marcadas como leídas');
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it.each([
    [new Error('falló'), 'falló'],
    [{}, 'Error al marcar las notificaciones como leídas'],
  ])('reports a failure to mark all as read', async (error, message) => {
    (markAllNotificationsAsRead as jest.Mock).mockRejectedValue(error);
    render(<NotificationsClient notifications={[notification()]} />);

    await userEvent.click(screen.getByRole('button', { name: /marcar todas/ }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message));
    expect(screen.getByRole('button', { name: /marcar todas/ })).toBeEnabled();
  });
});
