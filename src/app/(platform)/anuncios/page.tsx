import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
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
import { AnnouncementsWrapper } from '@/components/announcements/announcements-wrapper';
import {
  fetchAnnouncements,
  fetchAllAnnouncements,
} from '@/actions/announcements/get-announcements';
import { getEventsForSelect } from '@/actions/announcements/get-events-for-select';

const AnunciosPage = async () => {
  const sessionId = cookies().get('sessionId')?.value;
  let isAdmin = false;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });
    isAdmin = session?.user?.role === 'ADMIN';
  }

  // Admins ven todos los anuncios (incluyendo borradores), usuarios normales solo los publicados
  const [announcements, events] = await Promise.all([
    isAdmin ? fetchAllAnnouncements() : fetchAnnouncements(),
    isAdmin ? getEventsForSelect() : Promise.resolve([]),
  ]);

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
                <BreadcrumbPage>Anuncios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <AnnouncementsWrapper announcements={announcements} events={events} isAdmin={isAdmin} />
        </div>
      </div>
    </>
  );
};

export default AnunciosPage;
