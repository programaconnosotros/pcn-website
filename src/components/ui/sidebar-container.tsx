'use client';
import React, { ReactNode, useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from './sidebar';
import { IconBrandTabler, IconUserBolt } from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { User } from '@prisma/generated/zod';
import { ThemeToggle } from '../themes/theme-toggle';

export const SidebarContainer = ({ user, children }: { user?: User; children: ReactNode }) => {
  const links = [
    {
      label: 'Inicio',
      href: '/home',
      icon: (
        <IconBrandTabler className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: 'Consejos',
      href: '/advises',
      icon: (
        <IconBrandTabler className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: 'Mi perfil',
      href: '/profile',
      icon: (
        <IconUserBolt className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 md:flex-row',
        'h-screen',
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}

            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>

          <div>
            <ThemeToggle />

            {user && (
              <div>
                <SidebarLink
                  link={{
                    label: user.name ?? 'Sin nombre',
                    href: '/profile',
                    icon: user.image && (
                      <Image
                        src={user.image}
                        className="h-7 w-7 flex-shrink-0 rounded-full"
                        width={50}
                        height={50}
                        alt="Avatar"
                      />
                    ),
                  }}
                />
              </div>
            )}
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="w-full overflow-auto">{children}</div>
    </div>
  );
};

export const Logo = () => (
  <Link
    href="/"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <div className="h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-black dark:bg-white" />

    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="whitespace-pre font-medium text-black dark:text-white"
    >
      <code>programaConNosotros</code>
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <div className="h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-black dark:bg-white" />
  </Link>
);
