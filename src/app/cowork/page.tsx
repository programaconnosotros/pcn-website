import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();

  const nextCowork = await prisma.event.findFirst({
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
        contains: 'cowork',
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

  if (!nextCowork) {
    return {
      title: 'Cowork (PCN)',
      description: 'Participá del próximo cowork de PCN.',
      openGraph: {
        title: 'Cowork (PCN)',
        description: 'Participá del próximo cowork de PCN.',
        images: [`${SITE_URL}/pcn-link-preview.png`],
        url: `${SITE_URL}/cowork`,
        type: 'website',
        siteName: 'programaConNosotros',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Cowork (PCN)',
        description: 'Participá del próximo cowork de PCN.',
        images: [`${SITE_URL}/pcn-link-preview.png`],
      },
    };
  }

  const imageUrl =
    nextCowork.flyerSrc ||
    (nextCowork.images.length > 0
      ? nextCowork.images[0].imgSrc
      : `${SITE_URL}/pcn-link-preview.png`);
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`;

  return {
    title: `${nextCowork.name} (PCN)`,
    description:
      nextCowork.description.length > 160
        ? nextCowork.description.substring(0, 157) + '...'
        : nextCowork.description,
    openGraph: {
      title: `${nextCowork.name} - Cowork - PCN`,
      description:
        nextCowork.description.length > 160
          ? nextCowork.description.substring(0, 157) + '...'
          : nextCowork.description,
      images: [absoluteImageUrl],
      url: `${SITE_URL}/cowork`,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${nextCowork.name} (PCN)`,
      description:
        nextCowork.description.length > 160
          ? nextCowork.description.substring(0, 157) + '...'
          : nextCowork.description,
      images: [absoluteImageUrl],
    },
  };
}

const CoworkPage = async () => {
  await trackPageVisit('/cowork');

  const now = new Date();

  const nextCowork = await prisma.event.findFirst({
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
        contains: 'cowork',
        mode: 'insensitive',
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  if (!nextCowork) {
    redirect('/eventos');
  }

  redirect(`/eventos/${nextCowork.id}`);
};

export default CoworkPage;
