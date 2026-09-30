import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { AnnouncementsWrapper } from '@/components/announcements/announcements-wrapper';
import {
  fetchAnnouncements,
  fetchAllAnnouncements,
} from '@/actions/announcements/get-announcements';
import { getEventsForSelect } from '@/actions/announcements/get-events-for-select';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Anuncios',
  description: 'Novedades, avisos y eventos de la comunidad programaConNosotros.',
  openGraph: {
    title: 'Anuncios | programaConNosotros',
    description: 'Novedades, avisos y eventos de la comunidad programaConNosotros.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/anuncios`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anuncios | programaConNosotros',
    description: 'Novedades, avisos y eventos de la comunidad programaConNosotros.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

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
