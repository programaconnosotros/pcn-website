'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UserProgrammingLanguage, programmingLanguages } from '@/types/programming-language';
import { LanguageCoinsContainer } from './language-coins-container';
import { ARGENTINA_PROVINCES } from '@/lib/validations/auth-schemas';
import { Briefcase, GraduationCap, Link2, User as UserIcon, Code, Loader2 } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';

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
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Agregar lenguaje de programación</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="language">Selecciona un lenguaje</Label>
          <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar lenguaje" />
            </SelectTrigger>
            <SelectContent>
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
      image: user.image ?? '',
      countryOfOrigin: user.countryOfOrigin ?? '',
      province: user.province ?? '',
      xAccountUrl: user.xAccountUrl ?? '',
      linkedinUrl: user.linkedinUrl ?? '',
      gitHubUrl: user.gitHubUrl ?? '',
      slogan: user.slogan ?? '',
      jobTitle: user.jobTitle ?? '',
      enterprise: user.enterprise ?? '',
      career: user.career ?? '',
      studyPlace: user.studyPlace ?? '',
      programmingLanguages: languages || [],
    },
  });

  const [userLanguages, setUserLanguages] = useState<UserProgrammingLanguage[]>(languages || []);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchCountry = form.watch('countryOfOrigin');

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
    setIsSubmitting(true);
    try {
      await toast.promise(updateProfile(data), {
        loading: 'Actualizando perfil...',
        success: 'Perfil actualizado correctamente',
        error: 'Error al actualizar el perfil',
      });
    } catch (error) {
      // Error manejado por toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-6">
        <div className="space-y-4 rounded-md border p-4 transition-all duration-300 hover:border-pcnPurple hover:shadow-[0_0_15px_rgba(80,56,189,0.3)] dark:hover:border-white/20 dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <UserIcon className="h-5 w-5" />
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

        <div className="space-y-4 rounded-md border p-4 transition-all duration-300 hover:border-pcnPurple hover:shadow-[0_0_15px_rgba(80,56,189,0.3)] dark:hover:border-white/20 dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="h-5 w-5" />
            Información profesional
            <Badge variant="secondary" className="text-xs font-normal">
              opcional
            </Badge>
          </h3>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">¿De qué trabajas?</Label>
            <Input
              id="jobTitle"
              placeholder="Ej: Desarrollador Frontend"
              {...form.register('jobTitle')}
            />
            <FormError error={form.formState.errors.jobTitle} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="enterprise">¿En qué empresa trabajas?</Label>
            <Input id="enterprise" placeholder="Ej: Google" {...form.register('enterprise')} />
            <FormError error={form.formState.errors.enterprise} />
          </div>
        </div>

        <div className="space-y-4 rounded-md border p-4 transition-all duration-300 hover:border-pcnPurple hover:shadow-[0_0_15px_rgba(80,56,189,0.3)] dark:hover:border-white/20 dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <GraduationCap className="h-5 w-5" />
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

        <div className="space-y-4 rounded-md border p-4 transition-all duration-300 hover:border-pcnPurple hover:shadow-[0_0_15px_rgba(80,56,189,0.3)] dark:hover:border-white/20 dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Link2 className="h-5 w-5" />
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
          </div>
        </div>

        {/* Section for adding programming languages */}
        <div className="space-y-4 rounded-md border p-4 transition-all duration-300 hover:border-pcnPurple hover:shadow-[0_0_15px_rgba(80,56,189,0.3)] dark:hover:border-white/20 dark:hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <div className="mb-4 flex items-center justify-between gap-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Code className="h-5 w-5" />
              Lenguajes de programación
            </h3>
            <LanguageDialog
              currentLanguage={currentLanguage}
              setCurrentLanguage={setCurrentLanguage}
              addLanguage={addLanguage}
            />
          </div>

          {/* View of added languages using the LanguageCoinsContainer */}
          <LanguageCoinsContainer
            languages={userLanguages}
            editable={true}
            onRemoveLanguage={removeLanguage}
          />
        </div>

        <div className="mb-8 pb-4">
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
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
