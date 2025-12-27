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

  // Obtener todas las inscripciones con datos del usuario
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      eventId: id,
    },
    include: {
      user: true,
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
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Aún no hay inscripciones para este evento.
                </p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Información</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de inscripción</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((registration) => {
                        const user = registration.user;
                        const hasProfessionalData = user.jobTitle && user.enterprise;
                        const hasStudentData = user.career && user.studyPlace;

                        return (
                          <TableRow
                            key={registration.id}
                            className={registration.cancelledAt ? 'opacity-60' : ''}
                          >
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              {hasProfessionalData ? (
                                <div className="text-sm text-muted-foreground">
                                  <Badge variant="outline" className="mb-1">
                                    Profesional
                                  </Badge>
                                  <p>
                                    <span className="font-medium">Trabaja:</span> {user.jobTitle}
                                  </p>
                                  <p>
                                    <span className="font-medium">En:</span> {user.enterprise}
                                  </p>
                                </div>
                              ) : hasStudentData ? (
                                <div className="text-sm text-muted-foreground">
                                  <Badge variant="outline" className="mb-1">
                                    Estudiante
                                  </Badge>
                                  <p>
                                    <span className="font-medium">Estudia:</span> {user.career}
                                  </p>
                                  <p>
                                    <span className="font-medium">Dónde:</span> {user.studyPlace}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Sin información adicional
                                </span>
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
                                  userName={user.name}
                                />
                              )}
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

export default EventRegistrationsPage;
