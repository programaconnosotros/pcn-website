import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const heading1Variants = cva('scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl', {
  variants: {
    variant: {
      default: '',
      gradient: 'bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface Heading1Props extends VariantProps<typeof heading1Variants> {
  children: ReactNode;
  className?: string;
}

export const Heading1 = ({ children, className, variant }: Heading1Props) => (
  <h1 className={cn(heading1Variants({ variant, className }))}>{children}</h1>
);
