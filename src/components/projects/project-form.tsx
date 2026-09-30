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
      members: project?.members
        ? project.members.map((m) => ({
            userId: m.userId ?? null,
            memberName: m.memberName,
          }))
        : [],
      order: project?.order ?? 0,
    },
  });

  // Proyectos viejos cargados por admins pueden no tener autor.
  const author = project ? project.author : { id: currentUser.id, name: currentUser.name };
  const memberImages = Object.fromEntries(
    (project?.members ?? []).flatMap((m) => (m.user ? [[m.user.id, m.user.image]] : [])),
  );

  const techStack = form.watch('techStack') ?? [];

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
                <Input placeholder="https://github.com/usuario/proyecto" {...field} />
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
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-pcnGreen-500">@ </span>
            {author?.name ?? 'Sin autor'}
          </p>
        </div>

        <FormField
          control={form.control}
          name="members"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compañeros que te ayudaron</FormLabel>
              <FormControl>
                <CollaboratorsField
                  value={field.value ?? []}
                  onChange={field.onChange}
                  excludedUserIds={author ? [author.id] : []}
                  initialImages={memberImages}
                />
              </FormControl>
              <FormDescription>
                Buscá a los miembros de la comunidad que participaron. Si alguien no tiene cuenta,
                podés agregarlo por nombre.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {currentUser.isAdmin && (
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Número menor aparece primero.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            variant="pcn"
            className="flex-1"
            loading={isSubmitting}
            loadingText="Guardando..."
          >
            <Save className="mr-2 h-4 w-4" />
            {project ? 'Actualizar proyecto' : 'Publicar proyecto'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
