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
export const PageTitle = ({ path, meta, action, className }: PageTitleProps) => {
  const crumbs = typeof path === 'string' ? toCrumbs(path) : path;

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 font-mono',
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
        // Wraps (meta above the action) rather than pushing the page sideways on narrow screens.
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
          {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
          {action}
        </div>
      )}
    </div>
  );
};
