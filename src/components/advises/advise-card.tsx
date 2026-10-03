'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import type { Consejo } from '@/lib/consejos';
import type { SessionWithUser } from '@/lib/session';
import { cn, formatDate } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Highlight } from '@/components/conversations/highlight';
import { AdviseOptions } from './advise-options';
import { consejoHash, consejoHref } from './consejo-utils';
import { ExtractedNotice } from './extracted-notice';
import { LikeButton } from './like-button';

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

export function ConsejoAuthorChip({
  author,
  className,
}: {
  author: Consejo['author'];
  className?: string;
}) {
  const body = (
    <>
      <Avatar className="size-5 rounded-sm ring-1 ring-pcnGreen-200 transition-shadow group-hover/author:ring-pcnGreen">
        <AvatarImage src={author.image ?? undefined} alt={author.name} />
        <AvatarFallback className="rounded-sm text-[9px]">{author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <span className="truncate">
        <span className="text-pcnGreen-600">@</span>
        {author.name}
      </span>
    </>
  );
  const chipClassName = cn(
    'group/author relative z-10 flex min-w-0 items-center gap-1.5 font-mono text-xs font-semibold',
    className,
  );

  return author.id ? (
    <Link
      href={`/perfil/${author.id}`}
      className={cn(chipClassName, 'transition-colors hover:text-pcnGreen')}
    >
      {body}
    </Link>
  ) : (
    <span className={chipClassName} title="Todavía no vinculado a un perfil de la plataforma">
      {body}
    </span>
  );
}

export const AdviseCard = ({
  consejo,
  session,
  className,
  showAuthor = true,
  clamped = true,
  query = '',
}: {
  className?: string;
  /** Cut long consejos to a few lines with a "ver más" link. */
  clamped?: boolean;
  /** Off where every card is by the same person, like their own profile. */
  showAuthor?: boolean;
  /** Search term to light up in the text. */
  query?: string;
  consejo: Consejo;
  session: SessionWithUser | null;
}) => {
  const contentRef = useRef<HTMLParagraphElement>(null);
  const isOverflowing = useIsOverflowing(contentRef, clamped);

  const isExtracted = consejo.source !== null;
  const href = consejoHref(consejo.id);
  const isAuthor = !!session?.user?.id && session.user.id === consejo.author.id;
  const isAdmin = session?.user?.role === 'ADMIN';
  // Extracted consejos aren't rows anybody published, so there's nothing to edit or delete.
  const canEditOrDelete = !isExtracted && (isAuthor || isAdmin);
  const createdAt = new Date(consejo.createdAt);

  return (
    <article
      className={cn(
        ruledCellClassName,
        'group/advise relative flex flex-col gap-2.5 p-3 transition-colors hover:bg-pcnGreen/[0.04]',
        isExtracted &&
          'bg-[repeating-linear-gradient(0deg,rgba(4,244,190,0.025)_0_1px,transparent_1px_3px)]',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-0.5 transition-colors',
          isExtracted
            ? 'bg-[repeating-linear-gradient(180deg,rgba(4,244,190,0.7)_0_4px,transparent_4px_8px)]'
            : 'bg-transparent group-hover/advise:bg-pcnGreen group-hover/advise:shadow-[0_0_12px_rgba(4,244,190,0.8)]',
        )}
      />

      <header className="flex min-w-0 items-center gap-2 whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground">
        <span className="text-pcnGreen-600">#{consejoHash(consejo.id)}</span>
        <time dateTime={consejo.createdAt} title={formatDate(createdAt)} suppressHydrationWarning>
          {format(createdAt, 'yyyy-MM-dd', { locale: es })}
        </time>
        {isExtracted && (
          <span className="border border-dashed border-pcnGreen-600 px-1 text-[10px] uppercase leading-4 tracking-wider text-pcnGreen">
            auto
          </span>
        )}
        <span className="ml-auto flex shrink-0 items-center gap-1">
          {consejo.commentCount > 0 && (
            <span
              className="flex items-center gap-1 px-1"
              title={`${consejo.commentCount} comentarios`}
            >
              <MessageSquare className="size-3" />
              {consejo.commentCount}
            </span>
          )}
          {consejo.likes && (
            <LikeButton adviseId={consejo.id} likes={consejo.likes} session={session} />
          )}
          {canEditOrDelete && <AdviseOptions adviseId={consejo.id} content={consejo.content} />}
        </span>
      </header>

      <div className="flex-1">
        <p
          ref={contentRef}
          className={cn(
            'whitespace-pre-line text-[14px] leading-relaxed text-foreground/90 transition-colors group-hover/advise:text-foreground',
            clamped && 'line-clamp-5',
          )}
        >
          {/* Stretches over the whole card, so clicking anywhere opens the consejo. */}
          <Link
            href={href}
            scroll={false}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-1 focus-visible:after:ring-inset focus-visible:after:ring-pcnGreen"
          >
            <Highlight text={consejo.content} query={query} />
          </Link>
        </p>
        {clamped && isOverflowing && (
          <Link
            href={href}
            scroll={false}
            className="relative z-10 mt-1 inline-block font-mono text-[11px] text-pcnGreen-600 transition-colors hover:text-pcnGreen"
          >
            [ver más →]
          </Link>
        )}
      </div>

      {(showAuthor || consejo.source) && (
        <footer className="flex min-w-0 flex-col gap-1.5">
          {showAuthor && <ConsejoAuthorChip author={consejo.author} />}
          {consejo.source && (
            <ExtractedNotice
              source={consejo.source}
              author={consejo.author.name}
              className="relative z-10"
            />
          )}
        </footer>
      )}
    </article>
  );
};
