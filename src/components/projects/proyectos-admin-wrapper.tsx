'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Edit, ExternalLink, MoreVertical, Plus, Rocket, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Heading2 } from '@/components/ui/heading-2';
import { ProjectForm } from './project-form';
import { deleteProject } from '@/actions/projects/delete-project';
import { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';

type ProjectWithMembers = Awaited<ReturnType<typeof fetchPublicProjects>>[number];

interface Props {
  projects: ProjectWithMembers[];
  isAdmin: boolean;
}

export function ProyectosAdminWrapper({ projects, isAdmin }: Props) {
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
      <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex w-full flex-row items-center justify-between">
          <Heading2 className="m-0 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
              <Rocket className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
            </div>
            <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Proyectos</span>
          </Heading2>

          {isAdmin && (
            <Button variant="pcn" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo proyecto
            </Button>
          )}
        </div>
      </div>

      {projects.length === 0 && (
        <p className="text-muted-foreground">Todavía no hay proyectos publicados.</p>
      )}

      <div className="my-5 ml-0 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="flex flex-col overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800"
          >
            <div className="flex flex-col md:flex-row">
              {/* Logo */}
              {project.logoUrl && (
                <div className="relative flex shrink-0 items-center justify-center bg-muted/30 md:w-40">
                  <div className="relative h-32 w-32 md:aspect-square md:h-auto md:w-full">
                    <Image
                      src={project.logoUrl}
                      alt={`Logo de ${project.title}`}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 128px, 160px"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-1 flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
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
                </CardHeader>

                <CardContent className="flex-1 space-y-3">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {project.description}
                  </p>

                  {/* Tech stack badges */}
                  {project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Members */}
                  {project.members.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-pcnPurple dark:text-pcnGreen" />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        {project.members.map((member) =>
                          member.user ? (
                            <Link
                              key={member.id}
                              href={`/perfil/${member.user.id}`}
                              className="text-sm text-muted-foreground hover:underline"
                            >
                              {member.memberName}
                            </Link>
                          ) : (
                            <p key={member.id} className="text-sm text-muted-foreground">
                              {member.memberName}
                            </p>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="mt-auto">
                  <Link href={project.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="flex items-center gap-2">
                      Visitar proyecto
                      <ExternalLink className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
                    </Button>
                  </Link>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSuccess={() => setShowCreate(false)}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              project={editingProject}
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
