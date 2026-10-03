import { AddAdvise } from '@/components/advises/add-advise';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { ConsejosClient } from './consejos-client';
import type { Metadata } from 'next';
import { findSession } from '@/lib/session';
import { tabTitle } from '@/lib/tab-title';
import { getIdentityMap } from '@/lib/identity-links';
import { extractedConsejos } from '@/data/consejos-extraidos';
import { fromAdvise, fromExtracted, sortByNewest } from '@/lib/consejos';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.ls('consejos'),
  description:
    'Consejos prácticos sobre ingeniería de software compartidos por miembros de la comunidad. Aprendé de la experiencia de otros y compartí la tuya.',
  openGraph: {
    title: 'Consejos de la comunidad | programaConNosotros',
    description:
      'Consejos prácticos sobre ingeniería de software compartidos por miembros de la comunidad. Aprendé de la experiencia de otros y compartí la tuya.',
    url: `${SITE_URL}/consejos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consejos de la comunidad | programaConNosotros',
    description:
      'Consejos prácticos sobre ingeniería de software compartidos por miembros de la comunidad. Aprendé de la experiencia de otros y compartí la tuya.',
  },
};

const AdvicePage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;

  // La sesión y los consejos no dependen entre sí: se piden a la vez.
  const [session, advises, profiles] = await Promise.all([
    sessionId ? findSession(sessionId) : null,
    prisma.advise.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        likes: { select: { userId: true } },
        _count: { select: { comments: true } },
      },
    }),
    getIdentityMap('whatsapp'),
  ]);

  const consejos = sortByNewest([
    ...advises.map(fromAdvise),
    ...extractedConsejos.map((consejo) => fromExtracted(consejo, profiles)),
  ]);

  // Consejo of the day: changes daily, the same for everyone that day.
  const day = Math.floor(Date.now() / 86_400_000);
  const fortuneId = consejos.length > 0 ? consejos[day % consejos.length].id : null;

  return (
    <ConsejosClient
      consejos={consejos}
      session={session}
      fortuneId={fortuneId}
      addButton={session && <AddAdvise />}
    />
  );
};

export default AdvicePage;
