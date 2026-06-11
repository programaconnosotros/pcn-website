'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Article } from './articles';

interface ReaderData {
  title: string;
  byline: string | null;
  siteName: string | null;
  content: string;
  length: number;
}

interface ArticleReaderDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}

async function fetchArticleContent(url: string): Promise<ReaderData> {
  const res = await fetch(`/api/lectura/reader?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `Error ${res.status}`);
  }
  return res.json() as Promise<ReaderData>;
}

export function ArticleReaderDialog({ article, open, onOpenChange }: ArticleReaderDialogProps) {
  const { data, isLoading, isError, error } = useQuery<ReaderData, Error>({
    queryKey: ['article-reader', article?.url],
    queryFn: () => fetchArticleContent(article!.url),
    enabled: open && !!article,
    staleTime: 24 * 60 * 60 * 1000, // 24h — article content is static
    retry: 1,
  });

  if (!article) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[90vw] max-w-3xl flex-col gap-0 overflow-hidden border-none p-0">
        {/* Header */}
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={article.avatar} alt={article.author} />
                <AvatarFallback>
                  {article.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none">{article.author}</p>
                <p className="text-xs text-muted-foreground">{article.source}</p>
              </div>
            </div>
            <Link href={article.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                Leer original
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <DialogTitle className="mt-3 text-xl leading-snug">{article.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Artículo de {article.author} en {article.source}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Cargando artículo…</p>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">No se pudo cargar el artículo</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {error?.message ?? 'Error desconocido'}
                </p>
              </div>
              <Link href={article.url} target="_blank" rel="noopener noreferrer">
                <Button variant="pcn" size="sm" className="flex items-center gap-2">
                  Abrir en nueva pestaña
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {data && (
            <article
              className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-img:rounded-md"
              dangerouslySetInnerHTML={{ __html: data.content }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
