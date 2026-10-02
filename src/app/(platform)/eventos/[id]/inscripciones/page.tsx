'use server';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';

import { getEventManager } from '@/lib/event-access';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import { getEventRegistrations, getEventWaitlist } from '@/actions/events/get-event-registrations';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { RegistrationsDataTable } from '@/components/events/registrations-data-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LocalDateTime } from '@/components/ui/local-date-time';

const EventRegistrationsPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;

  // Admins del sitio y quienes gestionan este evento
  if (!(await getEventManager(id))) {
    redirect(`/eventos/${id}`);
  }

  // Obtener evento
  const event = await fetchEvent(id);

  if (!event) {
    redirect('/eventos');
  }

  // Obtener todas las inscripciones
  const [registrations, waitlist] = await Promise.all([
    getEventRegistrations(id),
    getEventWaitlist(id),
  ]);

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

          <RuledGrid className="mb-4 grid-cols-2 sm:grid-cols-4">
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
              {
                label: 'en espera',
                value: waitlist.length,
                hint: event.capacity !== null ? `cupo: ${event.capacity}` : 'sin cupo',
              },
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

          {waitlist.length > 0 && (
            <section className="mb-4 border border-pcnGreen-200">
              <h2 className="border-b border-pcnGreen-200 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <span className="text-pcnGreen-500">{'// '}</span>
                lista de espera · {waitlist.length}
              </h2>
              <p className="px-3 pt-3 text-xs text-muted-foreground">
                Cuando se libera un lugar, se inscribe automáticamente a la primera persona de la
                lista y le llega un email.
              </p>
              <div className="p-3">
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="min-w-[200px]">Nombre</TableHead>
                        <TableHead className="min-w-[240px]">Email</TableHead>
                        <TableHead className="whitespace-nowrap">Se sumó</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waitlist.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono text-xs">{entry.position}</TableCell>
                          <TableCell className="font-medium">{entry.name}</TableCell>
                          <TableCell className="text-sm">{entry.email}</TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            <LocalDateTime date={entry.createdAt} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </section>
          )}

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
