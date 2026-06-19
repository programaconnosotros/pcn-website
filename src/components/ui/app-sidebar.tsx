'use client';

import {
  AlertTriangle,
  Bell,
  BookOpen,
  CalendarDays,
  Code2,
  Download,
  Eye,
  GraduationCap,
  Home,
  Image,
  Instagram,
  LayoutDashboard,
  Layers,
  Library,
  LifeBuoy,
  Linkedin,
  MessageCircle,
  MicVocal,
  Podcast,
  ScrollText,
  Send,
  Share2,
  Users,
  Wrench,
  Youtube,
} from 'lucide-react';
import { NavMain } from '@/components/ui/nav-main';
import { NavUser } from '@/components/ui/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePwa } from '@/components/pwa-provider';
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

const getHomeItem = () => {
  return [
    {
      title: 'Inicio',
      url: '/',
      icon: Home,
    },
  ];
};

const getActividadesItems = (upcomingEvents: UpcomingEvent[] = []) => {
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
      title: 'Eventos',
      url: '/eventos',
      icon: CalendarDays,
      items: eventItems.length > 0 ? eventItems : undefined,
    },
    {
      title: 'Conversaciones',
      url: '/conversaciones',
      icon: MessageCircle,
    },
    {
      title: 'Charlas',
      url: '/charlas',
      icon: MicVocal,
    },
    {
      title: 'Podcast',
      url: '/podcast',
      icon: Podcast,
    },
    {
      title: 'Desarrollo',
      url: '/desarrollo',
      icon: Code2,
    },
  ];
};

const getRecursosItems = () => [
  { title: 'Cursos', url: '/cursos', icon: GraduationCap },
  { title: 'Lectura', url: '/lectura', icon: BookOpen },
  { title: 'Especialidades', url: '/especialidades', icon: Layers },
  { title: 'Herramientas', url: '/herramientas', icon: Wrench },
  {
    title: 'Más recursos',
    icon: Library,
    items: [
      { title: 'Influencers', url: '/influencers' },
      { title: 'Música', url: '/music' },
      { title: 'Series y películas', url: '/series-y-peliculas' },
      { title: 'Preguntas frecuentes', url: '/preguntas-frecuentes' },
    ],
  },
];

const socialNetworks = [
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
];

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
      title: 'Redes',
      icon: Share2,
      items: socialNetworks.map(({ name, url }) => ({ title: name, url })),
    },
  ];
};

const getAdminItems = (unreadCount: number = 0) => {
  return [
    {
      title: 'Usuarios',
      url: '/usuarios',
      icon: Users,
    },
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
      badge: unreadCount,
    },
    {
      title: 'Monitoreo',
      url: '/monitoreo',
      icon: AlertTriangle,
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
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
  upcomingEvents?: UpcomingEvent[];
  unreadNotificationsCount?: number;
}

function PwaInstallWidget() {
  const { isInstallable, installApp } = usePwa();
  const { isCollapsed, isMobile } = useSidebar();

  if (!isInstallable) return null;

  if (isCollapsed && !isMobile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem className="flex justify-center py-2">
          <SidebarMenuButton
            tooltip="Instalar aplicación"
            onClick={installApp}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600 hover:text-white transition-all duration-200"
          >
            <Download className="h-4 w-4 animate-pulse" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <div className="mx-2 my-2 rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-transparent p-4 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 animate-bounce duration-[3000ms]">
          <Download className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h4 className="text-xs font-semibold text-zinc-200 tracking-wide">
            App de Escritorio / Móvil
          </h4>
          <p className="text-[10px] leading-normal text-zinc-400">
            Instala PCN para acceso rápido y navegación offline.
          </p>
          <button
            onClick={installApp}
            className="mt-2.5 w-full rounded-lg bg-violet-600 px-3 py-1.5 text-center text-xs font-semibold text-white shadow-md shadow-violet-600/15 hover:bg-violet-500 active:scale-95 transition-all duration-200"
          >
            Instalar App
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppSidebar(props: AppSidebarProps) {
  const { user, upcomingEvents = [], unreadNotificationsCount = 0, ...sidebarProps } = props;

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar" {...sidebarProps}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="-ml-2 mt-1.5 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:mt-3.5">
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black p-1 text-sidebar-primary-foreground">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
        <NavMain items={getHomeItem()} />
        <NavMain items={getActividadesItems(upcomingEvents)} label="Actividades" />
        <NavMain items={getRecursosItems()} label="Recursos" />
        <NavMain items={getComunidadItems()} label="Comunidad" />
        {user?.role === 'ADMIN' && (
          <NavMain items={getAdminItems(unreadNotificationsCount)} label="Administración" />
        )}
        <PwaInstallWidget />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
