import * as React from 'react';

import { cn } from '@/lib/utils';

// Compact terminal tables: mono uppercase headers that stick while the body scrolls, dense
// rows with faint zebra striping, and a green bar on the hovered row's left edge.

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full scrollbar-thin overflow-auto">
      <table
        ref={ref}
        className={cn('w-full caption-bottom border-collapse text-xs', className)}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'sticky top-0 z-10 bg-black/90 backdrop-blur-sm [&_tr]:border-b [&_tr]:border-pcnGreen-300 [&_tr]:shadow-none [&_tr:hover]:bg-transparent',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      '[&_tr:last-child]:border-0 [&_tr:nth-child(even)]:bg-pcnGreen/[0.02]',
      className,
    )}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-pcnGreen-300 bg-pcnGreen/[0.04] font-mono font-medium last:[&>tr]:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-dashed border-foreground/8 transition-colors hover:bg-pcnGreen/[0.06] hover:shadow-[inset_2px_0_0_#04f4be] data-[state=selected]:bg-pcnGreen/10 data-[state=selected]:shadow-[inset_2px_0_0_#04f4be]',
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-8 px-3 text-left align-middle font-mono text-[10px] font-medium tracking-wider whitespace-nowrap text-pcnGreen-600 uppercase has-[[role=checkbox]]:pr-0',
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('h-9 px-3 py-1 align-middle has-[[role=checkbox]]:pr-0', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-3 font-mono text-[11px] text-muted-foreground', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

/** A tiny status tag for table cells: `[admin]`, `[ok]`, `[pendiente]`. */
const TableTag = ({
  tone = 'muted',
  className,
  children,
}: {
  tone?: 'green' | 'muted' | 'warn' | 'danger' | 'purple';
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={cn(
      'inline-flex items-center border px-1 font-mono text-[10px] leading-4 tracking-wider whitespace-nowrap uppercase',
      tone === 'green' &&
        'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen shadow-[0_0_8px_-3px_#04f4be]',
      tone === 'muted' && 'border-pcnGreen-200 text-muted-foreground',
      tone === 'warn' && 'border-amber-500/50 bg-amber-500/10 text-amber-400',
      tone === 'danger' && 'border-red-500/50 bg-red-500/10 text-red-400',
      tone === 'purple' && 'border-[#8b7cf0]/50 bg-pcnPurple/20 text-[#a99cf5]',
      className,
    )}
  >
    {children}
  </span>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableTag,
};
