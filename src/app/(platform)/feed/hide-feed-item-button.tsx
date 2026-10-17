'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { hideFeedItem, showFeedItem } from '@/actions/feed/hidden-feed-items';
import type { FeedItem } from '@/lib/feed';
import { actionErrorMessage } from '@/lib/rate-limit-messages';
import { cn } from '@/lib/utils';

// For admins: takes an item off the feed for everyone. No confirmation, the toast undoes it, and
// /admin/feed lists everything hidden to bring it back later.
export function HideFeedItemButton({ item, className }: { item: FeedItem; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const undo = async () => {
    try {
      await showFeedItem(item.id);
      router.refresh();
    } catch (error) {
      toast.error(actionErrorMessage(error, 'No se pudo volver a mostrar'));
    }
  };

  const hide = () =>
    startTransition(async () => {
      try {
        await hideFeedItem({ itemId: item.id, title: item.title, href: item.href });
        toast.success('Lo sacaste del feed', { action: { label: 'Deshacer', onClick: undo } });
        router.refresh();
      } catch (error) {
        toast.error(actionErrorMessage(error, 'No se pudo ocultar'));
      }
    });

  return (
    <button
      type="button"
      onClick={hide}
      disabled={isPending}
      aria-label={`Ocultar del feed: ${item.title}`}
      className={cn(
        'flex items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-red-400 disabled:opacity-50',
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="size-3 animate-spin" aria-hidden />
      ) : (
        <EyeOff className="size-3" aria-hidden />
      )}
      ocultar
    </button>
  );
}
