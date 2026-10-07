'use client';

import { DialogClose, DialogTitle } from '@/components/ui/dialog';
import { formatLongDate, toSentences } from '@/components/conversations/conversation-utils';
import type { Consejo } from '@/lib/consejos';
import type { ConsejoDetail } from '@/lib/consejos-server';
import type { SessionWithUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { ConsejoAuthorChip } from './advice-card';
import { AdviceOptions } from './advice-options';
import { CommentSection } from './comment-section';
import { CopyConsejoLink, ShareConsejo } from './consejo-share';
import { consejoHash, keyCapClassName } from './consejo-utils';
import { LikeButton } from './like-button';

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">{children}</kbd>
);

const Prompt = ({ children }: { children: React.ReactNode }) => (
  <span className="text-pcnGreen-600">$ {children}</span>
);

export type ConsejoPanelNav = {
  index: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
};

interface ConsejoPanelProps {
  consejo: Consejo;
  comments: ConsejoDetail['comments'];
  session: SessionWithUser | null;
  /** In the modal the title is the dialog's and closing is the dialog's own close. */
  variant: 'modal' | 'page';
  /** Position in the list behind the modal, when there is one. */
  nav?: ConsejoPanelNav;
}

// The consejo on the terminal reader, like a conversation's: a `~/consejos/<hash>` path bar with
// share and copy-link key caps (and prev/next over the list), the date, the consejo as numbered
// log lines, who gave it, where it came from and the comments.
export function ConsejoPanel({ consejo, comments, session, variant, nav }: ConsejoPanelProps) {
  const sentences = toSentences(consejo.content);
  const lineNumberWidth = String(sentences.length).length;
  const isAuthor = !!session?.user?.id && session.user.id === consejo.author.id;
  const isAdmin = session?.user?.role === 'ADMIN';
  const canEditOrDelete = !consejo.source && (isAuthor || isAdmin);
  const date = consejo.createdAt.slice(0, 10);
  const title = `Consejo de ${consejo.author.name}`;
  const TitleTag = variant === 'modal' ? DialogTitle : 'h1';

  return (
    <>
      <header className="flex items-center gap-3 border-b border-dashed border-pcnGreen-200 py-2 pl-3 pr-2 font-mono text-xs">
        <p className="min-w-0 flex-1 truncate">
          <span className="text-pcnGreen-500">~/consejos/</span>
          <span className="text-pcnGreen">{consejoHash(consejo.id)}</span>
        </p>
        {nav && nav.total > 0 && (
          <span className="shrink-0 tabular-nums text-muted-foreground max-sm:hidden">
            [
            <span className="text-pcnGreen">
              {String(nav.index + 1).padStart(String(nav.total).length, '0')}
            </span>
            /{nav.total}]
          </span>
        )}
        <div className="flex shrink-0 gap-1">
          <ShareConsejo id={consejo.id} author={consejo.author.name} content={consejo.content} />
          <CopyConsejoLink id={consejo.id} />
          {nav && nav.total > 0 && (
            <>
              <button
                type="button"
                className={keyCapClassName}
                onClick={nav.onPrevious}
                disabled={!nav.onPrevious}
                title="Anterior (←)"
              >
                <ChevronLeft className="size-4" />
                <span className="sr-only">Anterior</span>
              </button>
              <button
                type="button"
                className={keyCapClassName}
                onClick={nav.onNext}
                disabled={!nav.onNext}
                title="Siguiente (→)"
              >
                <ChevronRight className="size-4" />
                <span className="sr-only">Siguiente</span>
              </button>
            </>
          )}
          {variant === 'modal' ? (
            <DialogClose className={cn(keyCapClassName, 'group')} title="Cerrar (Esc)">
              <X className="size-4 transition-transform duration-300 group-hover:rotate-90" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          ) : (
            <Link href="/consejos" className={cn(keyCapClassName, 'group')} title="Ver todos">
              <X className="size-4 transition-transform duration-300 group-hover:rotate-90" />
              <span className="sr-only">Ver todos los consejos</span>
            </Link>
          )}
        </div>
      </header>

      <div
        className={cn(variant === 'modal' && 'min-h-0 flex-1 overflow-y-auto overscroll-contain')}
      >
        <div
          key={consejo.id}
          className="flex flex-col gap-4 p-5 duration-300 animate-in fade-in slide-in-from-bottom-1 sm:p-6"
        >
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tabular-nums text-muted-foreground">
            <time dateTime={date}>
              <Prompt>date </Prompt>
              {formatLongDate(date)}
            </time>
            {consejo.source && (
              <span className="border border-dashed border-pcnGreen-600 px-1 text-[10px] uppercase leading-4 tracking-wider text-pcnGreen shadow-[0_0_10px_-2px_rgba(4,244,190,0.6)]">
                auto-extraído
              </span>
            )}
            {consejo.tags.map((tag) => (
              <span key={tag} className="text-pcnGreen-600">
                #{tag}
              </span>
            ))}
          </div>

          <TitleTag className="font-mono text-sm font-normal text-muted-foreground">
            <Prompt>cat </Prompt>
            <span className="text-foreground">consejo.txt</span>
            <span className="sr-only"> — {title}</span>
          </TitleTag>

          <ol className="border-l border-pcnGreen-200 font-sans text-[15px] leading-relaxed text-foreground/90">
            {sentences.map((sentence, i) => (
              <li
                key={i}
                className="group/line flex gap-3 py-1 pl-3 transition-colors hover:bg-pcnGreen/[0.04]"
              >
                <span
                  aria-hidden
                  className="shrink-0 select-none pt-0.5 font-mono text-[11px] tabular-nums text-pcnGreen-500 group-hover/line:text-pcnGreen"
                >
                  {String(i + 1).padStart(lineNumberWidth, '0')}
                </span>
                <span className="whitespace-pre-line">{sentence}</span>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-2 border-t border-dashed border-pcnGreen-200 pt-4 font-mono text-[11px] text-muted-foreground">
            <div className="flex min-w-0 items-center gap-2">
              <Prompt>whoami</Prompt>
              <ConsejoAuthorChip author={consejo.author} />
              <span className="ml-auto flex shrink-0 items-center gap-1">
                {consejo.likes && (
                  <LikeButton adviceId={consejo.id} likes={consejo.likes} session={session} />
                )}
                {canEditOrDelete && (
                  <AdviceOptions adviceId={consejo.id} content={consejo.content} />
                )}
              </span>
            </div>

            {consejo.source && (
              <div className="flex flex-col gap-1">
                <p>
                  <Prompt>source </Prompt>
                  <Link
                    href={consejo.source.href}
                    className="text-pcnGreen-600 underline decoration-dotted underline-offset-2 transition-colors hover:text-pcnGreen"
                  >
                    ~/conversaciones/{consejo.source.hash}
                  </Link>{' '}
                  <span className="text-foreground/80">«{consejo.source.title}»</span>
                </p>
                <p className="border border-dashed border-pcnGreen-200 px-2 py-1.5 leading-relaxed">
                  <span className="text-pcnGreen">[auto]</span> Este consejo fue extraído
                  automáticamente del resumen de una conversación del grupo de WhatsApp.{' '}
                  {consejo.author.name} no lo publicó manualmente.
                </p>
              </div>
            )}
          </div>

          {!consejo.source && (
            <div className="-mx-5 border-t border-dashed border-pcnGreen-200 sm:-mx-6 [&>div]:border-b-0 [&>div]:border-r-0">
              <CommentSection adviceId={consejo.id} comments={comments} session={session} />
            </div>
          )}
        </div>
      </div>

      {variant === 'modal' && (
        <p className="flex items-center gap-4 border-t border-dashed border-pcnGreen-200 px-3 py-1.5 font-mono text-[10px] text-muted-foreground max-sm:hidden">
          {nav && nav.total > 0 && (
            <span>
              <Kbd>←</Kbd> <Kbd>→</Kbd> navegar
            </span>
          )}
          <span>
            <Kbd>Esc</Kbd> cerrar
          </span>
          <span className="ml-auto">compartí el link: abre este consejo directo</span>
        </p>
      )}
    </>
  );
}
