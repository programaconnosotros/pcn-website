import type { Metadata } from 'next';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Proyectos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <ProyectosAdminWrapper projects={projects} isAdmin={isAdmin} />
      </div>
    </>
  );
};

export default Proyectos;
