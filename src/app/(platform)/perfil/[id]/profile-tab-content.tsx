import type { ComponentProps } from 'react';
import type { Person } from '@/components/people/person-link';
import Link from 'next/link';
import { AdviceCard } from '@/components/advice/advice-card';
import type { Consejo } from '@/lib/consejos';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ProfileArticles } from '@/components/profile/profile-articles';
import { ProfileTalks } from '@/components/profile/profile-talks';
import { ProfileTabCounts } from '@/components/profile/profile-tab-nav';
import { profileTabHref } from '@/components/profile/profile-tabs';
import {
  ContributionStats,
  ConversationRows,
  EmptyLine,
  OrganizedEventRows,
  PhotoGrid,
  ProfileStat,
  ProjectRows,
  SectionHeading,
  type ProfileTab,
} from '@/components/profile/profile-sections';
import {
  getProfileAdvice,
  getProfileArticles,
  getProfileContributions,
  getProfileConversations,
  getProfileCounts,
  getProfileEvents,
  getProfileIdentities,
  getProfilePhotos,
  getProfileProjects,
  getProfileSetups,
  getProfileTalks,
  getProfileVideos,
  getProfileCourses,
} from './profile-data';
import { VideoGrid } from '@/components/videos/video-grid';
import { SetupTile } from '@/components/setups/setup-tile';

// How many items of each section the overview shows before "ver todo".
const PREVIEW = 2;
const ARTICLES_PREVIEW = 3;
const CONVERSATIONS_PREVIEW = 4;
const SETUPS_PREVIEW = 3;
// One full row of talk cells.
const TALKS_PREVIEW = 3;
// The photos preview is a fixed 3-column grid: it shows up to two full rows and never leaves a
// row half empty when the person has more photos than fit.
const PHOTOS_PREVIEW_COLUMNS = 3;
const PHOTOS_PREVIEW = 2 * PHOTOS_PREVIEW_COLUMNS;

/** How many photos the preview shows: as many full rows as possible (all of them if under one row). */
const photosPreviewCount = (total: number) =>
  total < PHOTOS_PREVIEW_COLUMNS
    ? total
    : Math.min(PHOTOS_PREVIEW, total - (total % PHOTOS_PREVIEW_COLUMNS));

type Session = ComponentProps<typeof AdviceCard>['session'];

type ProfileSetup = Awaited<ReturnType<typeof getProfileSetups>>[number];

const SetupGrid = ({ setups, session }: { setups: ProfileSetup[]; session: Session }) => (
  <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
    {setups.map((setup) => (
      <SetupTile
        key={setup.id}
        setup={setup}
        viewerId={session?.user?.id ?? null}
        showAuthor={false}
      />
    ))}
  </RuledGrid>
);

const AdviceRows = ({ advice, session }: { advice: Consejo[]; session: Session }) => (
  <RuledGrid className="grid-cols-1 md:grid-cols-2">
    {advice.map((consejo) => (
      <AdviceCard key={consejo.id} session={session} consejo={consejo} showAuthor={false} />
    ))}
  </RuledGrid>
);

/** Streams the tab counts into the tab bar once every section has loaded. */
export async function ProfileCountsLoader({ userId }: { userId: string }) {
  return <ProfileTabCounts counts={await getProfileCounts(userId)} />;
}

type TabProps = {
  userId: string;
  firstName: string;
  session: Session;
  /** The profile's owner, credited as the writer of their articles. */
  person: Person;
};

