'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createForumPost, updateForumPost } from '@/actions/forum/posts';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TabBrackets, tabsListClassName, tabsTriggerClassName } from '@/components/ui/tab-styles';
import { Markdown } from '@/lib/markdown';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { forumPostSchema, type ForumPostFormData } from '@/schemas/forum-schema';

type Category = { id: string; name: string };

// Opens a thread or edits one. The body is markdown, with a preview tab that renders it exactly
// like the thread will.
export function ForumPostForm({
  categories,
  post,
  defaultCategoryId,
}: {
  categories: Category[];
  /** The thread being edited; leave it out to open a new one. */
  post?: ForumPostFormData & { id: string };
  defaultCategoryId?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'escribir' | 'vista-previa'>('escribir');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ForumPostFormData>({
    resolver: zodResolver(forumPostSchema),
    defaultValues: {
      title: post?.title ?? '',
      categoryId: post?.categoryId ?? defaultCategoryId ?? '',
      content: post?.content ?? '',
    },
  });

  const onSubmit = async (data: ForumPostFormData) => {
    setIsSubmitting(true);
    try {
      if (post) {
        await updateForumPost(post.id, data);
        toast.success('Tema actualizado');
        router.push(`/foro/tema/${post.id}`);
      } else {
        const { id } = await createForumPost(data);
        toast.success('Tema publicado');
        router.push(`/foro/tema/${id}`);
      }
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudo guardar el tema'));
      setIsSubmitting(false);
    }
  };

  const content = form.watch('content');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="¿Qué querés charlar?" maxLength={140} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger aria-label="Categoría">
                      <SelectValue placeholder="Elegí una" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-2">
                <FormLabel>Contenido</FormLabel>
                <div role="tablist" aria-label="Contenido" className={tabsListClassName}>
                  {(['escribir', 'vista-previa'] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-selected={tab === value}
                      data-state={tab === value ? 'active' : 'inactive'}
                      onClick={() => setTab(value)}
                      className={tabsTriggerClassName}
                    >
                      <TabBrackets>{value}</TabBrackets>
                    </button>
                  ))}
                </div>
              </div>
              {tab === 'escribir' ? (
                <FormControl>
                  <Textarea
                    aria-label="Contenido"
                    placeholder={
                      'Contá el contexto, qué probaste y qué esperás.\n\nAdmite markdown: **negrita**, _cursiva_, `código`, listas, > citas y bloques ```'
                    }
                    className="min-h-[16rem] font-mono text-xs"
                    {...field}
                  />
                </FormControl>
              ) : (
                <div className="min-h-[16rem] border border-pcnGreen-200 p-3">
                  {content.trim() ? (
                    <Markdown content={content} />
                  ) : (
                    <p className="font-mono text-xs text-muted-foreground">Nada para mostrar.</p>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.back()}>
            cancelar();
          </Button>
          <Button
            type="submit"
            variant="pcn"
            size="sm"
            loading={isSubmitting}
            loadingText={post ? 'guardando...' : 'publicando...'}
          >
            {post ? 'guardarCambios();' : 'publicarTema();'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
