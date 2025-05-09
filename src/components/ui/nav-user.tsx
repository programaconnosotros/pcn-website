'use client';

import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
  Moon,
  Sun,
  Monitor,
  UserPlus,
  LogIn,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { signOut } from '@/actions/auth/sign-out';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function NavUser({ user }: { user: User | null }) {
  const { isMobile, isCollapsed } = useSidebar();
  const router = useRouter();
  const { setTheme } = useTheme();

  if (!user)
    return (
      <SidebarMenu>
        <div
          className={`transition-all duration-300 ease-in-out ${
            isCollapsed && !isMobile
              ? 'flex flex-col items-center gap-2'
              : 'translate-x-0 opacity-100'
          }`}
        >
          <SidebarMenuItem className="mb-2 w-full">
            <Link href="/auth/sign-in">
              <Button className={`w-full ${isCollapsed && !isMobile ? 'p-2' : ''}`}>
                {isCollapsed && !isMobile ? (
                  <LogIn className="h-5 w-5" />
                ) : (
                  <>
                    Iniciar sesión <LogIn className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </Link>
          </SidebarMenuItem>

          <SidebarMenuItem className="w-full">
            <Link href="/auth/sign-up">
              <Button
                className={`w-full ${isCollapsed && !isMobile ? 'p-2' : ''}`}
                variant="secondary"
              >
                {isCollapsed && !isMobile ? (
                  <UserPlus className="h-5 w-5" />
                ) : (
                  <>
                    Crear cuenta <UserPlus className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </Link>
          </SidebarMenuItem>
        </div>
      </SidebarMenu>
    );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`transition-all duration-300 ease-in-out data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${
                isCollapsed && !isMobile ? 'justify-center p-2' : ''
              }`}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {!isCollapsed && !isMobile && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              )}
              {!isCollapsed && !isMobile && <ChevronsUpDown className="ml-auto size-4" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {!isCollapsed && (
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="flex cursor-pointer flex-row gap-2"
                  onClick={() => router.push('/profile')}
                >
                  <BadgeCheck size={16} />
                  Mi cuenta
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex cursor-pointer flex-row gap-2">
                    <Sun size={16} />
                    Tema
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2" size={16} />
                      Claro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2" size={16} />
                      Oscuro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Monitor className="mr-2" size={16} />
                      Sistema
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
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
