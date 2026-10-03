'use client';

import { toggleLike } from '@/actions/advises/like-advise';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Consejo } from '@/lib/consejos';
import { cn, formatDate } from '@/lib/utils';
import type { SessionWithUser } from '@/lib/session';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Edit, Heart, MoreVertical, Trash } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useOptimistic, useRef, useState, type RefObject } from 'react';
import { DeleteAdviseDialog } from './delete-advise-dialog';
import { EditAdviseDialog } from './edit-advise-dialog';
import { ExtractedNotice } from './extracted-notice';

/** Whether a line-clamped element hides part of its text, re-checked when it resizes. */
const useIsOverflowing = (ref: RefObject<HTMLElement | null>, enabled: boolean) => {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const check = () => setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return isOverflowing;
};

type LikeRef = { userId: string };

export const AdviseCard = ({
  consejo,
  session,
  className,
  showAuthor = true,
  clamped = true,
}: {
  className?: string;
  /** Cut long consejos to a few lines with a "ver más" link. Off on the consejo's own page. */
  clamped?: boolean;
  /** Off where every card is by the same person, like their own profile. */
  showAuthor?: boolean;
  consejo: Consejo;
  session: SessionWithUser | null;
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const contentRef = useRef<HTMLAnchorElement>(null);
  const isOverflowing = useIsOverflowing(contentRef, clamped);

  const [optimisticLikes, toggleOptimisticLike] = useOptimistic(
    consejo.likes ?? [],
    (state: LikeRef[], userId: string) =>
      state.some((like) => like.userId === userId)
        ? state.filter((like) => like.userId !== userId)
        : [...state, { userId }],
  );

  const isExtracted = consejo.source !== null;
  const href = `/consejos/${consejo.id}`;
  const isAuthor = !!session?.user?.id && session.user.id === consejo.author.id;
  const isAdmin = session?.user?.role === 'ADMIN';
  // Extracted consejos aren't rows anybody published, so there's nothing to edit or delete.
  const canEditOrDelete = !isExtracted && (isAuthor || isAdmin);

  const isLiked = session?.user?.id
    ? optimisticLikes.some((like) => like.userId === session.user.id)
    : false;

  const handleLike = async () => {
    if (!session?.user?.id || isLiking) return;

    setIsLiking(true);
    try {
      toggleOptimisticLike(session.user.id);
      await toggleLike(consejo.id);
    } catch (error) {
      console.error('Error toggling like:', error);
      toggleOptimisticLike(session.user.id);
    } finally {
      setIsLiking(false);
    }
  };

  const Options = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreVertical className="h-3.5 w-3.5" />
          <span className="sr-only">Opciones</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash className="mr-2 h-4 w-4" />
          <span>Eliminar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const authorAvatar = (
    <Avatar className="h-6 w-6 rounded-sm">
      <AvatarImage src={consejo.author.image ?? undefined} alt={consejo.author.name} />
      <AvatarFallback className="rounded-sm text-[10px]">
        {consejo.author.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <article className={cn(ruledCellClassName, 'group/advise flex flex-col gap-4 p-4', className)}>
      <div className="relative flex-1 border-l-2 border-pcnGreen-200 pl-4 pr-6 transition-colors group-hover/advise:border-pcnGreen-500">
        <span
          aria-hidden
          className="absolute -top-1 right-0 font-serif text-4xl leading-none text-pcnGreen/15"
        >
          &rdquo;
        </span>
        <Link
          ref={contentRef}
          href={href}
          className={cn(
            'block whitespace-pre-line text-[15px] leading-relaxed text-foreground/90 transition-colors hover:text-foreground',
            clamped && 'line-clamp-5',
          )}
        >
          {consejo.content}
        </Link>
        {clamped && isOverflowing && (
          <Link
            href={href}
            className="mt-1 inline-block font-mono text-xs text-pcnGreen-600 transition-colors hover:text-pcnGreen"
          >
            ver más →
          </Link>
        )}
      </div>

      {consejo.source && <ExtractedNotice source={consejo.source} author={consejo.author.name} />}

      <footer className="flex items-center gap-2">
        {showAuthor &&
          (consejo.author.id ? (
            <Link
              href={`/perfil/${consejo.author.id}`}
              className="group/author flex min-w-0 items-center gap-2"
            >
              {authorAvatar}
              <span className="truncate font-mono text-xs font-semibold transition-colors group-hover/author:text-pcnGreen">
                {consejo.author.name}
              </span>
            </Link>
          ) : (
            <span className="flex min-w-0 items-center gap-2">
              {authorAvatar}
              <span className="truncate font-mono text-xs font-semibold">
                {consejo.author.name}
              </span>
            </span>
          ))}

        <time
          dateTime={consejo.createdAt}
          title={formatDate(new Date(consejo.createdAt))}
          className={cn(
            'shrink-0 font-mono text-[11px] text-muted-foreground',
            showAuthor && 'hidden sm:inline',
          )}
          suppressHydrationWarning
        >
          {showAuthor && <span className="text-pcnGreen-500/60">· </span>}
          {format(new Date(consejo.createdAt), 'd MMM yyyy', { locale: es })}
        </time>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          {consejo.likes && (
            <button
              type="button"
              aria-pressed={isLiked}
              className={cn(
                'flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] tabular-nums transition-colors',
                isLiked
                  ? 'border-red-500/40 bg-red-500/10 text-red-500 hover:text-red-400'
                  : 'border-transparent text-muted-foreground hover:border-red-500/30 hover:text-red-500',
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart className="h-3.5 w-3.5" fill={isLiked ? 'currentColor' : 'none'} />
              {optimisticLikes.length}
              <span className="sr-only">Me gusta</span>
            </button>
          )}
          {canEditOrDelete && Options}
        </div>
      </footer>

      {canEditOrDelete && (
        <>
          <DeleteAdviseDialog
            adviseId={consejo.id}
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          />
          <EditAdviseDialog
            adviseId={consejo.id}
            initialContent={consejo.content}
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        </>
      )}
    </article>
  );
};
