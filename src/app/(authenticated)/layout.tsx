import { SignOut } from '@components/auth/sign-out';
import { ThemeToggle } from '@components/themes/theme-toggle';
import { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => (
  <div>
    <div className="min-h-screen bg-background">
      {/* <SidebarDemo /> */}

      <nav className="border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
          <h1 className="text-lg font-semibold">
            <code>programaConNosotros</code>
          </h1>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOut />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl p-4">{children}</main>
    </div>
  </div>
);

export default Layout;
