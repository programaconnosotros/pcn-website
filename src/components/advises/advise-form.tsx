'use client';

import { createAdvise } from "@/actions/advises/create-advise";
import { AdviseFormData, adviseSchema } from "@/schemas/advise-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { editAdvise } from "@/actions/advises/edit-advise";
import { EditAdviseDialogProps } from "./edit-advise-dialog";

interface AdviceFormProps {
  setDialogOpen?: (data: boolean) => void;
  editAdviseOptions?: EditAdviseDialogProps;
}

export const AdviseForm = ({ setDialogOpen, editAdviseOptions }: AdviceFormProps) => {

  const adviseId = editAdviseOptions?.adviseId ?? '';
  const initialContent = editAdviseOptions?.initialContent ?? '';
  const onOpenChange = editAdviseOptions ? editAdviseOptions.onOpenChange : () => { };

  const form = useForm<AdviseFormData>({
    resolver: zodResolver(adviseSchema),
    defaultValues: {
      content: initialContent,
    },
  });

  const onSubmitAddAdvise = ({ content }: AdviseFormData) => {
    toast.promise(createAdvise(content), {
      loading: 'Creando consejo...',
      success: () => {
        form.reset();
        return 'Tu consejo fue publicado exitosamente. Gracias por compartir!';
      },
      error: 'Ocurrió un error al publicar el consejo',
    });

    if (setDialogOpen) setDialogOpen(false);
  }

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(editAdviseOptions ? onSubmitEditAdvise : onSubmitAddAdvise)} className="space-y-8">
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

        <Button type="submit" className="w-full">
          {editAdviseOptions ? "Guardar Cambios" : "Publicar"}
        </Button>
      </form>
    </Form>
  )
}