'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { GalleryPhoto } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { createGalleryPhotoSchema, CreateGalleryPhotoInput } from '@/schemas/gallery-photo-schema';
import { createGalleryPhoto } from '@/actions/gallery/create-gallery-photo';
import { updateGalleryPhoto } from '@/actions/gallery/update-gallery-photo';

interface GalleryPhotoFormDialogProps {
  mode: 'create' | 'edit';
  photo?: GalleryPhoto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GalleryPhotoFormDialog({
  mode,
  photo,
  open,
  onOpenChange,
}: GalleryPhotoFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateGalleryPhotoInput>({
    resolver: zodResolver(createGalleryPhotoSchema),
    defaultValues: {
      title: photo?.title ?? '',
      location: photo?.location ?? '',
      takenAt: photo?.takenAt
        ? new Date(photo.takenAt.toISOString().substring(0, 10))
        : undefined,
      imageUrl: photo?.imageUrl ?? '',
    },
  });

  const handleSubmit = async (data: CreateGalleryPhotoInput) => {
    setIsSubmitting(true);
    try {
      if (mode === 'edit' && photo) {
        await updateGalleryPhoto({ ...data, id: photo.id });
        toast.success('Foto actualizada exitosamente');
      } else {
        await createGalleryPhoto(data);
        toast.success('Foto subida exitosamente');
      }
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la foto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Editar foto' : 'Subir foto'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen</FormLabel>
                  <FormControl>
                    <FileUpload
                      folder="gallery"
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Charla de arquitectura en la UTN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="takenAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().substring(0, 10)
                            : (field.value as string) ?? ''
                        }
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tucumán, Argentina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : mode === 'edit' ? (
                  'Guardar cambios'
                ) : (
                  'Subir foto'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
