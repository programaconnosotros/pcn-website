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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Edit, UserPlus, Users, Globe } from 'lucide-react';
import { fetchEvent } from '@/actions/events/fetch-event';
import { CancelRegistrationButton } from '@/components/events/cancel-registration-button';
import { DeleteRegistrationButton } from '@/components/events/delete-registration-button';
import { EventPhotos } from '@/components/events/event-photos';
import { Image as Images, Event, Sponsor } from '@prisma/client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

type EventWithImages = Event & {
  images: Images[];
  sponsors: Sponsor[];
};

const EventDetailPage: React.FC<{ params: { id: string } }> = async ({ params }) => {
  const id: string = params.id;

  const event: EventWithImages | null = await fetchEvent(id);

  // Verificar si el usuario es admin y obtener datos de sesión
  const sessionId = cookies().get('sessionId')?.value;
  let isAdmin = false;
  let userId: string | null = null;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session) {
      if (session.user.role === 'ADMIN') {
        isAdmin = true;
      }
      userId = session.userId;
    }
  }

  if (!event) {
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
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mt-4">
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">
                No se encontró el evento solicitado.
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Verificar si el evento ya pasó
  const now = new Date();
  const eventEndDate = event.endDate || event.date;
  const hasEventPassed = new Date(eventEndDate) < now;

  // Verificar si el usuario ya está registrado (solo inscripciones activas)
  let isRegistered = false;
  let registrationId: string | null = null;
  if (userId) {
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: id,
        userId: userId,
        cancelledAt: null, // Solo considerar inscripciones activas
      },
    });
    if (registration) {
      isRegistered = true;
      registrationId = registration.id;
    }
  }

  // Obtener información del cupo
  let capacityInfo = null;
  if (event.capacity !== null) {
    const currentRegistrations = await prisma.eventRegistration.count({
      where: {
        eventId: id,
        cancelledAt: null, // Excluir inscripciones canceladas
      },
    });
    capacityInfo = {
      current: currentRegistrations,
      capacity: event.capacity,
      available: currentRegistrations < event.capacity,
    };
  }

  // Obtener inscripciones si el usuario es admin
  let registrations: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: 'STUDENT' | 'PROFESSIONAL';
    workTitle: string | null;
    workPlace: string | null;
    studyField: string | null;
    studyPlace: string | null;
    cancelledAt: Date | null;
    createdAt: Date;
  }> = [];

  if (isAdmin) {
    registrations = await prisma.eventRegistration.findMany({
      where: {
        eventId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

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
              <BreadcrumbItem>
                <BreadcrumbPage>{event.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Heading2 className="m-0">{event.name}</Heading2>
            {isAdmin && (
              <Link href={`/eventos/${id}/editar`}>
                <Button variant="pcn" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Editar evento
                </Button>
              </Link>
            )}
          </div>

          <div className="my-5 ml-0 flex flex-col gap-5 xl:flex-row">
            {/* Columna principal */}
            <div className="flex flex-1 flex-col gap-5">
              {/* Flyer del evento */}
              {event.flyerSrc && (
                <Card className="overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                  <div className="relative w-full overflow-hidden">
                    <img
                      src={event.flyerSrc}
                      alt={`Flyer de ${event.name}`}
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </Card>
              )}

              {/* Descripción */}
              {event.description && (
                <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                  <CardHeader>
                    <CardTitle>Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{event.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Fotos */}
              {event.images && event.images.length > 0 && (
                <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                  <CardHeader>
                    <CardTitle>Fotos del evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EventPhotos images={event.images} />
                  </CardContent>
                </Card>
              )}

              {/* Listado de inscripciones (solo para admins) */}
              {isAdmin && (
                <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Inscripciones ({registrations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {registrations.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Aún no hay inscripciones para este evento.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {registrations.map((registration) => (
                          <div
                            key={registration.id}
                            className={`rounded-lg border bg-background p-4 space-y-2 ${
                              registration.cancelledAt ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">
                                    {registration.firstName} {registration.lastName}
                                  </p>
                                  {registration.cancelledAt && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                                      Cancelada
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{registration.email}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-muted">
                                  {registration.type === 'PROFESSIONAL' ? 'Profesional' : 'Estudiante'}
                                </span>
                                {!registration.cancelledAt && (
                                  <DeleteRegistrationButton
                                    registrationId={registration.id}
                                    userName={`${registration.firstName} ${registration.lastName}`}
                                  />
                                )}
                              </div>
                            </div>
                            {registration.type === 'PROFESSIONAL' && (
                              <div className="text-sm text-muted-foreground">
                                <p>
                                  <span className="font-medium">Trabaja:</span>{' '}
                                  {registration.workTitle || '-'}
                                </p>
                                <p>
                                  <span className="font-medium">En:</span>{' '}
                                  {registration.workPlace || '-'}
                                </p>
                              </div>
                            )}
                            {registration.type === 'STUDENT' && (
                              <div className="text-sm text-muted-foreground">
                                <p>
                                  <span className="font-medium">Estudia:</span>{' '}
                                  {registration.studyField || '-'}
                                </p>
                                <p>
                                  <span className="font-medium">En:</span>{' '}
                                  {registration.studyPlace || '-'}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Inscrito el {formatDate(registration.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Columna lateral con información */}
            <div className="flex w-full flex-col gap-5 xl:w-80">
              {/* Botón de registro */}
              {!hasEventPassed && (
                <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                  <CardContent className="pt-6">
                    {isRegistered ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-center">Ya estás registrado</p>
                          <p className="text-xs text-center text-muted-foreground">
                            Te esperamos en el evento
                          </p>
                        </div>
                        <CancelRegistrationButton
                          eventId={id}
                          registrationId={registrationId || undefined}
                          isLoggedIn={!!userId}
                        />
                      </div>
                    ) : capacityInfo && !capacityInfo.available ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-center text-destructive">
                          Cupo completo
                        </p>
                        <p className="text-xs text-center text-muted-foreground">
                          {capacityInfo.current} de {capacityInfo.capacity} cupos ocupados
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link href={`/eventos/${id}/inscripcion`} className="block">
                          <Button variant="pcn" className="w-full flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Inscribirme al evento
                          </Button>
                        </Link>
                        {capacityInfo && (
                          <p className="text-xs text-center text-muted-foreground">
                            {capacityInfo.capacity - capacityInfo.current} de {capacityInfo.capacity}{' '}
                            cupos disponibles
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Información del evento */}
              <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                <CardHeader>
                  <CardTitle>Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">Fecha y hora</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.date)} a las {formatTime(event.date)}
                        {event.endDate && ` - ${formatTime(event.endDate)}`}
                      </p>
                    </div>
                  </div>

                  {(event.city || event.placeName || event.address) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                      <div className="flex flex-col">
                        <p className="text-sm font-medium">Ubicación</p>
                        {event.placeName && (
                          <p className="text-sm text-muted-foreground">{event.placeName}</p>
                        )}
                        {event.address && (
                          <p className="text-sm text-muted-foreground">{event.address}</p>
                        )}
                        {event.city && (
                          <p className="text-sm text-muted-foreground">
                            {event.city}, Argentina
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sponsors */}
              {event.sponsors && event.sponsors.length > 0 && (
                <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                  <CardHeader>
                    <CardTitle>Sponsors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      {event.sponsors.map((sponsor) => (
                        <div key={sponsor.id} className="flex items-center gap-2">
                          {sponsor.website ? (
                            <a
                              href={sponsor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm font-medium text-pcnPurple hover:underline dark:text-pcnGreen"
                            >
                              <Globe className="h-4 w-4" />
                              {sponsor.name}
                            </a>
                          ) : (
                            <span className="text-sm font-medium">{sponsor.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mapa */}
              {event.latitude && event.longitude && (
                <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
                  <CardHeader>
                    <CardTitle>Mapa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative h-64 w-full overflow-hidden rounded-lg">
                      <iframe
                        src={`https://www.google.com/maps?q=${Number(event.latitude).toFixed(6)},${Number(event.longitude).toFixed(6)}&z=15&output=embed`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación del evento"
                        sandbox="allow-scripts allow-same-origin"
                        className="absolute inset-0"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetailPage;
