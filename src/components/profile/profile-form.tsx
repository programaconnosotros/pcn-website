'use client';

import { useEffect, useState, type ReactNode } from 'react';
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
import { FileUpload } from '@/components/ui/file-upload';
import { PositionsField } from './positions-field';
import { cn } from '@/lib/utils';

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

const SLOGAN_MAX = 160;
const BAR_WIDTH = 20;

const LINKS = [
  { name: 'gitHubUrl', prefix: 'github', placeholder: 'https://github.com/tu-usuario' },
  { name: 'linkedinUrl', prefix: 'linkedin', placeholder: 'https://linkedin.com/in/tu-usuario' },
  { name: 'xAccountUrl', prefix: 'x', placeholder: 'https://x.com/tu-usuario' },
  { name: 'instagramUrl', prefix: 'instagram', placeholder: 'https://instagram.com/tu-usuario' },
] as const;

type FormErrorProps = {
  error?: { message?: string };
};

const FormError = ({ error }: FormErrorProps) => {
  if (!error || !error.message) return null;
  return <p className="text-xs text-red-500">{error.message}</p>;
};

// Un campo suelto: label de terminal arriba, el input y su error abajo.
const Field = ({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn('group/field min-w-0 space-y-1.5', className)}>
    <div className="flex items-baseline justify-between gap-2">
      <Label htmlFor={id}>{label}</Label>
      {hint && <span className="font-mono text-[10px] text-muted-foreground">{hint}</span>}
    </div>
    {children}
  </div>
);

