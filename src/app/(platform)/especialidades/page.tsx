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
import { Heading2 } from '@/components/ui/heading-2';
import { TableOfContents } from '@/components/especialidades/table-of-contents';
import { SpecialtyCard } from '@/components/especialidades/specialty-card';
import { specialtyGroups, specialties } from '@/components/especialidades/specialties';
import { Code } from 'lucide-react';
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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <div className="mb-6 flex flex-col gap-3">
          <Heading2 className="m-0 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
              <Code className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
            </div>
            <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Especialidades</span>
          </Heading2>
          <p className="max-w-3xl text-muted-foreground">
            El mundo del software es vasto y diverso. Acá te presentamos las principales
            especialidades en las que podés enfocar tu carrera profesional.
          </p>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {specialties.length} especialidades · {specialtyGroups.length} áreas
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
          <TableOfContents />

          <div className="min-w-0 flex-1">
            <div className="mx-auto max-w-3xl space-y-14">
              {specialtyGroups.map((group) => (
                <section key={group.id} id={group.id} className="scroll-mt-32 lg:scroll-mt-28">
                  <div className="mb-5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold tracking-tight">{group.title}</h2>
                      <span className="rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                        {group.specialties.length}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{group.description}</p>
                  </div>
                  <div className="space-y-5">
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
