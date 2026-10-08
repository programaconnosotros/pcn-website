import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide transition-colors focus:outline-hidden focus:ring-1 focus:ring-pcnGreen',
  {
    variants: {
      variant: {
        default: 'border-pcnGreen-500 bg-pcnGreen-100 text-pcnGreen hover:bg-pcnGreen-200',
        secondary:
          'border-pcnGreen-200 bg-secondary text-secondary-foreground hover:border-pcnGreen-400',
        destructive: 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20',
        outline: 'border-pcnGreen-300 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
