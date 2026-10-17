import { fullRowsClassName, type Columns } from '@/lib/full-rows';
import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

// A grid whose cells share hairlines instead of floating as separate cards:
// the grid draws the top/left edge and every cell draws its own bottom/right.
export const RuledGrid = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid border-t border-l border-pcnGreen-200', className)} {...props} />
);

export const ruledCellClassName =
  'border-b border-r border-pcnGreen-200 transition-colors hover:bg-pcnGreen/[0.04]';

export const RuledCell = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(ruledCellClassName, className)} {...props} />
);

/**
 * A cell of a capped preview grid, hidden at the breakpoints where it would leave its row half
 * empty (see src/lib/full-rows.ts). `columns` must match the grid's `grid-cols-*` classes.
 */
export const FullRowsCell = ({
  index,
  count,
  columns,
  children,
}: {
  index: number;
  count: number;
  columns: Columns;
  children: ReactNode;
}) => {
  const hidden = fullRowsClassName(index, count, columns);
  // A one-cell grid stretches the cell to the row's height, like it was a direct grid item.
  return hidden ? <div className={cn('grid', hidden)}>{children}</div> : children;
};
