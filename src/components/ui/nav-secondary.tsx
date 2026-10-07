import * as React from 'react';
import { type LucideIcon } from 'lucide-react';

import { SidebarGroup } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function NavSecondary({
  items,
  className,
  flush = false,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
  /** Inside a ruled block: the links share hairlines instead of having their own boxes. */
  flush?: boolean;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup
      className={cn('py-1', flush && 'border-b border-pcnGreen-200 py-0', className)}
      {...props}
    >
      <div className={cn('grid grid-cols-2', flush ? 'divide-x divide-pcnGreen-200' : 'gap-1.5')}>
        {items.map((item) => (
          <a
            key={item.title}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex h-8 items-center justify-center gap-1.5 font-mono text-[11px] font-medium text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground',
              !flush && 'rounded-sm border border-pcnGreen-200 hover:border-sidebar-border',
            )}
          >
            <item.icon className="size-3.5" strokeWidth={1.75} />
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </SidebarGroup>
  );
}
