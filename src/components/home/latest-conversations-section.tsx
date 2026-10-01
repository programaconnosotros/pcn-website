import { conversationHref, shortHash } from '@/components/conversations/conversation-utils';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { conversations } from '@/data/whatsapp-conversations';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SectionHeader } from './section-header';

const LATEST_CONVERSATIONS_COUNT = 3;

const latestConversations = [...conversations]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, LATEST_CONVERSATIONS_COUNT);

/**
 * A peek at what goes on in the WhatsApp group: its newest summarized conversations. Rendered on the
 * server and handed to the home as a node, so the full conversation archive stays out of the bundle.
 */
export const LatestConversationsSection = () => (
  <section>
    <SectionHeader
      eyebrow="Conversaciones"
      title={
        <>
          Lo último que se habló <span className="text-pcnGreen">en el grupo</span>
        </>
      }
      description="Resúmenes de las discusiones técnicas más recientes de la comunidad."
      action={{ label: 'Ver todas las conversaciones', href: '/conversaciones' }}
    />

    <RuledGrid className="grid-cols-1 md:grid-cols-3">
      {latestConversations.map((conversation) => (
        <Link
          key={shortHash(conversation)}
          href={conversationHref(conversation)}
          className={cn(ruledCellClassName, 'group flex flex-col gap-1.5 p-4')}
        >
          <span className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-muted-foreground">
            <span className="text-pcnGreen-600">{shortHash(conversation)}</span>
            <time dateTime={conversation.date}>{conversation.date}</time>
            <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
          </span>
          <h3 className="font-mono text-sm font-semibold leading-snug tracking-tight text-foreground group-hover:text-pcnGreen">
            {conversation.title}
          </h3>
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {conversation.summary}
          </p>
        </Link>
      ))}
    </RuledGrid>
  </section>
);
