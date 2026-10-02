import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

export type Crumb = { label: string; href?: string };

interface PageTitleProps {
  /** `eventos/charlas` (each parent segment links to its route) or explicit crumbs. */
  path: string | Crumb[];
  meta?: ReactNode;
  action?: ReactNode;
  /** Keeps the title pinned to the top on large screens, for long pages read top to bottom. */
  sticky?: boolean;
  className?: string;
}

const toCrumbs = (path: string): Crumb[] => {
  const segments = path.split('/').filter(Boolean);
  return segments.map((label, i) => ({
    label,
    href: i < segments.length - 1 ? `/${segments.slice(0, i + 1).join('/')}` : undefined,
  }));
};

const crumbLinkClassName = 'text-pcnGreen-500 transition-colors hover:text-pcnGreen';

// Terminal-style page title that doubles as the breadcrumb: `~/eventos/<name>`, where `~` and
// every parent segment are links. Scrolls with the page instead of taking a fixed header bar.
export const PageTitle = ({ path, meta, action, sticky, className }: PageTitleProps) => {
  const crumbs = typeof path === 'string' ? toCrumbs(path) : path;

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono',
        // Pinned 1rem down, where the page's top margin leaves it at rest, so it doesn't shift up
        // when the page starts scrolling; the backdrop reaches up to the edge to hide what passes.
        sticky &&
          'lg:sticky lg:top-4 lg:z-30 lg:-mx-4 lg:border-b lg:border-pcnGreen-200 lg:px-4 lg:py-3 lg:before:absolute lg:before:inset-x-0 lg:before:-top-4 lg:before:bottom-0 lg:before:-z-10 lg:before:bg-background/90 lg:before:backdrop-blur',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 size-7 shrink-0 text-muted-foreground hover:text-pcnGreen max-md:hidden" />
        <nav aria-label="breadcrumb" className="min-w-0">
          <h1 className="flex min-w-0 items-center text-xl font-semibold tracking-tight">
            <Link href="/" className={crumbLinkClassName}>
              ~
            </Link>
            {crumbs.map((crumb, i) => (
              <Fragment key={`${crumb.label}-${i}`}>
                <span className="text-pcnGreen-500/60">/</span>
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={cn(crumbLinkClassName, 'max-w-[14ch] shrink-0 truncate')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="min-w-0 truncate">
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            ))}
            <span className="ml-1 inline-block h-[1.1em] w-2 shrink-0 animate-pulse bg-pcnGreen" />
          </h1>
        </nav>
      </div>
      {(meta || action) && (
        <div className="flex items-center gap-3">
          {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
          {action}
        </div>
      )}
    </div>
  );
};
