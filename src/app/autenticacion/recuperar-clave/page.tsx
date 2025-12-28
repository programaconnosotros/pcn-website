'use client';

import { requestPasswordReset } from '@/actions/auth/request-password-reset';
import { verifyResetCode } from '@/actions/auth/verify-reset-code';
import { completePasswordReset } from '@/actions/auth/complete-password-reset';
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
import { ArrowLeft, LogIn, Mail, KeyRound, ShieldCheck, Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Schemas para cada paso
const emailSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

const codeSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código solo puede contener números'),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type Step = 'email' | 'code' | 'password' | 'success';

export default function ResetPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer para el cooldown de reenvío
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(values.email);
      setEmail(values.email);
      setStep('code');
      setResendCooldown(result.waitSeconds || 60);
      toast.success('Código enviado. Revisá tu correo electrónico.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.startsWith('RATE_LIMIT:')) {
        const waitSeconds = parseInt(errorMessage.split(':')[1], 10);
        setResendCooldown(waitSeconds);
        toast.error(`Tenés que esperar ${waitSeconds} segundos antes de pedir otro código.`);
      } else {
        toast.error('Error al enviar el código. Intentá de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    setIsLoading(true);
    try {
      await verifyResetCode(email, values.code);
      setCode(values.code);
      setStep('password');
      toast.success('Código verificado. Ahora podés crear tu nueva contraseña.');
    } catch {
      toast.error('Código inválido o expirado. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsLoading(true);
    try {
      await completePasswordReset(email, code, values.password);
      setStep('success');
      toast.success('Contraseña actualizada exitosamente.');
    } catch {
      toast.error('Error al actualizar la contraseña. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setResendCooldown(result.waitSeconds || 60);
      toast.success('Nuevo código enviado. Revisá tu correo electrónico.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.startsWith('RATE_LIMIT:')) {
        const waitSeconds = parseInt(errorMessage.split(':')[1], 10);
        setResendCooldown(waitSeconds);
        toast.error(`Tenés que esperar ${waitSeconds} segundos antes de reenviar.`);
      } else {
        toast.error('Error al reenviar el código.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'code') {
      setStep('email');
      setEmail('');
    } else if (step === 'password') {
      setStep('code');
      setCode('');
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-[425px]">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.webp" alt="Logo" className="w-10" />

          <div className="space-y-2 text-center">
            <h1 className="mb-4 text-2xl font-semibold tracking-tight">
              {step === 'email' && 'Restablecer contraseña'}
              {step === 'code' && 'Verificar código'}
              {step === 'password' && 'Nueva contraseña'}
              {step === 'success' && '¡Contraseña actualizada!'}
            </h1>

            {/* Indicador de pasos */}
            {step !== 'success' && (
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step === 'email'
                      ? 'bg-pcnPurple text-white dark:bg-pcnGreen dark:text-black'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  1
                </div>
                <div className="h-0.5 w-8 bg-muted" />
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step === 'code'
                      ? 'bg-pcnPurple text-white dark:bg-pcnGreen dark:text-black'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  2
                </div>
                <div className="h-0.5 w-8 bg-muted" />
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step === 'password'
                      ? 'bg-pcnPurple text-white dark:bg-pcnGreen dark:text-black'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  3
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Paso 1: Email */}
        {step === 'email' && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="mt-6 space-y-4">
              <FormField
                control={emailForm.control}
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar código
                    <Mail className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}

        {/* Paso 2: Código */}
        {step === 'code' && (
          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="mt-6 space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Enviamos un código de 6 dígitos a <strong>{email}</strong>
              </p>

              <FormField
                control={codeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de verificación</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    Verificar código
                    <ShieldCheck className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={goBack}
                  className="text-muted-foreground hover:text-primary"
                >
                  ← Cambiar email
                </button>
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-muted-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                </button>
              </div>
            </form>
          </Form>
        )}

        {/* Paso 3: Nueva contraseña */}
        {step === 'password' && (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="mt-6 space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    Actualizar contraseña
                    <KeyRound className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={goBack}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary"
              >
                ← Volver al código
              </button>
            </form>
          </Form>
        )}

        {/* Éxito */}
        {step === 'success' && (
          <div className="mt-6 space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pcnPurple/10 dark:bg-pcnGreen/10">
              <ShieldCheck className="h-8 w-8 text-pcnPurple dark:text-pcnGreen" />
            </div>
            <p className="text-muted-foreground">
              Tu contraseña fue actualizada con éxito. Ya podés iniciar sesión con tu nueva
              contraseña.
            </p>
            <Link href="/autenticacion/iniciar-sesion" className="mt-4 block">
              <Button className="w-full">
                Iniciar sesión
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Enlaces adicionales */}
        {step !== 'success' && (
          <>
            <div className="mt-4 flex flex-row gap-4">
              <Link href="/autenticacion/iniciar-sesion" className="w-full">
                <Button variant="outline" className="w-full">
                  Iniciar sesión
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/autenticacion/registro" className="w-full">
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
          </>
        )}
      </div>
    </div>
  );
}
