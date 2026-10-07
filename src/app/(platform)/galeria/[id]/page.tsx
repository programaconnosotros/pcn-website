import type { Metadata } from 'next';
import { preload } from 'react-dom';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { LocalDate } from '@/components/ui/local-date-time';
import { PhotoActionsBar } from '@/components/photo-gallery/photo-actions-bar';
import { EventCoverKey } from '@/components/photo-gallery/event-cover-key';
import { PhotoPeople } from '@/components/photo-gallery/photo-people';
import { PhotoTagCanvas, PhotoTagsProvider } from '@/components/photo-gallery/photo-tags';
import { PhotoKeyboardNav } from '@/components/photo-gallery/photo-keyboard-nav';
import {
  keyCapClassName,
  padIndex,
  photoCaption,
  photoFileName,
} from '@/components/photo-gallery/photo-utils';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { optimizedOgImage } from '@/lib/og-image';
import { getGalleryItem, getGalleryNeighbours } from '@/lib/gallery';
import { formatDuration, galleryQuery, parseGalleryFilter } from '@/lib/gallery-filters';
import { googleMapsSearchUrl } from '@/lib/google-maps';
import { cn } from '@/lib/utils';
import { MISSING_TAB_TITLE, tabTitle } from '@/lib/tab-title';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="p-3">
    <h2 className="mb-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
      <span className="text-pcnGreen-500">{'// '}</span>
      {title}
    </h2>
    {children}
  </section>
);