async function OverviewTab({ userId, firstName, session, person }: TabProps) {
  const [projects, advice, talks, articles, events, photos, setups, conversations, github] =
    await Promise.all([
      getProfileProjects(userId),
      getProfileAdvice(userId),
      getProfileTalks(userId),
      getProfileArticles(userId),
      getProfileEvents(userId),
      getProfilePhotos(userId),
      getProfileSetups(userId),
      getProfileConversations(userId),
      getProfileContributions(userId),
    ]);
  const { contributions } = github;
  const tabHref = (tab: ProfileTab) => profileTabHref(userId, tab);
  const previewPhotos = photos.slice(0, photosPreviewCount(photos.length));
  const hasActivity =
    projects.length +
      advice.length +
      talks.length +
      articles.length +
      events.length +
      photos.length +
      setups.length +
      conversations.length +
      contributions.length >
    0;

  return (
    <div className="mb-14 space-y-8">
      {/* PCN contributions (PRs, commits, lines) are only in their own section below. */}
      <RuledGrid className="grid-cols-2 sm:grid-cols-5">
        <ProfileStat label="proyectos" value={projects.length} href={tabHref('proyectos')} />
        <ProfileStat label="consejos" value={advice.length} href={tabHref('consejos')} />
        <ProfileStat label="charlas" value={talks.length} href={tabHref('charlas')} />
        <ProfileStat label="artículos" value={articles.length} href={tabHref('articulos')} />
        <ProfileStat
          label="conversaciones"
          value={conversations.length}
          href={tabHref('conversaciones')}
        />
      </RuledGrid>

      {!hasActivity && (
        <EmptyLine>{firstName} todavía no tiene actividad en la comunidad.</EmptyLine>
      )}

      {projects.length > 0 && (
        <section>
          <SectionHeading
            label="proyectos"
            count={projects.length}
            href={projects.length > PREVIEW ? tabHref('proyectos') : undefined}
          />
          <ProjectRows projects={projects.slice(0, PREVIEW)} />
        </section>
      )}

      {contributions.length > 0 && (
        <section>
          <SectionHeading label="contribuciones a pcn" href={tabHref('contribuciones')} />
          <ContributionStats contributions={contributions} totals={github.totals} />
        </section>
      )}

      {talks.length > 0 && (
        <section>
          <SectionHeading
            label="charlas"
            count={talks.length}
            href={talks.length > TALKS_PREVIEW ? tabHref('charlas') : undefined}
          />
          <ProfileTalks talks={talks.slice(0, TALKS_PREVIEW)} />
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <SectionHeading
            label="artículos"
            count={articles.length}
            href={articles.length > ARTICLES_PREVIEW ? tabHref('articulos') : undefined}
          />
          <ProfileArticles articles={articles.slice(0, ARTICLES_PREVIEW)} writer={person} />
        </section>
      )}

      {events.length > 0 && (
        <section>
          <SectionHeading
            label="eventos organizados"
            count={events.length}
            href={events.length > PREVIEW ? tabHref('eventos') : undefined}
          />
          <OrganizedEventRows events={events.slice(0, PREVIEW)} />
        </section>
      )}

      {photos.length > 0 && (
        <section>
          <SectionHeading
            label="fotos y videos"
            count={photos.length}
            href={photos.length > previewPhotos.length ? tabHref('fotos') : undefined}
          />
          {/* Same 3 columns at every width (tailwind-merge drops the default breakpoints). */}
          <PhotoGrid
            photos={previewPhotos}
            className="grid-cols-3 lg:grid-cols-3 2xl:grid-cols-3"
          />
        </section>
      )}

      {setups.length > 0 && (
        <section>
          <SectionHeading
            label="setups"
            count={setups.length}
            href={setups.length > SETUPS_PREVIEW ? tabHref('setups') : undefined}
          />
          <SetupGrid setups={setups.slice(0, SETUPS_PREVIEW)} session={session} />
        </section>
      )}

      {conversations.length > 0 && (
        <section>
          <SectionHeading
            label="conversaciones"
            count={conversations.length}
            href={
              conversations.length > CONVERSATIONS_PREVIEW ? tabHref('conversaciones') : undefined
            }
          />
          <ConversationRows conversations={conversations.slice(0, CONVERSATIONS_PREVIEW)} />
        </section>
      )}

      {advice.length > 0 && (
        <section>
          <SectionHeading
            label="consejos"
            count={advice.length}
            href={advice.length > PREVIEW ? tabHref('consejos') : undefined}
          />
          <AdviceRows advice={advice.slice(0, PREVIEW)} session={session} />
        </section>
      )}
    </div>
  );
}

