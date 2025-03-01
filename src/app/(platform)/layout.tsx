import { SidebarContainer } from '@/components/ui/sidebar-container';
import { ReactNode } from 'react';

const Layout = async ({ children }: { children?: ReactNode }) => {
  // TODO: Get session from database or cookie.
  const session = {
    user: {
      name: 'John Doe',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarContainer user={session.user}>{children}</SidebarContainer>
    </div>
  );
};

export default Layout;
