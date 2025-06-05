import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const heading2Variants = cva('scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0', {
  variants: {
    variant: {
      default: '',
      gradient:
        'bg-gradient-to-r from-pcnGreen via-teal-500 to-pcnGreen bg-clip-text text-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface Heading2Props extends VariantProps<typeof heading2Variants> {
  children: ReactNode;
  className?: string;
}

export const Heading2 = ({ children, className, variant }: Heading2Props) => (
  <h2 className={cn(heading2Variants({ variant, className }))}>{children}</h2>
);
