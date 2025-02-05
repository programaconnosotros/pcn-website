'use client';
import React, { ReactNode, useState } from 'react';
import { Sidebar, SidebarBody, SidebarLink } from './sidebar';
import { IconUser, IconHome, IconMusic } from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '../themes/theme-toggle';
import { User } from 'next-auth';
import {
  Braces,
  Calendar,
  HandHelping,
  Images,
  Instagram,
  Linkedin,
  MicVocal,
  Podcast,
  TvMinimalPlay,
  Youtube,
} from 'lucide-react';

export const SidebarContainer = ({
  user,
  children,
}: {
  user?: User | undefined;
  children: ReactNode;
}) => {
  const links = [
    {
      label: 'Inicio',
      href: '/home',
      icon: <IconHome className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'Consejos',
      href: '/advises',
      icon: (
        <HandHelping className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: 'Cursos',
      href: '/courses',
      icon: (
        <TvMinimalPlay className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: 'Eventos',
      href: '/events',
      icon: <Calendar className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'Charlas',
      href: '/talks',
      icon: <MicVocal className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'Code Warfare',
      href: '/code-warfare',
      icon: <Braces className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'Podcast',
      href: '/podcast',
      icon: <Podcast className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'Fotos',
      href: '/photos',
      icon: <Images className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'Música',
      href: '/music',
      icon: <IconMusic className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/programa-con-nosotros',
      icon: <Linkedin className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@programaconnosotros2689',
      icon: <Youtube className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/programa.con.nosotros/',
      icon: <Instagram className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
  ];

  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md md:flex-row',
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

              {user && (
                <SidebarLink
                  link={{
                    label: 'Mi perfil',
                    href: '/profile',
                    icon: (
                      <IconUser className="h-5 w-5 flex-shrink-0 text-neutral-700 dark:text-neutral-200" />
                    ),
                  }}
                />
              )}
            </div>
          </div>

          <div>
            <ThemeToggle />

            {user && (
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
            )}
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="w-full overflow-auto p-5 md:min-w-[100%]">{children}</div>
    </div>
  );
};

export const Logo = () => (
  <Link
    href="/"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <img src="/logo.png" alt="Programa Con Nosotros" className="h-5 w-6" />

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
    <img src="/logo.png" alt="Programa Con Nosotros" className="h-5 w-6" />
  </Link>
);
