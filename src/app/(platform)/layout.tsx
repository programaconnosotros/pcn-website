import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { User } from '@prisma/client';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { fetchUpcomingEvents } from '@/actions/events/fetch-upcoming-events';
import { PageVisitTracker } from '@/components/analytics/page-visit-tracker';
import { getUnreadNotificationsCount } from '@/actions/notifications/get-unread-count';

const PlatformLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const defaultOpen = (await cookies().get('sidebar_state')?.value) === 'true';
  const sessionId = await cookies().get('sessionId')?.value;

  let user: User | null = null;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session) {
      user = session.user;
    }
  }

  // Obtener próximos eventos para la sidebar
  const upcomingEvents = await fetchUpcomingEvents(5);

  // Obtener contador de notificaciones no leídas (solo para admins)
  const unreadNotificationsCount =
    user?.role === 'ADMIN' ? await getUnreadNotificationsCount() : 0;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        user={user}
        upcomingEvents={upcomingEvents}
        unreadNotificationsCount={unreadNotificationsCount}
      />
      <PageVisitTracker />

      <SidebarInset className="px-6">{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default PlatformLayout;
