'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/file-upload';
import { CollaboratorsField } from './collaborators-field';
import { projectSchema, ProjectFormData } from '@/schemas/project-schema';
import { createProject } from '@/actions/projects/create-project';
import { updateProject } from '@/actions/projects/update-project';
import { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';

type ProjectWithMembers = Awaited<ReturnType<typeof fetchPublicProjects>>[number];

type Props = {
  project?: ProjectWithMembers;
  // Usuario logueado: es el autor de los proyectos nuevos.
  currentUser: { id: string; name: string; isAdmin: boolean };
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function ProjectForm({ project, currentUser, onSuccess, onCancel }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [techInput, setTechInput] = useState('');

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title ?? '',
      description: project?.description ?? '',
      url: project?.url ?? '',
      logoUrl: project?.logoUrl ?? '',
      techStack: project?.techStack ?? [],
      isOpenSource: project?.isOpenSource ?? false,
      repoUrl: project?.repoUrl ?? '',
      startYear: project?.startYear ?? '',
      endYear: project?.endYear ?? '',
      authorRole: project?.authorRole ?? '',
      members: project?.members
        ? project.members.map((m) => ({
            userId: m.userId ?? null,
            memberName: m.memberName,
            role: m.role ?? '',
          }))
        : [],
    },
  });

  // Proyectos viejos cargados por admins pueden no tener autor.
  const author = project ? project.author : { id: currentUser.id, name: currentUser.name };
  // Solo el autor (o un admin) arma el equipo y define los roles; los colaboradores editan
  // la información básica.
  const canManageTeam = !project || currentUser.isAdmin || project.authorId === currentUser.id;
  const memberImages = Object.fromEntries(
    (project?.members ?? []).flatMap((m) => (m.user ? [[m.user.id, m.user.image]] : [])),
  );

  const techStack = form.watch('techStack') ?? [];
  const isOpenSource = form.watch('isOpenSource');

  function addTech() {
    const tag = techInput.trim();
    if (!tag || techStack.includes(tag)) return;
    form.setValue('techStack', [...techStack, tag], { shouldValidate: true });
    setTechInput('');
  }

  function removeTech(tag: string) {
    form.setValue(
      'techStack',
      techStack.filter((t) => t !== tag),
      { shouldValidate: true },
    );
  }

  const handleSubmit = async (values: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      if (project) {
        await updateProject(project.id, values);
        toast.success('Proyecto actualizado');
      } else {
        await createProject(values);
        toast.success('Proyecto publicado');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del proyecto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: PCN Dashboard" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describí brevemente de qué trata el proyecto..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL del proyecto</FormLabel>
              <FormControl>
                <Input placeholder="https://mi-proyecto.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo del proyecto</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  folder="project-logos"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isOpenSource"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <input
                    type="checkbox"
                    id="isOpenSource"
                    checked={!!field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked);
                      // El repo solo aplica a proyectos open-source; no lo dejamos validando oculto.
                      if (!e.target.checked) form.setValue('repoUrl', '', { shouldValidate: true });
                    }}
                    className="h-4 w-4 cursor-pointer rounded border-input accent-pcnPurple dark:accent-pcnGreen"
                  />
                </FormControl>
                <FormLabel htmlFor="isOpenSource" className="cursor-pointer">
                  Es open-source
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {isOpenSource && (
          <FormField
            control={form.control}
            name="repoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repositorio en GitHub</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://github.com/usuario/proyecto"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>
                  Opcional. Así otros miembros pueden leer el código y contribuir.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año de inicio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Ej: 2024"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Opcional.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año de cierre</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="Ej: 2025"
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormDescription>Dejalo vacío si sigue activo.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tech stack tag input */}
        <FormField
          control={form.control}
          name="techStack"
          render={() => (
            <FormItem>
              <FormLabel>Stack tecnológico</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Next.js, PostgreSQL..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTech}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {techStack.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {techStack.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTech(tag)}
                        className="ml-0.5 rounded-sm opacity-70 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">Autor</p>
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate font-mono text-sm text-muted-foreground">
              <span className="text-pcnGreen-500">@ </span>
              {author?.name ?? 'Sin autor'}
            </p>
            {canManageTeam && author ? (
              <FormField
                control={form.control}
                name="authorRole"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormControl>
                      <Input
                        aria-label="Rol del autor"
                        placeholder="Rol (opcional)"
                        maxLength={100}
                        className="h-8 w-40 text-xs sm:w-48"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              project?.authorRole && (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {project.authorRole}
                </span>
              )
            )}
          </div>
        </div>

        {canManageTeam ? (
          <FormField
            control={form.control}
            name="members"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipo</FormLabel>
                <FormControl>
                  <CollaboratorsField
                    value={field.value ?? []}
                    onChange={field.onChange}
                    excludedUserIds={author ? [author.id] : []}
                    initialImages={memberImages}
                  />
                </FormControl>
                <FormDescription>
                  Buscá a los miembros de la comunidad que participaron y, si querés, escribí el rol
                  de cada uno. Si alguien no tiene cuenta, podés agregarlo por nombre.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Equipo</p>
            {project && project.members.length > 0 && (
              <ul className="space-y-1 font-mono text-sm text-muted-foreground">
                {project.members.map((member) => (
                  <li key={member.id} className="flex gap-2">
                    <span className="min-w-0 flex-1 truncate">
                      <span className="text-pcnGreen-500">@ </span>
                      {member.memberName}
                    </span>
                    {member.role && <span className="shrink-0 text-xs">{member.role}</span>}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[0.8rem] text-muted-foreground">
              Solo el autor puede cambiar el equipo y los roles.
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            variant="pcn"
            className="flex-1"
            loading={isSubmitting}
            loadingText="guardando..."
          >
            <Save className="mr-2 h-4 w-4" />
            {project ? 'actualizarProyecto();' : 'publicarProyecto();'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              cancelar();
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
