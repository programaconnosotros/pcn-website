import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();

  const nextMeetup = await prisma.event.findFirst({
    where: {
      deletedAt: null,
      OR: [
        {
          date: {
            gte: now,
          },
        },
        {
          endDate: {
            gte: now,
          },
        },
      ],
      name: {
        contains: 'meetup',
        mode: 'insensitive',
      },
    },
    orderBy: {
      date: 'asc',
    },
    include: {
      images: true,
    },
  });

  if (!nextMeetup) {
    return {
      title: 'Dev Meetup (PCN)',
      description: 'Participá de la próxima dev meetup de PCN.',
      openGraph: {
        title: 'Dev Meetup (PCN)',
        description: 'Participá de la próxima dev meetup de PCN.',
        images: [`${SITE_URL}/pcn-link-preview.png`],
        url: `${SITE_URL}/meetup`,
        type: 'website',
        siteName: 'programaConNosotros',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Dev Meetup (PCN)',
        description: 'Participá de la próxima dev meetup de PCN.',
        images: [`${SITE_URL}/pcn-link-preview.png`],
      },
    };
  }

  const imageUrl =
    nextMeetup.flyerSrc ||
    (nextMeetup.images.length > 0
      ? nextMeetup.images[0].imgSrc
      : `${SITE_URL}/pcn-link-preview.png`);
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  return {
    title: `${nextMeetup.name} - Meetup - PCN`,
    description:
      nextMeetup.description.length > 160
        ? nextMeetup.description.substring(0, 157) + '...'
        : nextMeetup.description,
    openGraph: {
      title: `${nextMeetup.name} - Meetup - PCN`,
      description:
        nextMeetup.description.length > 160
          ? nextMeetup.description.substring(0, 157) + '...'
          : nextMeetup.description,
      images: [absoluteImageUrl],
      url: `${SITE_URL}/meetup`,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${nextMeetup.name} - Meetup - PCN`,
      description:
        nextMeetup.description.length > 160
          ? nextMeetup.description.substring(0, 157) + '...'
          : nextMeetup.description,
      images: [absoluteImageUrl],
    },
  };
}

const MeetupPage = async () => {
  // Trackear la visita a /meetup antes del redirect
  await trackPageVisit('/meetup');

  const now = new Date();

  // Buscar el próximo evento que sea un dev meetup
  // Buscamos eventos que:
  // 1. No estén eliminados
  // 2. Tengan fecha futura (o endDate futura)
  // 3. Su nombre contenga "meetup" o "dev meetup" (case insensitive)
  const nextMeetup = await prisma.event.findFirst({
    where: {
      deletedAt: null,
      OR: [
        {
          date: {
            gte: now,
          },
        },
        {
          endDate: {
            gte: now,
          },
        },
      ],
      name: {
        contains: 'meetup',
        mode: 'insensitive',
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  if (!nextMeetup) {
    // Si no hay meetup próximo, redirigir a la página de eventos
    redirect('/eventos');
  }

  // Redirigir a la página de inscripción del meetup
  redirect(`/eventos/${nextMeetup.id}/inscripcion`);
};

export default MeetupPage;
