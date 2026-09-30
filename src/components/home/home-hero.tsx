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
      {/* Backdrop: photo + gradients + grid */}
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/IMG_9069.webp"
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

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-16 md:pb-24 md:pt-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center gap-2 rounded-full border border-pcnGreen/25 bg-pcnGreen/[0.06] px-3 py-1 text-xs font-medium text-pcnGreen">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-pcnGreen opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-pcnGreen" />
                </span>
                Comunidad de ingeniería de software · Sin fronteras
              </span>
            </motion.div>

            <motion.h1
              {...fadeUp(0.08)}
              className="mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-foreground md:text-6xl lg:text-7xl"
            >
              {firstName ? (
                <>
                  Hola, <span className="text-pcnGreen">{firstName}</span>.
                  <br />
                  Qué bueno verte.
                </>
              ) : (
                <>
                  Programá
                  <br />
                  <span className="bg-gradient-to-r from-pcnGreen via-emerald-300 to-pcnGreen bg-clip-text text-transparent">
                    con nosotros.
                  </span>
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
                  <Button asChild size="lg" className="rounded-full px-6">
                    <Link href="/eventos">
                      <CalendarDays className="mr-2 size-4" />
                      Ver próximos eventos
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                    <Link href={WHATSAPP_GROUP_URL} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 size-4" />
                      Ir al grupo de WhatsApp
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="rounded-full px-6">
                    <Link href="/autenticacion/registro">
                      Crear cuenta
                      <UserPlus className="ml-2 size-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-full px-6">
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
      <div className="pointer-events-none absolute -inset-px rounded-[1.6rem] bg-gradient-to-br from-pcnGreen/30 via-transparent to-transparent opacity-70 blur-sm" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-background/70 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span
            className={cn(
              GeistMono.className,
              'ml-2 text-[11px] tracking-wide text-muted-foreground/80',
            )}
          >
            pcn — comunidad
          </span>
        </div>

        <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
          {COMMUNITY_STATS.map((tile) => (
            <div key={tile.label} className="bg-background/80 p-5 md:p-6">
              <div className="flex items-baseline gap-0.5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                <NumberTicker value={tile.value} className="tabular-nums tracking-tight" />
                <span className="text-pcnGreen">+</span>
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
          <div className="bg-background/80 p-5 md:p-6">
            <div className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
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

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-5 py-3.5">
          <p className="text-xs text-muted-foreground">Presencial y online. Para todo el mundo.</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pcnGreen/10 px-2 py-0.5 text-[11px] font-medium text-pcnGreen">
            <span className="size-1.5 rounded-full bg-pcnGreen" />
            Activa
          </span>
        </div>
      </div>
    </div>
  );
};
