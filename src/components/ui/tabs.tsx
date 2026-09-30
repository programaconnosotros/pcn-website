'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

// HUD-style tab strip: a scanlined bar with lit corner ticks, where the active tab lights up
// with a glowing underline and bracketed label, like a selected pane in a terminal UI.
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'relative inline-flex h-7 items-stretch justify-center border border-pcnGreen-200 bg-black/70 bg-[repeating-linear-gradient(0deg,rgba(4,244,190,0.035)_0_1px,transparent_1px_3px)] font-mono text-pcnGreen-600',
      'before:pointer-events-none before:absolute before:-left-px before:-top-px before:size-1.5 before:border-l before:border-t before:border-pcnGreen',
      'after:pointer-events-none after:absolute after:-bottom-px after:-right-px after:size-1.5 after:border-b after:border-r after:border-pcnGreen',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const bracketClassName =
  'text-pcnGreen-500 opacity-0 transition-all duration-200 group-hover:opacity-40 group-data-[state=active]:translate-x-0 group-data-[state=active]:opacity-100';

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'group relative inline-flex items-center justify-center gap-1 whitespace-nowrap border-r border-pcnGreen-200 px-2.5 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors last:border-r-0 hover:bg-pcnGreen/[0.06] hover:text-pcnGreen-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-pcnGreen disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-[linear-gradient(0deg,rgba(4,244,190,0.16),rgba(4,244,190,0.02)_70%)] data-[state=active]:text-pcnGreen data-[state=active]:[text-shadow:0_0_8px_rgba(4,244,190,0.6)]',
      // Glowing underline that sweeps in from the left when the tab becomes active.
      'before:absolute before:inset-x-0 before:bottom-0 before:h-0.5 before:origin-left before:scale-x-0 before:bg-pcnGreen before:shadow-[0_0_10px_rgba(4,244,190,0.8)] before:transition-transform before:duration-300 data-[state=active]:before:scale-x-100',
      className,
    )}
    {...props}
  >
    <span aria-hidden className={cn(bracketClassName, '-translate-x-0.5')}>
      [
    </span>
    {children}
    <span aria-hidden className={cn(bracketClassName, 'translate-x-0.5')}>
      ]
    </span>
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
