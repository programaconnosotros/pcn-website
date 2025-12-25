'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Star } from 'lucide-react';
import { deleteTestimonial } from '@/actions/testimonials/delete-testimonial';
import { toggleFeatured } from '@/actions/testimonials/toggle-featured';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TestimonialForm } from '@/components/testimonials/testimonial-form';
import { useRouter } from 'next/navigation';
import { Testimonial } from '@prisma/client';

type TestimonialDetailActionsProps = {
  testimonial: Testimonial;
  canEdit: boolean;
  isAdmin: boolean;
};

export function TestimonialDetailActions({
  testimonial,
  canEdit,
  isAdmin,
}: TestimonialDetailActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleToggleFeatured = async () => {
    setIsToggling(true);
    try {
      await toggleFeatured(testimonial.id);
      toast.success(
        testimonial.featured
          ? 'Testimonio removido de la home page'
          : 'Testimonio agregado a la home page',
      );
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar el testimonio');
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTestimonial(testimonial.id);
      toast.success('Testimonio eliminado exitosamente');
      // Cerrar el diálogo antes de redirigir
      setIsDeleteDialogOpen(false);
      // Redirigir a la página de testimonios
      router.push('/testimonios');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el testimonio');
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    router.refresh();
  };

  if (!canEdit && !isAdmin) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        {isAdmin && (
          <Button
            variant="outline"
            onClick={handleToggleFeatured}
            disabled={isToggling}
            className={testimonial.featured ? 'text-yellow-500 border-yellow-500' : ''}
          >
            <Star
              className={`mr-2 h-4 w-4 ${
                testimonial.featured ? 'fill-yellow-400 text-yellow-400' : ''
              }`}
            />
            {testimonial.featured ? 'Remover de destacados' : 'Destacar'}
          </Button>
        )}
        {canEdit && (
          <>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro de que quieres eliminar este testimonio?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. El testimonio será eliminado permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar testimonio</DialogTitle>
            <DialogDescription>
              Modifica tu testimonio y comparte tu experiencia actualizada.
            </DialogDescription>
          </DialogHeader>
          <TestimonialForm
            defaultValues={{
              body: testimonial.body,
            }}
            testimonialId={testimonial.id}
            onCancel={() => setIsEditDialogOpen(false)}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

