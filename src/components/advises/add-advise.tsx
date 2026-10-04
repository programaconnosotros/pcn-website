'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useState } from 'react';
import { createAdvise } from '@actions/advises/create-advise';
import { adviseSchema, AdviseFormData } from '@/schemas/advise-schema';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

export const AddAdvise = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AdviseFormData>({
    resolver: zodResolver(adviseSchema),
    defaultValues: {
      content: '',
    },
  });

  async function onSubmit({ content }: AdviseFormData) {
    setIsSubmitting(true);
    // toast.promise devuelve el id del toast, no la promesa: se espera la action en sí, así el
    // diálogo queda abierto (con lo escrito) si falla
    const promise = createAdvise(content);
    toast.promise(promise, {
      loading: 'Publicando consejo...',
      success: () => {
        form.reset();
        return 'Consejo publicado! 👏';
      },
      error: (error) => actionErrorMessage(error, 'Ocurrió un error al publicar el consejo'),
    });
    try {
      await promise;
      setDialogOpen(false);
    } catch {
      // El toast ya avisó del error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="pcn" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          publicarConsejo();
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publicar un consejo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Escribí acá tu consejo..." {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              loadingText="publicando..."
            >
              publicar();
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
