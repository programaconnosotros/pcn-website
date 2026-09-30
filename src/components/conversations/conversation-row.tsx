'use client';

import { ruledCellClassName } from '@/components/ui/ruled-grid';
import type { Conversation } from '@/data/whatsapp-conversations';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Highlight } from './highlight';

/** Conversations naming at least this many members are highlighted as group threads. */
export const GROUP_THREAD_MIN = 5;

const COLLAPSED_PARTICIPANTS = 3;
const METER_SLOTS = 8;

// A stable, git-like short hash so every conversation gets its own id.
const shortHash = (text: string) => {
  let hash = 5381;
  for (const char of text) hash = (Math.imul(hash, 33) ^ char.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, '0').slice(0, 7);
};

interface ConversationRowProps {
  conversation: Conversation;
  query: string;
  activeParticipant: string | null;
  onParticipantClick: (_name: string) => void;
}

export function ConversationRow({
  conversation,
  query,
  activeParticipant,
  onParticipantClick,
}: ConversationRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { title, date, summary, participants } = conversation;
  const isGroupThread = participants.length >= GROUP_THREAD_MIN;
  const isLong = summary.length > 200;
  const visibleParticipants =
    isGroupThread || expanded ? participants : participants.slice(0, COLLAPSED_PARTICIPANTS);
  const hiddenCount = participants.length - visibleParticipants.length;

  return (
    <article
      className={cn(
        ruledCellClassName,
        'group relative flex flex-col gap-1.5 p-3',
        isGroupThread &&
          'bg-pcnGreen/[0.035] bg-[repeating-linear-gradient(0deg,rgba(4,244,190,0.03)_0_1px,transparent_1px_3px)] hover:bg-pcnGreen/[0.07]',
      )}
    >
      {isGroupThread && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-pcnGreen shadow-[0_0_12px_rgba(4,244,190,0.8)]"
        />
      )}

      <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-muted-foreground">
        <span className="text-pcnGreen-600">{shortHash(`${date}${title}`)}</span>
        <time dateTime={date}>{date}</time>
        {isGroupThread && (
          <span className="border border-pcnGreen-600 px-1 text-[10px] uppercase leading-4 tracking-wider text-pcnGreen shadow-[0_0_10px_-2px_rgba(4,244,190,0.6)]">
            hilo grupal
          </span>
        )}
        {participants.length > 0 && (
          <span
            className="ml-auto flex items-center gap-1.5"
            title={`${participants.length} participantes`}
          >
            <span aria-hidden className="flex gap-px">
              {Array.from({ length: METER_SLOTS }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2 w-1',
                    i < participants.length
                      ? isGroupThread
                        ? 'bg-pcnGreen shadow-[0_0_4px_rgba(4,244,190,0.8)]'
                        : 'bg-pcnGreen-600'
                      : 'bg-pcnGreen-100',
                  )}
                />
              ))}
            </span>
            <span className={cn(isGroupThread && 'text-pcnGreen')}>
              {participants.length}
              <span className="sr-only"> participantes</span>
            </span>
          </span>
        )}
      </div>

      <h3
        className={cn(
          'font-mono text-sm font-semibold leading-snug transition-colors group-hover:text-pcnGreen',
          isGroupThread && 'text-[15px]',
        )}
      >
        <Highlight text={title} query={query} />
      </h3>

      <p
        className={cn(
          'text-xs leading-relaxed text-muted-foreground',
          !expanded && isLong && 'line-clamp-3',
        )}
      >
        <Highlight text={summary} query={query} />
      </p>

      {(participants.length > 0 || isLong) && (
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1 font-mono text-[11px]">
          {visibleParticipants.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onParticipantClick(name)}
              aria-pressed={activeParticipant === name}
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
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="px-1 leading-5 text-muted-foreground transition-colors hover:text-pcnGreen"
            >
              +{hiddenCount}
            </button>
          )}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="ml-auto leading-5 text-pcnGreen-700 transition-colors hover:text-pcnGreen"
            >
              {expanded ? '[-] menos' : '[+] más'}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
