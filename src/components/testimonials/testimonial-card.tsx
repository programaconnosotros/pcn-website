'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Star } from 'lucide-react';
import { useState } from 'react';
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
import { Testimonial } from '@prisma/client';

type TestimonialCardProps = {
  testimonial: Testimonial & {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  currentUserId?: string;
  isAdmin?: boolean;
  onEdit: (testimonial: Testimonial) => void;
};

export function TestimonialCard({
  testimonial,
  currentUserId,
  isAdmin,
  onEdit,
}: TestimonialCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const canEdit = isAdmin || (currentUserId && testimonial.userId === currentUserId);

  const handleToggleFeatured = async () => {
    setIsToggling(true);
    try {
      await toggleFeatured(testimonial.id);
      toast.success(
        testimonial.featured
          ? 'Testimonio removido de la home page'
          : 'Testimonio agregado a la home page',
      );
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
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el testimonio');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20 flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{testimonial.user.name}</h3>
            {testimonial.featured && (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${testimonial.featured ? 'text-yellow-500' : ''}`}
                onClick={handleToggleFeatured}
                disabled={isToggling}
                title={testimonial.featured ? 'Remover de home page' : 'Mostrar en home page'}
              >
                <Star
                  className={`h-4 w-4 ${testimonial.featured ? 'fill-yellow-400 text-yellow-400' : ''}`}
                />
              </Button>
            )}
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(testimonial)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
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
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{testimonial.body}</p>
      </CardContent>
    </Card>
  );
}

