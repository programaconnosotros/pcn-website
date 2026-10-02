'use client';

import {
  Activity,
  Gauge,
  Link2,
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  BookOpen,
  CalendarDays,
  Code2,
  Contact,
  Eye,
  GraduationCap,
  Handshake,
  History,
  Home,
  Image,
  LayoutDashboard,
  Layers,
  Library,
  LifeBuoy,
  MessageCircle,
  MessageSquareHeart,
  MicVocal,
  Podcast,
  Rocket,
  Rss,
  ScrollText,
  Share2,
  Trophy,
  Users,
  Wrench,
  Youtube,
} from 'lucide-react';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import { NavMain, type NavItem } from '@/components/ui/nav-main';
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
import { MobileNav } from '@/components/ui/mobile-nav';
import type { SessionUser } from '@/lib/session';
import { cn } from '@/lib/utils';
import { NavSecondary } from './nav-secondary';
import { InstallAppButton } from './install-app-button';
import { SearchTrigger } from '@/components/search/search-trigger';
import { SidebarUpcomingEvents, type UpcomingEvent } from './sidebar-upcoming-events';

const feedItem: NavItem = { title: 'Feed', url: '/feed', icon: Rss };

const homeItems: NavItem[] = [{ title: 'Inicio', url: '/', icon: Home }, feedItem];

const actividadesItems: NavItem[] = [
  { title: 'Eventos', url: '/eventos', icon: CalendarDays },
  { title: 'Conversaciones', url: '/conversaciones', icon: MessageCircle },
  { title: 'Charlas', url: '/charlas', icon: MicVocal },
  { title: 'Podcast', url: '/podcast', icon: Podcast },
  { title: 'Desarrollo', url: '/desarrollo', icon: Code2 },
];

const recursosItems: NavItem[] = [
  { title: 'Cursos', url: '/cursos', icon: GraduationCap },
  { title: 'Lectura', url: '/lectura', icon: BookOpen },
  { title: 'Videos', url: '/videos', icon: Youtube },
  { title: 'Especialidades', url: '/especialidades', icon: Layers },
  { title: 'Herramientas', url: '/herramientas', icon: Wrench },
  { title: 'Proyectos', url: '/proyectos', icon: Rocket },
  { title: 'Entrevistas', url: '/entrevistas', icon: BriefcaseBusiness },
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

export const socialNetworks = [
  { title: 'WhatsApp', url: 'https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh' },
  { title: 'Discord', url: 'https://discord.gg/dTQexKw56S' },
  { title: 'Instagram', url: 'https://www.instagram.com/programa.con.nosotros/' },
  { title: 'YouTube', url: 'https://www.youtube.com/@programaconnosotros2689/videos' },
  { title: 'LinkedIn', url: 'https://www.linkedin.com/company/programaconnosotros/' },
];

const comunidadItems: NavItem[] = [
  { title: 'Historia', url: '/historia', icon: ScrollText },
  { title: 'Miembros', url: '/miembros', icon: Contact },
  { title: 'Logros', url: '/logros', icon: Trophy },
  { title: 'Galería', url: '/galeria', icon: Image },
  { title: 'Partners', url: '/partners', icon: Handshake },
  { title: 'Changelog', url: '/changelog', icon: History },
  { title: 'Redes', icon: Share2, items: socialNetworks },
];

const getAdminItems = (unreadCount: number): NavItem[] => [
  { title: 'Panel', url: '/admin', icon: Gauge },
  { title: 'Usuarios', url: '/usuarios', icon: Users },
  { title: 'Analíticas', url: '/analiticas', icon: LayoutDashboard },
  { title: 'Métricas', url: '/metricas', icon: Activity },
  { title: 'Visitas', url: '/visitas', icon: Eye },
  { title: 'Notificaciones', url: '/notificaciones', icon: Bell, badge: unreadCount },
  { title: 'Monitoreo', url: '/monitoreo', icon: AlertTriangle },
  { title: 'Vínculos', url: '/vinculos', icon: Link2 },
];

export const secondaryItems = [
  { title: 'Soporte', url: 'https://wa.me/5493815777562', icon: LifeBuoy },
  { title: 'Feedback', url: 'https://wa.me/5493815777562', icon: MessageSquareHeart },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: SessionUser | null;
  upcomingEvents?: UpcomingEvent[];
  unreadNotificationsCount?: number;
}

export function AppSidebar(props: AppSidebarProps) {
  const { user, upcomingEvents = [], unreadNotificationsCount = 0, ...sidebarProps } = props;
  const { isMobile } = useSidebar();

  if (isMobile)
    return (
      <MobileNav
        user={user}
        footerItems={secondaryItems}
        sections={[
          { label: 'Actividades', items: actividadesItems },
          { label: 'Recursos', items: recursosItems },
          { label: 'Comunidad', items: [feedItem, ...comunidadItems] },
          ...(user?.role === 'ADMIN'
            ? [{ label: 'Administración', items: getAdminItems(unreadNotificationsCount) }]
            : []),
        ]}
      />
    );

  return (
    <Sidebar
      collapsible="offcanvas"
      variant="sidebar"
      className="border-pcnGreen-200 [&_[data-sidebar=sidebar]]:bg-black"
      {...sidebarProps}
    >
      <SidebarHeader className="px-3 pb-1 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-12 rounded-sm px-2 hover:bg-sidebar-accent/70"
            >
              <Link href="/" className="flex items-center gap-3">
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-sm bg-black ring-1 ring-inset ring-pcnGreen-400">
                  <span className="absolute inset-0 rounded-sm bg-pcnGreen/20 blur-md" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.webp" alt="programaConNosotros" className="relative size-6" />
                </span>
                <span className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="text-glow truncate font-mono text-[13px] font-semibold tracking-tight text-pcnGreen">
                    programaConNosotros
                  </span>
                  <span
                    className={cn(
                      GeistMono.className,
                      'truncate text-[10px] uppercase tracking-[0.1em] text-pcnGreen-500',
                    )}
                  >
                    Comunidad · desde 2020
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SearchTrigger className="mt-2" />
      </SidebarHeader>

      <SidebarContent className="gap-0 px-1 [scrollbar-width:thin]">
        <NavMain items={homeItems} />
        <SidebarUpcomingEvents events={upcomingEvents} />
        <NavMain items={actividadesItems} label="Actividades" />
        <NavMain items={recursosItems} label="Recursos" />
        <NavMain items={comunidadItems} label="Comunidad" />
        {user?.role === 'ADMIN' && (
          <NavMain items={getAdminItems(unreadNotificationsCount)} label="Administración" />
        )}
      </SidebarContent>

      <SidebarFooter className="gap-1.5 border-t border-pcnGreen-200 px-3 pb-3 pt-2">
        <InstallAppButton />
        <NavSecondary items={secondaryItems} className="p-0" />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
