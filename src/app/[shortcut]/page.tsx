import { signGallerySrc } from '@/lib/gallery-signing';
import { redirect } from 'next/navigation';
import { trackPageVisit } from '@/actions/analytics/track-page-visit';
import { findNextEventByShortcut, slugToLabel } from '@/lib/event-shortcuts';
import type { Metadata } from 'next';
import { optimizedOgImage } from '@/lib/og-image';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ shortcut: string }>;
}): Promise<Metadata> {
  const { shortcut } = await params;
  const label = slugToLabel(shortcut);

  const event = await findNextEventByShortcut(shortcut);

  if (!event) {
    return {
      title: 'programaConNosotros',
      description: 'Participá de los próximos eventos de PCN.',
      openGraph: {
        title: 'programaConNosotros',
        description: 'Participá de los próximos eventos de PCN.',
        url: `${SITE_URL}/${shortcut}`,
        type: 'website',
        siteName: 'programaConNosotros',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'programaConNosotros',
        description: 'Participá de los próximos eventos de PCN.',
      },
    };
  }

  const rawImage =
    event.flyerImages[0] ||
    (event.galleryItems[0] && signGallerySrc(event.galleryItems[0].src).url) ||
    null;
  // Events without a flyer get the generated terminal card.
  const imageUrl = rawImage
    ? optimizedOgImage(rawImage)
    : `${SITE_URL}/eventos/${event.id}/og-image`;

  return {
    title: event.name,
    description: event.description,
    openGraph: {
      title: `${event.name} - ${label}`,
      description: event.description,
      images: [imageUrl],
      url: `${SITE_URL}/${shortcut}`,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description: event.description,
      images: [imageUrl],
    },
  };
}

const ShortcutPage = async ({ params }: { params: Promise<{ shortcut: string }> }) => {
  const { shortcut } = await params;

  await trackPageVisit(`/${shortcut}`);

  const event = await findNextEventByShortcut(shortcut);

  if (!event) {
    redirect('/eventos');
  }

  redirect(`/eventos/${event.id}`);
};

export default ShortcutPage;
