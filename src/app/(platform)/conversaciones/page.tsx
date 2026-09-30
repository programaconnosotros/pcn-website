'use client';

import { useState, useMemo } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { conversations, type Conversation } from '@/data/whatsapp-conversations';
import { SearchBar } from '@/components/ui/search-bar';
import { ActivityGraph, type MonthActivity } from '@/components/conversations/activity-graph';
import { ConversationRow } from '@/components/conversations/conversation-row';
import { ConversationDialog } from '@/components/conversations/conversation-dialog';
import { isGroupThread, monthName } from '@/components/conversations/conversation-utils';
import { normalize } from '@/components/conversations/highlight';

const TOP_VOICES = 8;

const monthKey = (date: string) => date.slice(0, 7);

const sortedConversations = [...conversations].sort((a, b) => b.date.localeCompare(a.date));

const allMonthKeys = Array.from(new Set(sortedConversations.map((c) => monthKey(c.date)))).sort();

const participantCounts = (() => {
  const counts = new Map<string, number>();
  for (const { participants } of conversations)
    for (const name of participants) counts.set(name, (counts.get(name) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
})();

const stats = [
  { label: 'charlas', value: conversations.length },
  { label: 'meses', value: allMonthKeys.length },
  { label: 'voces', value: participantCounts.length },
  { label: 'hilos grupales', value: conversations.filter(isGroupThread).length, lit: true },
];

function Stat({ label, value, lit }: { label: string; value: number; lit?: boolean }) {
  return (
    <div className={cn(ruledCellClassName, 'flex flex-col gap-0.5 px-3 py-2 font-mono')}>
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-2xl font-semibold tabular-nums leading-none',
          lit ? 'text-pcnGreen [text-shadow:0_0_14px_rgba(4,244,190,0.6)]' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Flag({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-9 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-xs transition-all',
        active
          ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen shadow-[0_0_18px_-6px_rgba(4,244,190,0.6)]'
          : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-600 hover:text-pcnGreen',
      )}
    >
      <span className="text-pcnGreen-600">[{active ? 'x' : ' '}]</span>
      {children}
    </button>
  );
}

export default function ConversationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupOnly, setGroupOnly] = useState(false);
  const [participant, setParticipant] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleParticipant = (name: string) =>
    setParticipant((current) => (current === name ? null : name));

  // Filtering from inside the dialog changes the list under it, so close it first.
  const filterFromDialog = (name: string) => {
    setOpenIndex(null);
    toggleParticipant(name);
  };

  const filtered = useMemo(() => {
    const query = normalize(searchTerm.trim());
    return sortedConversations.filter(
      (c) =>
        (!groupOnly || isGroupThread(c)) &&
        (!participant || c.participants.includes(participant)) &&
        (!query ||
          normalize(c.title).includes(query) ||
          normalize(c.summary).includes(query) ||
          c.participants.some((name) => normalize(name).includes(query))),
    );
  }, [searchTerm, groupOnly, participant]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Conversation[]>();
    for (const c of filtered) {
      const key = monthKey(c.date);
      groups.set(key, [...(groups.get(key) ?? []), c]);
    }
    return [...groups.entries()];
  }, [filtered]);

  const activity = useMemo<MonthActivity[]>(
    () =>
      allMonthKeys.map((key) => ({
        key,
        total: conversations.filter((c) => monthKey(c.date) === key).length,
        matches: filtered.filter((c) => monthKey(c.date) === key).length,
      })),
    [filtered],
  );

  const isFiltering = Boolean(searchTerm.trim() || groupOnly || participant);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path="conversaciones"
            meta={`${conversations.length} charlas destacadas del grupo de WhatsApp`}
          />

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <SearchBar
              searchQuery={searchTerm}
              setSearchQuery={setSearchTerm}
              placeholder="conversaciones, temas o personas"
              label="Buscar conversaciones"
            />
            <Flag active={groupOnly} onClick={() => setGroupOnly(!groupOnly)}>
              --grupales
            </Flag>
            {participant && (
              <button
                type="button"
                onClick={() => setParticipant(null)}
                className="flex h-9 items-center gap-1.5 rounded-sm border border-pcnGreen-600 bg-pcnGreen/10 px-2.5 font-mono text-xs text-pcnGreen"
              >
                --author=&quot;{participant}&quot;
                <X className="size-3.5" />
                <span className="sr-only">Quitar filtro de persona</span>
              </button>
            )}
            <p
              className="ml-auto font-mono text-xs tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              <span className={cn(isFiltering ? 'text-pcnGreen' : 'text-foreground')}>
                {filtered.length}
              </span>
              /{conversations.length} resultados
            </p>
          </div>
        </StickyHeader>

        <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <RuledGrid className="grid-cols-2 self-start sm:grid-cols-4 xl:grid-cols-2">
            {stats.map((stat) => (
              <Stat key={stat.label} {...stat} />
            ))}
          </RuledGrid>
          <ActivityGraph months={activity} />
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-1 font-mono text-[11px]">
          <span className="mr-1 text-muted-foreground">
            <span className="text-pcnGreen-600">{'// '}</span>voces frecuentes:
          </span>
          {participantCounts.slice(0, TOP_VOICES).map(([name, count]) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleParticipant(name)}
              aria-pressed={participant === name}
              className={cn(
                'border px-1.5 leading-5 transition-colors',
                participant === name
                  ? 'border-pcnGreen bg-pcnGreen/15 text-pcnGreen'
                  : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-600 hover:text-pcnGreen',
              )}
            >
              <span className="text-pcnGreen-600">@</span>
              {name}
              <span className="ml-1.5 tabular-nums text-muted-foreground/70">{count}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mb-14 border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>0 resultados
            {searchTerm.trim() && (
              <>
                {' '}
                para <span className="text-pcnGreen">&quot;{searchTerm}&quot;</span>
              </>
            )}
          </p>
        ) : (
          <div className="mb-14 space-y-6">
            {grouped.map(([key, items]) => {
              const groupCount = items.filter(isGroupThread).length;
              return (
                <section key={key} id={`m-${key}`} className="scroll-mt-4">
                  <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="text-pcnGreen">{'>'}</span>
                    <span className="text-foreground">{key}</span>
                    <span>{monthName(key)}</span>
                    <span
                      aria-hidden
                      className="h-px flex-1 bg-gradient-to-r from-pcnGreen-400 to-transparent"
                    />
                    <span className="tabular-nums">
                      [{items.length}]
                      {groupCount > 0 && (
                        <span className="ml-2 text-pcnGreen">
                          {groupCount} {groupCount === 1 ? 'grupal' : 'grupales'}
                        </span>
                      )}
                    </span>
                  </h2>
                  <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                    {items.map((c) => (
                      <ConversationRow
                        key={`${c.date}-${c.title}`}
                        conversation={c}
                        query={searchTerm}
                        activeParticipant={participant}
                        onParticipantClick={toggleParticipant}
                        onOpen={() => setOpenIndex(filtered.indexOf(c))}
                      />
                    ))}
                  </RuledGrid>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <ConversationDialog
        conversations={filtered}
        index={openIndex}
        query={searchTerm}
        activeParticipant={participant}
        onNavigate={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        onParticipantClick={filterFromDialog}
      />
    </div>
  );
}
