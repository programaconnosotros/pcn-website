'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteProject } from '@/actions/projects/delete-project';
import type { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';
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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { ProjectForm } from './project-form';

type Project = Awaited<ReturnType<typeof fetchPublicProjects>>[number];

/** Edit and delete buttons on a project's page: the team edits, the author (or an admin) deletes. */
export function ProjectOwnerActions({
  project,
  currentUser,
  canDelete,
}: {
  project: Project;
  currentUser: { id: string; name: string; isAdmin: boolean };
  canDelete: boolean;
}) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  const handleDelete = () =>
    startDelete(async () => {
      try {
        await deleteProject(project.id);
        toast.success('Proyecto eliminado');
        setIsDeleteOpen(false);
        router.push('/proyectos');
      } catch (error) {
        toast.error(actionErrorMessage(error, 'Error al eliminar el proyecto', true));
      }
    });

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
        <Pencil className="mr-1.5 size-3.5" />
        editar
      </Button>
      {canDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeleteOpen(true)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-1.5 size-3.5" />
          eliminar
        </Button>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={project}
            currentUser={currentUser}
            onSuccess={() => setIsEditOpen(false)}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente &quot;{project.title}&quot;, con sus fotos y
              videos. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
