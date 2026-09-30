import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface SubPageTitleProps {
  backHref: string;
  path: string;
  title: ReactNode;
  action?: ReactNode;
}

// Compact mono title for event sub-pages: `← ~/eventos/<path> title` plus an optional action.
export const SubPageTitle = ({ backHref, path, title, action }: SubPageTitleProps) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-mono">
    <div className="flex min-w-0 items-center gap-2">
      <Link
        href={backHref}
        aria-label="Volver"
        className="flex h-7 w-7 shrink-0 items-center justify-center border border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen hover:text-pcnGreen"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
      </Link>
      <h1 className="text-xl font-semibold tracking-tight">
        <span className="text-pcnGreen-500">~/{path}</span>
        {title}
      </h1>
    </div>
    {action}
  </div>
);
