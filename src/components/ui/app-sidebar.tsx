'use client';

import {
  Book,
  BookOpen,
  Briefcase,
  CalendarDays,
  Code,
  HelpCircle,
  Home,
  Image,
  Instagram,
  Laptop,
  LayoutDashboard,
  LifeBuoy,
  Linkedin,
  Megaphone,
  MessageCircle,
  MicVocal,
  Music,
  Quote,
  ScrollText,
  Send,
  SquareTerminal,
  Star,
  Users,
  Youtube,
} from 'lucide-react';
import { NavMain } from '@/components/ui/nav-main';
import { NavProjects } from '@/components/ui/nav-projects';
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
import { NavSecondary } from './nav-secondary';

const data = {
  navMain: [
    {
      title: 'Inicio',
      url: '/home',
      icon: Home,
    },
    {
      title: 'Consejos',
      url: '/consejos',
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: 'Galería',
      url: '/galeria',
      icon: Image,
    },
    {
      title: 'Charlas',
      url: '/charlas',
      icon: BookOpen,
    },
    {
      title: 'Podcast',
      url: '/podcast',
      icon: MicVocal,
    },
    {
      title: 'Música',
      url: '/music',
      icon: Music,
    },
    {
      title: 'Historia',
      url: '/historia',
      icon: ScrollText,
    },
    {
      title: 'Lectura',
      url: '/lectura',
      icon: Book,
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
      title: 'Especialidades',
      url: '/especialidades',
      icon: Code,
    },
    {
      title: 'Testimonios',
      url: '/testimonios',
      icon: Quote,
    },
    {
      title: 'Preguntas frecuentes',
      url: '/preguntas-frecuentes',
      icon: HelpCircle,
    },
    {
      title: 'Influencers',
      url: '/influencers',
      icon: Users,
    },
    {
      title: 'Software recomendado',
      url: '/software-recomendado',
      icon: Star,
    },
    {
      title: 'Comunidad',
      url: '/comunidad',
      icon: Users,
    },
    {
      title: 'Trabajos',
      url: '/trabajos',
      icon: Briefcase,
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Anuncios',
      url: '/anuncios',
      icon: Megaphone,
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
      url: 'https://www.youtube.com/@programaconnosotros2689/videos',
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
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
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
                  <span className="text-xs text-muted-foreground">Impulsando desde 2020.</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects socialNetworks={data.socialNetworks} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
