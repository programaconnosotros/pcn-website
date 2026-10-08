import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Megaphone } from 'lucide-react';
import { fetchAnnouncements } from '@/actions/announcements/get-announcements';
import { fetchUpcomingEvents } from '@/actions/events/fetch-upcoming-events';
import { partners } from '@/data/partners';
import { partnerLogoGroupHoverClassName } from '@/components/home/partner-logo-styles';
import { cn } from '@/lib/utils';

const ANNOUNCEMENTS = 3;
const PARTNERS = 6;

const dateFormat = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Argentina/Buenos_Aires',
});

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border border-pcnGreen-200 bg-black/40">
    <h2 className="border-b border-pcnGreen-200 px-3 py-2 font-mono text-[11px] tracking-[0.18em] text-pcnGreen-600 uppercase">
      <span className="text-pcnGreen-300">{'// '}</span>
      {title}
    </h2>
    {children}
  </section>
);

const excerpt = (text: string, max = 110) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/**
 * The feed's side column, pinned while the feed scrolls: the next event, the latest announcements
 * (pinned ones first) and the partners that support the community.
 */
export async function FeedAside() {
  const [events, announcements] = await Promise.all([fetchUpcomingEvents(1), fetchAnnouncements()]);
  const next = events[0];

  return (
    <div className="flex flex-col gap-3">
      <Panel title="próximo evento">
        {next ? (
          <Link
            href={`/eventos/${next.id}`}
            className="flex group flex-col gap-1 px-3 py-3 transition-colors hover:bg-pcnGreen/[0.05]"
          >
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-pcnGreen">
              <CalendarDays className="size-3.5" />
              {dateFormat.format(next.date)}
            </span>
            <span className="font-mono text-sm leading-snug font-semibold group-hover:text-pcnGreen">
              {next.name}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground group-hover:text-pcnGreen">
              anotarme <ArrowUpRight className="size-3" />
            </span>
          </Link>
        ) : (
          <p className="px-3 py-3 font-mono text-xs text-muted-foreground">
            No hay eventos agendados.{' '}
            <Link href="/eventos" className="text-pcnGreen hover:underline">
              ver anteriores
            </Link>
          </p>
        )}
      </Panel>

      {announcements.length > 0 && (
        <Panel title="anuncios">
          <ul className="divide-y divide-pcnGreen-200">
            {announcements.slice(0, ANNOUNCEMENTS).map((announcement) => (
              <li key={announcement.id}>
                <Link
                  href="/anuncios"
                  className="flex group flex-col gap-1 px-3 py-2.5 transition-colors hover:bg-pcnGreen/[0.05]"
                >
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                    <Megaphone className={cn('size-3', announcement.pinned && 'text-pcnGreen')} />
                    {announcement.pinned ? 'fijado' : announcement.category}
                  </span>
                  <span className="text-sm leading-snug font-medium group-hover:text-pcnGreen">
                    {announcement.title}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {excerpt(announcement.content)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="nos acompañan">
        <ul className="grid grid-cols-2 divide-x divide-y divide-pcnGreen-200 border-t-0">
          {partners.slice(0, PARTNERS).map((partner) => (
            <li key={partner.name}>
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                title={partner.name}
                className="flex h-16 group items-center justify-center px-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo}
                  alt={partner.name}
                  loading="lazy"
                  className={cn(
                    'h-7 w-24 object-contain',
                    partnerLogoGroupHoverClassName,
                    partner.monochromeOnDark && 'brightness-0 invert',
                  )}
                />
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/partners"
          className="block border-t border-pcnGreen-200 px-3 py-2 font-mono text-[11px] text-pcnGreen-700 hover:text-pcnGreen"
        >
          ver todos los partners →
        </Link>
      </Panel>
    </div>
  );
}
