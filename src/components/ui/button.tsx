import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm font-mono text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'border border-pcnGreen bg-pcnGreen text-black hover:shadow-[0_0_18px_-2px_rgba(4,244,190,0.7)] active:translate-y-px disabled:bg-pcnGreen/50 disabled:shadow-none',
        destructive:
          'border border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:shadow-[0_0_16px_-4px_rgba(239,68,68,0.7)]',
        outline:
          'border border-pcnGreen-400 bg-black/40 text-pcnGreen-900 hover:border-pcnGreen hover:bg-pcnGreen-100 hover:text-pcnGreen hover:shadow-[0_0_14px_-4px_rgba(4,244,190,0.6)] [&_svg]:text-current',
        secondary:
          'border border-pcnGreen-200 bg-secondary text-secondary-foreground hover:border-pcnGreen-500 hover:text-pcnGreen',
        ghost: 'text-foreground/80 hover:bg-pcnGreen-100 hover:text-pcnGreen',
        link: 'text-pcnGreen underline-offset-4 hover:underline',
        youtube: 'border border-red-500/60 bg-red-600 text-white hover:bg-red-600/90',
        pcn: 'border border-pcnGreen bg-pcnGreen text-black hover:shadow-[0_0_18px_-2px_rgba(4,244,190,0.7)] disabled:bg-pcnGreen/50',
        gold: 'bg-[#FFE066] text-black shadow-[0_0_15px_rgba(255,224,102,0.4)] hover:bg-[#FFE066] hover:shadow-[0_0_20px_rgba(255,224,102,0.7)] disabled:bg-[#FFE066]/50 disabled:text-black/70 disabled:shadow-none',
        silver:
          'bg-[#E8E8E8] text-black shadow-[0_0_15px_rgba(232,232,232,0.4)] hover:bg-[#E8E8E8] hover:shadow-[0_0_20px_rgba(232,232,232,0.7)] disabled:bg-[#E8E8E8]/50 disabled:text-black/70 disabled:shadow-none',
        bronze:
          'bg-[#F5B56A] text-black shadow-[0_0_15px_rgba(245,181,106,0.4)] hover:bg-[#F5B56A] hover:shadow-[0_0_20px_rgba(245,181,106,0.7)] disabled:bg-[#F5B56A]/50 disabled:text-black/70 disabled:shadow-none',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-5',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && !asChild ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
