import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();

  const nextEvent = await prisma.event.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { date: { gte: now } },
        { endDate: { gte: now } },
      ],
      name: { contains: 'zero to agent', mode: 'insensitive' },
    },
    orderBy: { date: 'asc' },
    include: { images: true },
  });

  if (!nextEvent) {
    return {
      title: 'Zero to Agent (PCN)',
      description: 'Participá del próximo evento Zero to Agent de PCN.',
      openGraph: {
        title: 'Zero to Agent (PCN)',
        description: 'Participá del próximo evento Zero to Agent de PCN.',
        images: [`${SITE_URL}/pcn-link-preview.png`],
        url: `${SITE_URL}/02A`,
        type: 'website',
        siteName: 'programaConNosotros',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Zero to Agent (PCN)',
        description: 'Participá del próximo evento Zero to Agent de PCN.',
        images: [`${SITE_URL}/pcn-link-preview.png`],
      },
    };
  }

  const imageUrl =
    nextEvent.flyerSrc ||
    (nextEvent.images.length > 0
      ? nextEvent.images[0].imgSrc
      : `${SITE_URL}/pcn-link-preview.png`);
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  return {
    title: `${nextEvent.name} (PCN)`,
    description:
      nextEvent.description.length > 160
        ? nextEvent.description.substring(0, 157) + '...'
        : nextEvent.description,
    openGraph: {
      title: `${nextEvent.name} - PCN`,
      description:
        nextEvent.description.length > 160
          ? nextEvent.description.substring(0, 157) + '...'
          : nextEvent.description,
      images: [absoluteImageUrl],
      url: `${SITE_URL}/02A`,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${nextEvent.name} (PCN)`,
      description:
        nextEvent.description.length > 160
          ? nextEvent.description.substring(0, 157) + '...'
          : nextEvent.description,
      images: [absoluteImageUrl],
    },
  };
}

const ZeroToAgentPage = async () => {
  await trackPageVisit('/02A');

  const now = new Date();

  const nextEvent = await prisma.event.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { date: { gte: now } },
        { endDate: { gte: now } },
      ],
      name: { contains: 'zero to agent', mode: 'insensitive' },
    },
    orderBy: { date: 'asc' },
  });

  if (!nextEvent) {
    redirect('/eventos');
  }

  redirect(`/eventos/${nextEvent.id}`);
};

export default ZeroToAgentPage;
