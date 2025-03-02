'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileFormData, profileSchema } from '@/schemas/profile-schema';
import { updateProfile } from '@actions/update-profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/generated/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

export const ProfileForm = ({ user }: { user: User }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
      email: user.email ?? '',
      favoriteProgrammingLanguage: user.favoriteProgrammingLanguage ?? '',
      countryOfOrigin: user.countryOfOrigin ?? '',
      xAccountUrl: user.xAccountUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    toast.promise(updateProfile(data), {
      loading: 'Actualizando perfil...',
      success: 'Perfil actualizado correctamente',
      error: 'Error al actualizar el perfil',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="favoriteProgrammingLanguage">Lenguaje de programación favorito</Label>
          <Input id="favoriteProgrammingLanguage" {...register('favoriteProgrammingLanguage')} />
          {errors.favoriteProgrammingLanguage && (
            <p className="text-sm text-red-500">{errors.favoriteProgrammingLanguage.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="countryOfOrigin">País de origen</Label>
          <Input id="countryOfOrigin" {...register('countryOfOrigin')} />
          {errors.countryOfOrigin && (
            <p className="text-sm text-red-500">{errors.countryOfOrigin.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="xAccountUrl">URL de cuenta de X</Label>
          <Input id="xAccountUrl" type="url" {...register('xAccountUrl')} />
          {errors.xAccountUrl && (
            <p className="text-sm text-red-500">{errors.xAccountUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">URL de cuenta de LinkedIn</Label>
          <Input id="linkedinUrl" type="url" {...register('linkedinUrl')} />
          {errors.linkedinUrl && (
            <p className="text-sm text-red-500">{errors.linkedinUrl.message}</p>
          )}
        </div>
      </div>

      <Button className="w-full sm:w-auto" type="submit">
        Actualizar perfil
      </Button>
    </form>
  );
};
