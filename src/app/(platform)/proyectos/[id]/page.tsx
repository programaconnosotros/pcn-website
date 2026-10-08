import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canEditProject, canManageProject } from '@/actions/projects/get-session-user';
import { Github } from '@/components/icons/brand-icons';
import { ProjectMediaGrid } from '@/components/projects/project-media-grid';
import { ProjectMediaUploader } from '@/components/projects/project-media-uploader';
import { ProjectOwnerActions } from '@/components/projects/project-owner-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { optimizedOgImage } from '@/lib/og-image';
import { fetchProject, type ProjectDetail } from '@/lib/projects';
import { MISSING_TAB_TITLE, tabTitle } from '@/lib/tab-title';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ id: string }> };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="p-3">
    <h2 className="mb-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
      <span className="text-pcnGreen-500">{'// '}</span>
      {title}
    </h2>
    {children}
  </section>
);

const displayUrl = (url: string) => {
  try {
    const { host, pathname } = new URL(url);
    return `${host.replace(/^www\./, '')}${pathname === '/' ? '' : pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// "2023 → 2025", "2023 → hoy" o solo el año de cierre si no se cargó el de inicio.
const yearsLabel = ({ startYear, endYear }: ProjectDetail) => {
  if (startYear) return `${startYear} → ${endYear ?? 'hoy'}`;
  if (endYear) return `→ ${endYear}`;
  return null;
};

// Author first, then the collaborators.
const teamOf = (project: ProjectDetail) => [
  ...(project.author
    ? [
        {
          key: project.author.id,
          name: project.author.name,
          role: project.authorRole,
          user: project.author,
        },
      ]
    : []),
  ...project.members.map((member) => ({
    key: member.id,
    name: member.memberName,
    role: member.role,
    user: member.user,
  })),
];

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const project = await fetchProject(id);
  if (!project) return { title: { absolute: MISSING_TAB_TITLE } };

  const title = `${project.title} · proyecto de la comunidad`;
  const description =
    project.description.length > 160
      ? `${project.description.slice(0, 157)}...`
      : project.description;
  const cover = project.media.find((media) => media.kind === 'PHOTO')?.src ?? project.logoUrl;
  const images = cover ? [{ url: optimizedOgImage(cover), alt: project.title }] : undefined;

  return {
    title: tabTitle.cat('proyectos', project.title),
    description,
    openGraph: {
      title,
      description,
      images,
      url: `/proyectos/${project.id}`,
      type: 'article',
      siteName: 'programaConNosotros',
    },
    twitter: { card: 'summary_large_image', title, description, images },
  };
}

export default async function ProjectPage(props: Props) {
  const { id } = await props.params;
  const [project, session] = await Promise.all([fetchProject(id), getCurrentSession()]);
  if (!project) notFound();

  const viewer = session?.user ?? null;
  const canEdit = canEditProject(viewer, project);
  const canDelete = canManageProject(viewer, project);
  const team = teamOf(project);
  const years = yearsLabel(project);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 pt-0">
      <StickyHeader className="mt-4">
        <PageTitle
          path={[{ label: 'proyectos', href: '/proyectos' }, { label: project.title }]}
          action={
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-sm border border-pcnGreen-600 bg-pcnGreen/10 px-2 py-1 font-mono text-xs text-pcnGreen transition-colors hover:bg-pcnGreen/20"
            >
              ./run
              <ArrowUpRight className="size-3" />
            </a>
          }
        />
      </StickyHeader>

      <div className="mb-14 grid border border-pcnGreen-200 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col divide-y divide-pcnGreen-200 max-lg:border-b max-lg:border-pcnGreen-200 lg:border-r lg:border-pcnGreen-200">
          <div className="flex items-start gap-4 p-4">
            <div
              className={cn(
                'flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-[22%]',
                !project.logoUrl && 'bg-white',
              )}
            >
              {project.logoUrl ? (
                <Image
                  src={project.logoUrl}
                  alt={`Logo de ${project.title}`}
                  width={160}
                  height={160}
                  className="h-full w-full scale-[1.06] object-cover"
                />
              ) : (
                <span className="font-mono text-2xl font-bold text-black">
                  {initials(project.title)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="font-mono text-xl leading-snug font-semibold">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
                {project.isOpenSource && (
                  <span className="rounded-sm border border-pcnGreen-600 px-1 leading-4 text-pcnGreen">
                    open-source
                  </span>
                )}
                {years && <span className="tabular-nums">{years}</span>}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {project.description}
              </p>
              {project.techStack.length > 0 && (
                <ul className="flex flex-wrap gap-1 pt-1 font-mono text-[10px]">
                  {project.techStack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-sm border border-pcnGreen-200 px-1.5 leading-5 text-muted-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <Section title={`fotos y videos (${project.media.length})`}>
            {project.media.length > 0 ? (
              <ProjectMediaGrid media={project.media} title={project.title} canEdit={canEdit} />
            ) : (
              <p className="border border-dashed border-pcnGreen-200 py-8 text-center font-mono text-xs text-muted-foreground">
                <span className="text-pcnGreen-500">$ </span>
                {canEdit
                  ? 'todavía no hay fotos ni videos: subí capturas o una demo'
                  : 'todavía no hay fotos ni videos'}
              </p>
            )}
          </Section>
        </div>

        <div className="flex flex-col divide-y divide-pcnGreen-200">
          <Section title="links">
            <ul className="space-y-1.5 font-mono text-xs">
              <li>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 break-all text-pcnGreen-700 hover:text-pcnGreen"
                >
                  <ArrowUpRight className="size-3.5 shrink-0" />
                  {displayUrl(project.url)}
                </a>
              </li>
              {project.repoUrl && (
                <li>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 break-all text-pcnGreen-700 hover:text-pcnGreen"
                  >
                    <Github className="size-3.5 shrink-0" />
                    {displayUrl(project.repoUrl)}
                  </a>
                </li>
              )}
            </ul>
          </Section>

          {team.length > 0 && (
            <Section title={`equipo (${team.length})`}>
              <ul className="space-y-2">
                {team.map((person) => {
                  const content = (
                    <>
                      <Avatar className="size-8 rounded-sm">
                        <AvatarImage src={person.user?.image ?? undefined} alt="" />
                        <AvatarFallback className="rounded-sm bg-pcnGreen-100 text-[10px] text-pcnGreen">
                          {initials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-sm font-semibold transition-colors group-hover/person:text-pcnGreen">
                          {person.name}
                        </span>
                        {person.role && (
                          <span className="block truncate font-mono text-[11px] text-muted-foreground">
                            {person.role}
                          </span>
                        )}
                      </span>
                    </>
                  );
                  return (
                    <li key={person.key}>
                      {person.user ? (
                        <Link
                          href={`/perfil/${person.user.id}`}
                          className="group/person flex min-w-0 items-center gap-2"
                        >
                          {content}
                        </Link>
                      ) : (
                        <span className="flex min-w-0 items-center gap-2">{content}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          {canEdit && viewer && (
            <div className="space-y-3 p-3">
              <ProjectMediaUploader projectId={project.id} count={project.media.length} />
              <ProjectOwnerActions
                project={project}
                currentUser={{
                  id: viewer.id,
                  name: viewer.name,
                  isAdmin: viewer.role === 'ADMIN',
                }}
                canDelete={canDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
