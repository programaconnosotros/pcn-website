'use client';
import { signIn } from '@/actions/auth/sign-in';
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
import { LogIn, UserPlus, SquareAsterisk, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useSearchParams } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(4, 'La contraseña debe tener al menos 4 caracteres'),
});

export default function SignInPage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const passwordParam = searchParams.get('password') || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailParam,
      password: passwordParam,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await toast.promise(signIn(values), {
        loading: 'Ingresando...',
        success: 'Bienvenido! 👋',
        error: 'No pudimos iniciar la sesión.',
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-[425px]">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.webp" alt="Logo" className="w-10" />

          <div className="space-y-2 text-center">
            <h1 className="mb-8 text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>

                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Ingresar <LogIn className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>

        <div className="mt-4 flex flex-row gap-4">
          <Link href="/auth/sign-up" className="w-full">
            <Button variant="outline" className="w-full">
              Crear cuenta
              <UserPlus className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Link href="/auth/reset-password" className="w-full">
            <Button variant="outline" className="w-full">
              Cambiar contraseña
              <SquareAsterisk className="ml-2 h-4 w-4" />
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
