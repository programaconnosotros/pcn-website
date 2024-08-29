'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from '@actions/update-profile';
import { User } from '@prisma/generated/zod';

export const ProfileForm = ({ user }: { user: User }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user.name ?? '',
      email: user.email ?? '',
    },
  });

  const onSubmit = (data: { name: string; email: string }) => {
    toast.promise(updateProfile(data), {
      loading: 'Actualizando perfil...',
      success: 'Perfil actualizado correctamente',
      error: 'Error al actualizar el perfil',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name', { required: 'El nombre es requerido' })} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>

        <Input
          id="email"
          type="email"
          {...register('email', { required: 'El email es requerido' })}
        />

        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <Button type="submit">Actualizar perfil</Button>
    </form>
  );
};
