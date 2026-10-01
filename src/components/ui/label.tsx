'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Labels read like terminal prompts: a dim `>` that lights up, along with the label itself,
// while the field inside the same FormItem (`group/field`) has focus.
const labelVariants = cva(
  [
    'inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase leading-none tracking-[0.14em] text-pcnGreen-800 transition-colors duration-200',
    "before:text-pcnGreen-500 before:transition-[color,text-shadow] before:content-['>']",
    'group-focus-within/field:text-pcnGreen group-focus-within/field:before:text-pcnGreen group-focus-within/field:before:text-glow',
    'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  ].join(' '),
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
