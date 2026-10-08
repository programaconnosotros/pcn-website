import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import type { ChangelogAuthor, VisibleChangelogEntry } from '@/lib/changelog';
import { cn } from '@/lib/utils';

// `@Name` links to the PCN profile the GitHub login is linked to; unlinked logins show as plain
// text since there is no profile to open.
function Author({ author }: { author: ChangelogAuthor }) {
  if (!author.user) {
    return (
      <span className="text-muted-foreground" title="Sin perfil vinculado en PCN">
        <span className="text-pcnGreen-600">@</span>
        {author.login}
      </span>
    );
  }

  return (
    <Link
      href={`/perfil/${author.user.id}`}
      title={`Ver el perfil de ${author.user.name}`}
      className="text-pcnGreen-700 transition-colors hover:text-pcnGreen"
    >
      <span className="text-pcnGreen-600">@</span>
      {author.user.name}
    </Link>
  );
}

/**
 * One change, as /changelog and the contributions tab of a profile show it. `showDate` is for
 * lists that are not already grouped by day.
 */
export function ChangelogRow({
  entry,
  showDate = false,
}: {
  entry: VisibleChangelogEntry;
  showDate?: boolean;
}) {
  return (
    <article
      className={cn(
        ruledCellClassName,
        'relative flex flex-col gap-1.5 p-3',
        entry.adminOnly && 'bg-amber-400/3 hover:bg-amber-400/6',
      )}
    >
      {entry.adminOnly && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-amber-400"
        />
      )}

      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted-foreground">
        {showDate && (
          <time dateTime={entry.date} className="tabular-nums">
            {entry.date}
          </time>
        )}
        <span className="border border-pcnGreen-200 px-1 leading-4 text-pcnGreen-700">
          {entry.area}
        </span>
        {entry.adminOnly && (
          <span className="border border-amber-400/60 px-1 text-[10px] leading-4 tracking-wider text-amber-400 uppercase">
            solo admins
          </span>
        )}
        <span className="ml-auto flex flex-wrap items-center gap-x-2">
          {entry.authors.map((author) => (
            <Author key={author.login} author={author} />
          ))}
        </span>
      </div>

      <h3 className="leading-snug font-semibold">
        {entry.href ? (
          <Link
            href={entry.href}
            className="inline-flex group items-center gap-1 transition-colors hover:text-pcnGreen"
          >
            {entry.title}
            <ArrowUpRight className="size-3.5 text-pcnGreen-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ) : (
          entry.title
        )}
      </h3>
      <p className="text-sm text-muted-foreground">{entry.description}</p>
    </article>
  );
}
