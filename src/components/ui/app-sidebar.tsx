'use client';

import {
  BookOpen,
  CalendarDays,
  Home,
  Image,
  Instagram,
  Laptop,
  LifeBuoy,
  Linkedin,
  ScrollText,
  Send,
  SquareTerminal,
  Users,
  Youtube,
  Image,
  Home,
  CalendarDays,
  Users,
  Briefcase,
} from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/ui/nav-main';
import { NavProjects } from '@/components/ui/nav-projects';
// import { NavSecondary } from '@/components/ui/nav-secondary'; Estaba declarado pero no se usaba, lo dejo comentado por las dudas.
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
      url: '/consejos',
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: 'Fotos',
      url: '/galeria',
      icon: Image,
    },
    {
      title: 'Charlas',
      url: '/charlas',
      icon: BookOpen,
    },
    {
      title: 'Historia',
      url: '/historia',
      icon: ScrollText,
    },
    {
      title: 'Eventos',
      url: '/eventos',
      icon: CalendarDays,
    },
    {
      title: 'Cursos',
      url: '/cursos',
      icon: Laptop,
      items: [
        {
          title: 'Vim',
          url: '/cursos/vim',
        },
        {
          title: 'LaTeX',
          url: '/cursos/latex',
        },
        {
          title: 'Git & GitHub',
          url: '/cursos/git-and-github',
        },
        {
          title: 'Ver todos',
          url: '/cursos',
        },
      ],
    },
    {
      title: 'Trabajos',
      url: '/jobs',
      icon: Briefcase,
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
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="-ml-2 mt-1.5 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:mt-3.5">
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black p-1 text-sidebar-primary-foreground">
                  <img src="/logo.webp" alt="programaConNosotros" />
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
