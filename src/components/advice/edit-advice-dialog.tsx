'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { editAdvice } from '@/actions/advice/edit-advice';
import { toast } from 'sonner';
import { adviceSchema, AdviceFormData } from '@/schemas/advice-schema';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

interface EditAdviceDialogProps {
  adviceId: string;
  initialContent: string;
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
}

export const EditAdviceDialog = ({
  adviceId,
  initialContent,
  isOpen,
  onOpenChange,
}: EditAdviceDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AdviceFormData>({
    resolver: zodResolver(adviceSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  const onSubmitEditAdvice = async ({ content }: AdviceFormData) => {
    setIsSubmitting(true);
    // toast.promise devuelve el id del toast: se espera la action para que el botón quede en
    // "editando" mientras corre
    const promise = editAdvice({ id: adviceId, content });
    toast.promise(promise, {
      loading: 'Editando consejo...',
      success: () => {
        form.reset({ content });
        onOpenChange(false);
        return 'Tu consejo fue editado exitosamente.';
      },
      error: (error) => actionErrorMessage(error, 'Ocurrió un error al editar el consejo'),
    });
    try {
      await promise;
    } catch {
      // El toast ya avisó del error
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
          <form onSubmit={form.handleSubmit(onSubmitEditAdvice)} className="space-y-8">
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

            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              loadingText="guardando..."
            >
              guardarCambios();
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
