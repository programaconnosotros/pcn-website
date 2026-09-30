'use client';

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Conversation } from '@/data/whatsapp-conversations';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
  METER_SLOTS,
  formatLongDate,
  isGroupThread,
  shortHash,
  toSentences,
} from './conversation-utils';
import { Highlight } from './highlight';

const keyCapClassName = cn(
  'flex size-7 shrink-0 items-center justify-center rounded-sm border border-pcnGreen-200 bg-black/70 text-pcnGreen-600 transition-all',
  'hover:border-pcnGreen hover:text-pcnGreen hover:shadow-[0_0_14px_-2px_rgba(4,244,190,0.7)]',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen',
  'disabled:pointer-events-none disabled:opacity-40',
);

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-sm border border-pcnGreen-200 px-1 text-pcnGreen-600">{children}</kbd>
);

interface ConversationDialogProps {
  conversations: Conversation[];
  index: number | null;
  query: string;
  activeParticipant: string | null;
  onNavigate: (_index: number) => void;
  onClose: () => void;
  onParticipantClick: (_name: string) => void;
}

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
        className="flex max-h-[calc(100dvh-2rem)] max-w-3xl flex-col gap-0 p-0 [&>button:last-child]:hidden"
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

        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto">
          <div
            key={index}
            className="flex flex-col gap-4 p-5 duration-300 animate-in fade-in slide-in-from-bottom-1 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] tabular-nums text-muted-foreground">
              <time dateTime={conversation.date}>
                <span className="text-pcnGreen-600">$ date </span>
                {formatLongDate(conversation.date)}
              </time>
              {isGroup && (
                <span className="border border-pcnGreen-600 px-1 text-[10px] uppercase leading-4 tracking-wider text-pcnGreen shadow-[0_0_10px_-2px_rgba(4,244,190,0.6)]">
                  hilo grupal
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
                    <Highlight text={sentence} query={query} />
                  </span>
                </li>
              ))}
            </ol>

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
                    <button
                      key={name}
                      type="button"
                      onClick={() => onParticipantClick(name)}
                      aria-pressed={activeParticipant === name}
                      title={`Ver las conversaciones de ${name}`}
                      className={cn(
                        'border px-1.5 leading-5 transition-colors',
                        activeParticipant === name
                          ? 'border-pcnGreen bg-pcnGreen/15 text-pcnGreen'
                          : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-600 hover:text-pcnGreen',
                      )}
                    >
                      <span className="text-pcnGreen-600">@</span>
                      {name}
                    </button>
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
