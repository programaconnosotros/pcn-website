import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';
import { CharlasAdminWrapper } from '@/components/talks/charlas-admin-wrapper';
import { findSession } from '@/lib/session';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Charlas',
  description:
    'Mirá charlas técnicas dadas por miembros de la comunidad sobre ingeniería de software, arquitectura, IA y mucho más. Aprendé de quienes ya recorrieron el camino.',
  openGraph: {
    title: 'Charlas técnicas | programaConNosotros',
    description:
      'Mirá charlas técnicas dadas por miembros de la comunidad sobre ingeniería de software, arquitectura, IA y mucho más. Aprendé de quienes ya recorrieron el camino.',
    url: `${SITE_URL}/charlas`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Charlas técnicas | programaConNosotros',
    description:
      'Mirá charlas técnicas dadas por miembros de la comunidad sobre ingeniería de software, arquitectura, IA y mucho más. Aprendé de quienes ya recorrieron el camino.',
  },
};

const Talks = async () => {
  const [talks, sessionId] = await Promise.all([
    fetchPublicTalks(),
    cookies().then((c) => c.get('sessionId')?.value),
  ]);

  const session = sessionId ? await findSession(sessionId) : null;

  const isAdmin = session?.user.role === 'ADMIN';

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <CharlasAdminWrapper talks={talks} isAdmin={isAdmin} />
      </div>
    </>
  );
};

export default Talks;
