'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || (item.url !== '/home' && pathname.startsWith(item.url));
          const hasActiveSubItem = item.items?.some(subItem => pathname === subItem.url);
          
          return (
          <Collapsible key={item.title} asChild defaultOpen={isActive || hasActiveSubItem}>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                data-active={isActive}
                className={isActive ? "border-l-2 border-pcnPurple dark:border-pcnGreen bg-pcnPurple/10 dark:bg-pcnGreen/10 text-pcnPurple dark:text-pcnGreen" : ""}
              >
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
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
                            className={isSubItemActive ? "border-l-2 border-pcnPurple dark:border-pcnGreen bg-pcnPurple/10 dark:bg-pcnGreen/10 text-pcnPurple dark:text-pcnGreen" : ""}
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
