import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

const stats = [
  { value: '500+', label: 'miembros' },
  { value: '50+', label: 'charlas' },
  { value: '20+', label: 'eventos' },
];

const Prompt = ({ command }: { command: string }) => (
  <p className="font-mono text-xs text-muted-foreground">
    <span className="text-pcnGreen">pcn@comunidad</span>
    <span className="text-muted-foreground/60">:~$ </span>
    <span className="text-foreground/90">{command}</span>
  </p>
);

/** Terminal-style brand panel shown next to the form on large screens. */
const BrandPanel = () => (
  <aside className="sticky top-0 hidden h-dvh flex-col justify-between border-r border-pcnGreen-200 bg-black/40 p-10 lg:flex xl:p-14">
    <Link href="/" className="flex items-center gap-3 font-mono text-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.webp" alt="" className="size-8" />
      programaConNosotros
    </Link>

    <div className="space-y-8">
      <div className="space-y-2">
        <Prompt command="whoami" />
        <p className="font-mono text-sm text-foreground/75">
          Comunidad de ingeniería de software · <span className="text-pcnGreen">sin fronteras</span>
        </p>
      </div>

      <h2 className="font-mono text-4xl leading-[1.1] font-semibold tracking-[-0.04em] xl:text-5xl xl:leading-none">
        Programá
        <br />
        <span className="cursor-blink text-pcnGreen text-glow">con nosotros.</span>
      </h2>

      <div className="space-y-3">
        <Prompt command="cat stats" />
        <dl className="grid max-w-md grid-cols-3 border-t border-l border-pcnGreen-200">
          {stats.map((stat) => (
            <div key={stat.label} className="border-r border-b border-pcnGreen-200 px-3 py-2">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-mono text-xl font-semibold text-pcnGreen">{stat.value}</dd>
              <dd className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>

    <p className="font-mono text-[11px] text-muted-foreground/70">
      © 2020–{new Date().getFullYear()} programaConNosotros
    </p>
  </aside>
);

interface AuthShellProps {
  /** Command shown in the prompt above the title, e.g. `login`. */
  command: string;
  title: string;
  description?: ReactNode;
  /** Wider column for long forms such as sign-up. */
  wide?: boolean;
  children: ReactNode;
}

/**
 * Layout shared by every authentication screen: a full-bleed form on phones (no floating
 * card) and a split view with a terminal brand panel on large screens.
 */
export const AuthShell = ({ command, title, description, wide, children }: AuthShellProps) => (
  <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <BrandPanel />

    <main className="flex min-h-dvh flex-col px-4 py-4 sm:px-8 lg:px-12">
      <div className="flex items-center justify-between font-mono text-xs">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-pcnGreen"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          ~/inicio
        </Link>
        <Link href="/" aria-label="programaConNosotros" className="lg:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.webp" alt="" className="size-7" />
        </Link>
      </div>

      <div className={cn('mx-auto my-auto w-full py-10', wide ? 'max-w-[560px]' : 'max-w-[400px]')}>
        <p className="font-mono text-[11px] text-pcnGreen-600">~/pcn/auth $ {command}</p>
        <h1 className="mt-1 font-mono text-2xl font-semibold tracking-tight text-pcnGreen text-glow">
          {title}
        </h1>
        {description && (
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</div>
        )}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  </div>
);

export type AuthLink = { href: string; label: string };

/** Secondary auth actions as a stacked list of terminal links (they never get clipped). */
export const AuthLinks = ({ links }: { links: AuthLink[] }) => (
  <nav className="mt-6 grid gap-2 border-t border-pcnGreen-200 pt-4 font-mono text-xs">
    {links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="flex group items-center gap-2 text-muted-foreground transition-colors hover:text-pcnGreen"
      >
        <span className="text-pcnGreen-500">›</span>
        {link.label}
        <span className="hidden animate-blink text-pcnGreen group-hover:inline">_</span>
      </Link>
    ))}
  </nav>
);

/** A titled group of fields separated by a hairline instead of a card. */
export const AuthSection = ({
  title,
  optional,
  children,
}: {
  title: string;
  optional?: boolean;
  children: ReactNode;
}) => (
  <fieldset className="space-y-4 border-t border-pcnGreen-200 pt-4 first:border-t-0 first:pt-0">
    <legend className="float-left mb-4 w-full font-mono text-sm font-semibold">
      <span className="text-pcnGreen-500">## </span>
      {title}
      {optional && (
        <span className="ml-2 text-[11px] font-normal text-muted-foreground">[opcional]</span>
      )}
    </legend>
    <div className="clear-both space-y-4">{children}</div>
  </fieldset>
);

/** Centered status block for success / empty states. */
export const AuthStatus = ({ children }: { children: ReactNode }) => (
  <div className="border border-pcnGreen-200 bg-pcnGreen/[0.04] p-4 font-mono text-sm leading-relaxed text-foreground/80">
    <span className="text-pcnGreen">✓ </span>
    {children}
  </div>
);

export const codeInputClassName = 'h-12 text-center font-mono text-2xl tracking-[0.5em]';
