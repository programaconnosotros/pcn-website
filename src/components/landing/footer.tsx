import { Github } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@components/themes/theme-toggle';

export const Footer = () => (
  <footer className="flex w-full shrink-0 flex-row items-center justify-between gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
    <div className="flex items-center gap-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        <code>programaConNosotros</code>
      </p>

      <div className="flex space-x-4">
        <Link
          href="https://github.com/programaconnosotros/pcn-website"
          className="text-gray-500 hover:text-gray-700"
        >
          <Github className="h-6 w-6" />
          <span className="sr-only">GitHub</span>
        </Link>
      </div>
    </div>

    <div className="flex justify-end">
      <ThemeToggle />
    </div>
  </footer>
);
