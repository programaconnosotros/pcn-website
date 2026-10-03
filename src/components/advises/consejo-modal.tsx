'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Consejo } from '@/lib/consejos';
import type { ConsejoDetail } from '@/lib/consejos-server';
import type { SessionWithUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ConsejoPanel } from './consejo-panel';
import { consejoHref } from './consejo-utils';
import { useConsejosNav } from './consejos-nav';

// /consejos/<id> intercepted from the list: the consejo opens on the same terminal dialog as a
// conversation, over the list. Closing goes back to the list; ← → step through what it shows.
export function ConsejoModal({
  consejo,
  comments,
  session,
}: {
  consejo: Consejo;
  comments: ConsejoDetail['comments'];
  session: SessionWithUser | null;
}) {
  const router = useRouter();
  const { ids } = useConsejosNav();
  const index = ids.indexOf(consejo.id);
  const previousId = index > 0 ? ids[index - 1] : undefined;
  const nextId = index !== -1 && index < ids.length - 1 ? ids[index + 1] : undefined;

  // Stepping replaces the entry, so closing always lands back on the list in one step.
  const go = (id: string) => router.replace(consejoHref(id), { scroll: false });

  const close = () => {
    if (ids.length > 0 && window.history.length > 1) router.back();
    else router.push('/consejos', { scroll: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // Typing a comment shouldn't flip to another consejo.
    if (e.target instanceof HTMLElement && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft' && previousId) go(previousId);
    else if (e.key === 'ArrowRight' && nextId) go(nextId);
    else return;
    e.preventDefault();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className={cn(
          // Only the body scrolls (see ConversationDialog for the Safari story).
          'flex max-h-[calc(100dvh-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 [&>button:last-child]:hidden',
          // Center it above the phone tab bar and cap it to the space left.
          'max-md:top-[calc((100dvh+env(safe-area-inset-top)-4rem-env(safe-area-inset-bottom))/2)]',
          'max-md:max-h-[calc(100dvh-env(safe-area-inset-top)-4rem-env(safe-area-inset-bottom)-1.5rem)]',
          // Inside a PCN OS window there is no tab bar.
          'embedded:max-md:top-1/2 embedded:max-md:max-h-[calc(100dvh-2rem)]',
        )}
        aria-describedby={undefined}
        onKeyDown={handleKeyDown}
      >
        <ConsejoPanel
          consejo={consejo}
          comments={comments}
          session={session}
          variant="modal"
          nav={
            index === -1
              ? undefined
              : {
                  index,
                  total: ids.length,
                  onPrevious: previousId ? () => go(previousId) : undefined,
                  onNext: nextId ? () => go(nextId) : undefined,
                }
          }
        />
      </DialogContent>
    </Dialog>
  );
}
