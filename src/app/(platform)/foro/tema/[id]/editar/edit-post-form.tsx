'use client';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { ChevronLeft, Save } from 'lucide-react';
import { renderMarkdown } from '@/lib/render-markdown';
import { Heading1 } from '@/components/ui/typography';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPostCategories } from '@/actions/forum_posts/get-categories';
import { updatePost } from '@/actions/forum_posts/update';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().min(1, 'Category is required'),
});

type PostCategory = {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  slug: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  authorId: string;
  category: {
    name: string;
    slug: string;
  };
};

interface EditPostFormProps {
  post: Post;
}

export function EditPostForm({ post }: EditPostFormProps) {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title,
      content: post.content,
      categoryId: post.categoryId,
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await getPostCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Error al cargar las categorías');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const result = await updatePost(post.id, data);

      if (result.success) {
        toast.success('¡Post actualizado exitosamente! 🎉');
        router.push(`/foro/tema/${post.id}`);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] w-full overflow-hidden md:h-[calc(100vh-1.5rem)]">
      <div className="flex w-1/2 flex-col border-r">
        <div className="flex items-center gap-3 p-4">
          <Link
            href={`/foro/tema/${post.id}`}
            className="text-gray-400 transition-colors hover:text-gray-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <Heading1 className="m-0 text-xl font-semibold">Editar Post</Heading1>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Escribe un título para el post" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingCategories ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              Cargando categorías...
                            </div>
                          ) : categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <span>{category.icon}</span>
                                  <span>{category.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No hay categorías disponibles
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col">
                      <FormLabel>Contenido (Formato Markdown)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Escribe el contenido del post aquí..."
                          className="min-h-[300px] flex-1 resize-none font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div className="flex w-1/2 flex-col">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-blue-400">Preview</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-invert max-w-none">
            {form.watch('title') && (
              <h1 className="mb-6 text-3xl font-bold">{form.watch('title')}</h1>
            )}
            <div>
              {form.watch('content') ? (
                renderMarkdown(form.watch('content'))
              ) : (
                <p className="italic text-gray-400">Escribe algo para ver la preview...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
