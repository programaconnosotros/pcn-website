import { ruledCellClassName } from '@/components/ui/ruled-grid';
import type { Conversation } from '@/data/whatsapp-conversations';
import { cn } from '@/lib/utils';
import { METER_SLOTS, formatShortDate, isGroupThread, shortHash } from './conversation-utils';
import { ConversationEventLink } from './conversation-event';
import { Highlight } from './highlight';
import { ParticipantChip } from './participant-chip';

const COLLAPSED_PARTICIPANTS = 3;

interface ConversationRowProps {
  conversation: Conversation;
  query: string;
  activeParticipant: string | null;
  onParticipantClick: (_name: string) => void;
  onOpen: () => void;
}

export function ConversationRow({
  conversation,
  query,
  activeParticipant,
  onParticipantClick,
  onOpen,
}: ConversationRowProps) {
  const { title, date, summary, participants } = conversation;
  const isGroup = isGroupThread(conversation);
  const visibleParticipants = isGroup
    ? participants
    : participants.slice(0, COLLAPSED_PARTICIPANTS);
  const hiddenCount = participants.length - visibleParticipants.length;

  return (
    <article
      className={cn(
        ruledCellClassName,
        'group relative flex flex-col gap-1.5 p-3',
        isGroup &&
          'bg-pcnGreen/[0.035] bg-[repeating-linear-gradient(0deg,rgba(4,244,190,0.03)_0_1px,transparent_1px_3px)] hover:bg-pcnGreen/[0.07]',
      )}
    >
      {isGroup && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-pcnGreen shadow-[0_0_12px_rgba(4,244,190,0.8)]"
        />
      )}

      {/* Phones get a single short line here (short date, short badge); the hash and the event
          move out of the way so nothing wraps. */}
      <div className="flex min-w-0 items-center gap-2 whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground">
        <span className="hidden text-pcnGreen-600 sm:inline">{shortHash(conversation)}</span>
        <time dateTime={date}>
          <span className="sm:hidden">{formatShortDate(date)}</span>
          <span className="hidden sm:inline">{date}</span>
        </time>
        <span className="hidden min-w-0 sm:flex">
          <ConversationEventLink conversation={conversation} />
        </span>
        {isGroup && (
          <span className="shrink-0 border border-pcnGreen-600 px-1 text-[10px] uppercase leading-4 tracking-wider text-pcnGreen shadow-[0_0_10px_-2px_rgba(4,244,190,0.6)]">
            <span className="sm:hidden">grupal</span>
            <span className="hidden sm:inline">muchos participantes</span>
          </span>
        )}
        {participants.length > 0 && (
          <span
            className="ml-auto flex shrink-0 items-center gap-1.5"
            title={`${participants.length} participantes`}
          >
            <span aria-hidden className="flex gap-px">
              {Array.from({ length: METER_SLOTS }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2 w-1',
                    i < participants.length
                      ? isGroup
                        ? 'bg-pcnGreen shadow-[0_0_4px_rgba(4,244,190,0.8)]'
                        : 'bg-pcnGreen-600'
                      : 'bg-pcnGreen-100',
                  )}
                />
              ))}
            </span>
            <span className={cn(isGroup && 'text-pcnGreen')}>
              {participants.length}
              <span className="sr-only"> participantes</span>
            </span>
          </span>
        )}
      </div>

      {/* The title button stretches over the whole card, so clicking anywhere opens the summary. */}
      <h3
        className={cn(
          'font-mono text-sm font-semibold leading-snug transition-colors group-hover:text-pcnGreen',
          isGroup && 'text-[15px]',
        )}
      >
        <button
          type="button"
          onClick={onOpen}
          className="text-left after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-1 focus-visible:after:ring-inset focus-visible:after:ring-pcnGreen"
        >
          <Highlight text={title} query={query} />
        </button>
      </h3>

      <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground sm:text-xs">
        <Highlight text={summary} query={query} />
      </p>

      <span className="flex min-w-0 font-mono text-[11px] sm:hidden">
        <ConversationEventLink conversation={conversation} />
      </span>

      {/* On phones the chips stay on one line that scrolls sideways instead of stacking into
          rows, and the whole card already opens the summary, so "abrir resumen" goes away. Gaps
          let taps through to the card. */}
      <div className="pointer-events-none -mx-3 mt-auto flex items-center gap-1 overflow-x-auto px-3 pt-1 font-mono text-[11px] [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-24px),transparent)] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none] [&::-webkit-scrollbar]:hidden">
        {/* Lifted above the title's stretched hit area so `@name` filters instead of opening. */}
        {visibleParticipants.map((name) => (
          <span
            key={name}
            className="pointer-events-auto relative z-10 flex shrink-0 whitespace-nowrap"
          >
            <ParticipantChip
              name={name}
              active={activeParticipant === name}
              onClick={() => onParticipantClick(name)}
            />
          </span>
        ))}
        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={onOpen}
            title="Ver todos los participantes"
            className="pointer-events-auto relative z-10 shrink-0 px-1 leading-5 text-muted-foreground transition-colors hover:text-pcnGreen"
          >
            +{hiddenCount}
          </button>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="group/open pointer-events-auto ml-auto hidden items-center gap-1 border border-transparent px-1.5 leading-5 text-pcnGreen-700 transition-all hover:border-pcnGreen-600 hover:text-pcnGreen hover:shadow-[0_0_10px_-2px_rgba(4,244,190,0.6)] sm:flex"
        >
          <span className="text-pcnGreen-600 group-hover/open:text-pcnGreen">&gt;_</span>
          abrir resumen
        </button>
      </div>
    </article>
  );
}
