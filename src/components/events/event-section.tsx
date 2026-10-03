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
    <h2 className="mb-2 flex items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      <span>
        <span className="text-pcnGreen-500">{'// '}</span>
        {title}
      </span>
      {aside && <span className="normal-case tracking-normal">{aside}</span>}
    </h2>
    {children}
  </section>
);
