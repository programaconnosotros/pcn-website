import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { changelog } from '@/data/changelog';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SectionHeader } from './section-header';

const LATEST_CHANGES_COUNT = 4;

/**
 * The newest platform changes everyone can see. Rendered on the server and handed to the home as a
 * node, so neither the full changelog nor its admin-only entries reach the browser.
 */
export const LatestChangesSection = () => {
  const latestChanges = changelog
    .filter((entry) => entry.audience !== 'admins')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, LATEST_CHANGES_COUNT);

  return (
    <section>
      <SectionHeader
        eyebrow="Changelog"
        title={
          <>
            Últimas <span className="text-pcnGreen">mejoras</span> en la plataforma
          </>
        }
        description="La plataforma la construimos entre todos y cambia todas las semanas."
        action={{ label: 'Ver el changelog completo', href: '/changelog' }}
      />

      <RuledGrid className="grid-cols-1 md:grid-cols-2">
        {latestChanges.map((entry) => {
          const content = (
            <>
              <span className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-muted-foreground">
                <span className="border border-pcnGreen-200 px-1 leading-4 text-pcnGreen-700">
                  {entry.area}
                </span>
                <time dateTime={entry.date}>{entry.date}</time>
                {entry.href && (
                  <ArrowUpRight className="ml-auto size-3.5 text-muted-foreground/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
                )}
              </span>
              <h3 className="font-mono text-sm font-semibold leading-snug tracking-tight text-foreground group-hover:text-pcnGreen">
                {entry.title}
              </h3>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {entry.description}
              </p>
            </>
          );
          const className = cn(ruledCellClassName, 'group flex flex-col gap-1.5 p-4');

          return entry.href ? (
            <Link key={`${entry.date}-${entry.title}`} href={entry.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={`${entry.date}-${entry.title}`} className={className}>
              {content}
            </div>
          );
        })}
      </RuledGrid>
    </section>
  );
};
