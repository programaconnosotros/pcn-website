import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';
import { ProyectosAdminWrapper } from '@/components/projects/proyectos-admin-wrapper';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Proyectos',
  description:
    'Explorá los proyectos de software creados por miembros de la comunidad. Conocé las tecnologías utilizadas y las personas detrás de cada proyecto.',
  openGraph: {
    title: 'Proyectos de la comunidad | programaConNosotros',
    description:
      'Explorá los proyectos de software creados por miembros de la comunidad. Conocé las tecnologías utilizadas y las personas detrás de cada proyecto.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/proyectos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proyectos de la comunidad | programaConNosotros',
    description:
      'Explorá los proyectos de software creados por miembros de la comunidad. Conocé las tecnologías utilizadas y las personas detrás de cada proyecto.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const Proyectos = async () => {
  const [projects, sessionId] = await Promise.all([
    fetchPublicProjects(),
    cookies().then((c) => c.get('sessionId')?.value),
  ]);

  const session = sessionId
    ? await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } })
    : null;

  const isAdmin = session?.user.role === 'ADMIN';

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <ProyectosAdminWrapper projects={projects} isAdmin={isAdmin} />
      </div>
    </>
  );
};

export default Proyectos;
