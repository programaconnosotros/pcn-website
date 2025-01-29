import { auth } from '@/auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ReactNode } from 'react';
import { AppSidebar } from '@/components/ui/app-sidebar';

const Layout = async ({ children }: { children?: ReactNode }) => {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        {session?.user?.id && <AppSidebar user={session.user as { id: string; name: string; email: string; [key: string]: any }} />}
        <main>{children}</main>
      </SidebarProvider>
    </div>
  );
};

export default Layout;