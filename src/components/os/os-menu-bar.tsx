'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { signOut } from '@/actions/auth/sign-out';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { secondaryItems, socialNetworks } from '@/components/ui/app-sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { OS_PROGRAMS, type OsProgram } from './programs';

export interface OsUser {
  name: string;
  email: string;
  image: string | null;
}

interface OsMenuBarProps {
  user: OsUser | null;
  focusedProgram: OsProgram | null;
  onOpenProgram: (program: OsProgram) => void;
  onOpenLauncher: () => void;
}

const menuContentClassName = 'z-[7000] min-w-52';
const menuTriggerClassName =
  'rounded-sm px-2 py-0.5 outline-none transition-colors hover:bg-pcnGreen-200 hover:text-pcnGreen data-[state=open]:bg-pcnGreen data-[state=open]:text-black';

const programById = (id: string) => OS_PROGRAMS.find((program) => program.id === id)!;

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const formatClock = (date: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

/** Rendered only on the client so the server and client markup never disagree about the time. */
const Clock = () => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(interval);
  }, []);
  return <span className="tabular-nums text-pcnGreen-800">{now ? formatClock(now) : ''}</span>;
};

/** Top bar of the desktop: PCN menu, the focused program's path, the clock and the user. */
export function OsMenuBar({ user, focusedProgram, onOpenProgram, onOpenLauncher }: OsMenuBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-[5000] flex h-7 items-center gap-1 border-b border-pcnGreen-300 bg-black/85 px-2 font-mono text-xs text-pcnGreen-900 backdrop-blur-xl">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className={cn(menuTriggerClassName, 'group flex items-center gap-1.5')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt=""
            className="size-4 shrink-0 object-contain group-data-[state=open]:brightness-0"
          />
          <span className="text-glow font-semibold text-pcnGreen group-data-[state=open]:text-black group-data-[state=open]:[text-shadow:none]">
            PCN_OS
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={menuContentClassName}>
          <DropdownMenuItem onSelect={() => onOpenProgram(programById('historia'))}>
            Acerca de programaConNosotros
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenLauncher}>Todos los programas</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Redes</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className={menuContentClassName}>
              {socialNetworks.map((network) => (
                <DropdownMenuItem key={network.title} asChild>
                  <a href={network.url} target="_blank" rel="noopener noreferrer">
                    {network.title}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {secondaryItems.map((item) => (
            <DropdownMenuItem key={item.title} asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {focusedProgram && (
        <span className="px-2 text-pcnGreen">~/{focusedProgram.name.toLowerCase()}</span>
      )}

      <div className="ml-auto flex items-center gap-3 pr-1">
        <Clock />
        {user ? (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={cn(menuTriggerClassName, 'flex items-center gap-1.5')}>
              <Avatar className="size-5">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-pcnGreen/15 text-[9px] font-semibold text-pcnGreen">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-40 truncate">{user.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={menuContentClassName}>
              <DropdownMenuLabel className="font-normal">
                <span className="block truncate font-semibold">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2"
                onSelect={() => onOpenProgram(programById('perfil'))}
              >
                <UserRound className="size-4" /> Mi cuenta
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onSelect={() =>
                  toast.promise(signOut(), {
                    loading: 'Cerrando sesión...',
                    success: 'Sesión cerrada correctamente',
                    error: 'Error al cerrar sesión',
                  })
                }
              >
                <LogOut className="size-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-1">
            <Link href="/autenticacion/iniciar-sesion" className={menuTriggerClassName}>
              Iniciar sesión
            </Link>
            <Link
              href="/autenticacion/registro"
              className="rounded-sm bg-pcnGreen px-2 py-0.5 font-medium text-black transition-shadow hover:shadow-[0_0_12px_#04f4be]"
            >
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
