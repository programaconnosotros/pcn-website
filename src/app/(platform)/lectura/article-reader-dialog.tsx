'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Loader2, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Article } from './articles';

interface ArticleReaderDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}

async function fetchEmbeddable(url: string): Promise<boolean> {
  const res = await fetch(`/api/lectura/embed?url=${encodeURIComponent(url)}`);
  if (!res.ok) return false;
  const body = (await res.json()) as { embeddable?: boolean };
  return body.embeddable === true;
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/**
 * Shows an article on its original website, framed like a browser window. Sites that refuse to
 * be embedded get a notice with a link to read it in a new tab instead.
 */
export function ArticleReaderDialog({ article, open, onOpenChange }: ArticleReaderDialogProps) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const { data: embeddable, isLoading } = useQuery({
    queryKey: ['article-embeddable', article?.url],
    queryFn: () => fetchEmbeddable(article!.url),
    enabled: open && !!article,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  if (!article) return null;

  const frameLoaded = loadedUrl === article.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88dvh] w-[94vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-sm border border-pcnGreen-300 bg-black p-0 [&>button:last-child]:top-2.5">
        <header className="flex shrink-0 items-center gap-3 border-b border-pcnGreen-200 py-2 pl-3 pr-12 font-mono">
          <Avatar className="size-7 shrink-0 rounded-sm">
            <AvatarImage src={article.avatar} alt={article.author} />
            <AvatarFallback className="rounded-sm text-[10px]">
              {initials(article.author)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold">{article.title}</DialogTitle>
            <DialogDescription className="truncate text-[11px] text-pcnGreen-600">
              <span className="text-pcnGreen-500">@ </span>
              {article.author} · {new URL(article.url).host}
            </DialogDescription>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir en una pestaña nueva"
            className="flex shrink-0 items-center gap-1 rounded-sm border border-pcnGreen-200 px-2 py-1 text-[11px] text-pcnGreen-700 transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen"
          >
            <span className="max-sm:hidden">abrir</span>
            <ArrowUpRight className="size-3.5" />
          </a>
        </header>

        <div className="relative min-h-0 flex-1 bg-background">
          {embeddable && (
            <iframe
              key={article.url}
              src={article.url}
              title={article.title}
              onLoad={() => setLoadedUrl(article.url)}
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
              className="size-full border-0 bg-white"
            />
          )}

          {(isLoading || (embeddable && !frameLoaded)) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background font-mono text-xs text-pcnGreen-700">
              <Loader2 className="size-5 animate-spin text-pcnGreen" />
              <span className="cursor-blink">$ curl {new URL(article.url).host}</span>
            </div>
          )}

          {embeddable === false && (
            <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center font-mono">
              <ShieldAlert className="size-8 text-pcnGreen-600" />
              <div className="space-y-1">
                <p className="text-sm text-foreground">
                  {new URL(article.url).host} no permite mostrarse embebido
                </p>
                <p className="text-xs text-muted-foreground">
                  Abrilo en su sitio original para leerlo.
                </p>
              </div>
              <Button asChild variant="pcn" size="sm">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Leer en {new URL(article.url).host}
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
