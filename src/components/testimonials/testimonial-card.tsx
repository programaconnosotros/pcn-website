'use client';

import { ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
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
  onEdit: (_testimonial: Testimonial) => void;
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
    <div
      className={cn(
        ruledCellClassName,
        'flex flex-col gap-2 p-3',
        isOwnTestimonial && 'bg-pcnGreen-50 shadow-[inset_2px_0_0_0_#04f4be]',
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7 rounded-sm">
          <AvatarImage src={testimonial.user.image || undefined} alt={testimonial.user.name} />
          <AvatarFallback className="rounded-sm text-[10px]">
            {testimonial.user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Link
          href={`/perfil/${testimonial.user.id}`}
          className="truncate font-mono text-sm font-semibold transition-colors hover:text-pcnGreen"
        >
          {testimonial.user.name}
        </Link>
        {isOwnTestimonial && (
          <span className="shrink-0 font-mono text-[10px] text-pcnGreen">(vos)</span>
        )}
        {isAdmin && testimonial.featured && (
          <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
        )}
        {(isAdmin || canEdit) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 shrink-0">
                <MoreVertical className="h-3.5 w-3.5" />
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

      <p className="text-xs leading-relaxed text-muted-foreground">
        <span className="font-mono text-pcnGreen-500">&gt; </span>
        {testimonial.body}
      </p>

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
    </div>
  );
}
