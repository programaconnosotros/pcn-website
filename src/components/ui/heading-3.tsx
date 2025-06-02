import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const heading3Variants = cva('scroll-m-20 text-2xl font-semibold tracking-tight', {
  variants: {
    variant: {
      default: '',
      gradient: 'bg-gradient-to-r from-pcnGreen to-teal-600 bg-clip-text text-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface Heading3Props extends VariantProps<typeof heading3Variants> {
  children: React.ReactNode;
  className?: string;
}

export const Heading3 = ({ children, className, variant }: Heading3Props) => (
  <h3 className={cn(heading3Variants({ variant, className }))}>{children}</h3>
);
