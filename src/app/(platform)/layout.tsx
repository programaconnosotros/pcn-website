import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { User } from '@prisma/client';
import prisma from '@/lib/prisma';
import {
  Breadcrumb,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbItem,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';

const Layout = async ({ children }: { children?: ReactNode }) => {
  const cookieStore = await cookies();

  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  const sessionId = cookieStore.get('sessionId')?.value;

  let user: User | null = null;

  if (sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (session) {
      user = session.user;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar user={user} />

        <div className="fixed left-0 top-0 z-50 mb-4 flex h-12 w-full items-center gap-3 border-b border-border bg-background px-4 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-semibold">programaConNosotros</span>
        </div>

        <main className="p-4 pt-16 md:pt-4">{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
