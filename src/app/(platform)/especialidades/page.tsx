import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { PageTitle } from '@/components/ui/page-title';
import { TableOfContents } from '@/components/especialidades/table-of-contents';
import { SpecialtyCard } from '@/components/especialidades/specialty-card';
import { specialtyGroups, specialties } from '@/components/especialidades/specialties';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Especialidades',
  description:
    'Una guía de las distintas especialidades dentro de la ingeniería de software para ayudarte a descubrir tu camino profesional.',
  openGraph: {
    title: 'Especialidades en ingeniería de software | programaConNosotros',
    description:
      'Una guía de las distintas especialidades dentro de la ingeniería de software para ayudarte a descubrir tu camino profesional.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/especialidades`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Especialidades en ingeniería de software | programaConNosotros',
    description:
      'Una guía de las distintas especialidades dentro de la ingeniería de software para ayudarte a descubrir tu camino profesional.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
};

const SpecialtiesPage = () => (
  <>
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 bg-background">
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
              <BreadcrumbPage>Especialidades</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitle
          path="especialidades"
          meta={`${specialties.length} especialidades · ${specialtyGroups.length} áreas`}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <TableOfContents />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl space-y-8">
              {specialtyGroups.map((group) => (
                <section key={group.id} id={group.id} className="scroll-mt-32 lg:scroll-mt-28">
                  <div className="mb-2">
                    <h2 className="font-mono text-sm font-semibold">
                      <span className="text-pcnGreen-500">## </span>
                      {group.title}
                      <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                        [{group.specialties.length}]
                      </span>
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">{group.description}</p>
                  </div>
                  <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
                    {group.specialties.map((specialty) => (
                      <SpecialtyCard key={specialty.id} specialty={specialty} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default SpecialtiesPage;
