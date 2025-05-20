import React from 'react';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarTrigger } from '@/components/SidebarTrigger';

interface AppLayoutProps {
  defaultOpen: boolean;
  user: any;
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ defaultOpen, user, children }) => {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} />

      <div className="fixed left-0 top-0 z-50 mb-4 flex h-12 w-full items-center gap-3 border-b border-border bg-background px-4 md:hidden">
        <span className="text-sm font-semibold">programaConNosotros</span>
      </div>

      <main className="relative w-full p-4 pt-16 md:p-0 md:pt-1">
        <SidebarTrigger className="absolute md:left-6 md:top-6" />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default AppLayout; 