import Link from 'next/link';
import { Edit, ImagePlus, Images, Mic, UserCog, Users } from 'lucide-react';
import type { fetchEvent } from '@/actions/events/fetch-event';
import { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';
import { EventSection } from '@/components/events/event-section';
import { EventSponsors } from '@/components/events/event-sponsors';
import { PersonLink } from '@/components/people/person-link';
import { Button } from '@/components/ui/button';
import { LocalDate, LocalTime } from '@/components/ui/local-date-time';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { conversations } from '@/data/whatsapp-conversations';
import { getEventCover, getEventMemories } from '@/lib/gallery';
import { getIdentityMap } from '@/lib/identity-links';
import { getEventCounts } from '@/lib/event-index';
import { MemoryConversations } from './memory-conversations';
import { MemoryCoverPicker } from './memory-cover-picker';
import { MemoryHero } from './memory-hero';
import { FlyerCredits } from '@/components/events/flyer-credits';
import { MemoryCoverFraming } from './memory-cover-framing';
import { MemoryMosaic } from './memory-mosaic';
import { MemoryTalks } from './memory-talks';

type Event = NonNullable<Awaited<ReturnType<typeof fetchEvent>>>;

// How many photos and videos the album shows before linking to the gallery.
const MEMORY_PREVIEW = 30;
// How many of the people tagged in the photos are listed by name.
const PEOPLE_PREVIEW = 24;

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

const linkRowClassName =
  'flex items-center justify-between gap-2 py-1 font-mono text-xs text-muted-foreground hover:text-pcnGreen';

/**
 * A past event's page, laid out as a memory of how it went instead of an invitation: a photo of
 * the night with what it left (people, talks, photos), the album, the talks given and the
 * event's details. Whoever manages the event still gets their tools at the bottom.
 */
export async function PastEventMemory({
  event,
  canEdit,
  isAdmin,
}: {
  event: Event;
  canEdit: boolean;
  isAdmin: boolean;
}) {
  const isExternalEvent = !!event.externalRegistrationUrl;
  const eventConversations = conversations.filter((c) => c.eventId === event.id);
  const [memories, cover, talks, counts, profiles] = await Promise.all([
    getEventMemories(event.id, MEMORY_PREVIEW + 1),
    getEventCover(event.id, event.coverPhotoId),
    fetchPublicTalks(event.id),
    getEventCounts(event.id),
    eventConversations.length > 0 ? getIdentityMap('whatsapp') : Promise.resolve({}),
  ]);

  // Same numbering as the /eventos museum: the first event ever is Nº 001.
  const { catalogNumber } = counts;
  const activeRegistrations = isExternalEvent ? 0 : counts.activeRegistrations;
  const totalRegistrations = isExternalEvent ? 0 : counts.totalRegistrations;

  // Without landscape photos, any photo of the night still beats the flyer.
  const covers = cover.covers.length > 0 ? cover.covers : cover.photos.slice(0, 1);
  // A chosen cover opens the page, so the album doesn't repeat it.
  const album = memories.items
    .filter((item) => item.id !== cover.chosenId)
    .slice(0, MEMORY_PREVIEW);
  const totalItems = memories.photoCount + memories.videoCount;
  const orderedTalks = [...talks].sort((a, b) => a.order - b.order);
  const place = event.isOnline
    ? 'online'
    : [event.placeName, event.city].filter(Boolean).join(', ') || null;

  const stats = [
    { value: activeRegistrations, label: plural(activeRegistrations, 'inscripto', 'inscriptos') },
    { value: orderedTalks.length, label: plural(orderedTalks.length, 'charla', 'charlas') },
    {
      value: eventConversations.length,
      label: plural(eventConversations.length, 'conversación', 'conversaciones'),
    },
    { value: memories.photoCount, label: plural(memories.photoCount, 'foto', 'fotos') },
    { value: memories.videoCount, label: plural(memories.videoCount, 'video', 'videos') },
  ].filter((stat) => stat.value > 0);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 pt-0">
      <StickyHeader className="mt-4">
        <PageTitle
          path={[{ label: 'eventos', href: '/eventos' }, { label: event.name }]}
          action={
            canEdit && (
              <Link href={`/eventos/${event.id}/editar`}>
                <Button variant="pcn" size="sm" className="flex items-center gap-1.5">
                  <Edit className="h-4 w-4" />
                  editarEvento();
                </Button>
              </Link>
            )
          }
        />
      </StickyHeader>

      <article className="mb-14 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
        <MemoryHero
          name={event.name}
          date={event.date}
          place={place}
          catalogNumber={catalogNumber}
          covers={covers.map((photo) => photo.fullUrl)}
          flyer={event.flyerImages[0]}
          stats={stats}
          flyerCredits={
            event.flyerImages[0] && (
              <FlyerCredits
                flyers={[event.flyerImages[0]]}
                credits={event.flyerDesigners}
                className="text-right text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]"
              />
            )
          }
          framing={
            cover.chosenId
              ? { x: event.coverFocusX, y: event.coverFocusY, zoom: event.coverZoom }
              : undefined
          }
          coverPicker={
            canEdit && (
              <div className="absolute right-3 top-3 z-10 flex gap-1.5">
                {cover.chosenId && covers[0] && (
                  <MemoryCoverFraming
                    eventId={event.id}
                    photo={covers[0].fullUrl}
                    framing={{ x: event.coverFocusX, y: event.coverFocusY, zoom: event.coverZoom }}
                  />
                )}
                <MemoryCoverPicker
                  eventId={event.id}
                  chosenId={cover.chosenId}
                  photos={cover.photos.map(({ id, thumbUrl, width, height }) => ({
                    id,
                    thumbUrl,
                    width,
                    height,
                  }))}
                />
              </div>
            )
          }
        />

        {(totalItems > 0 || isAdmin) && (
          <EventSection
            title="fotos y videos"
            aside={
              <span className="flex gap-4 font-mono text-xs">
                {isAdmin && (
                  <Link
                    href={`/galeria/subir?evento=${event.id}`}
                    className="flex items-center gap-1 text-muted-foreground hover:text-pcnGreen"
                  >
                    <ImagePlus className="size-3.5" />
                    subir
                  </Link>
                )}
                {totalItems > 0 && (
                  <Link
                    href={`/galeria?evento=${event.id}`}
                    className="flex items-center gap-1 text-pcnGreen-700 hover:text-pcnGreen"
                  >
                    <Images className="size-3.5" />
                    ver {totalItems === 1 ? 'en' : `los ${totalItems} en`} la galería →
                  </Link>
                )}
              </span>
            }
          >
            {album.length > 0 ? (
              <MemoryMosaic
                eventId={event.id}
                items={album}
                total={totalItems - (cover.chosenId ? 1 : 0)}
              />
            ) : (
              totalItems === 0 && (
                <p className="font-mono text-xs text-muted-foreground">
                  Todavía no hay fotos ni videos de este evento.
                </p>
              )
            )}
          </EventSection>
        )}

        {orderedTalks.length > 0 && (
          <EventSection title="charlas">
            <MemoryTalks talks={orderedTalks} />
          </EventSection>
        )}

        {eventConversations.length > 0 && (
          <EventSection
            title="de qué se habló"
            aside={
              <Link
                href="/conversaciones"
                className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
              >
                todas las conversaciones →
              </Link>
            }
          >
            <MemoryConversations conversations={eventConversations} profiles={profiles} />
          </EventSection>
        )}

        <div className="grid grid-cols-1 divide-y divide-pcnGreen-200 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:divide-x md:divide-y-0">
          <div className="flex flex-col divide-y divide-pcnGreen-200">
            {event.description && (
              <EventSection title="de qué se trató">
                <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </EventSection>
            )}

            {memories.people.length > 0 && (
              <EventSection
                title="aparecen en las fotos"
                aside={<span className="font-mono text-xs">{memories.people.length}</span>}
              >
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {memories.people.slice(0, PEOPLE_PREVIEW).map((person) => (
                    <li key={person.id}>
                      <PersonLink person={person} />
                    </li>
                  ))}
                </ul>
                {memories.people.length > PEOPLE_PREVIEW && (
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    y {memories.people.length - PEOPLE_PREVIEW} más
                  </p>
                )}
              </EventSection>
            )}
          </div>

          <div className="flex flex-col divide-y divide-pcnGreen-200">
            <EventSection title="ficha">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
                <dt className="text-muted-foreground">fecha</dt>
                <dd>
                  <LocalDate date={event.date} /> <LocalTime date={event.date} />
                  {event.endDate && (
                    <>
                      {' → '}
                      <LocalDate date={event.endDate} /> <LocalTime date={event.endDate} />
                    </>
                  )}
                </dd>
                <dt className="text-muted-foreground">{event.isOnline ? 'modo' : 'lugar'}</dt>
                <dd>
                  {event.isOnline
                    ? 'online'
                    : [event.placeName, event.address, event.city].filter(Boolean).join(' · ') ||
                      '—'}
                  {!event.isOnline && event.googleMapsUrl && (
                    <>
                      {' '}
                      <a
                        href={event.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pcnGreen hover:underline"
                      >
                        abrir en Google Maps
                      </a>
                    </>
                  )}
                </dd>
              </dl>
            </EventSection>

            {event.organizers.length > 0 && (
              <EventSection title="organizaron">
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {event.organizers.map(({ user }) => (
                    <li key={user.id}>
                      <PersonLink person={user} />
                    </li>
                  ))}
                </ul>
              </EventSection>
            )}

            {event.sponsors.length > 0 && (
              <EventSection title="con el apoyo de">
                <EventSponsors sponsors={event.sponsors} compact />
              </EventSection>
            )}
          </div>
        </div>

        {canEdit && (
          <EventSection title="gestión">
            <div className="grid gap-x-6 sm:grid-cols-2">
              <Link href={`/eventos/${event.id}/charlas`} className={linkRowClassName}>
                <span className="flex items-center gap-2">
                  <Mic className="size-3.5" />
                  charlas del evento
                </span>
                <span>gestionar →</span>
              </Link>
              <Link href={`/eventos/${event.id}/organizadores`} className={linkRowClassName}>
                <span className="flex items-center gap-2">
                  <UserCog className="size-3.5" />
                  organizadores
                </span>
                <span>gestionar →</span>
              </Link>
              {!isExternalEvent && (
                <Link href={`/eventos/${event.id}/inscripciones`} className={linkRowClassName}>
                  <span className="flex items-center gap-2">
                    <Users className="size-3.5" />
                    {activeRegistrations} activas · {totalRegistrations} total
                  </span>
                  <span>inscripciones →</span>
                </Link>
              )}
              {event.callForSpeakersEnabled && (
                <Link
                  href={`/eventos/${event.id}/propuestas-de-charlas`}
                  className={linkRowClassName}
                >
                  <span className="flex items-center gap-2">
                    <Mic className="size-3.5" />
                    propuestas de charlas
                  </span>
                  <span>ver →</span>
                </Link>
              )}
            </div>
          </EventSection>
        )}
      </article>
    </div>
  );
}
