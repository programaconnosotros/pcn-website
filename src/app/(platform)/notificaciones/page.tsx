import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { PageTitle } from '@/components/ui/page-title';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { fetchNotifications } from '@/actions/notifications/fetch-notifications';
import { NotificationsClient } from './notifications-client';
import { redirect } from 'next/navigation';

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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Notificaciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
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
