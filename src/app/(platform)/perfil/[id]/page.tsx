import { getCurrentSession } from '@/actions/auth/get-current-session';
import { ProfileBadges } from '@/components/badges/profile-badges';
import {
  AMBASSADOR_BADGE,
  COFOUNDER_BADGE,
  isBadgeIcon,
  isBadgeTone,
  type DisplayBadge,
} from '@/lib/badges';
import { earnedAchievements } from '@/lib/achievements';
import { getUserAchievementMetrics } from '@/lib/achievement-metrics';
import { GitHubContributions } from '@/components/profile/github-contributions';
import { LanguageCoinsContainer } from '@/components/profile/language-coins-container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { formatDate } from '@/lib/date-formatter';
import { Pencil } from 'lucide-react';
import { Github, Instagram, Linkedin, Twitch, Youtube } from '@/components/icons/brand-icons';
import { isProfileTab, type ProfileTab } from '@/components/profile/profile-tabs';
import {
  ProfileTabPanel,
  ProfileTabs,
  ProfileTabsProvider,
} from '@/components/profile/profile-tab-nav';
import { ProfileTabSkeleton } from '@/components/profile/profile-tab-skeleton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProfileCountsLoader, ProfileTabContent } from './profile-tab-content';
import type { Metadata } from 'next';
import { MISSING_TAB_TITLE, tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const user = await findProfileUser(params.id);

  if (!user) {
    return {
      title: { absolute: MISSING_TAB_TITLE },
      description: 'El perfil que buscas no existe.',
    };
  }

  const title = user.name;
  const description = user.slogan
    ? `Perfil de ${user.name} en programaConNosotros. ${user.slogan}`
    : `Perfil de ${user.name} en programaConNosotros. Miembro de la comunidad.`;
  const pageUrl = `${SITE_URL}/perfil/${params.id}`;

  return {
    title: tabTitle.cat('perfil', user.name),
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

// lucide has no X logo; same 24×24 box and `currentColor` fill as its icons.
const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.73H5.58l11.1 14.44Z" />
  </svg>
);

// Same for Kick: its "K" mark in the same box.
const KickLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
    <path d="M3 3h6v4.5h1.5V6H12V4.5h1.5V3H21v6h-1.5v1.5H18V12h-1.5v1.5H18V15h1.5v1.5H21V21h-7.5v-1.5H12V18h-1.5v-1.5H9V21H3V3Z" />
  </svg>
);

// The profile's own data, shared by the metadata and the page. Cached: contact data is in it,
// but the page only shows it to members with a session.
const findProfileUser = cached(
  'profile-user',
  (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phoneNumber: true,
        isAmbassador: true,
        isCofounder: true,
        countryOfOrigin: true,
        province: true,
        slogan: true,
        jobTitle: true,
        enterprise: true,
        career: true,
        studyPlace: true,
        xAccountUrl: true,
        linkedinUrl: true,
        gitHubUrl: true,
        instagramUrl: true,
        youtubeUrl: true,
        twitchUrl: true,
        kickUrl: true,
        createdAt: true,
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
    }),
  { models: ['User', 'UserBadge', 'Badge', 'UserLanguage', 'UserPosition'] },
);

