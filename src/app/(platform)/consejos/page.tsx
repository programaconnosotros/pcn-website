import { AdviseCard } from '@/components/advises/advise-card';
import { AddAdvise } from '@/components/advises/add-advise';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Session, User } from '@prisma/client';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid } from '@/components/ui/ruled-grid';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Consejos',
  description:
    'Consejos prácticos sobre ingeniería de software compartidos por miembros de la comunidad. Aprendé de la experiencia de otros y compartí la tuya.',
  openGraph: {
    title: 'Consejos de la comunidad | programaConNosotros',
    description:
      'Consejos prácticos sobre ingeniería de software compartidos por miembros de la comunidad. Aprendé de la experiencia de otros y compartí la tuya.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/consejos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consejos de la comunidad | programaConNosotros',
    description:
      'Consejos prácticos sobre ingeniería de software compartidos por miembros de la comunidad. Aprendé de la experiencia de otros y compartí la tuya.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const AdvicePage = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  let session: (Session & { user: User }) | null = null;

  if (sessionId) {
    session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });
  }

  const advises = await prisma.advise.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      author: true,
      likes: true,
    },
  });

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <PageTitle
              path="consejos"
              meta={`${advises.length} consejos de la comunidad`}
              className="mb-0 flex-1"
            />
            {session && <AddAdvise />}
          </div>

          {advises.length === 0 ? (
            <p className="border border-pcnGreen-200 p-4 font-mono text-xs text-muted-foreground">
              <span className="text-pcnGreen-500">$ </span>
              No hay consejos para ver aún.
            </p>
          ) : (
            <RuledGrid className="mb-14 grid-cols-1 xl:grid-cols-2">
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
