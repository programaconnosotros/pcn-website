import * as React from 'react';
import { type LucideIcon } from 'lucide-react';

import { SidebarGroup } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function NavSecondary({
  items,
  className,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup className={cn('py-1', className)} {...props}>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map((item) => (
          <a
            key={item.title}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-sidebar-border/70 text-[12px] font-medium text-sidebar-foreground/55 transition-colors hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <item.icon className="size-3.5" strokeWidth={1.75} />
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </SidebarGroup>
  );
}
