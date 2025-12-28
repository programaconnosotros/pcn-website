'use client';

import { PlusCircle, Loader2 } from 'lucide-react';
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
    try {
      await toast.promise(createAdvise(content), {
        loading: 'Publicando consejo...',
        success: () => {
          form.reset();
          return 'Consejo publicado! 👏';
        },
        error: 'Ocurrió un error al publicar el consejo',
      });
      setDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="pcn">
          <PlusCircle className="mr-2 h-4 w-4" />
          Publicar un consejo
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                'Publicar'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
