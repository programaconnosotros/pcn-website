'use server';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import { getEventRegistrations } from '@/actions/events/get-event-registrations';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { RegistrationsDataTable } from '@/components/events/registrations-data-table';

const EventRegistrationsPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;

  // Verificar autenticación y permisos de admin
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    redirect(`/eventos/${id}`);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.user.role !== 'ADMIN') {
    redirect(`/eventos/${id}`);
  }

  // Obtener evento
  const event = await fetchEvent(id);

  if (!event) {
    redirect('/eventos');
  }

  // Obtener todas las inscripciones
  const registrations = await getEventRegistrations(id);

  const activeRegistrations = registrations.filter((r) => r.cancelledAt === null);
  const cancelledRegistrations = registrations.filter((r) => r.cancelledAt !== null);

  // Contar estudiantes y profesionales (solo inscripciones activas)
  const studentsCount = activeRegistrations.filter((r) => r.career && r.studyPlace).length;
  const professionalsCount = activeRegistrations.filter((r) => r.jobTitle && r.enterprise).length;

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle
              path={[
                { label: 'eventos', href: '/eventos' },
                { label: event.name, href: `/eventos/${id}` },
                { label: 'inscripciones' },
              ]}
            />
          </StickyHeader>

          <RuledGrid className="mb-4 grid-cols-1 sm:grid-cols-3">
            {[
              {
                label: 'activas',
                value: activeRegistrations.length,
                hint: `${cancelledRegistrations.length} cancelada${cancelledRegistrations.length !== 1 ? 's' : ''}`,
              },
              {
                label: 'estudiantes',
                value: studentsCount,
                hint: 'con carrera y lugar de estudio',
              },
              { label: 'profesionales', value: professionalsCount, hint: 'con cargo y empresa' },
            ].map((stat) => (
              <div key={stat.label} className={cn(ruledCellClassName, 'p-3 font-mono')}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <span className="text-pcnGreen-500">{'// '}</span>
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-pcnGreen">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground/70">{stat.hint}</p>
              </div>
            ))}
          </RuledGrid>

          <section className="mb-14 border border-pcnGreen-200">
            <h2 className="border-b border-pcnGreen-200 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span className="text-pcnGreen-500">{'// '}</span>
              inscripciones · {registrations.length} total
            </h2>
            <div className="p-3">
              <RegistrationsDataTable data={registrations} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default EventRegistrationsPage;
