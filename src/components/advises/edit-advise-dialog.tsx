'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
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
  const form = useForm<AdviseFormData>({
    resolver: zodResolver(adviseSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  const onSubmitEditAdvise = ({ content }: AdviseFormData) => {
    toast.promise(editAdvise({ id: adviseId, content }), {
      loading: 'Editando consejo...',
      success: () => {
        form.reset({ content });
        onOpenChange(false);
        return 'Tu consejo fue editado exitosamente.';
      },
      error: 'Ocurrió un error al editar el consejo',
    });
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

            <Button type="submit" className="w-full">
              Guardar cambios
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
