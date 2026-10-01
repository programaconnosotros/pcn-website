import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { LocalDate } from '@/components/ui/local-date-time';
import { PersonLink } from '@/components/people/person-link';
import { PhotoActionsBar } from '@/components/photo-gallery/photo-actions-bar';
import { PhotoKeyboardNav } from '@/components/photo-gallery/photo-keyboard-nav';
import {
  keyCapClassName,
  padIndex,
  photoCaption,
  photoFileName,
} from '@/components/photo-gallery/photo-utils';
import { getAdminUser } from '@/lib/admin';
import { optimizedOgImage } from '@/lib/og-image';
import { getPhoto, getPhotoNeighbours } from '@/lib/photos';
import { cn } from '@/lib/utils';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ evento?: string }>;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="p-3">
    <h2 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      <span className="text-pcnGreen-500">{'// '}</span>
      {title}
    </h2>
    {children}
  </section>
);

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const photo = await getPhoto(id);
  if (!photo) return { title: 'Foto no encontrada' };

  const title = photoCaption(photo);
  const people = photo.tags.map((tag) => tag.user.name);
  const description = people.length
    ? `Con ${people.join(', ')}. Galería de programaConNosotros.`
    : 'Galería de fotos de la comunidad programaConNosotros.';
  const images = [{ url: optimizedOgImage(photo.src), alt: title }];

  return {
    title,
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

export default async function PhotoPage(props: Props) {
  const { id } = await props.params;
  const { evento } = await props.searchParams;

  const [photo, admin] = await Promise.all([getPhoto(id), getAdminUser()]);
  if (!photo) notFound();

  // Browsing an event's photos keeps prev/next within that event.
  const scopeEventId = evento && evento === photo.eventId ? evento : undefined;
  const { previousId, nextId, index, total } = await getPhotoNeighbours(id, scopeEventId);
  const hrefFor = (photoId: string | null) =>
    photoId && `/galeria/${photoId}${scopeEventId ? `?evento=${scopeEventId}` : ''}`;
  const previousHref = hrefFor(previousId);
  const nextHref = hrefFor(nextId);

  const caption = photoCaption(photo);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 pt-0">
      <PhotoKeyboardNav previousHref={previousHref} nextHref={nextHref} />
      <StickyHeader className="mt-4">
        <PageTitle
          path={[
            { label: 'galeria', href: '/galeria' },
            ...(scopeEventId && photo.event
              ? [{ label: photo.event.name, href: `/galeria?evento=${photo.event.id}` }]
              : []),
            { label: photoFileName(photo) },
          ]}
          meta={
            total > 1 && (
              <span className="tabular-nums">
                [<span className="text-pcnGreen">{padIndex(index + 1, total)}</span>/{total}]
              </span>
            )
          }
          action={
            <>
              {admin && (
                <Link
                  href={`/galeria/${photo.id}/editar`}
                  className={keyCapClassName}
                  title="Editar o eliminar"
                >
                  <Pencil className="size-3.5" />
                  <span className="sr-only">Editar o eliminar</span>
                </Link>
              )}
              <PhotoActionsBar photo={photo} />
            </>
          }
        />
      </StickyHeader>

      <div className="mb-14 grid grid-cols-1 divide-y divide-pcnGreen-200 border border-pcnGreen-200 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:divide-x lg:divide-y-0">
        <div className="relative flex min-h-[50vh] items-center justify-center bg-black lg:min-h-[calc(100dvh-10rem)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,244,190,0.06),transparent_70%)]"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={photo.src}
            alt={caption}
            width={photo.width ?? undefined}
            height={photo.height ?? undefined}
            className="photo-glitch-in relative max-h-[calc(100dvh-10rem)] w-auto max-w-full select-none object-contain p-2 sm:p-4"
            draggable={false}
          />
          {previousHref && (
            <Link
              href={previousHref}
              scroll={false}
              className={cn(keyCapClassName, 'absolute left-2 top-1/2 size-9 -translate-y-1/2')}
            >
              <ChevronLeft className="size-5" />
              <span className="sr-only">Foto anterior</span>
            </Link>
          )}
          {nextHref && (
            <Link
              href={nextHref}
              scroll={false}
              className={cn(keyCapClassName, 'absolute right-2 top-1/2 size-9 -translate-y-1/2')}
            >
              <ChevronRight className="size-5" />
              <span className="sr-only">Foto siguiente</span>
            </Link>
          )}
        </div>

        <div className="flex flex-col divide-y divide-pcnGreen-200">
          <Section title="info">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
              <dt className="text-muted-foreground">fecha</dt>
              <dd>
                <LocalDate date={photo.takenAt} />
              </dd>
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
                </>
              )}
            </dl>
          </Section>

          {photo.description && (
            <Section title="descripción">
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {photo.description}
              </p>
            </Section>
          )}

          <Section title="en la foto">
            {photo.tags.length > 0 ? (
              <ul className="space-y-1.5">
                {photo.tags.map(({ user }) => (
                  <li key={user.id}>
                    <PersonLink person={user} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-mono text-xs text-muted-foreground">
                Todavía no hay nadie etiquetado.
              </p>
            )}
          </Section>

          <p className="hidden p-3 font-mono text-[10px] text-muted-foreground lg:block">
            <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">←</kbd>{' '}
            <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">→</kbd>{' '}
            navegar
          </p>
        </div>
      </div>
    </div>
  );
}
