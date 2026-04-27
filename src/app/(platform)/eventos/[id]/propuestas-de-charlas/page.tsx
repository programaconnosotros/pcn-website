'use server';

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
import { ArrowLeft, Mic } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocalDateTime } from '@/components/ui/local-date-time';
import { WhatsappSpeakerButton } from '@/components/talk-proposals/whatsapp-speaker-button';
import { ProposalStatusActions } from '@/components/talk-proposals/proposal-status-actions';
import { TalkProposalStatus } from '@prisma/client';

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

  const event = await fetchEvent(id);

  if (!event) {
    redirect('/eventos');
  }

  const proposals = await fetchTalkProposals(id);

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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/eventos">Eventos</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/eventos/${id}`}>{event.name}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Propuestas de charlas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-6 flex items-center gap-4">
            <Link href={`/eventos/${id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Heading2 className="m-0">Propuestas de charlas — {event.name}</Heading2>
          </div>

          <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Propuestas ({proposals.length} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
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
                      {proposals.map((proposal) => {
                        const hasProfessionalData =
                          proposal.isProfessional && proposal.jobTitle && proposal.enterprise;
                        const hasStudentData =
                          proposal.isStudent && proposal.career && proposal.studyPlace;

                        return (
                          <TableRow key={proposal.id}>
                            <TableCell className="max-w-[180px] font-medium">
                              {proposal.title}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {proposal.speakerName}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {hasProfessionalData && (
                                  <div className="text-sm text-muted-foreground">
                                    <Badge variant="outline" className="mb-1">
                                      Profesional
                                    </Badge>
                                    <p>
                                      <span className="font-medium">Rol:</span> {proposal.jobTitle}
                                    </p>
                                    <p>
                                      <span className="font-medium">Empresa:</span>{' '}
                                      {proposal.enterprise}
                                    </p>
                                  </div>
                                )}
                                {hasStudentData && (
                                  <div className="text-sm text-muted-foreground">
                                    <Badge variant="outline" className="mb-1">
                                      Estudiante
                                    </Badge>
                                    <p>
                                      <span className="font-medium">Carrera:</span>{' '}
                                      {proposal.career}
                                    </p>
                                    <p>
                                      <span className="font-medium">Universidad:</span>{' '}
                                      {proposal.studyPlace}
                                    </p>
                                  </div>
                                )}
                                {!hasProfessionalData && !hasStudentData && (
                                  <span className="text-sm text-muted-foreground">
                                    Sin información adicional
                                  </span>
                                )}
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
                              <div className="flex items-center justify-end gap-2">
                                <WhatsappSpeakerButton
                                  phone={proposal.speakerPhone}
                                  speakerName={proposal.speakerName}
                                  talkTitle={proposal.title}
                                  eventName={event.name}
                                />
                                <ProposalStatusActions
                                  proposalId={proposal.id}
                                  currentStatus={proposal.status}
                                  speakerName={proposal.speakerName}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default TalkProposalsPage;
