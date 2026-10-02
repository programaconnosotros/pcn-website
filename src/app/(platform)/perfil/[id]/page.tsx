import { getCurrentSession } from '@/actions/auth/get-current-session';
import { AdviseCard } from '@/components/advises/advise-card';
import { BadgeStrip, ProfileBadges } from '@/components/badges/profile-badges';
import {
  AMBASSADOR_BADGE,
  COFOUNDER_BADGE,
  isBadgeIcon,
  isBadgeTone,
  type DisplayBadge,
} from '@/lib/badges';
import { LanguageCoinsContainer } from '@/components/profile/language-coins-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import prisma from '@/lib/prisma';
import { galleryOrder, visibleGalleryItem } from '@/lib/gallery';
import { signGalleryItem } from '@/lib/gallery-signing';
import { articleAuthors, articles as allArticles } from '@/app/(platform)/lectura/articles';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Pencil } from 'lucide-react';
import { conversations as allConversations } from '@/data/whatsapp-conversations';
import { getCollaborationStats } from '@/lib/github-stats';
import { getUserIdentities } from '@/lib/identity-links';
import {
  ContributionStats,
  ConversationRows,
  EmptyLine,
  ArticleRows,
  OrganizedEventRows,
  PhotoGrid,
  ProfileStat,
  ProfileTabs,
  ProjectRows,
  SectionHeading,
  isProfileTab,
  type ProfileProject,
  type ProfileTab,
} from '@/components/profile/profile-sections';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      name: true,
      slogan: true,
    },
  });

  if (!user) {
    return {
      title: 'Perfil no encontrado',
      description: 'El perfil que buscas no existe.',
    };
  }

  const title = user.name;
  const description = user.slogan
    ? `Perfil de ${user.name} en programaConNosotros. ${user.slogan}`
    : `Perfil de ${user.name} en programaConNosotros. Miembro de la comunidad.`;
  const pageUrl = `${SITE_URL}/perfil/${params.id}`;

  return {
    title,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    openGraph: {
      title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      url: pageUrl,
      type: 'profile',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    },
  };
}

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ tab?: string }>;
}

// How many items of each section the overview shows before "ver todo".
const PREVIEW = 2;
const CONVERSATIONS_PREVIEW = 4;
const PHOTOS_PREVIEW = 6;

type ProfileTalk = {
  id: string;
  title: string;
  portraitUrl: string | null;
  videoUrl: string | null;
  event: { date: Date; placeName: string | null; city: string | null } | null;
  speakers: { speakerName: string }[];
};

