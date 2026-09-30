'use client';

import { useState, useMemo } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { conversations, type Conversation } from '@/data/whatsapp-conversations';
import { SearchBar } from '@/components/ui/search-bar';

const MONTHS_ES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} de ${MONTHS_ES[month - 1]} de ${year}`;
}

function getMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number);
  return `${MONTHS_ES[month - 1].charAt(0).toUpperCase() + MONTHS_ES[month - 1].slice(1)} ${year}`;
}

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}-${month}-${day}`;
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = conversation.summary.length > 200;

  return (
    <div className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3')}>
      <div className="flex items-baseline gap-2 font-mono">
        <h3 className="text-sm font-semibold leading-snug">{conversation.title}</h3>
        <time
          dateTime={conversation.date}
          title={formatDate(conversation.date)}
          className="ml-auto shrink-0 text-[11px] text-muted-foreground"
        >
          {formatShortDate(conversation.date)}
        </time>
      </div>
      <p
        className={cn(
          'text-xs leading-relaxed text-muted-foreground',
          !expanded && isLong && 'line-clamp-3',
        )}
      >
        {conversation.summary}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-fit items-center gap-1 font-mono text-[11px] text-pcnGreen-700 hover:text-pcnGreen"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> menos
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> más
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default function ConversationsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const list = q
      ? conversations.filter(
          (c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q),
        )
      : conversations;
    return [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm]);

  const grouped = useMemo(() => {
    const groups: Record<string, Conversation[]> = {};
    for (const c of filtered) {
      const key = getMonthYear(c.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    }
    return Object.entries(groups).sort(
      ([, a], [, b]) => new Date(b[0].date).getTime() - new Date(a[0].date).getTime(),
    );
  }, [filtered]);

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle
            path="conversaciones"
            meta={`${conversations.length} charlas destacadas del grupo de WhatsApp`}
          />

          <SearchBar
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            placeholder="conversaciones"
            label="Buscar conversaciones"
            className="mb-4"
          />

          {filtered.length === 0 ? (
            <p className="border border-pcnGreen-200 p-4 font-mono text-xs text-muted-foreground">
              <span className="text-pcnGreen-500">$ </span>
              No se encontraron conversaciones para &quot;{searchTerm}&quot;.
            </p>
          ) : (
            <div className="mb-14 space-y-4">
              {grouped.map(([monthYear, items]) => (
                <section key={monthYear}>
                  <h2 className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="text-pcnGreen-500">{'// '}</span>
                    {monthYear}
                    <span className="ml-2 text-muted-foreground/60">[{items.length}]</span>
                  </h2>
                  <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                    {items.map((c, i) => (
                      <ConversationCard key={`${c.date}-${i}`} conversation={c} />
                    ))}
                  </RuledGrid>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
