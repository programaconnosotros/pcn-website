import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { SetupLikeButton } from '@/components/setups/setup-like-button';
import { SetupOwnerActions } from '@/components/setups/setup-owner-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LocalDate } from '@/components/ui/local-date-time';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { optimizedOgImage } from '@/lib/og-image';
import { fetchSetup } from '@/lib/setups';

type Props = { params: Promise<{ id: string }> };

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
  const setup = await fetchSetup(id);
  if (!setup) return { title: 'Setup no encontrado' };

  const title = `${setup.title} · setup de ${setup.author.name}`;
  const description =
    setup.description.length > 160 ? `${setup.description.slice(0, 157)}...` : setup.description;
  const images = [{ url: optimizedOgImage(setup.imageUrl), alt: setup.title }];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      url: `/setups/${setup.id}`,
      type: 'article',
      siteName: 'programaConNosotros',
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function SetupPage(props: Props) {
  const { id } = await props.params;
  const [setup, session] = await Promise.all([fetchSetup(id), getCurrentSession()]);
  if (!setup) notFound();

  const viewer = session?.user ?? null;
  const isAuthor = viewer?.id === setup.author.id;
  const canDelete = isAuthor || viewer?.role === 'ADMIN';

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 pt-0">
      <StickyHeader className="mt-4">
        <PageTitle
          path={[{ label: 'setups', href: '/setups' }, { label: setup.title }]}
          action={
            <SetupLikeButton
              setupId={setup.id}
              likes={setup.likes.length}
              liked={!!viewer && setup.likes.some((like) => like.userId === viewer.id)}
              isLoggedIn={!!viewer}
              className="px-2 py-1 text-xs"
            />
          }
        />
      </StickyHeader>

      <div className="mb-14 grid border border-pcnGreen-200 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center justify-center bg-black max-lg:border-b max-lg:border-pcnGreen-200 lg:border-r lg:border-pcnGreen-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={setup.imageUrl}
            alt={setup.title}
            width={setup.width}
            height={setup.height}
            className="photo-glitch-in max-h-[calc(100dvh-10rem)] w-auto max-w-full object-contain p-2 sm:p-4"
          />
        </div>

        <div className="flex flex-col divide-y divide-pcnGreen-200">
          <Section title="de">
            <Link
              href={`/perfil/${setup.author.id}`}
              className="group/author flex min-w-0 items-center gap-2"
            >
              <Avatar className="size-8 rounded-sm">
                <AvatarImage src={setup.author.image ?? undefined} alt="" />
                <AvatarFallback className="rounded-sm text-xs">
                  {setup.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block truncate font-mono text-sm font-semibold transition-colors group-hover/author:text-pcnGreen">
                  {setup.author.name}
                </span>
                <span className="block font-mono text-[11px] text-muted-foreground">
                  <LocalDate date={setup.createdAt} />
                </span>
              </span>
            </Link>
          </Section>

          <Section title="descripción">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {setup.description}
            </p>
          </Section>

          {canDelete && (
            <div className="p-3">
              <SetupOwnerActions
                setup={{
                  id: setup.id,
                  title: setup.title,
                  description: setup.description,
                  imageUrl: setup.thumbUrl,
                }}
                canEdit={isAuthor}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
