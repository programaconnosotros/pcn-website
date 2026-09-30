'use client';

import { NumberTicker } from '@/components/magicui/number-ticker';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { ArrowRight, CalendarDays, LogIn, MessageCircle, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

export const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh';

interface HomeHeroProps {
  userName: string | null;
}

/** Community-wide figures; rounded down on purpose ("500+"). */
const COMMUNITY_STATS = [
  { label: 'Miembros', value: 500 },
  { label: 'Charlas', value: 50 },
  { label: 'Eventos', value: 20 },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export const HomeHero = ({ userName }: HomeHeroProps) => {
  const firstName = userName?.split(' ')[0] ?? null;

  return (
    <section className="relative overflow-hidden">
      {/* Backdrop: animated gif + gradients + grid */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/home.GIF"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/85 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_10%,rgba(4,244,190,0.16),transparent_65%)]" />
        <div className="bg-grid-fade absolute inset-0 opacity-60" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-10 md:pb-14 md:pt-14 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          <div>
            <motion.div {...fadeUp(0)} className="hidden md:block">
              <span className="inline-flex items-center gap-2 rounded-sm border border-pcnGreen/25 bg-black/60 px-3 py-1 font-mono text-xs font-medium text-pcnGreen">
                <span className="text-pcnGreen-600">$</span>
                Comunidad de ingeniería de software · Sin fronteras
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.08)}
              className="text-balance font-mono text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-foreground md:mt-6 md:text-6xl lg:text-7xl"
            >
              {firstName ? (
                <>
                  Hola, <span className="text-glow text-pcnGreen">{firstName}</span>.
                  <br />
                  Qué bueno verte.
                </>
              ) : (
                <>
                  Programá
                  <br />
                  <span className="cursor-blink text-glow text-pcnGreen">con nosotros.</span>
                </>
              )}
            </motion.h1>

            <motion.p
              {...fadeUp(0.16)}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
            >
              {firstName
                ? 'Gracias por ser parte de la comunidad. Hay eventos, charlas y recursos nuevos esperándote.'
                : 'Eventos, charlas, mentores y una red de gente apasionada por el software para llevar tu carrera al siguiente nivel.'}
            </motion.p>

            <motion.div {...fadeUp(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
              {firstName ? (
                <>
                  <Button asChild>
                    <Link href="/eventos">
                      <CalendarDays className="mr-2 size-4" />
                      Ver próximos eventos
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 size-4" />
                      Ir al grupo de WhatsApp
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/autenticacion/registro">
                      Crear cuenta
                      <UserPlus className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/autenticacion/iniciar-sesion">
                      Iniciar sesión
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

            {!firstName && (
              <motion.p
                {...fadeUp(0.32)}
                className={cn(
                  GeistMono.className,
                  'mt-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70',
                )}
              >
                Gratis · Sin spam · Desde 2020
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
          <div className="bg-black/90 p-4 md:p-5">
            <div className="text-glow font-mono text-3xl font-semibold tracking-tight text-pcnGreen md:text-4xl">
              2020
            </div>
            <p
              className={cn(
                GeistMono.className,
                'mt-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground',
              )}
            >
              Impulsando desde
            </p>
          </div>
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
