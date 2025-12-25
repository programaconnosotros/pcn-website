'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Star, MoreVertical } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Testimonial } from '@prisma/client';

type TestimonialCardProps = {
  testimonial: Testimonial & {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
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
  const isOwnTestimonial = currentUserId && testimonial.userId === currentUserId;
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
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el testimonio');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className={`flex flex-col border-2 transition-all duration-300 hover:scale-[1.02] ${
        isOwnTestimonial
          ? 'border-pcnPurple bg-gradient-to-br from-white to-pcnPurple/5 shadow-lg shadow-pcnPurple/20 dark:border-pcnGreen dark:from-neutral-900 dark:to-pcnGreen/10 dark:shadow-pcnGreen/20'
          : 'border-transparent bg-gradient-to-br from-white to-gray-50 hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={testimonial.user.image || undefined} alt={testimonial.user.name} />
              <AvatarFallback className="text-sm">
                {testimonial.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <Link
                href={`/perfil/${testimonial.user.id}`}
                className="text-lg font-semibold transition-colors hover:text-pcnPurple hover:underline dark:hover:text-pcnGreen"
              >
                {testimonial.user.name}
              </Link>
              {isAdmin && testimonial.featured && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
          </div>
          {(isAdmin || canEdit) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem
                    onClick={handleToggleFeatured}
                    disabled={isToggling}
                    className={testimonial.featured ? 'text-yellow-500' : ''}
                  >
                    <Star
                      className={`mr-2 h-4 w-4 ${
                        testimonial.featured ? 'fill-yellow-400 text-yellow-400' : ''
                      }`}
                    />
                    <span>
                      {testimonial.featured ? 'Remover de home page' : 'Mostrar en home page'}
                    </span>
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(testimonial)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{testimonial.body}</p>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Estás seguro de que quieres eliminar este testimonio?
            </AlertDialogTitle>
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
    </Card>
  );
}
