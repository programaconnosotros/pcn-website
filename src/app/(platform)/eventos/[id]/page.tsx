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
import { Calendar, MapPin } from 'lucide-react';
import { fetchEvent } from '@/actions/events/fetch-event';
import { EventPhotos } from '@/components/events/event-photos';
import { Image as Images, Event } from '@prisma/client';

type EventWithImages = Event & {
  images: Images[];
};

const EventDetailPage: React.FC<{ params: { id: string } }> = async ({ params }) => {
  const id: string = params.id;

  const event: EventWithImages | null = await fetchEvent(id);

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
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Heading2 className="m-0">{event.name}</Heading2>
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
            </div>

            {/* Columna lateral con información */}
            <div className="flex w-full flex-col gap-5 xl:w-80">
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
