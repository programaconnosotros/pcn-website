import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

// Primary call to action: a lit green slab with a scanline texture, an outer glow and a light
// streak that sweeps across it every few seconds so it catches the eye even at rest.
const primaryCta = cn(
  'relative isolate overflow-hidden border border-pcnGreen bg-pcnGreen font-semibold tracking-tight text-black',
  'animate-cta-pulse motion-reduce:animate-none hover:animate-none',
  'hover:-translate-y-px hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(4,244,190,0.6),0_0_36px_-4px_rgba(4,244,190,0.95),inset_0_1px_0_rgba(255,255,255,0.6)] active:translate-y-0',
  'before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-1/3 before:bg-linear-to-r before:from-transparent before:via-white/70 before:to-transparent before:animate-cta-shine motion-reduce:before:hidden',
  'after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.07)_0_1px,transparent_1px_3px)]',
  '[&_svg]:transition-transform [&_svg]:hover:translate-x-0.5',
  'disabled:animate-none disabled:bg-pcnGreen/50 disabled:shadow-none disabled:before:hidden',
);

// Secondary call to action: a dark terminal frame with lit corner brackets that open up on
// hover while a green fill wipes in from the left.
const secondaryCta = cn(
  'relative border border-pcnGreen-400 bg-black/50 tracking-tight text-pcnGreen-900',
  'bg-[linear-gradient(90deg,rgba(4,244,190,0.16),rgba(4,244,190,0.06))] bg-size-[0%_100%] bg-left bg-no-repeat transition-[background-size,border-color,box-shadow,color,transform] duration-300',
  'hover:border-pcnGreen hover:bg-size-[100%_100%] hover:text-pcnGreen hover:text-glow hover:shadow-[0_0_20px_-4px_rgba(4,244,190,0.65),inset_0_0_12px_-6px_rgba(4,244,190,0.8)]',
  'before:pointer-events-none before:absolute before:-left-px before:-top-px before:size-2 before:border-l-2 before:border-t-2 before:border-pcnGreen before:transition-all before:duration-300 hover:before:size-3',
  'after:pointer-events-none after:absolute after:-bottom-px after:-right-px after:size-2 after:border-b-2 after:border-r-2 after:border-pcnGreen after:transition-all after:duration-300 hover:after:size-3',
  '[&_svg]:text-current [&_svg]:transition-transform [&_svg]:hover:translate-x-0.5',
);

// Buttons with a fill and a border label their action as a function call, e.g. `crearEvento();`.
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm font-mono text-sm font-medium ring-offset-background transition-all focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-pcnGreen focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: primaryCta,
        destructive:
          'border border-red-500/60 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:shadow-[0_0_16px_-4px_rgba(239,68,68,0.7)]',
        outline: secondaryCta,
        secondary:
          'border border-pcnGreen-200 bg-secondary text-secondary-foreground hover:border-pcnGreen-500 hover:text-pcnGreen',
        ghost: 'text-foreground/80 hover:bg-pcnGreen-100 hover:text-pcnGreen',
        link: 'text-pcnGreen underline-offset-4 hover:underline',
        youtube: 'border border-red-500/60 bg-red-600 text-white hover:bg-red-600/90',
        pcn: primaryCta,
        gold: 'bg-[#FFE066] text-black shadow-[0_0_15px_rgba(255,224,102,0.4)] hover:bg-[#FFE066] hover:shadow-[0_0_20px_rgba(255,224,102,0.7)] disabled:bg-[#FFE066]/50 disabled:text-black/70 disabled:shadow-none',
        silver:
          'bg-[#E8E8E8] text-black shadow-[0_0_15px_rgba(232,232,232,0.4)] hover:bg-[#E8E8E8] hover:shadow-[0_0_20px_rgba(232,232,232,0.7)] disabled:bg-[#E8E8E8]/50 disabled:text-black/70 disabled:shadow-none',
        bronze:
          'bg-[#F5B56A] text-black shadow-[0_0_15px_rgba(245,181,106,0.4)] hover:bg-[#F5B56A] hover:shadow-[0_0_20px_rgba(245,181,106,0.7)] disabled:bg-[#F5B56A]/50 disabled:text-black/70 disabled:shadow-none',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-6',
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
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
