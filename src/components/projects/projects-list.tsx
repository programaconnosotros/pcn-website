'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ArrowUpRight, Edit, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ProjectForm } from './project-form';
import { deleteProject } from '@/actions/projects/delete-project';
import { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';

type ProjectWithMembers = Awaited<ReturnType<typeof fetchPublicProjects>>[number];

type ProjectPerson = { id: string; name: string } | null;

interface Props {
  projects: ProjectWithMembers[];
  currentUser: { id: string; name: string; isAdmin: boolean } | null;
}

function ProfileLink({ user, name }: { user: ProjectPerson; name: string }) {
  if (!user) return <>{name}</>;
  return (
    <Link href={`/perfil/${user.id}`} className="hover:text-pcnGreen hover:underline">
      {name}
    </Link>
  );
}

export function ProjectsList({ projects, currentUser }: Props) {
  const canManage = (project: ProjectWithMembers) =>
    !!currentUser && (currentUser.isAdmin || project.authorId === currentUser.id);

  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithMembers | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithMembers | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await deleteProject(deletingProject.id);
      toast.success('Proyecto eliminado');
      setDeletingProject(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el proyecto');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4">
      <StickyHeader>
        <div className="flex items-start justify-between gap-4">
          <PageTitle
            path="proyectos"
            className="flex-1"
            meta={`${projects.length} proyectos de la comunidad`}
          />

          {currentUser ? (
            <Button variant="pcn" size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Publicar proyecto
            </Button>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/autenticacion/iniciar-sesion">Iniciá sesión para publicar</Link>
            </Button>
          )}
        </div>
      </StickyHeader>

      {projects.length === 0 && (
        <p className="font-mono text-sm text-muted-foreground">
          Todavía no hay proyectos publicados.
        </p>
      )}

      <RuledGrid className="mb-14 grid-cols-1 xl:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className={cn(ruledCellClassName, 'group flex gap-3 p-3')}>
            {project.logoUrl && (
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-sm bg-white">
                <Image
                  src={project.logoUrl}
                  alt={`Logo de ${project.title}`}
                  fill
                  className="object-contain p-1"
                  sizes="36px"
                />
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2 font-mono text-sm">
                <Link
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-1 font-semibold hover:text-pcnGreen"
                >
                  <h2 className="truncate">{project.title}</h2>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                </Link>

                {canManage(project) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingProject(project)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingProject(project)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {project.description}
              </p>

              {project.techStack.length > 0 && (
                <p className="truncate font-mono text-[11px] text-muted-foreground/70">
                  <span className="text-pcnGreen-500"># </span>
                  {project.techStack.join(' · ')}
                </p>
              )}

              {(project.author || project.members.length > 0) && (
                <p className="font-mono text-[11px] text-muted-foreground/70">
                  <span className="text-pcnGreen-500">@ </span>
                  {project.author && (
                    <span className="text-muted-foreground">
                      <ProfileLink user={project.author} name={project.author.name} />
                    </span>
                  )}
                  {project.author && project.members.length > 0 && ' con '}
                  {project.members.map((member, index) => (
                    <span key={member.id}>
                      {index > 0 && ', '}
                      <ProfileLink user={member.user} name={member.memberName} />
                    </span>
                  ))}
                </p>
              )}
            </div>
          </div>
        ))}
      </RuledGrid>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <ProjectForm
              currentUser={currentUser}
              onSuccess={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
          </DialogHeader>
          {editingProject && currentUser && (
            <ProjectForm
              project={editingProject}
              currentUser={currentUser}
              onSuccess={() => setEditingProject(null)}
              onCancel={() => setEditingProject(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente &quot;{deletingProject?.title}&quot;. No se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
