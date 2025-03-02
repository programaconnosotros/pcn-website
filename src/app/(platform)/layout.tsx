import { SidebarContainer } from '@/components/ui/sidebar-container';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import { Session, User } from '@prisma/client';
import prisma from '@/lib/prisma';

const Layout = async ({ children }: { children?: ReactNode }) => {
  const sessionId = cookies().get('sessionId')?.value;
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
      <SidebarContainer user={user}>{children}</SidebarContainer>
    </div>
  );
};

export default Layout;
