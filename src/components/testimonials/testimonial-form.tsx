'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { testimonialSchema, TestimonialFormData } from '@/schemas/testimonial-schema';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createTestimonial } from '@/actions/testimonials/create-testimonial';
import { updateTestimonial } from '@/actions/testimonials/update-testimonial';
import { deleteTestimonial } from '@/actions/testimonials/delete-testimonial';
import { Save, X, Trash2 } from 'lucide-react';
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
import { useState } from 'react';

type TestimonialFormProps = {
  defaultValues?: TestimonialFormData;
  testimonialId?: string;
  onCancel: () => void;
  onSuccess: () => void;
};

export function TestimonialForm({
  defaultValues,
  testimonialId,
  onCancel,
  onSuccess,
}: TestimonialFormProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: defaultValues || {
      body: '',
    },
  });

  const onSubmit = async (values: TestimonialFormData) => {
    const promise = testimonialId
      ? updateTestimonial(testimonialId, values)
      : createTestimonial(values);

    toast.promise(promise, {
      loading: testimonialId ? 'Actualizando testimonio...' : 'Creando testimonio...',
      success: testimonialId
        ? 'Testimonio actualizado exitosamente'
        : 'Testimonio creado exitosamente',
      error: (err) => err.message || 'Error al guardar el testimonio',
    });

    await promise;
    onSuccess();
  };

  const handleDelete = async () => {
    if (!testimonialId) return;

    setIsDeleting(true);
    const promise = deleteTestimonial(testimonialId);

    toast.promise(promise, {
      loading: 'Eliminando testimonio...',
      success: 'Testimonio eliminado exitosamente',
      error: (err) => err.message || 'Error al eliminar el testimonio',
    });

    try {
      await promise;
      onSuccess();
    } catch (error) {
      // Error ya manejado por toast.promise
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testimonio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Comparte tu experiencia con la comunidad..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Mínimo 10 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          {testimonialId && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isDeleting}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente tu testimonio.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="ml-auto flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" variant="pcn">
              <Save className="mr-2 h-4 w-4" />
              {testimonialId ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
