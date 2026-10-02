'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { User, UserPosition } from '@prisma/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UserProgrammingLanguage, programmingLanguages } from '@/types/programming-language';
import { LanguageChip } from './language-chip';
import { ARGENTINA_PROVINCES } from '@/lib/validations/auth-schemas';
import { Briefcase, GraduationCap, Link2, User as UserIcon, Code } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { PositionsField } from './positions-field';

// Lista de países
const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Cuba',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro',
];

type FormErrorProps = {
  error?: { message?: string };
};

const FormError = ({ error }: FormErrorProps) => {
  if (!error || !error.message) return null;
  return <p className="text-sm text-red-500">{error.message}</p>;
};

// Los puestos guardados; si todavía no hay ninguno, el cargo viejo o una fila vacía para arrancar.
const initialPositions = (user: User & { positions: UserPosition[] }) => {
  if (user.positions.length > 0) {
    return user.positions.map((p) => ({ jobTitle: p.jobTitle, enterprise: p.enterprise ?? '' }));
  }
  return [{ jobTitle: user.jobTitle ?? '', enterprise: user.enterprise ?? '' }];
};

export const ProfileForm = ({
  user,
  languages,
}: {
  user: User & { positions: UserPosition[] };
  languages: UserProgrammingLanguage[];
}) => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      image: user.image ?? '',
      countryOfOrigin: user.countryOfOrigin ?? '',
      province: user.province ?? '',
      xAccountUrl: user.xAccountUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      gitHubUrl: user.gitHubUrl ?? '',
      instagramUrl: user.instagramUrl ?? '',
      slogan: user.slogan ?? '',
      positions: initialPositions(user),
      career: user.career ?? '',
      studyPlace: user.studyPlace ?? '',
      programmingLanguages: languages || [],
    },
  });

  const [userLanguages, setUserLanguages] = useState<UserProgrammingLanguage[]>(languages || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchCountry = form.watch('countryOfOrigin');

  useEffect(() => {
    if (languages) {
      setUserLanguages(languages);
      form.setValue('programmingLanguages', languages);
    }
  }, [languages, form]);

  const addLanguage = (languageId: string) => {
    if (userLanguages.some((lang) => lang.languageId === languageId)) return;

    const selectedLanguage = programmingLanguages.find((lang) => lang.id === languageId);
    if (!selectedLanguage) return;

    const newLanguage: UserProgrammingLanguage = {
      languageId,
      color: selectedLanguage.color,
      logo: selectedLanguage.ext,
      experienceLevel: 0,
    };

    const updatedLanguages = [...userLanguages, newLanguage];

    setUserLanguages(updatedLanguages);
    form.setValue('programmingLanguages', updatedLanguages);
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
    setIsSubmitting(true);
    try {
      await toast.promise(updateProfile(data), {
        loading: 'Actualizando perfil...',
        success: 'Perfil actualizado correctamente',
        error: 'Error al actualizar el perfil',
      });
    } catch {
      // Error manejado por toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-6">
        <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <div className="space-y-3 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-mono text-sm font-semibold">
              <UserIcon className="h-4 w-4 text-pcnGreen" />
              Información personal
            </h3>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto de perfil</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value || ''}
                        onChange={field.onChange}
                        folder="profiles"
                        maxSize={5 * 1024 * 1024} // 5MB
                        variant="profile"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                <Label htmlFor="phoneNumber">Celular</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  {...form.register('phoneNumber')}
                />
                <FormError error={form.formState.errors.phoneNumber} />
              </div>

              <FormField
                control={form.control}
                name="countryOfOrigin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== 'Argentina') {
                          form.setValue('province', '');
                        }
                      }}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchCountry === 'Argentina' && (
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona tu provincia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ARGENTINA_PROVINCES.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="space-y-2">
                <Label htmlFor="slogan">Slogan o frase personal</Label>
                <Textarea
                  id="slogan"
                  placeholder="Ej: Desarrollador apasionado por el código"
                  {...form.register('slogan')}
                  rows={3}
                />
                <FormError error={form.formState.errors.slogan} />
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <h3 className="flex items-center gap-2 font-mono text-sm font-semibold">
              <Briefcase className="h-4 w-4 text-pcnGreen" />
              Información profesional
              <Badge variant="secondary" className="text-xs font-normal">
                opcional
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              ¿Dónde trabajás hoy? Si estás en más de un lugar, agregalos todos.
            </p>
            <PositionsField />
          </div>

          <div className="space-y-3 p-4">
            <h3 className="flex items-center gap-2 font-mono text-sm font-semibold">
              <GraduationCap className="h-4 w-4 text-pcnGreen" />
              Información académica
              <Badge variant="secondary" className="text-xs font-normal">
                opcional
              </Badge>
            </h3>
            <div className="space-y-2">
              <Label htmlFor="career">¿Qué estudias o estudiaste?</Label>
              <Input
                id="career"
                placeholder="Ej: Ingeniería en Sistemas"
                {...form.register('career')}
              />
              <FormError error={form.formState.errors.career} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studyPlace">¿Dónde o cómo estudias/estudiaste?</Label>
              <Input
                id="studyPlace"
                placeholder="Ej: Universidad Nacional de Tucumán / Autodidacta"
                {...form.register('studyPlace')}
              />
              <FormError error={form.formState.errors.studyPlace} />
            </div>
          </div>

          <div className="space-y-3 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-mono text-sm font-semibold">
              <Link2 className="h-4 w-4 text-pcnGreen" />
              Enlaces
              <Badge variant="secondary" className="text-xs font-normal">
                opcional
              </Badge>
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="xAccountUrl" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  URL de cuenta de X
                </Label>
                <Input
                  id="xAccountUrl"
                  type="url"
                  placeholder="https://x.com/tu-usuario"
                  {...form.register('xAccountUrl', {
                    setValueAs: (v) => (v === '' ? null : v),
                  })}
                  value={form.watch('xAccountUrl') || ''}
                />
                <FormError error={form.formState.errors.xAccountUrl} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  URL de cuenta de LinkedIn
                </Label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/tu-usuario"
                  {...form.register('linkedinUrl', {
                    setValueAs: (v) => (v === '' ? null : v),
                  })}
                  value={form.watch('linkedinUrl') || ''}
                />
                <FormError error={form.formState.errors.linkedinUrl} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gitHubUrl" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  URL de cuenta de GitHub
                </Label>
                <Input
                  id="gitHubUrl"
                  type="url"
                  placeholder="https://github.com/tu-usuario"
                  {...form.register('gitHubUrl', {
                    setValueAs: (v) => (v === '' ? null : v),
                  })}
                  value={form.watch('gitHubUrl') || ''}
                />
                <FormError error={form.formState.errors.gitHubUrl} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  URL de cuenta de Instagram
                </Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  placeholder="https://instagram.com/tu-usuario"
                  {...form.register('instagramUrl', {
                    setValueAs: (v) => (v === '' ? null : v),
                  })}
                  value={form.watch('instagramUrl') || ''}
                />
                <FormError error={form.formState.errors.instagramUrl} />
              </div>
            </div>
          </div>

          {/* Section for adding programming languages */}
          <div className="space-y-3 p-4">
            <div className="mb-3 flex items-center justify-between gap-6">
              <h3 className="flex items-center gap-2 font-mono text-sm font-semibold">
                <Code className="h-4 w-4 text-pcnGreen" />
                Lenguajes de programación
              </h3>
              <span className="font-mono text-[11px] text-muted-foreground">
                {userLanguages.length} marcados
              </span>
            </div>

            {/* Every language as a token: click to mark or unmark it */}
            <div className="flex flex-wrap gap-1.5">
              {programmingLanguages.map((lang) => {
                const selected = userLanguages.some((ul) => ul.languageId === lang.id);
                return (
                  <LanguageChip
                    key={lang.id}
                    languageId={lang.id}
                    selectable
                    selected={selected}
                    onToggle={() => (selected ? removeLanguage(lang.id) : addLanguage(lang.id))}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-8 pb-4">
          <Button type="submit" variant="default" loading={isSubmitting} loadingText="guardando...">
            guardarCambios();
          </Button>
        </div>
      </form>
    </Form>
  );
};
