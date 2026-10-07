'use client';

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Conversation } from '@/data/whatsapp-conversations';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, ExternalLink, Link2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  METER_SLOTS,
  conversationHref,
  formatLongDate,
  isGroupThread,
  shortHash,
  toSentences,
} from './conversation-utils';
import { ConversationEventLink } from './conversation-event';
import { Highlight } from './highlight';
import { LinkedNames } from './linked-names';
import { ParticipantChip } from './participant-chip';

const keyCapClassName = cn(
  'flex size-7 shrink-0 items-center justify-center rounded-sm border border-pcnGreen-200 bg-black/70 text-pcnGreen-600 transition-all',
  'hover:border-pcnGreen hover:text-pcnGreen hover:shadow-[0_0_14px_-2px_rgba(4,244,190,0.7)]',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen',
  'disabled:pointer-events-none disabled:opacity-40',
);

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">{children}</kbd>
);

// Copies the conversation's deep link (`/conversaciones?c=<hash>`), which opens it on load.
function CopyLinkButton({ conversation }: { conversation: Conversation }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(conversationHref(conversation), window.location.origin).toString(),
      );
      setCopied(true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <button
      type="button"
      className={cn(keyCapClassName, copied && 'border-pcnGreen text-pcnGreen')}
      onClick={handleCopy}
      title={copied ? 'Link copiado' : 'Copiar link para compartir'}
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copiado' : 'Copiar link para compartir'}
      </span>
    </button>
  );
}

interface ConversationDialogProps {
  conversations: Conversation[];
  index: number | null;
  query: string;
  activeParticipant: string | null;
  onNavigate: (_index: number) => void;
  onClose: () => void;
  onParticipantClick: (_name: string) => void;
}

/** `https://www.github.com/a/b?x=1` → host `github.com`, rest `/a/b?x=1`. */
export const linkLabel = (url: string) => {
  try {
    const { hostname, pathname, search } = new URL(url);
    const rest = `${pathname === '/' ? '' : pathname}${search}`;
    return { host: hostname.replace(/^www\./, ''), rest };
  } catch {
    return { host: url, rest: '' };
  }
};

