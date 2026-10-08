import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { canEditProject } from '@/actions/projects/get-session-user';
import { ProjectMediaUploader } from '@/components/projects/project-media-uploader';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { fetchProject } from '@/lib/projects';
import { PROJECT_MEDIA_LIMIT } from '@/schemas/project-media-schema';

export const metadata: Metadata = { title: 'scp * ~/proyectos' };

type Props = { params: Promise<{ id: string }> };

// Where the team adds photos and videos to a project: a list of files with retries, like the
// gallery's uploader, instead of a button that loses the pick when something fails.
export default async function UploadProjectMediaPage(props: Props) {
  const { id } = await props.params;
  const [project, session] = await Promise.all([fetchProject(id), getCurrentSession()]);
  if (!project) notFound();
  if (!session) {
    redirect(
      `/autenticacion/iniciar-sesion?redirect=${encodeURIComponent(`/proyectos/${id}/subir`)}`,
    );
  }
  if (!canEditProject(session.user, project)) redirect(`/proyectos/${id}`);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col p-4 pt-0">
      <StickyHeader className="mt-4">
        <PageTitle
          path={[
            { label: 'proyectos', href: '/proyectos' },
            { label: project.title, href: `/proyectos/${project.id}` },
            { label: 'subir' },
          ]}
          meta={`${project.media.length}/${PROJECT_MEDIA_LIMIT} fotos y videos`}
        />
      </StickyHeader>

      <ProjectMediaUploader projectId={project.id} count={project.media.length} />
    </div>
  );
}
