'use client';

import { useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Loader2, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface WebReaderPage {
  url: string;
  title: string;
  /** Second line of the title bar, e.g. the author. The host is appended. */
  subtitle?: string;
  icon?: ReactNode;
  /** API route answering `{ embeddable: boolean }` for this page. */
  embedCheckUrl: string;
}

interface WebReaderDialogProps {
  page: WebReaderPage | null;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}

async function fetchEmbeddable(checkUrl: string): Promise<boolean> {
  const res = await fetch(checkUrl);
  if (!res.ok) return false;
  const body = (await res.json()) as { embeddable?: boolean };
  return body.embeddable === true;
}

/**
 * Shows an external page on its original website, framed like a browser window, so reading it
 * never leaves the site (or PCN OS). Sites that refuse to be embedded get a notice with a link
 * to open them in a new tab instead.
 */
export function WebReaderDialog({ page, open, onOpenChange }: WebReaderDialogProps) {
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const { data: embeddable, isLoading } = useQuery({
    queryKey: ['web-reader-embeddable', page?.embedCheckUrl],
    queryFn: () => fetchEmbeddable(page!.embedCheckUrl),
    enabled: open && !!page,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  if (!page) return null;

  const host = new URL(page.url).host;
  const frameLoaded = loadedUrl === page.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[88dvh] w-[94vw] max-w-5xl flex-col gap-0 overflow-hidden rounded-sm border border-pcnGreen-300 bg-black p-0 [&>button:last-child]:top-2.5">
        <header className="flex shrink-0 items-center gap-3 border-b border-pcnGreen-200 py-2 pl-3 pr-12 font-mono">
          {page.icon}
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold">{page.title}</DialogTitle>
            <DialogDescription className="truncate text-[11px] text-pcnGreen-600">
              <span className="text-pcnGreen-500">@ </span>
              {page.subtitle ? `${page.subtitle} · ${host}` : host}
            </DialogDescription>
          </div>
          <a
            href={page.url}
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
              key={page.url}
              src={page.url}
              title={page.title}
              onLoad={() => setLoadedUrl(page.url)}
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
              className="size-full border-0 bg-white"
            />
          )}

          {(isLoading || (embeddable && !frameLoaded)) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background font-mono text-xs text-pcnGreen-700">
              <Loader2 className="size-5 animate-spin text-pcnGreen" />
              <span className="cursor-blink">$ curl {host}</span>
            </div>
          )}

          {embeddable === false && (
            <div className="flex size-full flex-col items-center justify-center gap-4 p-6 text-center font-mono">
              <ShieldAlert className="size-8 text-pcnGreen-600" />
              <div className="space-y-1">
                <p className="text-sm text-foreground">{host} no permite mostrarse embebido</p>
                <p className="text-xs text-muted-foreground">Abrilo en su sitio original.</p>
              </div>
              <Button asChild variant="pcn" size="sm">
                <a href={page.url} target="_blank" rel="noopener noreferrer">
                  {`abrir('${host}');`}
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
