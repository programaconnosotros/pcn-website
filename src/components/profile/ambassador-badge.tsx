import Link from 'next/link';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

// Distinctive tag for members of the PCN Ambassadors program. Links to the program's
// section on the home page.
export const AmbassadorBadge = ({ className }: { className?: string }) => (
  <Link
    href="/#ambassadors"
    title="Miembro del programa PCN Ambassadors"
    className={cn(
      'inline-flex w-fit items-center gap-1 border border-pcnGreen-600 bg-pcnGreen/10 px-1.5 py-0.5 font-mono text-[10px] uppercase leading-4 tracking-wider text-pcnGreen shadow-[0_0_10px_-3px_#04f4be] transition-colors hover:bg-pcnGreen/20',
      className,
    )}
  >
    <Award className="size-3" />
    pcn ambassador
  </Link>
);
