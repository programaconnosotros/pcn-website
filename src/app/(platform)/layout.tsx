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

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <SidebarTrigger className="ml-2" />
          </header>

          <main className="p-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
