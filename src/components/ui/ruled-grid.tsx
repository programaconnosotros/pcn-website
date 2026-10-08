import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

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
