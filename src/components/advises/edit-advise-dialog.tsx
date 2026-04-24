'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { editAdvise } from '@/actions/advises/edit-advise';
import { toast } from 'sonner';
import { adviseSchema, AdviseFormData } from '@/schemas/advise-schema';

interface EditAdviseDialogProps {
  adviseId: string;
  initialContent: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditAdviseDialog = ({
  adviseId,
  initialContent,
  isOpen,
  onOpenChange,
}: EditAdviseDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AdviseFormData>({
    resolver: zodResolver(adviseSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  const onSubmitEditAdvise = async ({ content }: AdviseFormData) => {
    setIsSubmitting(true);
    try {
      await toast.promise(editAdvise({ id: adviseId, content }), {
        loading: 'Editando consejo...',
        success: () => {
          form.reset({ content });
          onOpenChange(false);
          return 'Tu consejo fue editado exitosamente.';
        },
        error: 'Ocurrió un error al editar el consejo',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar consejo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitEditAdvise)} className="space-y-8">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
