import { AdviseCard } from '@/components/advises/advise-card';
import { AddAdvise } from '@/components/advises/add-advise';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid } from '@/components/ui/ruled-grid';
import type { Metadata } from 'next';
import { findSession, type SessionWithUser } from '@/lib/session';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Consejos',
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
  let session: SessionWithUser | null = null;

  if (sessionId) {
    session = await findSession(sessionId);
  }

  const advises = await prisma.advise.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
    },
  });

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <div className="mb-4 flex items-start justify-between gap-4">
              <PageTitle
                path="consejos"
                meta={`${advises.length} consejos de la comunidad`}
                className="mb-0 flex-1"
              />
              {session && <AddAdvise />}
            </div>
          </StickyHeader>

          {advises.length === 0 ? (
            <p className="border border-pcnGreen-200 p-4 font-mono text-xs text-muted-foreground">
              <span className="text-pcnGreen-500">$ </span>
              No hay consejos para ver aún.
            </p>
          ) : (
            <RuledGrid className="mb-14 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
              {advises.map((advise) => (
                <AdviseCard key={advise.id} advise={advise} session={session} />
              ))}
            </RuledGrid>
          )}
        </div>
      </div>
    </>
  );
};

export default AdvicePage;
