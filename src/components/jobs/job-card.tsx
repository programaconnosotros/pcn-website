'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, ExternalLink, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { JobOffers } from '@prisma/client';
import { JobForm } from './job-form';
import { DeleteJobDialog } from './delete-job-dialog';
import { updateJob } from '@/actions/jobs/update-job';
import { JobFormData } from '@/schemas/job-schema';
import { toast } from 'sonner';

interface JobCardProps {
  job: JobOffers;
  isAdmin?: boolean;
}

export function JobCard({ job, isAdmin = false }: JobCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const initial = job.company?.charAt(0).toUpperCase() || '?';

  const handleUpdate = async (data: JobFormData) => {
    setIsUpdating(true);
    try {
      await updateJob(job.id, data);
      toast.success('Oferta actualizada exitosamente');
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar la oferta');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="flex h-full w-full flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 rounded-xl">
                <AvatarFallback className="rounded-xl bg-pcnPurple text-lg font-semibold text-white dark:bg-pcnGreen dark:text-black">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <h3 className="text-lg font-semibold leading-tight">{job.title}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!job.available && (
                <Badge variant="secondary" className="text-xs">
                  Cubierta
                </Badge>
              )}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <p className="mb-4 flex-1 text-sm text-muted-foreground">{job.description}</p>

          <div className="mb-4 flex flex-wrap gap-2">
            {job.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-pcnPurple dark:text-pcnGreen" />
              <span>{job.location}</span>
            </div>
          </div>

          <Button className="w-full" disabled={!job.available}>
            {job.available ? (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Visitar
              </>
            ) : (
              'Posición cubierta'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar oferta de trabajo</DialogTitle>
            <DialogDescription>
              Modifica los datos de la oferta de trabajo.
            </DialogDescription>
          </DialogHeader>
          <JobForm
            defaultValues={job}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditOpen(false)}
            isLoading={isUpdating}
            submitLabel="Actualizar"
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de eliminación */}
      <DeleteJobDialog
        jobId={job.id}
        jobTitle={job.title}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
