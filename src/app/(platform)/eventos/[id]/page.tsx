import { Suspense } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { CalendarPlus, Download, Edit, Users, Globe, Video, Mic } from 'lucide-react';
import { fetchEvent } from '@/actions/events/fetch-event';
import { EventFlyerCarousel } from '@/components/events/event-flyer-carousel';
import { EventPhotos } from '@/components/events/event-photos';
import { EventDetailClient } from '@/components/events/event-detail-client';
import { EventStatusBadge } from '@/components/events/event-status-badge';
import { EventAnnouncements } from '@/components/announcements/event-announcements';
import { getEventAnnouncements } from '@/actions/announcements/get-event-announcements';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { LocalDate, LocalTime } from '@/components/ui/local-date-time';
import { optimizedOgImage } from '@/lib/og-image';
import { createGoogleCalendarUrl } from '@/lib/google-calendar';
import { canEditEvent } from '@/lib/event-permissions';

type EventWithDetails = Awaited<ReturnType<typeof fetchEvent>>;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="p-3">
    <h2 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      <span className="text-pcnGreen-500">{'// '}</span>
      {title}
    </h2>
    {children}
  </section>
);

function normalizeDescription(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const event = await fetchEvent(params.id);

  if (!event) {
    return {
      title: 'Evento no encontrado',
      description: 'El evento que buscas no existe o ha sido eliminado.',
    };
  }

  const normalizedDesc = normalizeDescription(event.description);
  const description =
    normalizedDesc.length > 160 ? normalizedDesc.substring(0, 157) + '…' : normalizedDesc;

  const rawImage = event.flyerImages[0] || event.images[0]?.imgSrc;
  const imageUrl = rawImage ? optimizedOgImage(rawImage) : `/eventos/${event.id}/og-image`;
  const imageAlt = `Flyer de ${event.name}`;
  const url = `/eventos/${event.id}`;

  return {
    title: event.name,
    description,
    openGraph: {
      title: { absolute: event.name },
      description,
      images: [{ url: imageUrl, alt: imageAlt }],
      url,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: { absolute: event.name },
      description,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
  };
}

const EventDetailPage: React.FC<{ params: Promise<{ id: string }> }> = async (props) => {
  const params = await props.params;
  const id: string = params.id;

  const event: EventWithDetails = await fetchEvent(id);

  // Verificar si el usuario es admin y obtener datos de sesión
  const sessionId = (await cookies()).get('sessionId')?.value;
  let isAdmin = false;
  let canEdit = false;
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

      // Ambassadors editan los eventos que crearon; cualquier usuario, los que organiza
      if (isAdmin) {
        canEdit = true;
      } else if (event) {
        canEdit = canEditEvent(session.user, event);
      }
    }
  }

  if (!event) {
    return (
      <>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mt-4">
            <PageTitle path={[{ label: 'eventos', href: '/eventos' }, { label: '404' }]} />
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-muted-foreground">No se encontró el evento solicitado.</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Verificar si el evento ya pasó
  const now = new Date();
  const eventEndDate = event.endDate || event.date;
  const hasEventPassed = new Date(eventEndDate) < now;

  const isExternalEvent = !!event.externalRegistrationUrl;

  // Verificar si el usuario ya está registrado (solo inscripciones activas)
  let isRegistered = false;
  let registrationId: string | null = null;
  if (userId && !isExternalEvent) {
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
  if (event.capacity !== null && !isExternalEvent) {
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

  const isFull = event.markedAsFull || (capacityInfo !== null && !capacityInfo.available);

  // Obtener inscripciones si el usuario es admin (solo para eventos con inscripción interna)
  let registrations: Array<{
    id: string;
    userId: string;
    cancelledAt: Date | null;
    createdAt: Date;
    user: {
      name: string;
      email: string;
    };
  }> = [];

  if (canEdit && !isExternalEvent) {
    registrations = await prisma.eventRegistration.findMany({
      where: {
        eventId: id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obtener anuncios del evento
  const eventAnnouncements = await getEventAnnouncements(id);

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 pt-0">
        <StickyHeader className="mt-4">
          <PageTitle
            path={[{ label: 'eventos', href: '/eventos' }, { label: event.name }]}
            action={
              <>
                <EventStatusBadge date={event.date} endDate={event.endDate} isFull={isFull} />
                {canEdit && (
                  <Link href={`/eventos/${id}/editar`}>
                    <Button variant="pcn" size="sm" className="flex items-center gap-1.5">
                      <Edit className="h-4 w-4" />
                      editarEvento();
                    </Button>
                  </Link>
                )}
              </>
            }
          />
        </StickyHeader>

        <div className="mb-14 grid grid-cols-1 divide-y divide-pcnGreen-200 border border-pcnGreen-200 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:divide-x md:divide-y-0">
          {/* Columna principal — flyer */}
          <div className="flex flex-col divide-y divide-pcnGreen-200">
            <div className="relative w-full overflow-hidden">
              <EventFlyerCarousel
                images={event.flyerImages}
                eventName={event.name}
                variant="detail"
              />
            </div>

            {event.images && event.images.length > 0 && (
              <Section title="fotos">
                <EventPhotos images={event.images} />
              </Section>
            )}

            {/* Link a propuestas de charlas (quien gestiona el evento, con call for speakers) */}
            {canEdit && event.callForSpeakersEnabled && (
              <Section title="propuestas de charlas">
                <Link
                  href={`/eventos/${id}/propuestas-de-charlas`}
                  className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-pcnGreen"
                >
                  <span className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Call for speakers habilitado.
                  </span>
                  <span className="font-mono text-xs">ver propuestas →</span>
                </Link>
              </Section>
            )}

            {/* Gestión de las charlas del evento (quien gestiona el evento) */}
            {canEdit && (
              <Section title="charlas del evento">
                <Link
                  href={`/eventos/${id}/charlas`}
                  className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-pcnGreen"
                >
                  <span className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Cargá y editá las charlas que se dieron.
                  </span>
                  <span className="font-mono text-xs">gestionar →</span>
                </Link>
              </Section>
            )}
          </div>

          {/* Columna de información */}
          <div className="flex flex-col divide-y divide-pcnGreen-200">
            {/* Botón de registro */}
            {!hasEventPassed && (
              <div className="p-3">
                <Suspense
                  fallback={
                    <Button variant="pcn" className="w-full" disabled>
                      cargando...
                    </Button>
                  }
                >
                  <EventDetailClient
                    eventId={id}
                    eventName={event.name}
                    isAuthenticated={!!sessionId}
                    isRegistered={isRegistered}
                    registrationId={registrationId}
                    capacityAvailable={capacityInfo?.available ?? true}
                    capacityInfo={capacityInfo}
                    externalRegistrationUrl={event.externalRegistrationUrl}
                    isFull={isFull}
                  />
                </Suspense>
              </div>
            )}

            {/* Información del evento */}
            <Section title="info">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
                {event.endDate ? (
                  <>
                    <dt className="text-muted-foreground">inicio</dt>
                    <dd>
                      <LocalDate date={event.date} /> <LocalTime date={event.date} />
                    </dd>
                    <dt className="text-muted-foreground">fin</dt>
                    <dd>
                      <LocalDate date={event.endDate} /> <LocalTime date={event.endDate} />
                    </dd>
                  </>
                ) : (
                  <>
                    <dt className="text-muted-foreground">fecha</dt>
                    <dd>
                      <LocalDate date={event.date} /> <LocalTime date={event.date} />
                    </dd>
                  </>
                )}
                {event.isOnline ? (
                  <>
                    <dt className="text-muted-foreground">modo</dt>
                    <dd>online</dd>
                  </>
                ) : (
                  (event.city || event.placeName || event.address) && (
                    <>
                      <dt className="text-muted-foreground">lugar</dt>
                      <dd>
                        {[event.placeName, event.address, event.city && `${event.city}, Argentina`]
                          .filter(Boolean)
                          .join(' · ')}
                      </dd>
                    </>
                  )
                )}
                {event.isOnline && event.streamingUrl && (
                  <>
                    <dt className="text-muted-foreground">stream</dt>
                    <dd>
                      <a
                        href={event.streamingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-pcnGreen hover:underline"
                      >
                        <Video className="h-3 w-3" />
                        ver transmisión
                      </a>
                    </dd>
                  </>
                )}
              </dl>
              {!hasEventPassed && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <a
                    href={createGoogleCalendarUrl(event)}
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                    agregar a google calendar
                  </a>
                  <a
                    href={`/eventos/${event.id}/calendario.ics`}
                    download
                    title="Para Apple Calendar, Outlook y otros calendarios"
                    className="inline-flex items-center gap-1.5 font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
                  >
                    <Download className="h-3.5 w-3.5" />
                    descargar .ics
                  </a>
                </div>
              )}
            </Section>

            {/* Descripción */}
            {event.description && (
              <Section title="descripción">
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </Section>
            )}

            {/* Link a página de inscripciones (solo para quien gestiona el evento) */}
            {canEdit && !isExternalEvent && (
              <Section title="inscripciones">
                <Link
                  href={`/eventos/${id}/inscripciones`}
                  className="flex items-center justify-between gap-2 font-mono text-xs hover:text-pcnGreen"
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    {registrations.filter((r) => r.cancelledAt === null).length} activas ·{' '}
                    {registrations.length} total
                  </span>
                  <span>ver todas →</span>
                </Link>
              </Section>
            )}

            {/* Call for speakers — botón para usuarios */}
            {event.callForSpeakersEnabled && (
              <Section title="call for speakers">
                <Link
                  href={
                    sessionId
                      ? `/eventos/${id}/proponer-charla`
                      : `/autenticacion/iniciar-sesion?redirect=/eventos/${id}/proponer-charla`
                  }
                  className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-pcnGreen"
                >
                  <span>Este evento acepta propuestas de charlas de la comunidad.</span>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-pcnGreen">
                    <Mic className="h-3.5 w-3.5" />
                    proponer →
                  </span>
                </Link>
              </Section>
            )}

            {/* Anuncios del evento */}
            {eventAnnouncements.length > 0 && (
              <div className="p-3">
                <EventAnnouncements announcements={eventAnnouncements} />
              </div>
            )}

            {/* Sponsors */}
            {event.sponsors && event.sponsors.length > 0 && (
              <Section title="sponsors">
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
                  {event.sponsors.map((sponsor) =>
                    sponsor.website ? (
                      <a
                        key={sponsor.id}
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-pcnGreen hover:underline"
                      >
                        <Globe className="h-3 w-3" />
                        {sponsor.name}
                      </a>
                    ) : (
                      <span key={sponsor.id}>{sponsor.name}</span>
                    ),
                  )}
                </div>
              </Section>
            )}

            {/* Mapa */}
            {!event.isOnline && event.latitude && event.longitude && (
              <div className="relative h-56 w-full overflow-hidden">
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
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetailPage;
