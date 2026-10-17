'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { showFeedItem } from '@/actions/feed/hidden-feed-items';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

/** Puts a hidden item back in the feed, from /admin/feed. */
export function ShowFeedItemButton({ itemId, title }: { itemId: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const show = () =>
    startTransition(async () => {
      try {
        await showFeedItem(itemId);
        toast.success('Volvió al feed');
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo volver a mostrar'));
      }
    });

  return (
    <button
      type="button"
      onClick={show}
      disabled={isPending}
      aria-label={`Mostrar en el feed: ${title}`}
      className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-pcnGreen disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="size-3 animate-spin" aria-hidden />
      ) : (
        <Eye className="size-3" aria-hidden />
      )}
      mostrar
    </button>
  );
}
