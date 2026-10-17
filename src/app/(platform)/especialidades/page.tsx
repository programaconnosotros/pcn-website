import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { TableOfContents } from '@/components/especialidades/table-of-contents';
import { SpecialtyCard } from '@/components/especialidades/specialty-card';
import { specialtyGroups, specialties } from '@/components/especialidades/specialties';
import type { Metadata } from 'next';
import { tabTitle } from '@/lib/tab-title';
import { getSpecialists } from '@/lib/specialists';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.ls('especialidades'),
  description:
    'Una guía de las distintas especialidades dentro de la ingeniería de software para ayudarte a descubrir tu camino profesional.',
  openGraph: {
    title: 'Especialidades en ingeniería de software | programaConNosotros',
    description:
      'Una guía de las distintas especialidades dentro de la ingeniería de software para ayudarte a descubrir tu camino profesional.',
    url: `${SITE_URL}/especialidades`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Especialidades en ingeniería de software | programaConNosotros',
    description:
      'Una guía de las distintas especialidades dentro de la ingeniería de software para ayudarte a descubrir tu camino profesional.',
  },
};

const SpecialtiesPage = async () => {
  const specialists = await getSpecialists();
  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader pinnedOnDesktop>
            <PageTitle
              path="especialidades"
              meta={`${specialties.length} especialidades · ${specialtyGroups.length} áreas`}
            />
          </StickyHeader>

          <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
            <TableOfContents />

            <div className="min-w-0 flex-1">
              {/* Room above the first area title, so it never sits flush under the page header. */}
              <div className="mx-auto max-w-3xl space-y-8 pt-4 lg:pt-6">
                {specialtyGroups.map((group) => (
                  <section
                    key={group.id}
                    id={group.id}
                    className="scroll-mt-32 lg:scroll-mt-[calc(var(--sticky-header-offset,0px)+1rem)]"
                  >
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
                        <SpecialtyCard
                          key={specialty.id}
                          specialty={specialty}
                          specialists={specialists[specialty.id] ?? []}
                        />
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
};

export default SpecialtiesPage;