const NavKey = ({
  href,
  label,
  icon: Icon,
}: {
  href: string | null;
  label: string;
  icon: typeof ChevronLeft;
}) =>
  href ? (
    <Link href={href} scroll={false} className={keyCapClassName} title={label}>
      <Icon className="size-4" />
      <span className="sr-only">{label}</span>
    </Link>
  ) : (
    <span aria-hidden className={cn(keyCapClassName, 'pointer-events-none opacity-30')}>
      <Icon className="size-4" />
    </span>
  );

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const photo = await getGalleryItem(id);
  if (!photo) return { title: { absolute: MISSING_TAB_TITLE } };

  const title = photoCaption(photo);
  const people = photo.tags.map((tag) => tag.user.name);
  const description = people.length
    ? `Con ${people.join(', ')}. Galería de programaConNosotros.`
    : 'Galería de fotos de la comunidad programaConNosotros.';
  const images = [
    {
      url: optimizedOgImage(photo.kind === 'VIDEO' ? photo.thumbUrl : photo.fullUrl),
      alt: title,
    },
  ];

  return {
    title: tabTitle.open('galeria', title),
    description,
    openGraph: {
      title,
      description,
      images,
      url: `/galeria/${photo.id}`,
      type: 'website',
      siteName: 'programaConNosotros',
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function GalleryItemPage(props: Props) {
  const { id } = await props.params;
  const filter = parseGalleryFilter(await props.searchParams);

  const [photo, session] = await Promise.all([getGalleryItem(id), getCurrentSession()]);
  if (!photo) notFound();
  const viewer = session?.user ?? null;
  const isAdmin = viewer?.role === 'ADMIN';

  // Prev/next stay within the filters the visitor was browsing the gallery with.
  const { previousId, nextId, previous, next, index, total } = await getGalleryNeighbours(
    id,
    filter,
  );
  // Fetch the neighbours' files at low priority, so stepping to them shows them right away.
  for (const neighbour of [next, previous]) {
    if (!neighbour || neighbour.id === id) continue;
    preload(neighbour.kind === 'VIDEO' ? neighbour.thumbUrl : neighbour.fullUrl, {
      as: 'image',
      fetchPriority: 'low',
    });
  }
  const query = galleryQuery(filter);
  const hrefFor = (itemId: string | null) => itemId && `/galeria/${itemId}${query}`;
  const isVideo = photo.kind === 'VIDEO';
  const previousHref = hrefFor(previousId);
  const nextHref = hrefFor(nextId);

  const caption = photoCaption(photo);
  // Wide photos get the page's full width with the details below; tall ones keep them beside.
  const landscape = !!photo.width && !!photo.height && photo.width / photo.height >= 1.25;

  // Photos from an event were taken where the event happened.
  const event = photo.event;
  const location = event
    ? [event.isOnline ? 'online' : event.placeName, event.city].filter(Boolean).join(', ')
    : '';
  const mapsHref =
    event && !event.isOnline
      ? event.googleMapsUrl ||
        (event.address || event.placeName
          ? googleMapsSearchUrl(
              [event.placeName, event.address, event.city].filter(Boolean).join(', '),
            )
          : null)
      : null;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 pt-0">
      <PhotoKeyboardNav previousHref={previousHref} nextHref={nextHref} />
      <StickyHeader className="mt-4">
        <PageTitle
          path={[
            { label: 'galeria', href: `/galeria${query}` },
            ...(filter.eventId && filter.eventId === photo.event?.id
              ? [{ label: photo.event.name, href: `/galeria${query}` }]
              : []),
            { label: photoFileName(photo) },
          ]}
          meta={
            total > 1 && (
              <span className="tabular-nums">
                [<span className="text-pcnGreen">{padIndex(total - index, total)}</span>/{total}]
              </span>
            )
          }
          action={
            <>
              {/* Prev/next live up here, outside the photo, so they never cover it. */}
              {(previousHref || nextHref) && (
                <nav aria-label="Fotos" className="flex gap-1">
                  <NavKey href={previousHref} label="Anterior" icon={ChevronLeft} />
                  <NavKey href={nextHref} label="Siguiente" icon={ChevronRight} />
                </nav>
              )}
              {isAdmin && (
                <Link
                  href={`/galeria/${photo.id}/editar`}
                  className={keyCapClassName}
                  title="Editar o eliminar"
                >
                  <Pencil className="size-3.5" />
                  <span className="sr-only">Editar o eliminar</span>
                </Link>
              )}
              {isAdmin && !isVideo && photo.event && (
                <EventCoverKey
                  eventId={photo.event.id}
                  photoId={photo.id}
                  isCover={photo.event.coverPhotoId === photo.id}
                />
              )}
              <PhotoActionsBar photo={photo} />
            </>
          }
        />
      </StickyHeader>

      <PhotoTagsProvider
        photoId={photo.id}
        initial={photo.tags.map((tag) => ({
          id: tag.user.id,
          name: tag.user.name,
          position: tag.x !== null && tag.y !== null ? { x: tag.x, y: tag.y } : null,
        }))}
      >
        <div
          className={cn(
            'mb-14 grid grid-cols-1 divide-y divide-pcnGreen-200 border border-pcnGreen-200',
            !landscape && 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:divide-x lg:divide-y-0',
          )}
          data-layout={landscape ? 'landscape' : 'portrait'}
        >
          <div
            className={cn(
              'relative flex items-center justify-center bg-black',
              landscape ? 'min-h-[40vh]' : 'min-h-[50vh] lg:min-h-[calc(100dvh-10rem)]',
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,244,190,0.06),transparent_70%)]"
            />
            {isVideo ? (
              <video
                key={photo.id}
                src={photo.fullUrl}
                poster={photo.thumbUrl}
                width={photo.width ?? undefined}
                height={photo.height ?? undefined}
                controls
                playsInline
                preload="metadata"
                aria-label={caption}
                className="relative max-h-[calc(100dvh-10rem)] w-auto max-w-full p-2 sm:p-4"
              />
            ) : (
              <div className={cn('relative p-2 sm:p-4', landscape && 'w-full')}>
                <PhotoTagCanvas className={landscape ? 'block w-full' : undefined}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={photo.id}
                    src={photo.fullUrl}
                    alt={caption}
                    width={photo.width ?? undefined}
                    height={photo.height ?? undefined}
                    fetchPriority="high"
                    // The thumbnail (already cached from the grid) shows until the full photo arrives.
                    style={{
                      backgroundImage: `url("${photo.thumbUrl}")`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                    }}
                    className={cn(
                      'relative block max-h-[calc(100dvh-12rem)] photo-glitch-in object-contain select-none',
                      landscape ? 'h-auto w-full' : 'w-auto max-w-full',
                    )}
                    draggable={false}
                  />
                </PhotoTagCanvas>
              </div>
            )}
          </div>

          <div
            className={cn(
              'flex flex-col divide-y divide-pcnGreen-200',
              // Below a wide photo, the details sit side by side instead of in a tall column.
              landscape && 'md:grid md:grid-cols-3 md:divide-x md:divide-y-0',
            )}
          >
            <Section title="info">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
                <dt className="text-muted-foreground">fecha</dt>
                <dd>
                  <LocalDate date={photo.takenAt} />
                </dd>
                {isVideo && photo.durationSeconds !== null && (
                  <>
                    <dt className="text-muted-foreground">duración</dt>
                    <dd className="tabular-nums">{formatDuration(photo.durationSeconds)}</dd>
                  </>
                )}
                {photo.event && (
                  <>
                    <dt className="text-muted-foreground">evento</dt>
                    <dd>
                      <Link
                        href={`/eventos/${photo.event.id}`}
                        className="text-pcnGreen hover:underline"
                      >
                        {photo.event.name}
                      </Link>
                    </dd>
                    <dt className="text-muted-foreground">ubicación</dt>
                    <dd>
                      {location ? (
                        mapsHref ? (
                          <a
                            href={mapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 hover:text-pcnGreen"
                          >
                            {location}
                            <ArrowUpRight className="size-3 text-muted-foreground" />
                          </a>
                        ) : (
                          location
                        )
                      ) : (
                        <span className="text-muted-foreground">sin datos</span>
                      )}
                    </dd>
                  </>
                )}
              </dl>
            </Section>

            {photo.description && (
              <Section title="descripción">
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {photo.description}
                </p>
              </Section>
            )}

            <Section title="en la foto">
              <PhotoPeople
                photoId={photo.id}
                people={photo.tags.map((tag) => tag.user)}
                viewer={viewer && { id: viewer.id, name: viewer.name, image: viewer.image }}
                isAdmin={isAdmin}
              />
            </Section>

            <p
              className={cn(
                'hidden p-3 font-mono text-[10px] text-muted-foreground lg:block',
                landscape && 'lg:hidden',
              )}
            >
              <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">←</kbd>{' '}
              <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">→</kbd>{' '}
              navegar
            </p>
          </div>
        </div>
      </PhotoTagsProvider>
    </div>
  );
}
