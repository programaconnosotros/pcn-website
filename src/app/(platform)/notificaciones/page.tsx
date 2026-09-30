import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { PageTitle } from '@/components/ui/page-title';
import { fetchNotifications } from '@/actions/notifications/fetch-notifications';
import { NotificationsClient } from './notifications-client';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// Admin-only page: keep it out of search results.
export const metadata: Metadata = {
  title: 'Notificaciones',
  robots: { index: false, follow: false },
};

const NotificacionesPage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect('/home');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/home');
  }

  const notifications = await fetchNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle
            path="notificaciones"
            meta={`${notifications.length} en total · ${unreadCount} sin leer`}
          />

          <NotificationsClient notifications={notifications} />
        </div>
      </div>
    </>
  );
};

export default NotificacionesPage;
