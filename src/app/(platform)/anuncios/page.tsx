import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { AnnouncementsWrapper } from '@/components/announcements/announcements-wrapper';
import {
  fetchAnnouncements,
  fetchAllAnnouncements,
} from '@/actions/announcements/get-announcements';
import { getEventsForSelect } from '@/actions/announcements/get-events-for-select';

const AnunciosPage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
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
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <AnnouncementsWrapper announcements={announcements} events={events} isAdmin={isAdmin} />
        </div>
      </div>
    </>
  );
};

export default AnunciosPage;
