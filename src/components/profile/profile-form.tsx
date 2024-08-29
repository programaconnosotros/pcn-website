'use client';

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from '@actions/update-profile';
import { User } from '@prisma/generated/zod';
import Image from 'next/image';

export const ProfileForm = ({ user }: { user: User }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col-reverse gap-6 sm:flex-row">
        <div className="w-full space-y-4 sm:w-2/3 md:w-1/2 lg:w-1/3">
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
        </div>

        <div className="flex-shrink-0 self-center sm:ml-auto sm:self-start">
          {user.image ? (
            <Image
              src={user.image}
              alt="Foto de perfil"
              width={120}
              height={120}
              className="rounded-full"
            />
          ) : (
            <div className="w-30 h-30 flex items-center justify-center rounded-full bg-gray-200">
              <span className="text-4xl text-gray-500">?</span>
            </div>
          )}
        </div>
      </div>

      <Button className="w-full sm:w-auto" type="submit">
        Actualizar perfil
      </Button>
    </form>
  );
};
