'use client';

import {
  Book,
  BookOpen,
  Briefcase,
  CalendarDays,
  Code,
  Eye,
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
  Bell,
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

interface UpcomingEvent {
  id: string;
  name: string;
  date: Date;
}

const formatEventDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const getNavMainItems = (upcomingEvents: UpcomingEvent[] = []) => {
  const eventItems = upcomingEvents.map((event) => ({
    title: `${formatEventDate(event.date)} - ${event.name}`,
    url: `/eventos/${event.id}`,
  }));

  // Agregar "Ver todos" al final si hay eventos
  if (eventItems.length > 0) {
    eventItems.push({
      title: 'Ver todos los eventos',
      url: '/eventos',
    });
  }

  return [
    {
      title: 'Inicio',
      url: '/home',
      icon: Home,
    },
    {
      title: 'Eventos',
      url: '/eventos',
      icon: CalendarDays,
      items: eventItems.length > 0 ? eventItems : undefined,
    },
    {
      title: 'Consejos',
      url: '/consejos',
      icon: SquareTerminal,
      isActive: true,
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
      title: 'Podcast',
      url: '/podcast',
      icon: MicVocal,
    },
    {
      title: 'Lectura',
      url: '/lectura',
      icon: Book,
    },
    {
      title: 'Especialidades',
      url: '/especialidades',
      icon: Code,
    },
    {
      title: 'Charlas',
      url: '/charlas',
      icon: BookOpen,
    },
    {
      title: 'Música',
      url: '/music',
      icon: Music,
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
      title: 'Trabajos',
      url: '/trabajos',
      icon: Briefcase,
    },
  ];
};

const getComunidadItems = () => {
  return [
    {
      title: 'Historia',
      url: '/historia',
      icon: ScrollText,
    },
    {
      title: 'Galería',
      url: '/galeria',
      icon: Image,
    },
    {
      title: 'Usuarios',
      url: '/usuarios',
      icon: Users,
    },
    {
      title: 'Anuncios',
      url: '/anuncios',
      icon: Megaphone,
    },
    {
      title: 'Preguntas frecuentes',
      url: '/preguntas-frecuentes',
      icon: HelpCircle,
    },
    {
      title: 'Testimonios',
      url: '/testimonios',
      icon: Quote,
    },
  ];
};

const getAdminItems = () => {
  return [
    {
      title: 'Analíticas',
      url: '/analiticas',
      icon: LayoutDashboard,
    },
    {
      title: 'Visitas',
      url: '/visitas',
      icon: Eye,
    },
    {
      title: 'Notificaciones',
      url: '/notificaciones',
      icon: Bell,
    },
  ];
};

const data = {
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
  upcomingEvents?: UpcomingEvent[];
}

export function AppSidebar({ user, upcomingEvents = [], ...props }: AppSidebarProps) {
  const navMainItems = getNavMainItems(upcomingEvents);

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
        <NavMain items={navMainItems} />
        <NavMain items={getComunidadItems()} label="Comunidad" />
        {user?.role === 'ADMIN' && (
          <NavMain items={getAdminItems()} label="Administración" />
        )}
        <NavProjects socialNetworks={data.socialNetworks} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
