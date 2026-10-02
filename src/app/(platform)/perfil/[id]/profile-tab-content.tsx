import type { ComponentProps } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AdviseCard } from '@/components/advises/advise-card';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ProfileArticles } from '@/components/profile/profile-articles';
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
  getProfileAdvises,
  getProfileArticles,
  getProfileContributions,
  getProfileConversations,
  getProfileCounts,
  getProfileEvents,
  getProfileIdentities,
  getProfilePhotos,
  getProfileProjects,
  getProfileTalks,
} from './profile-data';

// How many items of each section the overview shows before "ver todo".
const PREVIEW = 2;
const ARTICLES_PREVIEW = 3;
const CONVERSATIONS_PREVIEW = 4;
const PHOTOS_PREVIEW = 6;

type Session = ComponentProps<typeof AdviseCard>['session'];

type ProfileTalk = Awaited<ReturnType<typeof getProfileTalks>>[number];

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

const AdviseRows = ({
  advises,
  session,
}: {
  advises: Awaited<ReturnType<typeof getProfileAdvises>>;
  session: Session;
}) => (
  <RuledGrid className="grid-cols-1">
    {advises.map((advise) => (
      <AdviseCard key={advise.id} session={session} advise={advise} />
    ))}
  </RuledGrid>
);

/** Streams the tab counts into the tab bar once every section has loaded. */
export async function ProfileCountsLoader({ userId }: { userId: string }) {
  return <ProfileTabCounts counts={await getProfileCounts(userId)} />;
}

type TabProps = { userId: string; firstName: string; session: Session };

async function OverviewTab({ userId, firstName, session }: TabProps) {
  const [projects, advises, talks, articles, events, photos, conversations, github] =
    await Promise.all([
      getProfileProjects(userId),
      getProfileAdvises(userId),
      getProfileTalks(userId),
      getProfileArticles(userId),
      getProfileEvents(userId),
      getProfilePhotos(userId),
      getProfileConversations(userId),
      getProfileContributions(userId),
    ]);
  const { contributions } = github;
  const tabHref = (tab: ProfileTab) => profileTabHref(userId, tab);
  const hasActivity =
    projects.length +
      advises.length +
      talks.length +
      articles.length +
      events.length +
      photos.length +
      conversations.length +
      contributions.length >
    0;

  return (
    <div className="mb-14 space-y-8">
      <RuledGrid
        className={cn(
          'grid-cols-2',
          contributions.length > 0 ? 'sm:grid-cols-4' : 'sm:grid-cols-5',
        )}
      >
        <ProfileStat label="proyectos" value={projects.length} href={tabHref('proyectos')} />
        <ProfileStat label="consejos" value={advises.length} href={tabHref('consejos')} />
        <ProfileStat label="charlas" value={talks.length} href={tabHref('charlas')} />
        <ProfileStat
          label="artículos publicados"
          value={articles.length}
          href={tabHref('articulos')}
        />
        <ProfileStat
          label="conversaciones"
          value={conversations.length}
          href={tabHref('conversaciones')}
        />
        {contributions.length > 0 && (
          <>
            <ProfileStat
              label="PRs a pcn"
              value={github.mergedPrs}
              href={tabHref('contribuciones')}
            />
            <ProfileStat
              label="commits a pcn"
              value={github.commits.toLocaleString('es-AR')}
              href={tabHref('contribuciones')}
            />
            <ProfileStat
              label="líneas a pcn"
              value={github.linesAdded === null ? '—' : github.linesAdded.toLocaleString('es-AR')}
              href={tabHref('contribuciones')}
            />
          </>
        )}
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
            href={talks.length > PREVIEW ? tabHref('charlas') : undefined}
          />
          <TalkRows talks={talks.slice(0, PREVIEW)} />
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <SectionHeading
            label="artículos"
            count={articles.length}
            href={articles.length > ARTICLES_PREVIEW ? tabHref('articulos') : undefined}
          />
          <ProfileArticles articles={articles.slice(0, ARTICLES_PREVIEW)} />
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
            href={photos.length > PHOTOS_PREVIEW ? tabHref('fotos') : undefined}
          />
          <PhotoGrid photos={photos.slice(0, PHOTOS_PREVIEW)} />
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

      {advises.length > 0 && (
        <section>
          <SectionHeading
            label="consejos"
            count={advises.length}
            href={advises.length > PREVIEW ? tabHref('consejos') : undefined}
          />
          <AdviseRows advises={advises.slice(0, PREVIEW)} session={session} />
        </section>
      )}
    </div>
  );
}

/** The selected tab's content; each tab only waits for the data it shows. */
export async function ProfileTabContent({ tab, ...props }: TabProps & { tab: ProfileTab }) {
  const { userId, firstName, session } = props;

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
      const advises = await getProfileAdvises(userId);
      content = advises.length ? (
        <AdviseRows advises={advises} session={session} />
      ) : (
        <EmptyLine>{firstName} todavía no compartió ningún consejo.</EmptyLine>
      );
      break;
    }
    case 'charlas': {
      const talks = await getProfileTalks(userId);
      content = talks.length ? (
        <TalkRows talks={talks} />
      ) : (
        <EmptyLine>{firstName} todavía no dio ninguna charla.</EmptyLine>
      );
      break;
    }
    case 'articulos': {
      const articles = await getProfileArticles(userId);
      content = articles.length ? (
        <ProfileArticles articles={articles} />
      ) : (
        <EmptyLine>{firstName} todavía no publicó ningún artículo.</EmptyLine>
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
        <ContributionStats contributions={github.contributions} totals={github.totals} />
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
