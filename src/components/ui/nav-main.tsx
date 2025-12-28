'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavMain({
  items,
  label,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    badge?: number;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  label?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.url === '/' ? false : item.url !== '/home' && pathname.startsWith(item.url));
          const hasActiveSubItem = item.items?.some((subItem) => pathname === subItem.url);

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive || hasActiveSubItem}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  data-active={isActive}
                  className={`transition-transform duration-200 hover:scale-105 ${isActive ? 'border-l-2 border-pcnPurple bg-pcnPurple/10 text-pcnPurple dark:border-pcnGreen dark:bg-pcnGreen/10 dark:text-pcnGreen dark:[&_span]:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)] dark:[&_svg]:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]' : ''}`}
                >
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <SidebarMenuBadge className="bg-pcnPurple text-white dark:bg-pcnGreen dark:text-black">
                        {item.badge > 99 ? '99+' : item.badge}
                      </SidebarMenuBadge>
                    )}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubItemActive = pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubItemActive}
                                className={`transition-transform duration-200 hover:scale-105 ${isSubItemActive ? 'border-l-2 border-pcnPurple bg-pcnPurple/10 text-pcnPurple dark:border-pcnGreen dark:bg-pcnGreen/10 dark:text-pcnGreen dark:[&_span]:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]' : ''}`}
                              >
                                <a href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
