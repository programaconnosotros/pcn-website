'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ProfileFormData, profileSchema } from '@/schemas/profile-schema';
import { updateProfile } from '@actions/update-profile';
import { User } from '@prisma/client';
import { Form } from '@/components/ui/form';
import { UserProgrammingLanguage, programmingLanguages } from '@/types/programming-language';

export const dynamic = 'force-dynamic';

type LanguageDialogProps = {
  currentLanguage: string;
  setCurrentLanguage: (value: string) => void;
  addLanguage: () => void;
};

const LanguageDialog = ({
  currentLanguage,
  setCurrentLanguage,
  addLanguage,
}: LanguageDialogProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm">
        Agregar lenguaje
      </Button>
    </DialogTrigger>
    <DialogContent className="border-gray-700 bg-gray-900 text-white">
      <DialogHeader>
        <DialogTitle>Agregar lenguaje de programación</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="language">Selecciona un lenguaje</Label>
          <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
            <SelectTrigger className="border-gray-700 bg-gray-800">
              <SelectValue placeholder="Seleccionar lenguaje" />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-800">
              {programmingLanguages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  <div className="flex items-center gap-2">
                    <div className="relative h-5 w-5">
                      <img
                        src={lang.logo || '/placeholder.svg'}
                        alt={lang.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addLanguage} className="w-full">
          Agregar
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

type FormErrorProps = {
  error?: { message?: string };
};

const FormError = ({ error }: FormErrorProps) => {
  if (!error || !error.message) return null;
  return <p className="text-sm text-red-500">{error.message}</p>;
};

export const ProfileForm = ({
  user,
  languages,
}: {
  user: User;
  languages: UserProgrammingLanguage[];
}) => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
      email: user.email ?? '',
      countryOfOrigin: user.countryOfOrigin ?? '',
      xAccountUrl: user.xAccountUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      programmingLanguages: languages || [],
    },
  });

  const [userLanguages, setUserLanguages] = useState<UserProgrammingLanguage[]>(languages || []);
  const [currentLanguage, setCurrentLanguage] = useState('');

  useEffect(() => {
    if (languages) {
      setUserLanguages(languages);
      form.setValue('programmingLanguages', languages);
    }
  }, [languages, form]);

  const addLanguage = () => {
    if (!currentLanguage) return;

    const exists = userLanguages.some((lang) => lang.languageId === currentLanguage);
    if (exists) return;

    const selectedLanguage = programmingLanguages.find((lang) => lang.id === currentLanguage);
    if (!selectedLanguage) return;

    const newLanguage: UserProgrammingLanguage = {
      languageId: currentLanguage,
      color: selectedLanguage.color,
      logo: selectedLanguage.logo,
      experienceLevel: 0,
    };

    const updatedLanguages = [...userLanguages, newLanguage];

    setUserLanguages(updatedLanguages);
    form.setValue('programmingLanguages', updatedLanguages);
    setCurrentLanguage('');
  };

  //function for removing language
  const removeLanguage = (languageId: string) => {
    const updatedLanguages = userLanguages.filter((lang) => lang.languageId !== languageId);

    // Recalculate percentages after removal
    if (updatedLanguages.length > 0) {
      const equalPercentage = Math.floor(100 / updatedLanguages.length);
      const remainder = 100 - equalPercentage * updatedLanguages.length;

      const redistributedLanguages = updatedLanguages.map((lang, index) => ({
        ...lang,
        experienceLevel:
          index === updatedLanguages.length - 1 ? equalPercentage + remainder : equalPercentage,
      }));
      setUserLanguages(redistributedLanguages);
      form.setValue('programmingLanguages', redistributedLanguages);
    } else {
      setUserLanguages([]);
      form.setValue('programmingLanguages', []);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await toast.promise(updateProfile(data), {
        loading: 'Actualizando perfil...',
        success: 'Perfil actualizado correctamente',
        error: 'Error al actualizar el perfil',
      });
    } catch (error) {}
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...form.register('name')} />
            <FormError error={form.formState.errors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" {...form.register('email')} />
            <FormError error={form.formState.errors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryOfOrigin">País de origen</Label>
            <Input id="countryOfOrigin" {...form.register('countryOfOrigin')} />
            <FormError error={form.formState.errors.countryOfOrigin} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xAccountUrl">URL de cuenta de X</Label>
            <Input id="xAccountUrl" type="url" {...form.register('xAccountUrl')} />
            <FormError error={form.formState.errors.xAccountUrl} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">URL de cuenta de LinkedIn</Label>
            <Input id="linkedinUrl" type="url" {...form.register('linkedinUrl')} />
            <FormError error={form.formState.errors.linkedinUrl} />
          </div>
        </div>

        {/* Section for adding programming languages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-6">
            <Label>Lenguajes de programación</Label>
            <LanguageDialog
              currentLanguage={currentLanguage}
              setCurrentLanguage={setCurrentLanguage}
              addLanguage={addLanguage}
            />
          </div>

          {/* View of added languages */}
          {userLanguages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userLanguages.map((userLang) => {
                const language = programmingLanguages.find(
                  (lang) => lang.id === userLang.languageId,
                );
                return (
                  <Badge
                    key={userLang.languageId}
                    className="flex items-center gap-2 px-3 py-2"
                    style={{
                      backgroundColor: language?.color || '#000000',
                      color: getBestTextColor(language?.color || '#000000'),
                    }}
                  >
                    <div className="relative h-4 w-4">
                      <img
                        src={language?.logo || '/placeholder.svg'}
                        alt={language?.name || userLang.languageId}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span>{language?.name}</span>
                    <button
                      onClick={() => removeLanguage(userLang.languageId)}
                      className="ml-1 rounded-full p-1 hover:bg-black/20"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-700 p-6 text-center text-gray-500">
              No has agregado ningún lenguaje de programación todavía
            </div>
          )}
        </div>

        <Button className="w-full sm:w-auto" type="submit">
          Actualizar perfil
        </Button>
      </form>
    </Form>
  );
};

function getBestTextColor(bgColor: string): 'black' | 'white' {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}