// Una sección del formulario: cabecera `[01] nombre` con su progreso y el contenido debajo.
const Section = ({
  id,
  index,
  title,
  description,
  done,
  total,
  children,
}: {
  id: string;
  index: number;
  title: string;
  description?: string;
  done: number;
  total: number;
  children: ReactNode;
}) => (
  <section id={id} className="scroll-mt-4">
    <header className="flex items-center justify-between gap-4 border-b border-pcnGreen-200 bg-pcnGreen/[0.03] px-4 py-2 font-mono">
      <h2 className="flex min-w-0 items-baseline gap-2 text-sm font-semibold">
        <span className="text-pcnGreen-500">[{String(index).padStart(2, '0')}]</span>
        {title}
        {description && (
          <span className="truncate text-[11px] font-normal text-muted-foreground max-sm:hidden">
            {'// '}
            {description}
          </span>
        )}
      </h2>
      <span
        className={cn(
          'shrink-0 text-[11px] tabular-nums',
          done === total ? 'text-glow text-pcnGreen' : 'text-muted-foreground',
        )}
      >
        {done}/{total}
      </span>
    </header>
    <div className="p-4">{children}</div>
  </section>
);

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
  const values = form.watch();
  const dirtyCount = Object.keys(form.formState.dirtyFields).length;

  useEffect(() => {
    if (languages) {
      setUserLanguages(languages);
      form.setValue('programmingLanguages', languages);
    }
  }, [languages, form]);

  const setLanguages = (updated: UserProgrammingLanguage[]) => {
    setUserLanguages(updated);
    form.setValue('programmingLanguages', updated, { shouldDirty: true });
  };

  const addLanguage = (languageId: string) => {
    if (userLanguages.some((lang) => lang.languageId === languageId)) return;

    const selectedLanguage = programmingLanguages.find((lang) => lang.id === languageId);
    if (!selectedLanguage) return;

    setLanguages([
      ...userLanguages,
      {
        languageId,
        color: selectedLanguage.color,
        logo: selectedLanguage.ext,
        experienceLevel: 0,
      },
    ]);
  };

  //function for removing language
  const removeLanguage = (languageId: string) => {
    const updatedLanguages = userLanguages.filter((lang) => lang.languageId !== languageId);

    // Recalculate percentages after removal
    if (updatedLanguages.length > 0) {
      const equalPercentage = Math.floor(100 / updatedLanguages.length);
      const remainder = 100 - equalPercentage * updatedLanguages.length;

      setLanguages(
        updatedLanguages.map((lang, index) => ({
          ...lang,
          experienceLevel:
            index === updatedLanguages.length - 1 ? equalPercentage + remainder : equalPercentage,
        })),
      );
    } else {
      setLanguages([]);
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
      // Lo guardado pasa a ser el nuevo punto de partida: el contador de cambios vuelve a cero.
      form.reset(form.getValues());
    } catch {
      // Error manejado por toast
    } finally {
      setIsSubmitting(false);
    }
  };

  // ⌘S / Ctrl+S guarda desde cualquier campo.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (!isSubmitting) form.handleSubmit(onSubmit)();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const filledPositions = values.positions.filter((p) => p.jobTitle.trim());
  const filledLinks = LINKS.filter((link) => values[link.name]);

  // Qué tiene cargado cada sección, para los contadores y la barra de completitud.
  const sections = [
    {
      id: 'identidad',
      title: 'identidad',
      checks: [!!values.image, !!values.name, !!values.countryOfOrigin, !!values.slogan],
    },
    { id: 'trabajo', title: 'trabajo', checks: [filledPositions.length > 0] },
    { id: 'estudios', title: 'estudios', checks: [!!values.career, !!values.studyPlace] },
    { id: 'enlaces', title: 'enlaces', checks: LINKS.map((link) => !!values[link.name]) },
    { id: 'stack', title: 'stack', checks: [userLanguages.length > 0] },
  ].map((section) => ({
    ...section,
    done: section.checks.filter(Boolean).length,
    total: section.checks.length,
  }));
  const done = sections.reduce((sum, s) => sum + s.done, 0);
  const total = sections.reduce((sum, s) => sum + s.total, 0);
  const percent = Math.round((done / total) * 100);
  const filledBar = Math.round((percent / 100) * BAR_WIDTH);
  const progress = (id: string) => {
    const { done, total } = sections.find((s) => s.id === id)!;
    return { done, total };
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4 pb-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start"
      >
        {/* Columna izquierda: cómo se ve el perfil, cuánto falta y el índice de secciones */}
        <aside className="divide-y divide-pcnGreen-200 border border-pcnGreen-200 lg:sticky lg:top-4">
          <div className="flex items-center justify-between px-4 py-2 font-mono text-[11px] text-muted-foreground">
            <span>
              <span className="text-pcnGreen-500">$</span> whoami
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-pcnGreen" />
              live
            </span>
          </div>

          <div className="flex gap-4 p-4 lg:flex-col">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="shrink-0 space-y-0">
                  <FormLabel className="sr-only">Foto de perfil</FormLabel>
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

            <div className="min-w-0 space-y-1.5 font-mono">
              <p className="text-glow truncate text-base font-semibold">
                {values.name || 'sin nombre'}
              </p>
              {filledPositions.length > 0 ? (
                <ul className="space-y-0.5 text-[11px] text-muted-foreground">
                  {filledPositions.map((p, i) => (
                    <li key={i} className="truncate">
                      {p.jobTitle}
                      {p.enterprise && <span className="text-pcnGreen-500"> @ {p.enterprise}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-muted-foreground/60">sin puestos cargados</p>
              )}
              {values.slogan && (
                <p className="line-clamp-2 text-[11px] italic text-muted-foreground">
                  <span className="not-italic text-pcnGreen-500">&gt; </span>
                  {values.slogan}
                </p>
              )}
              {filledLinks.length > 0 && (
                <p className="flex flex-wrap gap-x-2 text-[11px] text-pcnGreen-600">
                  {filledLinks.map((link) => (
                    <span key={link.name}>{link.prefix}↗</span>
                  ))}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1 p-4 font-mono text-[11px]">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>perfil.completo</span>
              <span className={cn('tabular-nums', percent === 100 && 'text-glow text-pcnGreen')}>
                {percent}%
              </span>
            </div>
            <p aria-hidden className="whitespace-pre tracking-tighter">
              <span className="text-pcnGreen-500">[</span>
              <span className="text-glow text-pcnGreen">{'█'.repeat(filledBar)}</span>
              <span className="text-pcnGreen-200">{'░'.repeat(BAR_WIDTH - filledBar)}</span>
              <span className="text-pcnGreen-500">]</span>
            </p>
          </div>

          <nav aria-label="Secciones" className="hidden py-2 font-mono text-xs lg:block">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 px-4 py-1 text-muted-foreground transition-colors hover:bg-pcnGreen/[0.04] hover:text-pcnGreen"
              >
                <span className="text-pcnGreen-500/70">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex-1">{s.title}</span>
                <span
                  className={cn(
                    'tabular-nums',
                    s.done === s.total ? 'text-pcnGreen' : 'text-muted-foreground/60',
                  )}
                >
                  {s.done === s.total ? '✓' : `${s.done}/${s.total}`}
                </span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Columna derecha: las secciones del formulario y la barra para guardar */}
        <div className="min-w-0 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <Section
            id="identidad"
            index={1}
            title="identidad"
            description="quién sos y desde dónde"
            {...progress('identidad')}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field id="name" label="nombre">
                <Input id="name" autoComplete="name" {...form.register('name')} />
                <FormError error={form.formState.errors.name} />
              </Field>

              <Field id="email" label="email">
                <Input id="email" type="email" {...form.register('email')} />
                <FormError error={form.formState.errors.email} />
              </Field>

              <Field id="phoneNumber" label="celular" hint="privado">
                <Input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+54 9 11 1234-5678"
                  {...form.register('phoneNumber')}
                />
                <FormError error={form.formState.errors.phoneNumber} />
              </Field>

              <FormField
                control={form.control}
                name="countryOfOrigin"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel>país</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== 'Argentina') {
                          form.setValue('province', '', { shouldDirty: true });
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

              {values.countryOfOrigin === 'Argentina' && (
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel>provincia</FormLabel>
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

              <Field
                id="slogan"
                label="slogan"
                className="col-span-full"
                hint={
                  <span className="tabular-nums">
                    {values.slogan?.length ?? 0}/{SLOGAN_MAX}
                  </span>
                }
              >
                <Textarea
                  id="slogan"
                  placeholder="Ej: Desarrollador apasionado por el código"
                  maxLength={SLOGAN_MAX}
                  {...form.register('slogan')}
                  rows={2}
                />
                <FormError error={form.formState.errors.slogan} />
              </Field>
            </div>
          </Section>

          <Section
            id="trabajo"
            index={2}
            title="trabajo"
            description="dónde trabajás hoy, todos los lugares"
            {...progress('trabajo')}
          >
            <PositionsField />
          </Section>

          <Section
            id="estudios"
            index={3}
            title="estudios"
            description="qué y dónde estudiaste"
            {...progress('estudios')}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="career" label="carrera">
                <Input
                  id="career"
                  placeholder="Ej: Ingeniería en Sistemas"
                  {...form.register('career')}
                />
                <FormError error={form.formState.errors.career} />
              </Field>
              <Field id="studyPlace" label="institución">
                <Input
                  id="studyPlace"
                  placeholder="Ej: UTN / Autodidacta"
                  {...form.register('studyPlace')}
                />
                <FormError error={form.formState.errors.studyPlace} />
              </Field>
            </div>
          </Section>

          <Section
            id="enlaces"
            index={4}
            title="enlaces"
            description="dónde más te encuentran"
            {...progress('enlaces')}
          >
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              {LINKS.map((link) => (
                <div key={link.name} className="group/field min-w-0 space-y-1">
                  <div className="flex">
                    <label
                      htmlFor={link.name}
                      className="group-focus-within/field:text-glow flex w-24 shrink-0 items-center rounded-l-sm border border-r-0 border-input bg-pcnGreen/[0.04] px-2 font-mono text-[11px] text-pcnGreen-700 transition-colors group-focus-within/field:text-pcnGreen"
                    >
                      {link.prefix}
                      <span className="text-pcnGreen-500">:</span>
                    </label>
                    <Input
                      id={link.name}
                      type="url"
                      className="rounded-l-none"
                      placeholder={link.placeholder}
                      {...form.register(link.name, {
                        setValueAs: (v) => (v === '' ? null : v),
                      })}
                      value={values[link.name] || ''}
                    />
                  </div>
                  <FormError error={form.formState.errors[link.name]} />
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="stack"
            index={5}
            title="stack"
            description={`${userLanguages.length} lenguajes marcados`}
            {...progress('stack')}
          >
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
          </Section>

          <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-background/90 px-4 py-3 font-mono text-[11px] backdrop-blur">
            <span className="flex items-center gap-2">
              {dirtyCount > 0 ? (
                <>
                  <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
                  <span className="text-amber-400">
                    {dirtyCount} {dirtyCount === 1 ? 'campo modificado' : 'campos modificados'}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">
                  <span className="text-pcnGreen">✓</span> todo guardado
                </span>
              )}
              <kbd className="border border-pcnGreen-200 px-1 text-[10px] text-muted-foreground max-sm:hidden">
                ⌘S
              </kbd>
            </span>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              loadingText="guardando..."
            >
              guardarCambios();
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
