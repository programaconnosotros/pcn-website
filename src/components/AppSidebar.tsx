'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { User } from '@prisma/client';
import { Home, Menu, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';

interface AppSidebarProps {
  user: User | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const { isOpen } = useSidebar();
  const pathname = usePathname();

  const routes = [
    {
      label: 'Inicio',
      icon: Home,
      href: '/',
      active: pathname === '/',
    },
    {
      label: 'Consejos',
      icon: Menu,
      href: '/advises',
      active: pathname === '/advises',
    },
    {
      label: 'Usuarios',
      icon: Users,
      href: '/users',
      active: pathname === '/users',
    },
  ];

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-40 h-full w-64 transform border-r border-border bg-background transition-transform duration-300 ease-in-out md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-12 items-center border-b border-border px-4">
          <span className="text-sm font-semibold">programaConNosotros</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                route.active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 