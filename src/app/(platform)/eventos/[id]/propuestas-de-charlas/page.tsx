'use server';

import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { getEventManager } from '@/lib/event-access';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import { fetchTalkProposals } from '@/actions/talk-proposals/fetch-talk-proposals';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LocalDateTime } from '@/components/ui/local-date-time';
import { WhatsappSpeakerButton } from '@/components/talk-proposals/whatsapp-speaker-button';
import { ProposalStatusActions } from '@/components/talk-proposals/proposal-status-actions';
import { TalkProposalStatus } from '@prisma/client';
import type { Metadata } from 'next';
import { tabTitle } from '@/lib/tab-title';

// A 'use server' file can only export async functions, so the title comes from here.
export async function generateMetadata(): Promise<Metadata> {
  return { title: tabTitle.ls('eventos/*/propuestas-de-charlas') };
}

const statusLabel: Record<TalkProposalStatus, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
};

const statusVariant: Record<
  TalkProposalStatus,
  'outline' | 'default' | 'destructive' | 'secondary'
> = {
  PENDING: 'outline',
  ACCEPTED: 'default',
  REJECTED: 'destructive',
};

const TalkProposalsPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const id = params.id;

  // Admins del sitio y quienes gestionan este evento
  if (!(await getEventManager(id))) {
    redirect(`/eventos/${id}`);
  }

  const event = await fetchEvent(id);

  if (!event) {
    redirect('/eventos');
  }

  const proposals = await fetchTalkProposals(id);

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle
              path={[
                { label: 'eventos', href: '/eventos' },
                { label: event.name, href: `/eventos/${id}` },
                { label: 'propuestas' },
              ]}
            />
          </StickyHeader>

          <section className="mb-14 border border-pcnGreen-200">
            <h2 className="border-b border-pcnGreen-200 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span className="text-pcnGreen-500">{'// '}</span>
              propuestas · {proposals.length} total
            </h2>
            <div className="p-3">
              {proposals.length === 0 ? (
                <p className="py-4 font-mono text-sm text-muted-foreground">
                  Aún no hay propuestas de charlas para este evento.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Speaker</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell className="max-w-[180px] font-medium">
                            {proposal.title}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              {proposal.speakers.map((s) => (
                                <span key={s.id}>{s.speakerName}</span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-3">
                              {proposal.speakers.map((s) => {
                                const hasProfessionalData =
                                  s.isProfessional && s.jobTitle && s.enterprise;
                                const hasStudentData = s.isStudent && s.career && s.studyPlace;
                                return (
                                  <div key={s.id} className="flex flex-col gap-1">
                                    <span className="text-xs font-medium">{s.speakerName}</span>
                                    {hasProfessionalData && (
                                      <div className="text-sm text-muted-foreground">
                                        <Badge variant="outline" className="mb-1">
                                          Profesional
                                        </Badge>
                                        <p>
                                          <span className="font-medium">Rol:</span> {s.jobTitle}
                                        </p>
                                        <p>
                                          <span className="font-medium">Empresa:</span>{' '}
                                          {s.enterprise}
                                        </p>
                                      </div>
                                    )}
                                    {hasStudentData && (
                                      <div className="text-sm text-muted-foreground">
                                        <Badge variant="outline" className="mb-1">
                                          Estudiante
                                        </Badge>
                                        <p>
                                          <span className="font-medium">Carrera:</span> {s.career}
                                        </p>
                                        <p>
                                          <span className="font-medium">Universidad:</span>{' '}
                                          {s.studyPlace}
                                        </p>
                                      </div>
                                    )}
                                    {!hasProfessionalData && !hasStudentData && (
                                      <span className="text-sm text-muted-foreground">
                                        Sin información adicional
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                              {proposal.description}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[proposal.status]}>
                              {statusLabel[proposal.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            <LocalDateTime date={proposal.createdAt} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1">
                              {proposal.speakers.map((s) => (
                                <WhatsappSpeakerButton
                                  key={s.id}
                                  phone={s.speakerPhone}
                                  speakerName={s.speakerName}
                                  talkTitle={proposal.title}
                                  eventName={event.name}
                                />
                              ))}
                              <ProposalStatusActions
                                proposalId={proposal.id}
                                currentStatus={proposal.status}
                                speakerName={proposal.speakers.map((s) => s.speakerName).join(', ')}
                                hasTalk={!!proposal.talk}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default TalkProposalsPage;
