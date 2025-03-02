import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { User } from '@prisma/client';
import prisma from '@/lib/prisma';

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

        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;
