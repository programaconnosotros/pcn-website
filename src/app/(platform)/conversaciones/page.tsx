'use client';

import { useState, useMemo } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Heading2 } from '@/components/ui/heading-2';
import { MessageCircle, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import conversations from '@/data/whatsapp-conversations.json';

interface Conversation {
  title: string;
  date: string;
  summary: string;
}

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

function ConversationCard({ conversation }: { conversation: Conversation }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = conversation.summary.length > 300;

  return (
    <Card className="border border-neutral-200 transition-all duration-200 dark:border-neutral-800">
      <CardHeader className="pb-2 pt-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold leading-snug">{conversation.title}</h3>
          <span className="text-xs text-muted-foreground">{formatDate(conversation.date)}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className={`text-sm text-muted-foreground ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
          {conversation.summary}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-pcnPurple hover:underline dark:text-pcnGreen"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Ver más
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export default function ConversationsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return conversations as Conversation[];
    return (conversations as Conversation[]).filter(
      (c) => c.title.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q),
    );
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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Conversaciones</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 flex w-full flex-row items-center justify-between">
            <Heading2 className="m-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                <MessageCircle className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">
                Conversaciones
              </span>
            </Heading2>
            <Badge variant="secondary" className="hidden sm:block">
              {(conversations as Conversation[]).length} charlas
            </Badge>
          </div>

          <p className="mb-6 text-sm text-muted-foreground">
            Lo más interesante que se charló en el grupo de WhatsApp de PCN. Debates técnicos,
            recomendaciones de herramientas, consejos de carrera y más.
          </p>

          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No se encontraron conversaciones para &quot;{searchTerm}&quot;.
            </p>
          ) : (
            <div className="space-y-8">
              {grouped.map(([monthYear, items]) => (
                <section key={monthYear}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    {monthYear}
                  </h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((c, i) => (
                      <ConversationCard key={`${c.date}-${i}`} conversation={c} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
