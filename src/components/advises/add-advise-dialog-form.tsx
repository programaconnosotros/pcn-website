'use client';

import { createAdvise } from "@/actions/advises/create-advise";
import { AdviseFormData, adviseSchema } from "@/schemas/advise-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface DialogFormProps {
  setDialogOpen(data: boolean): void;
}

export const AddAdviseDialogForm = ({ setDialogOpen }: DialogFormProps) => {
  const form = useForm<AdviseFormData>({
    resolver: zodResolver(adviseSchema),
    defaultValues: {
      content: '',
    },
  });

  function onSubmit({ content }: AdviseFormData) {
    toast.promise(createAdvise(content), {
      loading: 'Creando consejo...',
      success: () => {
        form.reset();
        return 'Tu consejo fue publicado exitosamente. Gracias por compartir!';
      },
      error: 'Ocurrió un error al publicar el consejo',
    });

    setDialogOpen(false);
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
          Publicar
        </Button>
      </form>
    </Form>
  )
}