/** The selected tab's content; each tab only waits for the data it shows. */
export async function ProfileTabContent({ tab, ...props }: TabProps & { tab: ProfileTab }) {
  const { userId, firstName, session, person } = props;

  if (tab === 'resumen') return <OverviewTab {...props} />;

  let content: React.ReactNode;
  switch (tab) {
    case 'proyectos': {
      const projects = await getProfileProjects(userId);
      content = projects.length ? (
        <ProjectRows projects={projects} />
      ) : (
        <EmptyLine>{firstName} todavía no participó en ningún proyecto.</EmptyLine>
      );
      break;
    }
    case 'consejos': {
      const advice = await getProfileAdvice(userId);
      content = advice.length ? (
        <AdviceRows advice={advice} session={session} />
      ) : (
        <EmptyLine>{firstName} todavía no compartió ningún consejo.</EmptyLine>
      );
      break;
    }
    case 'charlas': {
      const talks = await getProfileTalks(userId);
      content = talks.length ? (
        <ProfileTalks talks={talks} />
      ) : (
        <EmptyLine>{firstName} todavía no dio ninguna charla.</EmptyLine>
      );
      break;
    }
    case 'articulos': {
      const articles = await getProfileArticles(userId);
      content = articles.length ? (
        <ProfileArticles articles={articles} writer={person} />
      ) : (
        <EmptyLine>{firstName} todavía no publicó ningún artículo.</EmptyLine>
      );
      break;
    }
    case 'videos': {
      const videos = await getProfileVideos(userId);
      content = videos.length ? (
        <VideoGrid videos={videos} toolbar={false} />
      ) : (
        <EmptyLine>
          {firstName} todavía no aparece en ningún video de{' '}
          <Link href="/videos" className="text-pcnGreen hover:underline">
            /videos
          </Link>
          .
        </EmptyLine>
      );
      break;
    }
    case 'cursos': {
      const courses = await getProfileCourses(userId);
      content = courses.length ? (
        <RuledGrid className="grid-cols-1">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/cursos/${course.id}`}
              className={cn(ruledCellClassName, 'group flex flex-col gap-1 p-3')}
            >
              <span className="flex items-center gap-2 font-mono text-sm">
                <span className="font-semibold group-hover:text-pcnGreen">{course.name}</span>
                {course.isMadeByCommunity && (
                  <span className="rounded-sm border border-pcnGreen-400 px-1 text-[10px] text-pcnGreen">
                    pcn
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                <span className="text-pcnGreen-500">@ </span>
                {course.date.toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  timeZone: 'UTC',
                })}
                {course.hours ? ` · ${course.hours}h` : ''}
              </span>
              <span className="line-clamp-2 text-xs text-muted-foreground">
                {course.description}
              </span>
            </Link>
          ))}
        </RuledGrid>
      ) : (
        <EmptyLine>
          {firstName} todavía no dio ningún curso de{' '}
          <Link href="/cursos" className="text-pcnGreen hover:underline">
            /cursos
          </Link>
          .
        </EmptyLine>
      );
      break;
    }
    case 'eventos': {
      const events = await getProfileEvents(userId);
      content = events.length ? (
        <OrganizedEventRows events={events} />
      ) : (
        <EmptyLine>{firstName} todavía no organizó ningún evento.</EmptyLine>
      );
      break;
    }
    case 'fotos': {
      const photos = await getProfilePhotos(userId);
      content = photos.length ? (
        <PhotoGrid photos={photos} />
      ) : (
        <EmptyLine>
          {firstName} todavía no aparece en ninguna foto ni video de la{' '}
          <Link href="/galeria" className="text-pcnGreen hover:underline">
            galería
          </Link>
          .
        </EmptyLine>
      );
      break;
    }
    case 'setups': {
      const setups = await getProfileSetups(userId);
      content = setups.length ? (
        <SetupGrid setups={setups} session={session} />
      ) : (
        <EmptyLine>
          {firstName} todavía no compartió su{' '}
          <Link href="/setups" className="text-pcnGreen hover:underline">
            setup
          </Link>
          .
        </EmptyLine>
      );
      break;
    }
    case 'conversaciones': {
      const [conversations, identities] = await Promise.all([
        getProfileConversations(userId),
        getProfileIdentities(userId),
      ]);
      content = conversations.length ? (
        <ConversationRows conversations={conversations} />
      ) : (
        <EmptyLine>
          {identities.whatsapp.length > 0
            ? `${firstName} no aparece en las conversaciones destacadas.`
            : 'Todavía no vinculamos este perfil con el grupo de WhatsApp.'}
        </EmptyLine>
      );
      break;
    }
    case 'contribuciones': {
      const github = await getProfileContributions(userId);
      content = github.contributions.length ? (
        <ContributionStats contributions={github.contributions} totals={github.totals} detailed />
      ) : (
        <EmptyLine>
          {github.linked
            ? 'No pudimos traer las contribuciones de GitHub, probá más tarde.'
            : `Todavía no vinculamos a ${firstName} con una cuenta que contribuyó al sitio.`}
        </EmptyLine>
      );
      break;
    }
  }

  return <div className="mb-14">{content}</div>;
}
