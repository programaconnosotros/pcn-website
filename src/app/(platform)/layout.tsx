import { auth } from '@/auth';
import { SidebarContainer } from '@/components/ui/sidebar-container';
import { ReactNode } from 'react';

const Layout = async ({ children }: { children?: ReactNode }) => {
  const session = await auth();

  return (
    <div>
      <div className="min-h-screen bg-background">
        <SidebarContainer user={session?.user}>{children}</SidebarContainer>
      </div>
    </div>
  );
};

export default Layout;
