'use client';

import { BadgeCheck, ChevronsUpDown, LogIn, LogOut, UserPlus } from 'lucide-react';

import { signOut } from '@/actions/auth/sign-out';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { User } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export function NavUser({ user }: { user: User | null }) {
  const { isMobile, isCollapsed } = useSidebar();
  const router = useRouter();
  const iconOnly = isCollapsed && !isMobile;

  if (!user)
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="rounded-xl border border-sidebar-border/80 bg-white/[0.02] p-2">
            <div className="flex flex-col gap-1">
              <Button asChild size="sm" className="w-full rounded-lg">
                <Link href="/autenticacion/iniciar-sesion">
                  {iconOnly ? (
                    <LogIn className="size-4" />
                  ) : (
                    <>
                      Iniciar sesión <LogIn className="ml-2 size-4" />
                    </>
                  )}
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="w-full rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <Link href="/autenticacion/registro">
                  {iconOnly ? (
                    <UserPlus className="size-4" />
                  ) : (
                    <>
                      Crear cuenta <UserPlus className="ml-2 size-4" />
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`h-14 rounded-xl border border-sidebar-border/80 bg-white/[0.02] px-2.5 transition-colors hover:bg-sidebar-accent data-[state=open]:border-pcnGreen/30 data-[state=open]:bg-sidebar-accent ${
                iconOnly ? 'justify-center p-2' : ''
              }`}
            >
              <Avatar className="size-9 rounded-full ring-2 ring-pcnGreen/30">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-full bg-pcnGreen/10 text-xs font-semibold text-pcnGreen">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              {!iconOnly && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="flex items-center gap-1.5 truncate font-semibold">
                    <span className="truncate">{user.name}</span>
                    {user.role === 'ADMIN' && (
                      <span className="shrink-0 rounded-full bg-pcnGreen/15 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider text-pcnGreen">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/55">{user.email}</span>
                </div>
              )}
              {!iconOnly && (
                <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/45" />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {!iconOnly && (
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-full">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback className="rounded-full bg-pcnGreen/10 text-xs font-semibold text-pcnGreen">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="flex cursor-pointer flex-row gap-2"
                  onClick={() => router.push('/perfil')}
                >
                  <BadgeCheck size={16} />
                  Mi cuenta
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="flex cursor-pointer flex-row gap-2"
                onClick={() =>
                  toast.promise(signOut(), {
                    loading: 'Cerrando sesión...',
                    success: 'Sesión cerrada correctamente',
                    error: 'Error al cerrar sesión',
                  })
                }
              >
                <LogOut size={16} />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
