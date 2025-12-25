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
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchEvent } from '@/actions/events/fetch-event';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DeleteRegistrationButton } from '@/components/events/delete-registration-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const EventRegistrationsPage = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  // Verificar autenticación y permisos de admin
  const sessionId = cookies().get('sessionId')?.value;

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
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      eventId: id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const activeRegistrations = registrations.filter((r) => r.cancelledAt === null);
  const cancelledRegistrations = registrations.filter((r) => r.cancelledAt !== null);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
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
                <BreadcrumbPage>Inscripciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/eventos/${id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Heading2 className="m-0">Inscripciones - {event.name}</Heading2>
            </div>
          </div>

          <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Inscripciones ({registrations.length} total - {activeRegistrations.length} activas,{' '}
                {cancelledRegistrations.length} canceladas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registrations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aún no hay inscripciones para este evento.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Información</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de inscripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((registration) => (
                        <TableRow
                          key={registration.id}
                          className={registration.cancelledAt ? 'opacity-60' : ''}
                        >
                          <TableCell className="font-medium">
                            {registration.firstName} {registration.lastName}
                          </TableCell>
                          <TableCell>{registration.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {registration.type === 'PROFESSIONAL' ? 'Profesional' : 'Estudiante'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {registration.type === 'PROFESSIONAL' ? (
                              <div className="text-sm text-muted-foreground">
                                <p>
                                  <span className="font-medium">Trabaja:</span> {registration.workTitle || '-'}
                                </p>
                                <p>
                                  <span className="font-medium">En:</span> {registration.workPlace || '-'}
                                </p>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                <p>
                                  <span className="font-medium">Estudia:</span> {registration.studyField || '-'}
                                </p>
                                <p>
                                  <span className="font-medium">En:</span> {registration.studyPlace || '-'}
                                </p>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {registration.cancelledAt ? (
                              <Badge variant="destructive">Cancelada</Badge>
                            ) : (
                              <Badge variant="default">Activa</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(registration.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            {!registration.cancelledAt && (
                              <DeleteRegistrationButton
                                registrationId={registration.id}
                                userName={`${registration.firstName} ${registration.lastName}`}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
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

export default EventRegistrationsPage;

