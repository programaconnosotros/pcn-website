import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { signGallerySrc } from '@/lib/gallery-signing';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const EVENT_ID = 'cmo9h0hwm00i2620uj1vixr1t';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { id: EVENT_ID },
    include: { galleryItems: { select: { src: true }, take: 1 } },
  });

  if (!event) {
    return {
      title: 'Eventos',
      description: 'Participá del próximo evento de PCN.',
      openGraph: {
        title: 'Eventos',
        description: 'Participá del próximo evento de PCN.',
        url: `${SITE_URL}/agents`,
        type: 'website',
        siteName: 'programaConNosotros',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Eventos',
        description: 'Participá del próximo evento de PCN.',
      },
    };
  }

  const imageUrl =
    event.flyerImages[0] ||
    (event.galleryItems.length > 0
      ? signGallerySrc(event.galleryItems[0].src).url
      : `/eventos/${event.id}/og-image`);
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  const description =
    event.description.length > 160
      ? event.description.substring(0, 157) + '...'
      : event.description;

  return {
    title: event.name,
    description,
    openGraph: {
      title: event.name,
      description,
      images: [absoluteImageUrl],
      url: `${SITE_URL}/agents`,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description,
      images: [absoluteImageUrl],
    },
  };
}

const AgentsPage = async () => {
  await trackPageVisit('/agents');

  const event = await prisma.event.findUnique({
    where: { id: EVENT_ID },
  });

  if (!event) {
    redirect('/eventos');
  }

  redirect(`/eventos/${event.id}`);
};

export default AgentsPage;
