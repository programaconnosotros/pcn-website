import { auth } from '@/auth';
import { SidebarWrapper } from '@/components/ui/sidebar-wrapper';
import { ReactNode } from 'react';

const Layout = async ({ children }: { children?: ReactNode }) => {
  const session = await auth();

  return (
    <div>
      <div className="min-h-screen bg-background">
        <SidebarWrapper user={session?.user}>{children}</SidebarWrapper>
      </div>
    </div>
  );
};

export default Layout;