// The full summary on the terminal dialog: a `~/conversaciones/<hash>` path bar with a counter
// and prev/next key caps, the date and participant meter, the title, the summary as numbered
// log lines and the roster. Arrows step through the current (filtered) list.
export function ConversationDialog({
  conversations,
  index,
  query,
  activeParticipant,
  onNavigate,
  onClose,
  onParticipantClick,
}: ConversationDialogProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const conversation = index === null ? undefined : conversations[index];
  const total = conversations.length;

  // Start every conversation from the top.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [index]);

  if (!conversation || index === null) return null;

  const hasPrevious = index > 0;
  const hasNext = index < total - 1;
  const isGroup = isGroupThread(conversation);
  const sentences = toSentences(conversation.summary);
  const lineNumberWidth = String(sentences.length).length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowLeft' && hasPrevious) onNavigate(index - 1);
    else if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1);
    else return;
    e.preventDefault();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          // Only the body scrolls. Safari counts the body's overflow as the panel's own, so with the
          // surface's default `overflow-y-auto` the whole panel scrolled away past its footer.
          'flex max-h-[calc(100dvh-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 [&>button:last-child]:hidden',
          // The phone tab bar (h-16 + safe area, z-60) sits above dialogs, so center the reader
          // in the space above it and cap its height to that space instead of the full viewport.
          'max-md:top-[calc((100dvh+env(safe-area-inset-top)-4rem-env(safe-area-inset-bottom))/2)]',
          'max-md:max-h-[calc(100dvh-env(safe-area-inset-top)-4rem-env(safe-area-inset-bottom)-1.5rem)]',
          // Inside a PCN OS window there is no tab bar.
          'embedded:max-md:top-1/2 embedded:max-md:max-h-[calc(100dvh-2rem)]',
        )}
        aria-describedby={undefined}
        onKeyDown={handleKeyDown}
      >
        <header className="flex items-center gap-3 border-b border-dashed border-pcnGreen-200 py-2 pl-3 pr-2 text-xs">
          <p className="min-w-0 flex-1 truncate">
            <span className="text-pcnGreen-500">~/conversaciones/</span>
            <span className="text-pcnGreen">{shortHash(conversation)}</span>
          </p>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            [
            <span className="text-pcnGreen">
              {String(index + 1).padStart(String(total).length, '0')}
            </span>
            /{total}]
          </span>
          <div className="flex shrink-0 gap-1">
            <CopyLinkButton key={shortHash(conversation)} conversation={conversation} />
            <button
              type="button"
              className={keyCapClassName}
              onClick={() => onNavigate(index - 1)}
              disabled={!hasPrevious}
              title="Anterior (←)"
            >
              <ChevronLeft className="size-4" />
              <span className="sr-only">Anterior</span>
            </button>
            <button
              type="button"
              className={keyCapClassName}
              onClick={() => onNavigate(index + 1)}
              disabled={!hasNext}
              title="Siguiente (→)"
            >
              <ChevronRight className="size-4" />
              <span className="sr-only">Siguiente</span>
            </button>
            <DialogClose className={cn(keyCapClassName, 'group')} title="Cerrar (Esc)">
              <X className="size-4 transition-transform duration-300 group-hover:rotate-90" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
          </div>
        </header>

        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div
            key={index}
            className="flex flex-col gap-4 p-5 duration-300 animate-in fade-in slide-in-from-bottom-1 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
              <time dateTime={conversation.date}>
                <span className="text-pcnGreen-600">$ date </span>
                {formatLongDate(conversation.date)}
              </time>
              <ConversationEventLink conversation={conversation} />
              {isGroup && (
                <span className="border border-pcnGreen-600 px-1 text-[10px] uppercase leading-4 tracking-wider text-pcnGreen shadow-[0_0_10px_-2px_rgba(4,244,190,0.6)]">
                  muchos participantes
                </span>
              )}
            </div>

            <DialogTitle className="text-lg leading-snug sm:text-xl">
              <Highlight text={conversation.title} query={query} />
            </DialogTitle>

            <ol className="border-l border-pcnGreen-200 font-sans text-sm leading-relaxed text-foreground/85">
              {sentences.map((sentence, i) => (
                <li
                  key={i}
                  className="group/line flex gap-3 py-1 pl-3 transition-colors hover:bg-pcnGreen/[0.04]"
                >
                  <span
                    aria-hidden
                    className="shrink-0 select-none pt-px font-mono text-[11px] tabular-nums text-pcnGreen-500 group-hover/line:text-pcnGreen"
                  >
                    {String(i + 1).padStart(lineNumberWidth, '0')}
                  </span>
                  <span>
                    <LinkedNames
                      text={sentence}
                      query={query}
                      participants={conversation.participants}
                    />
                  </span>
                </li>
              ))}
            </ol>

            {conversation.links && conversation.links.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-dashed border-pcnGreen-200 pt-4">
                <p className="text-[11px] text-muted-foreground">
                  <span className="text-pcnGreen-600">$ grep -o https:// </span>
                  {conversation.links.length}{' '}
                  {conversation.links.length === 1 ? 'link compartido' : 'links compartidos'}
                </p>
                <ul className="flex flex-col gap-1 text-xs">
                  {conversation.links.map((url) => {
                    const { host, rest } = linkLabel(url);
                    return (
                      <li key={url}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="group/link flex min-w-0 items-center gap-1.5 text-foreground/85 hover:text-pcnGreen"
                        >
                          <ExternalLink className="size-3 shrink-0 text-pcnGreen-600" />
                          <span className="shrink-0 text-pcnGreen">{host}</span>
                          <span className="min-w-0 truncate text-muted-foreground group-hover/link:text-pcnGreen">
                            {rest}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {conversation.participants.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-dashed border-pcnGreen-200 pt-4">
                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="text-pcnGreen-600">$ who</span>
                  <span aria-hidden className="flex gap-px">
                    {Array.from({ length: METER_SLOTS }, (_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-2 w-1',
                          i < conversation.participants.length
                            ? 'bg-pcnGreen shadow-[0_0_4px_rgba(4,244,190,0.8)]'
                            : 'bg-pcnGreen-100',
                        )}
                      />
                    ))}
                  </span>
                  <span className="tabular-nums">
                    {conversation.participants.length}{' '}
                    {conversation.participants.length === 1 ? 'participante' : 'participantes'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {conversation.participants.map((name) => (
                    <ParticipantChip
                      key={name}
                      name={name}
                      active={activeParticipant === name}
                      onClick={() => onParticipantClick(name)}
                      title={`Ver las conversaciones de ${name}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="flex items-center gap-4 border-t border-dashed border-pcnGreen-200 px-3 py-1.5 text-[10px] text-muted-foreground max-sm:hidden">
          <span>
            <Kbd>←</Kbd> <Kbd>→</Kbd> navegar
          </span>
          <span>
            <Kbd>Esc</Kbd> cerrar
          </span>
          <span className="ml-auto">click en @persona para filtrar</span>
        </p>
      </DialogContent>
    </Dialog>
  );
}
