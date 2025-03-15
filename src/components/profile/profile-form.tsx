'use client';

import { useState, useEffect } from 'react';
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
import { PieChart } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ProfileFormData, profileSchema } from '@/schemas/profile-schema';
import { updateProfile } from '@actions/update-profile';
import { User } from '@prisma/client';
import { LanguagePieChart } from './language-pie-chart';
import { set } from 'date-fns';
import { Form } from '@/components/ui/form';

const programmingLanguages = [
  { id: 'javascript', name: 'JavaScript', logo: '/logos/javascript.svg', color: '#F7DF1E' },
  { id: 'typescript', name: 'TypeScript', logo: '/logos/typescript.svg', color: '#3178C6' },
  { id: 'python', name: 'Python', logo: '/logos/python.svg', color: '#3776AB' },
  { id: 'java', name: 'Java', logo: '/logos/java.svg', color: '#007396' },
  { id: 'csharp', name: 'C#', logo: '/logos/csharp.svg', color: '#239120' },
  { id: 'cpp', name: 'C++', logo: '/logos/cpp.svg', color: '#00599C' },
  { id: 'php', name: 'PHP', logo: '/logos/php.svg', color: '#777BB4' },
  { id: 'ruby', name: 'Ruby', logo: '/logos/ruby.svg', color: '#CC342D' },
  { id: 'swift', name: 'Swift', logo: '/logos/swift.svg', color: '#FA7343' },
  { id: 'go', name: 'Go', logo: '/logos/go.svg', color: '#00ADD8' },
  { id: 'rust', name: 'Rust', logo: '/logos/rust.svg', color: '#000000' },
  { id: 'kotlin', name: 'Kotlin', logo: '/logos/kotlin.svg', color: '#7F52FF' },
];

export const ProfileForm = ({ user }: { user: User }) => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
      email: user.email ?? '',
      countryOfOrigin: user.countryOfOrigin ?? '',
      xAccountUrl: user.xAccountUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      programmingLanguages: [],
    },
  });

  //state for handling user languages and experience level
  const [userLanguages, setUserLanguages] = useState<
    Array<{
      languageId: string;
      experienceLevel: number;
    }>
  >([]);

  //state for language experience level added actualy
  const [currentLanguage, setCurrentLanguage] = useState('');

  //function for adding language and experience level
  const addLanguage = () => {
    if (!currentLanguage) return;

    // Check if language already exists
    const exists = userLanguages.some((lang) => lang.languageId === currentLanguage);
    if (exists) return;

    // Add new language and recalculate percentages for all languages
    const updatedLanguages = [
      ...userLanguages,
      { languageId: currentLanguage, experienceLevel: 0 },
    ];
    const equalPercentage = Math.floor(100 / updatedLanguages.length);
    const remainder = 100 - equalPercentage * updatedLanguages.length;

    const redistributedLanguages = updatedLanguages.map((lang, index) => ({
      ...lang,
      // Add the remainder to the last language to ensure total is 100%
      experienceLevel:
        index === updatedLanguages.length - 1 ? equalPercentage + remainder : equalPercentage,
    }));

    setUserLanguages(redistributedLanguages);
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
    } else {
      setUserLanguages([]);
    }
  };

  // Preparamos los datos del gráfico
  const chartData = userLanguages.map((userLang) => {
    const language = programmingLanguages.find((l) => l.id === userLang.languageId);
    return {
      name: language?.name || userLang.languageId,
      value: userLang.experienceLevel,
      color: language?.color || '#000000',
    };
  });

  // Cargar los lenguajes del usuario cuando el componente se monta
  useEffect(() => {
    const loadUserLanguages = async () => {
      try {
        const response = await fetch(`/api/user/${user.id}/languages`);
        if (response.ok) {
          const languages = await response.json();
          setUserLanguages(languages);
        }
      } catch (error) {
        console.error('Error loading user languages:', error);
      }
    };

    loadUserLanguages();
  }, [user.id]);

  const onSubmit = async (data: ProfileFormData) => {
    const formData = {
      ...data,
      programmingLanguages: userLanguages,
    };

    try {
      await toast.promise(updateProfile(formData), {
        loading: 'Actualizando perfil...',
        success: 'Perfil actualizado correctamente',
        error: 'Error al actualizar el perfil',
      });
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryOfOrigin">País de origen</Label>
            <Input id="countryOfOrigin" {...form.register('countryOfOrigin')} />
            {form.formState.errors.countryOfOrigin && (
              <p className="text-sm text-red-500">
                {form.formState.errors.countryOfOrigin.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="xAccountUrl">URL de cuenta de X</Label>
            <Input id="xAccountUrl" type="url" {...form.register('xAccountUrl')} />
            {form.formState.errors.xAccountUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.xAccountUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">URL de cuenta de LinkedIn</Label>
            <Input id="linkedinUrl" type="url" {...form.register('linkedinUrl')} />
            {form.formState.errors.linkedinUrl && (
              <p className="text-sm text-red-500">{form.formState.errors.linkedinUrl.message}</p>
            )}
          </div>
        </div>

        {/* Sección para agregar lenguajes de programación */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Lenguajes de programación</Label>
            {/* Se utiliza un diálogo para seleccionar y agregar un lenguaje */}
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
                                <Image
                                  src={lang.logo || '/placeholder.svg'}
                                  alt={lang.name}
                                  fill
                                  className="object-contain"
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
          </div>

          {/* Visualización de lenguajes agregados */}
          {userLanguages.length > 0 ? (
            <div className="mt-4 space-y-4">
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
                        backgroundColor: language?.color,
                        color: getBestTextColor(language?.color || '#000000'),
                      }}
                    >
                      <div className="relative h-4 w-4">
                        <Image
                          src={language?.logo || '/placeholder.svg'}
                          alt={language?.name || userLang.languageId}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span>
                        {language?.name} ({userLang.experienceLevel}%)
                      </span>
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

              {/* Se muestra el gráfico solo si hay lenguajes agregados */}
              <div className="mt-6 rounded-lg bg-gray-900 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-medium">
                  <PieChart className="h-5 w-5" />
                  Distribución de lenguajes
                </h3>
                <div className="h-64">
                  <LanguagePieChart data={chartData} />
                </div>
              </div>
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

function getBestTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'black' : 'white';
}
