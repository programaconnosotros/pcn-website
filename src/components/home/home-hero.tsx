'use client';

import { NumberTicker } from '@/components/magicui/number-ticker';
import { Button } from '@/components/ui/button';
import { HeroInstallButton } from '@/components/ui/install-app-button';
import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { ArrowRight, CalendarDays, LogIn, MessageCircle, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh';

interface HomeHeroProps {
  userName: string | null;
  /** Page title rendered over the hero backdrop, aligned with its content. */
  title?: ReactNode;
}

const FOUNDING_YEAR = 2020;

/** Community-wide figures; rounded down on purpose ("500+"). Its age counts itself up every year. */
const COMMUNITY_STATS = [
  { label: 'Miembros', value: 500 },
  { label: 'Charlas', value: 50 },
  { label: 'Eventos', value: 20 },
  { label: 'Años de comunidad', value: new Date().getFullYear() - FOUNDING_YEAR },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export const HomeHero = ({ userName, title }: HomeHeroProps) => {
  const firstName = userName?.split(' ')[0] ?? null;

  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: community photo + gradients + grid */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/pcn-header.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/85 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(4,244,190,0.16),transparent_65%)]" />
        <div className="bg-grid-fade absolute inset-0 opacity-60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-3 md:pb-14 lg:px-8">
        {title}
        <div className="grid items-center gap-8 pt-6 md:pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <div>
            <motion.div {...fadeUp(0)} className="hidden md:block">
              <PromptLine user={firstName ? toShellName(firstName) : 'guest'} />
            </motion.div>

            <motion.h1
              {...fadeUp(0.08)}
              className="text-balance font-mono text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl md:mt-4 lg:text-[2.6rem]"
            >
              {firstName ? (
                <>
                  <span className="cursor-blink">
                    Hola, <span className="text-glow text-pcnGreen">{firstName}</span>.
                  </span>
                </>
              ) : (
                <>
                  Programá
                  <br />
                  <span className="cursor-blink text-glow text-pcnGreen">con nosotros.</span>
                </>
              )}
            </motion.h1>

            <motion.div {...fadeUp(0.16)} className="mt-5 max-w-xl">
              <TerminalOutput
                lines={
                  firstName
                    ? [
                        { tag: 'ok', text: `sesión iniciada como ${toShellName(firstName)}@pcn` },
                        { tag: 'ok', text: 'eventos, charlas y recursos sincronizados' },
                        { tag: '>>', text: 'hay novedades desde tu último login' },
                      ]
                    : [
                        { tag: '+', text: 'eventos y charlas de ingeniería de software' },
                        { tag: '+', text: 'mentores que ya recorrieron el camino' },
                        {
                          tag: '+',
                          text: 'una red de ingenieros para llevar tu carrera al siguiente nivel',
                        },
                      ]
                }
              />
            </motion.div>

            <motion.div {...fadeUp(0.24)} className="mt-7 flex flex-wrap items-center gap-3">
              {firstName ? (
                <>
                  <Button asChild size="lg">
                    <Link href="/eventos">
                      <CalendarDays className="mr-2 size-4" />
                      verProximosEventos();
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 size-4" />
                      abrirWhatsApp();
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/autenticacion/registro">
                      crearCuenta();
                      <UserPlus className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/autenticacion/iniciar-sesion">
                      iniciarSesion();
                      <LogIn className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Link
                    href={WHATSAPP_GROUP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="group ml-1 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-pcnGreen"
                  >
                    Solo quiero el WhatsApp
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </>
              )}
            </motion.div>

            {/* Install prompt or manual steps; renders nothing once the app is installed. */}
            <HeroInstallButton className="mt-5" />

            {!firstName && (
              <motion.p
                {...fadeUp(0.32)}
                className={cn(
                  GeistMono.className,
                  'mt-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70',
                )}
              >
                Gratis · Sin spam · Desde {FOUNDING_YEAR}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <StatsPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/** "Agustín" → "agustin": a first name as it would look as a unix user. */
const toShellName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');

/** The shell prompt that "runs" the hero: who is logged in and what the community is about. */
const PromptLine = ({ user }: { user: string }) => (
  <p className="font-mono text-xs leading-relaxed text-muted-foreground">
    <span className="text-pcnGreen">{user}@pcn</span>
    <span>:</span>
    <span className="text-sky-400">~</span>
    <span className="text-pcnGreen-600">$ </span>
    <span className="text-foreground">./comunidad</span> <span>--tipo=</span>
    <span className="text-amber-300">&quot;ingeniería de software&quot;</span>{' '}
    <span>--fronteras=</span>
    <span className="text-amber-300">none</span>
  </p>
);

interface OutputLine {
  tag: 'ok' | '>>' | '+';
  text: string;
}

const TAG_STYLES: Record<OutputLine['tag'], string> = {
  ok: 'text-pcnGreen',
  '>>': 'text-amber-300',
  '+': 'text-pcnGreen',
};

/** Hero copy rendered as command output: status lines when logged in, a diff for guests. */
const TerminalOutput = ({ lines }: { lines: OutputLine[] }) => (
  <ul className="space-y-1 border-l border-pcnGreen/30 pl-4 font-mono text-[13px] leading-relaxed text-muted-foreground">
    {lines.map((line) => (
      <li key={line.text} className="flex gap-2">
        <span aria-hidden className={cn('shrink-0 select-none', TAG_STYLES[line.tag])}>
          {line.tag === '+' ? '+' : `[${line.tag}]`}
        </span>
        <span className="text-pretty">{line.text}</span>
      </li>
    ))}
  </ul>
);

const StatsPanel = () => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-px rounded-lg bg-pcnGreen/20 opacity-70 blur-md" />
      <div className="relative overflow-hidden rounded-lg border border-pcnGreen-400 bg-black/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-pcnGreen-200 px-4 py-3">
          <span className={cn(GeistMono.className, 'text-[11px] tracking-wide text-pcnGreen-700')}>
            ~/pcn $ stats --comunidad
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-pcnGreen-200">
          {COMMUNITY_STATS.map((tile) => (
            <div key={tile.label} className="bg-black/90 p-4 md:p-5">
              <div className="text-glow flex items-baseline gap-0.5 font-mono text-3xl font-semibold tracking-tight text-pcnGreen md:text-4xl">
                <NumberTicker value={tile.value} className="tabular-nums tracking-tight" />
                <span className="text-pcnGreen-600">+</span>
              </div>
              <p
                className={cn(
                  GeistMono.className,
                  'mt-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground',
                )}
              >
                {tile.label}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-pcnGreen-200 px-5 py-3.5">
          <p className="text-xs text-muted-foreground">Presencial y online. Para todo el mundo.</p>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-pcnGreen-400 bg-pcnGreen/10 px-2 py-0.5 font-mono text-[11px] font-medium text-pcnGreen">
            <span className="size-1.5 animate-pulse bg-pcnGreen" />
            online
          </span>
        </div>
      </div>
    </div>
  );
};
