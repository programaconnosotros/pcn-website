import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; href: string };
  align?: 'left' | 'center';
  className?: string;
}

export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p
    className={cn(
      GeistMono.className,
      'text-[11px] font-medium uppercase tracking-[0.22em] text-pcnGreen',
      className,
    )}
  >
    <span className="text-pcnGreen-500">{'// '}</span>
    {children}
  </p>
);

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
}: SectionHeaderProps) => (
  <div
    className={cn(
      'mb-5 flex flex-col gap-3',
      align === 'center'
        ? 'items-center text-center'
        : 'md:flex-row md:items-end md:justify-between',
      className,
    )}
  >
    <div className="max-w-2xl">
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <h2 className="text-balance font-mono text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      )}
    </div>

    {action && (
      <Link
        href={action.href}
        className="group inline-flex shrink-0 items-center gap-1.5 font-mono text-sm font-medium text-pcnGreen-700 transition-colors hover:text-pcnGreen"
      >
        {action.label}
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);