async function getUser(id: string) {
  const user = await findProfileUser(id);
  if (!user) notFound();

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
    phoneNumber: user.phoneNumber,
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
    youtubeUrl: user.youtubeUrl,
    twitchUrl: user.twitchUrl,
    kickUrl: user.kickUrl,
    languages: user.languages,
    createdAt: user.createdAt,
  };
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params;
  const { tab: requestedTab } = await props.searchParams;
  const tab: ProfileTab = isProfileTab(requestedTab) ? requestedTab : 'resumen';
  const [user, session, achievementMetrics] = await Promise.all([
    getUser(params.id),
    getCurrentSession(),
    getUserAchievementMetrics(params.id),
  ]);
  const achievements = earnedAchievements(achievementMetrics);

  const userLanguages = user.languages
    ? user.languages.map((language) => ({
        languageId: language.language,
        color: language.color,
        logo: language.logo,
      }))
    : [];

  const isOwnProfile = session?.user?.id === params.id;
  const viewerIsAdmin = session?.user?.role === 'ADMIN';

  // Built-in badges first, then the ones earned through activity, then the custom ones an admin
  // awarded, oldest first.
  const badges: (DisplayBadge & { custom?: boolean })[] = [
    ...(user.isCofounder ? [COFOUNDER_BADGE] : []),
    ...(user.isAmbassador ? [AMBASSADOR_BADGE] : []),
    ...achievements,
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

  const socialLinks = [
    {
      label: 'x',
      href: user.xAccountUrl,
      icon: XLogo,
      ariaLabel: `Perfil de X (anteriormente Twitter) de ${user.name}`,
    },
    {
      label: 'linkedin',
      href: user.linkedinUrl,
      icon: Linkedin,
      ariaLabel: `Perfil de LinkedIn de ${user.name}`,
    },
    {
      label: 'github',
      href: user.gitHubUrl,
      icon: Github,
      ariaLabel: `Perfil de GitHub de ${user.name}`,
    },
    {
      label: 'instagram',
      href: user.instagramUrl,
      icon: Instagram,
      ariaLabel: `Perfil de Instagram de ${user.name}`,
    },
    {
      label: 'youtube',
      href: user.youtubeUrl,
      icon: Youtube,
      ariaLabel: `Canal de YouTube de ${user.name}`,
    },
    {
      label: 'twitch',
      href: user.twitchUrl,
      icon: Twitch,
      ariaLabel: `Canal de Twitch de ${user.name}`,
    },
    {
      label: 'kick',
      href: user.kickUrl,
      icon: KickLogo,
      ariaLabel: `Canal de Kick de ${user.name}`,
    },
  ].filter((link): link is typeof link & { href: string } => !!link.href);

  const positions = user.positions.filter((position) => position.jobTitle || position.enterprise);

  const profileFacts: { label: string; value: string; href?: string }[] = [
    {
      label: 'ubicación',
      value: [user.province, user.countryOfOrigin].filter(Boolean).join(', '),
    },
    { label: 'miembro desde', value: formatDate(user.createdAt) },
    // El contacto lo ven solo los miembros logueados: visitantes anónimos y bots no
    ...(session
      ? [
          {
            label: 'email',
            value: user.email,
            href: user.email ? `mailto:${user.email}` : undefined,
          },
          {
            label: 'teléfono',
            value: user.phoneNumber,
            href: user.phoneNumber ? `tel:${user.phoneNumber}` : undefined,
          },
        ]
      : []),
  ].filter((fact): fact is { label: string; value: string; href?: string } => !!fact.value);

  const firstName = user.name?.split(' ')[0] ?? 'Este usuario';

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        {/* Al subir rápido vuelven las pestañas, no el título, así no se apilan dos barras. */}
        <div className="mt-4">
          <PageTitle
            path={[
              // /usuarios is admin-only; everyone else browses people from /miembros.
              viewerIsAdmin
                ? { label: 'usuarios', href: '/usuarios' }
                : { label: 'miembros', href: '/miembros' },
              { label: user.name ?? 'perfil' },
            ]}
          />
        </div>
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
                  <h1 className="truncate font-mono text-base font-semibold">{user.name}</h1>
                  {isOwnProfile && (
                    <Link
                      href="/perfil"
                      className="flex w-fit items-center gap-1 border border-dashed border-pcnGreen-200 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen"
                    >
                      <Pencil className="size-2.5" />
                      editar perfil
                    </Link>
                  )}
                </div>
              </div>

              {socialLinks.length > 0 && (
                <nav
                  aria-label={`Redes de ${user.name}`}
                  className="flex divide-x divide-pcnGreen-200"
                >
                  {/* Icons only: with several networks the labels no longer fit on one line. */}
                  {socialLinks.map(({ label, href, icon: Icon, ariaLabel }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={ariaLabel}
                      title={label}
                      className="flex min-w-0 flex-1 group items-center justify-center py-2.5 transition-colors hover:bg-pcnGreen/[0.04] hover:shadow-[inset_0_-2px_0_#04f4be]"
                    >
                      <Icon className="size-4 shrink-0 text-pcnGreen-600 transition-[filter] group-hover:text-pcnGreen group-hover:drop-shadow-[0_0_4px_rgba(4,244,190,0.8)]" />
                    </a>
                  ))}
                </nav>
              )}

              {/* Live from GitHub on every visit: streams in when ready, never holds the page. */}
              {user.gitHubUrl && (
                <Suspense fallback={null}>
                  <GitHubContributions gitHubUrl={user.gitHubUrl} />
                </Suspense>
              )}

              {user.slogan && (
                <p className="p-4 text-sm leading-relaxed text-muted-foreground italic">
                  <span className="text-pcnGreen-500 not-italic">&gt; </span>
                  {user.slogan}
                </p>
              )}

              <ProfileBadges
                userId={user.id}
                userName={user.name}
                badges={badges}
                isAdmin={viewerIsAdmin}
              />

              {positions.length > 0 && (
                <div className="p-4">
                  <h2 className="mb-2 font-mono text-xs font-semibold text-muted-foreground">
                    <span className="text-pcnGreen-500">## </span>trabajo
                  </h2>
                  <ul className="space-y-2">
                    {positions.map((position, index) => (
                      <li
                        key={`${position.jobTitle}-${position.enterprise}-${index}`}
                        className="border-l-2 border-pcnGreen-200 pl-3"
                      >
                        {position.jobTitle && (
                          <p className="text-sm leading-snug font-medium">{position.jobTitle}</p>
                        )}
                        {position.enterprise && (
                          <p className="font-mono text-xs text-muted-foreground">
                            <span className="text-pcnGreen-500">@ </span>
                            {position.enterprise}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(user.career || user.studyPlace) && (
                <div className="p-4">
                  <h2 className="mb-2 font-mono text-xs font-semibold text-muted-foreground">
                    <span className="text-pcnGreen-500">## </span>estudios
                  </h2>
                  <div className="border-l-2 border-pcnGreen-200 pl-3">
                    {user.career && (
                      <p className="text-sm leading-snug font-medium">{user.career}</p>
                    )}
                    {user.studyPlace && (
                      <p className="font-mono text-xs text-muted-foreground">
                        <span className="text-pcnGreen-500">@ </span>
                        {user.studyPlace}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {profileFacts.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 p-4 text-xs">
                  {profileFacts.map((fact) => (
                    <div key={`${fact.label}-${fact.value}`} className="contents">
                      <dt className="font-mono text-pcnGreen-500">{fact.label}</dt>
                      <dd className="min-w-0 wrap-break-word">
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
            <ProfileTabsProvider userId={user.id} active={tab}>
              <StickyHeader className="mb-4">
                <ProfileTabs />
              </StickyHeader>
              {/* Keyed by tab so a new tab streams in behind its skeleton instead of holding
                  the page on the previous tab until all of its data is ready. */}
              <Suspense key={`counts-${tab}`}>
                <ProfileCountsLoader userId={user.id} />
              </Suspense>
              <ProfileTabPanel>
                <Suspense key={tab} fallback={<ProfileTabSkeleton tab={tab} />}>
                  <ProfileTabContent
                    tab={tab}
                    userId={user.id}
                    firstName={firstName}
                    session={session}
                    person={{ id: user.id, name: user.name ?? '', image: user.image }}
                  />
                </Suspense>
              </ProfileTabPanel>
            </ProfileTabsProvider>
          </div>
        </div>
      </div>
    </>
  );
}
