import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';
import { ProjectsList } from '@/components/projects/projects-list';
import { findSession } from '@/lib/session';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Explorá los proyectos de software creados por miembros de la comunidad. Conocé las tecnologías utilizadas y las personas detrás de cada proyecto.',
  openGraph: {
    title: 'Proyectos de la comunidad | programaConNosotros',
    description:
      'Explorá los proyectos de software creados por miembros de la comunidad. Conocé las tecnologías utilizadas y las personas detrás de cada proyecto.',
    url: `${SITE_URL}/proyectos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proyectos de la comunidad | programaConNosotros',
    description:
      'Explorá los proyectos de software creados por miembros de la comunidad. Conocé las tecnologías utilizadas y las personas detrás de cada proyecto.',
  },
};

const Proyectos = async () => {
  const sessionId = (await cookies()).get('sessionId')?.value;
  const [projects, session] = await Promise.all([
    fetchPublicProjects(),
    sessionId ? findSession(sessionId) : null,
  ]);

  const currentUser = session
    ? { id: session.user.id, name: session.user.name, isAdmin: session.user.role === 'ADMIN' }
    : null;

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <ProjectsList projects={projects} currentUser={currentUser} />
      </div>
    </>
  );
};

export default Proyectos;
