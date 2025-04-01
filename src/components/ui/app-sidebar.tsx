'use client';

import * as React from 'react';
import {
  BookOpen,
  Instagram,
  Laptop,
  LifeBuoy,
  Linkedin,
  Send,
  SquareTerminal,
  Youtube,
  Image,
  Home,
  CalendarDays,
} from 'lucide-react';

import { NavMain } from '@/components/ui/nav-main';
import { NavProjects } from '@/components/ui/nav-projects';
import { NavSecondary } from '@/components/ui/nav-secondary';
import { NavUser } from '@/components/ui/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { User } from '@prisma/client';

const data = {
  navMain: [
    {
      title: 'Inicio',
      url: '/',
      icon: Home,
    },
    {
      title: 'Consejos',
      url: '/advises',
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: 'Fotos',
      url: '/photos',
      icon: Image,
    },
    {
      title: 'Charlas',
      url: '/talks',
      icon: BookOpen,
    },
    {
      title: 'Eventos',
      url: '/events',
      icon: CalendarDays,
    },
    {

      title: 'Cursos',
      url: '/courses',
      icon: Laptop,
      items: [
        {
          title: 'Vim',
          url: '/courses/vim',
        },
        {
          title: 'LaTeX',
          url: '/courses/latex',
        },
        {
          title: 'Git & GitHub',
          url: '/courses/git-and-github',
        },
        {
          title: 'Ver todos',
          url: '/courses',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Soporte',
      url: 'https://wa.me/5493815777562',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: 'https://wa.me/5493815777562',
      icon: Send,
    },
  ],
  socialNetworks: [
    {
      name: 'WhatsApp',
      url: 'https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh',
      icon: Send,
    },
    {
      name: 'Discord',
      url: 'https://discord.gg/dTQexKw56S',
      icon: Send,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/programa.con.nosotros/',
      icon: Instagram,
    },
    // {
    //   name: 'X',
    //   url: 'https://x.com/programaconnos',
    //   icon: X,
    // },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@programaconnosotros',
      icon: Youtube,
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/programaconnosotros/',
      icon: Linkedin,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black p-1 text-sidebar-primary-foreground">
                  <img src="/logo.png" alt="programaConNosotros" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">programaConNosotros</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects socialNetworks={data.socialNetworks} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
