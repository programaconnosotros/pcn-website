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

type CreateFormProps = {
  mode: "create";
}

type EditFormProps = {
  mode: "edit",
  adviseId: string;
  isOpen: boolean;
  initialContent: string;
}

export type AdviseFormProps = (EditFormProps | CreateFormProps) & {
  setDialogOpen: (open: boolean) => void;
}

export const AdviseForm = (props: AdviseFormProps) => {

  const form = useForm<AdviseFormData>({
    resolver: zodResolver(adviseSchema),
    defaultValues: {
      content: props.mode === "edit" ? props.initialContent : '',
    },
  });

  const onSubmit = ({ content }: AdviseFormData) => {
    if (props.mode === "create") {
      toast.promise(createAdvise(content), {
        loading: 'Creando consejo...',
        success: () => {
          form.reset();
          return 'Tu consejo fue publicado exitosamente. Gracias por compartir!';
        },
        error: 'Ocurrió un error al publicar el consejo',
      });
    } else {
      toast.promise(editAdvise({ id: props.adviseId, content }), {
        loading: 'Editando consejo...',
        success: () => {
          form.reset({content});
          return 'Tu consejo fue editado exitosamente.';
        },
        error: 'Ocurrió un error al editar el consejo',
      });
    }

    props.setDialogOpen(false);
  }

  return (
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

        <Button type="submit" className="w-full">
          {props.mode === "edit" ? "Guardar Cambios" : "Publicar"}
        </Button>
      </form>
    </Form>
  )
}