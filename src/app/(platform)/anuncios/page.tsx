import { cookies } from 'next/headers';
import { AnnouncementsWrapper } from '@/components/announcements/announcements-wrapper';
import {
  fetchAnnouncements,
  fetchAllAnnouncements,
} from '@/actions/announcements/get-announcements';
import { getEventsForSelect } from '@/actions/announcements/get-events-for-select';
import type { Metadata } from 'next';
import { findSession } from '@/lib/session';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.ls('anuncios'),
  description: 'Novedades, avisos y eventos de la comunidad programaConNosotros.',
  openGraph: {
    title: 'Anuncios | programaConNosotros',
    description: 'Novedades, avisos y eventos de la comunidad programaConNosotros.',
    url: `${SITE_URL}/anuncios`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anuncios | programaConNosotros',
    description: 'Novedades, avisos y eventos de la comunidad programaConNosotros.',
  },
};

const AnunciosPage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  let isAdmin = false;

  if (sessionId) {
    const session = await findSession(sessionId);
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
