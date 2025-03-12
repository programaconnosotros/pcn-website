import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import { User } from '@prisma/client';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const PlatformLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const defaultOpen = (await cookies().get('sidebar_state')?.value) === 'true';
  const sessionId = await cookies().get('sessionId')?.value;

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
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar user={user} />

      <div className="fixed left-0 top-0 z-50 mb-4 flex h-12 w-full items-center gap-3 border-b border-border bg-background px-4 md:hidden">
        <SidebarTrigger />
        <span className="text-sm font-semibold">programaConNosotros</span>
      </div>

      <main className="pt-16 md:pt-1">{children}</main>
    </SidebarProvider>
  );
};

export default PlatformLayout;
