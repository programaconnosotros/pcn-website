'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { LogIn, UserPlus, SquareAsterisk, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export default function ResetPasswordPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) =>
    toast.promise(Promise.resolve(), {
      loading: 'Generando nueva contraseña...',
      success: 'Si el usuario existe, vas a recibir una nueva contraseña.',
      error: 'No se pudo procesar la solicitud.',
    });

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-[425px]">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.png" alt="Logo" className="w-10" />

          <div className="space-y-2 text-center">
            <h1 className="mb-8 text-2xl font-semibold tracking-tight">Restablecer contraseña</h1>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>

                  <FormControl>
                    <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Generar nueva contraseña
              <SquareAsterisk className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>

        <div className="mt-4 flex flex-row gap-4">
          <Link href="/auth/sign-in" className="w-full">
            <Button variant="outline" className="w-full">
              Iniciar sesión
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/auth/sign-up" className="w-full">
            <Button variant="outline" className="w-full">
              Crear cuenta
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Link
          href="/"
          className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