const TalkRows = ({ talks }: { talks: ProfileTalk[] }) => (
  <RuledGrid className="grid-cols-1">
    {talks.map((talk) => {
      const location = [talk.event?.placeName, talk.event?.city].filter(Boolean).join(', ');
      const meta = [
        talk.event?.date &&
          new Date(talk.event.date).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        location,
      ]
        .filter(Boolean)
        .join(' · ');
      return (
        <div key={talk.id} className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
          {talk.portraitUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={talk.portraitUrl}
              alt={`Foto de la charla "${talk.title}"`}
              className="h-16 w-16 shrink-0 object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-sm">
              <h3 className="truncate font-semibold">{talk.title}</h3>
              {talk.videoUrl && (
                <a
                  href={talk.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground hover:text-pcnGreen"
                >
                  youtube
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {talk.speakers.map((speaker) => speaker.speakerName).join(', ')}
            </p>
            {meta && (
              <p className="truncate font-mono text-[11px] text-muted-foreground/70">
                <span className="text-pcnGreen-500">@ </span>
                {meta}
              </p>
            )}
          </div>
        </div>
      );
    })}
  </RuledGrid>
);

async function getUser(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        advises: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                email: true,
              },
            },
            likes: true,
          },
        },
        badges: {
          include: { badge: true },
          orderBy: { awardedAt: 'asc' },
        },
        languages: {
          select: {
            language: true,
            color: true,
            logo: true,
          },
        },
        positions: {
          select: { jobTitle: true, enterprise: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!user) {
      notFound();
    }

    // Seleccionar solo los campos necesarios del usuario
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      isAmbassador: user.isAmbassador,
      isCofounder: user.isCofounder,
      customBadges: user.badges,
      countryOfOrigin: user.countryOfOrigin,
      province: user.province,
      phoneNumber: (user as any).phoneNumber ?? null,
      slogan: user.slogan,
      // Perfiles que todavía no guardaron puestos muestran el cargo único que tenían.
      positions:
        user.positions.length > 0
          ? user.positions
          : user.jobTitle || user.enterprise
            ? [{ jobTitle: user.jobTitle ?? '', enterprise: user.enterprise }]
            : [],
      career: user.career,
      studyPlace: user.studyPlace,
      xAccountUrl: user.xAccountUrl,
      linkedinUrl: user.linkedinUrl,
      gitHubUrl: user.gitHubUrl,
      instagramUrl: user.instagramUrl,
      advises: user.advises,
      languages: user.languages,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    // Si el error es porque el usuario no existe, usar notFound
    if (error instanceof Error && error.message.includes('Record to find does not exist')) {
      notFound();
    }
    // Re-lanzar el error original para debugging
    throw error;
  }
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const { tab: requestedTab } = await props.searchParams;
  const tab: ProfileTab = isProfileTab(requestedTab) ? requestedTab : 'resumen';
  const user = await getUser(params.id);
  const session = await getCurrentSession();

  const userLanguages = user.languages
    ? user.languages.map((language) => ({
        languageId: language.language,
        color: language.color,
        logo: language.logo,
      }))
    : [];

  const isOwnProfile = session?.user?.id === params.id;
  const viewerIsAdmin = session?.user?.role === 'ADMIN';

  // Built-in badges first, then the custom ones an admin awarded, oldest first.
  const badges: (DisplayBadge & { custom?: boolean })[] = [
    ...(user.isCofounder ? [COFOUNDER_BADGE] : []),
    ...(user.isAmbassador ? [AMBASSADOR_BADGE] : []),
    ...user.customBadges.map(({ badge, awardedAt }) => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: isBadgeIcon(badge.icon) ? badge.icon : 'award',
      tone: isBadgeTone(badge.tone) ? badge.tone : 'green',
      awardedAt,
      custom: true,
    })),
  ];

  const profileFacts: { label: string; value: string; href?: string }[] = [
    ...user.positions.map((position) => ({
      label: 'trabaja',
      value: [position.jobTitle, position.enterprise].filter(Boolean).join(' @ '),
    })),
    { label: 'carrera', value: user.career },
    { label: 'institución', value: user.studyPlace },
    {
      label: 'ubicación',
      value: [user.province, user.countryOfOrigin].filter(Boolean).join(', '),
    },
    { label: 'email', value: user.email, href: user.email ? `mailto:${user.email}` : undefined },
    {
      label: 'teléfono',
      value: user.phoneNumber,
      href: user.phoneNumber ? `tel:${user.phoneNumber}` : undefined,
    },
  ].filter((fact): fact is { label: string; value: string; href?: string } => !!fact.value);

  const [userTalks, projects, identities, organizedEvents, taggedPhotos, articleAuthorships] =
    await Promise.all([
      prisma.talk.findMany({
        where: { speakers: { some: { userId: user.id } } },
        include: {
          event: { select: { date: true, placeName: true, city: true } },
          speakers: { orderBy: { order: 'asc' } },
        },
        orderBy: [{ event: { date: 'desc' } }, { createdAt: 'desc' }],
      }),
      prisma.project.findMany({
        where: { OR: [{ authorId: user.id }, { members: { some: { userId: user.id } } }] },
        select: {
          id: true,
          title: true,
          description: true,
          logoUrl: true,
          techStack: true,
          authorId: true,
          authorRole: true,
          members: { where: { userId: user.id }, select: { role: true }, take: 1 },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
      getUserIdentities(user.id),
      prisma.event.findMany({
        where: { deletedAt: null, organizers: { some: { userId: user.id } } },
        select: {
          id: true,
          name: true,
          date: true,
          isOnline: true,
          placeName: true,
          city: true,
          flyerImages: true,
        },
        orderBy: { date: 'desc' },
      }),
      prisma.galleryItem
        .findMany({
          where: { ...visibleGalleryItem, tags: { some: { userId: user.id } } },
          select: { id: true, kind: true, description: true, src: true, thumbSrc: true },
          orderBy: galleryOrder,
        })
        .then((items) => items.map(signGalleryItem)),
      prisma.articleAuthor.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    ]);

  // Articles from /lectura that an admin marked as written by this user, one by one or through
  // an author name linked in /vinculos, newest first.
  const writtenIds = new Set(articleAuthorships.map(({ articleId }) => articleId));
  const authorNames = new Set(identities.articulos);
  const userArticles = allArticles
    .filter(
      (article) =>
        writtenIds.has(article.id) || articleAuthors(article).some((name) => authorNames.has(name)),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  // El rol que se cargó en el proyecto; si no hay, si es autor o colaborador.
  const userProjects: ProfileProject[] = projects.map(({ members, authorRole, ...project }) => ({
    ...project,
    role: project.authorId === user.id ? authorRole || 'autor' : members[0]?.role || 'colaborador',
  }));

  // Conversations where any of the WhatsApp names an admin linked to this user took part.
  const whatsappNames = new Set(identities.whatsapp);
  const userConversations = allConversations
    .filter((conversation) => conversation.participants.some((name) => whatsappNames.has(name)))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Contributions to this website's repo, from the GitHub logins linked to this user.
  const githubStats = identities.github.length > 0 ? await getCollaborationStats() : null;
  const contributions =
    githubStats?.topContributors.filter((contributor) =>
      identities.github.includes(contributor.login),
    ) ?? [];
  const mergedPrs = contributions.reduce((sum, contributor) => sum + contributor.mergedPrs, 0);
  const commits = contributions.reduce((sum, contributor) => sum + contributor.commits, 0);
  const linesAdded = contributions.some((contributor) => contributor.linesAdded === null)
    ? null
    : contributions.reduce((sum, contributor) => sum + (contributor.linesAdded ?? 0), 0);

  const counts: Partial<Record<ProfileTab, number>> = {
    proyectos: userProjects.length,
    consejos: user.advises.length,
    charlas: userTalks.length,
    articulos: userArticles.length,
    eventos: organizedEvents.length,
    fotos: taggedPhotos.length,
    conversaciones: userConversations.length,
    ...(contributions.length > 0 && { contribuciones: mergedPrs }),
  };
  const tabHref = (id: ProfileTab) => `/perfil/${user.id}?tab=${id}`;
  const firstName = user.name?.split(' ')[0] ?? 'Este usuario';
  const hasActivity =
    userProjects.length +
      user.advises.length +
      userTalks.length +
      userArticles.length +
      organizedEvents.length +
      taggedPhotos.length +
      userConversations.length +
      contributions.length >
    0;

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <StickyHeader className="mt-4">
          <PageTitle
            path={[{ label: 'usuarios', href: '/usuarios' }, { label: user.name ?? 'perfil' }]}
          />
        </StickyHeader>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Columna izquierda: Información del usuario (fija en pantallas grandes, y con scroll
              propio cuando no entra en la pantalla) */}
          <div className="lg:col-span-1">
            <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
              <div className="flex items-center gap-3 p-4">
                <Avatar className="h-12 w-12 rounded-sm">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'Usuario'} />
                  <AvatarFallback className="rounded-sm">{user.name?.[0] ?? 'U'}</AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <h1 className="truncate font-mono text-base font-semibold">{user.name}</h1>
                    <BadgeStrip badges={badges} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 font-mono text-[11px] text-muted-foreground">
                    {user.xAccountUrl && (
                      <a
                        href={user.xAccountUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pcnGreen"
                        aria-label={`Perfil de X (anteriormente Twitter) de ${user.name}`}
                      >
                        x↗
                      </a>
                    )}
                    {user.linkedinUrl && (
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pcnGreen"
                        aria-label={`Perfil de LinkedIn de ${user.name}`}
                      >
                        linkedin↗
                      </a>
                    )}
                    {user.gitHubUrl && (
                      <a
                        href={user.gitHubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pcnGreen"
                        aria-label={`Perfil de GitHub de ${user.name}`}
                      >
                        github↗
                      </a>
                    )}
                    {user.instagramUrl && (
                      <a
                        href={user.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-pcnGreen"
                        aria-label={`Perfil de Instagram de ${user.name}`}
                      >
                        instagram↗
                      </a>
                    )}
                    {isOwnProfile && (
                      <Link href="/perfil" className="flex items-center gap-1 hover:text-pcnGreen">
                        <Pencil className="h-3 w-3" />
                        editar
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {user.slogan && (
                <p className="p-4 text-sm italic leading-relaxed text-muted-foreground">
                  <span className="not-italic text-pcnGreen-500">&gt; </span>
                  {user.slogan}
                </p>
              )}

              <ProfileBadges
                userId={user.id}
                userName={user.name}
                badges={badges}
                isAdmin={viewerIsAdmin}
              />

              {profileFacts.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 p-4 text-xs">
                  {profileFacts.map((fact) => (
                    <div key={`${fact.label}-${fact.value}`} className="contents">
                      <dt className="font-mono text-pcnGreen-500">{fact.label}</dt>
                      <dd className="min-w-0 break-words">
                        {fact.href ? (
                          <a href={fact.href} className="text-pcnGreen hover:underline">
                            {fact.value}
                          </a>
                        ) : (
                          fact.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="p-4">
                <h2 className="mb-2 font-mono text-xs font-semibold text-muted-foreground">
                  <span className="text-pcnGreen-500">## </span>lenguajes
                </h2>
                {userLanguages.length > 0 ? (
                  <LanguageCoinsContainer languages={userLanguages} />
                ) : (
                  <p className="text-xs text-muted-foreground">No hay lenguajes registrados</p>
                )}
              </div>
            </div>
          </div>

          {/* Columna derecha: resumen de todo lo que hizo, y una pestaña para ver cada sección */}
          <div className="min-w-0 lg:col-span-2">
            <ProfileTabs userId={user.id} active={tab} counts={counts} />

            {tab === 'resumen' && (
              <div className="mb-14 space-y-8">
                <RuledGrid
                  className={cn(
                    'grid-cols-2',
                    contributions.length > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-5',
                  )}
                >
                  <ProfileStat
                    label="proyectos"
                    value={userProjects.length}
                    href={tabHref('proyectos')}
                  />
                  <ProfileStat
                    label="consejos"
                    value={user.advises.length}
                    href={tabHref('consejos')}
                  />
                  <ProfileStat label="charlas" value={userTalks.length} href={tabHref('charlas')} />
                  <ProfileStat
                    label="artículos publicados"
                    value={userArticles.length}
                    href={tabHref('articulos')}
                  />
                  {contributions.length > 0 ? (
                    <>
                      <ProfileStat
                        label="conversaciones"
                        value={userConversations.length}
                        href={tabHref('conversaciones')}
                      />
                      <ProfileStat
                        label="PRs a pcn"
                        value={mergedPrs}
                        href={tabHref('contribuciones')}
                      />
                      <ProfileStat
                        label="commits a pcn"
                        value={commits.toLocaleString('es-AR')}
                        href={tabHref('contribuciones')}
                      />
                      <ProfileStat
                        label="líneas a pcn"
                        value={linesAdded === null ? '—' : linesAdded.toLocaleString('es-AR')}
                        href={tabHref('contribuciones')}
                      />
                    </>
                  ) : (
                    <ProfileStat
                      label="conversaciones"
                      value={userConversations.length}
                      href={tabHref('conversaciones')}
                    />
                  )}
                </RuledGrid>

                {!hasActivity && (
                  <EmptyLine>{firstName} todavía no tiene actividad en la comunidad.</EmptyLine>
                )}

                {userProjects.length > 0 && (
                  <section>
                    <SectionHeading
                      label="proyectos"
                      count={userProjects.length}
                      href={userProjects.length > PREVIEW ? tabHref('proyectos') : undefined}
                    />
                    <ProjectRows projects={userProjects.slice(0, PREVIEW)} />
                  </section>
                )}

                {contributions.length > 0 && (
                  <section>
                    <SectionHeading label="contribuciones a pcn" href={tabHref('contribuciones')} />
                    <ContributionStats
                      contributions={contributions}
                      totals={{
                        mergedPrs: githubStats?.mergedPrs ?? 0,
                        commits: githubStats?.commits ?? 0,
                      }}
                    />
                  </section>
                )}

                {userTalks.length > 0 && (
                  <section>
                    <SectionHeading
                      label="charlas"
                      count={userTalks.length}
                      href={userTalks.length > PREVIEW ? tabHref('charlas') : undefined}
                    />
                    <TalkRows talks={userTalks.slice(0, PREVIEW)} />
                  </section>
                )}

                {userArticles.length > 0 && (
                  <section>
                    <SectionHeading
                      label="artículos"
                      count={userArticles.length}
                      href={userArticles.length > PREVIEW ? tabHref('articulos') : undefined}
                    />
                    <ArticleRows articles={userArticles.slice(0, PREVIEW)} />
                  </section>
                )}

                {organizedEvents.length > 0 && (
                  <section>
                    <SectionHeading
                      label="eventos organizados"
                      count={organizedEvents.length}
                      href={organizedEvents.length > PREVIEW ? tabHref('eventos') : undefined}
                    />
                    <OrganizedEventRows events={organizedEvents.slice(0, PREVIEW)} />
                  </section>
                )}

                {taggedPhotos.length > 0 && (
                  <section>
                    <SectionHeading
                      label="fotos y videos"
                      count={taggedPhotos.length}
                      href={taggedPhotos.length > PHOTOS_PREVIEW ? tabHref('fotos') : undefined}
                    />
                    <PhotoGrid photos={taggedPhotos.slice(0, PHOTOS_PREVIEW)} />
                  </section>
                )}

                {userConversations.length > 0 && (
                  <section>
                    <SectionHeading
                      label="conversaciones"
                      count={userConversations.length}
                      href={
                        userConversations.length > CONVERSATIONS_PREVIEW
                          ? tabHref('conversaciones')
                          : undefined
                      }
                    />
                    <ConversationRows
                      conversations={userConversations.slice(0, CONVERSATIONS_PREVIEW)}
                    />
                  </section>
                )}

                {user.advises.length > 0 && (
                  <section>
                    <SectionHeading
                      label="consejos"
                      count={user.advises.length}
                      href={user.advises.length > PREVIEW ? tabHref('consejos') : undefined}
                    />
                    <RuledGrid className="grid-cols-1">
                      {user.advises.slice(0, PREVIEW).map((advise) => (
                        <AdviseCard key={advise.id} session={session} advise={advise} />
                      ))}
                    </RuledGrid>
                  </section>
                )}
              </div>
            )}

            {tab === 'proyectos' && (
              <div className="mb-14">
                {userProjects.length > 0 ? (
                  <ProjectRows projects={userProjects} />
                ) : (
                  <EmptyLine>{firstName} todavía no participó en ningún proyecto.</EmptyLine>
                )}
              </div>
            )}

            {tab === 'consejos' && (
              <div className="mb-14">
                {user.advises.length > 0 ? (
                  <RuledGrid className="grid-cols-1">
                    {user.advises.map((advise) => (
                      <AdviseCard key={advise.id} session={session} advise={advise} />
                    ))}
                  </RuledGrid>
                ) : (
                  <EmptyLine>{firstName} todavía no compartió ningún consejo.</EmptyLine>
                )}
              </div>
            )}

            {tab === 'charlas' && (
              <div className="mb-14">
                {userTalks.length > 0 ? (
                  <TalkRows talks={userTalks} />
                ) : (
                  <EmptyLine>{firstName} todavía no dio ninguna charla.</EmptyLine>
                )}
              </div>
            )}

            {tab === 'articulos' && (
              <div className="mb-14">
                {userArticles.length > 0 ? (
                  <ArticleRows articles={userArticles} />
                ) : (
                  <EmptyLine>{firstName} todavía no publicó ningún artículo.</EmptyLine>
                )}
              </div>
            )}

            {tab === 'eventos' && (
              <div className="mb-14">
                {organizedEvents.length > 0 ? (
                  <OrganizedEventRows events={organizedEvents} />
                ) : (
                  <EmptyLine>{firstName} todavía no organizó ningún evento.</EmptyLine>
                )}
              </div>
            )}

            {tab === 'fotos' && (
              <div className="mb-14">
                {taggedPhotos.length > 0 ? (
                  <PhotoGrid photos={taggedPhotos} />
                ) : (
                  <EmptyLine>
                    {firstName} todavía no aparece en ninguna foto ni video de la{' '}
                    <Link href="/galeria" className="text-pcnGreen hover:underline">
                      galería
                    </Link>
                    .
                  </EmptyLine>
                )}
              </div>
            )}

            {tab === 'conversaciones' && (
              <div className="mb-14">
                {userConversations.length > 0 ? (
                  <ConversationRows conversations={userConversations} />
                ) : (
                  <EmptyLine>
                    {identities.whatsapp.length > 0
                      ? `${firstName} no aparece en las conversaciones destacadas.`
                      : 'Todavía no vinculamos este perfil con el grupo de WhatsApp.'}
                  </EmptyLine>
                )}
              </div>
            )}

            {tab === 'contribuciones' && (
              <div className="mb-14">
                {contributions.length > 0 ? (
                  <ContributionStats
                    contributions={contributions}
                    totals={{
                      mergedPrs: githubStats?.mergedPrs ?? 0,
                      commits: githubStats?.commits ?? 0,
                    }}
                  />
                ) : (
                  <EmptyLine>
                    {identities.github.length > 0
                      ? 'No pudimos traer las contribuciones de GitHub, probá más tarde.'
                      : `Todavía no vinculamos a ${firstName} con una cuenta que contribuyó al sitio.`}
                  </EmptyLine>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
