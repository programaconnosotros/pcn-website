'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fraseAt, photoAt, remainingMs, slotAt } from './scene';

const pad = (n: number) => String(n).padStart(2, '0');

const countdown = (ms: number) => {
  const seconds = Math.ceil(ms / 1000);
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
};

/** Pide que la pantalla no se apague mientras la página está visible (un segundo monitor). */
const useWakeLock = () => {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    const request = () => {
      if (document.visibilityState !== 'visible') return;
      navigator.wakeLock
        .request('screen')
        .then((sentinel) => {
          lock = sentinel;
        })
        .catch(() => {});
    };
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      document.removeEventListener('visibilitychange', request);
      lock?.release().catch(() => {});
    };
  }, []);
};

const useFullscreen = () => {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  const toggle = () => {
    const done = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    done.catch(() => {});
  };
  return { fullscreen, toggle };
};

export function MotivationScreen() {
  // El turno sale del reloj del navegador: hasta montar no hay frase, así el HTML del servidor
  // no choca con la hora del cliente.
  const [now, setNow] = useState<number | null>(null);
  const { fullscreen, toggle } = useFullscreen();
  useWakeLock();

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <div className="fixed inset-0 bg-black" />;

  const slot = slotAt(now);
  const frase = fraseAt(slot);
  // La foto anterior se desvanece mientras entra la actual; la siguiente ya se va cargando.
  const photos = [slot - 1, slot, slot + 1].map((s) => ({ src: photoAt(s), current: s === slot }));

  return (
    <div className="fixed inset-0 group overflow-hidden bg-black text-white">
      {photos.map(({ src, current }) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          className={cn(
            'object-cover transition-opacity duration-[2000ms]',
            current ? 'z-10 opacity-100' : 'opacity-0',
          )}
        />
      ))}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/65 to-black/50" />

      <figure
        key={slot}
        className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center duration-1000 animate-in fade-in sm:px-16"
      >
        <blockquote className="max-w-5xl text-3xl leading-tight font-semibold text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-5xl lg:text-6xl">
          “{frase.text}”
        </blockquote>
        <figcaption className="mt-6 font-mono text-base tracking-wide text-pcnGreen drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] sm:text-lg">
          — {frase.author}
        </figcaption>
      </figure>

      <div className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 p-4 font-mono text-xs text-white/60 sm:p-6">
        <span>
          <span className="text-pcnGreen">$ </span>
          próxima frase en {countdown(remainingMs(now))}
        </span>
        <div className="flex items-center gap-4 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Link href="/" className="hover:text-pcnGreen">
            cd ~
          </Link>
          <button
            type="button"
            onClick={toggle}
            aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="hover:text-pcnGreen"
          >
            {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
