import { cn } from '@/lib/utils';

/** A block of the event page under a `// title` comment-style heading. */
export const EventSection = ({
  title,
  aside,
  className,
  children,
}: {
  title: string;
  /** Shown at the right of the heading (a count, a link). */
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <section className={cn('p-3', className)}>
    {/* The title never breaks; when the aside doesn't fit next to it, it moves whole to the next line. */}
    <h2 className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
      <span className="whitespace-nowrap">
        <span className="text-pcnGreen-500">{'// '}</span>
        {title}
      </span>
      {aside && <span className="tracking-normal whitespace-nowrap normal-case">{aside}</span>}
    </h2>
    {children}
  </section>
);
