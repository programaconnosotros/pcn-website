'use client';

import { useEffect, useState } from 'react';
import { Gauge, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  fallBackToLite,
  hasChosenDisplayMode,
  setDisplayMode,
  useDisplayMode,
  useIsAutoDisplayMode,
} from './os-display-mode';

/** Lets the windows that open with the desktop finish loading before measuring. */
const SETTLE_MS = 4000;
const SAMPLE_MS = 5000;
/** A frame this long means under 20 fps: a stutter you can see. */
const LONG_FRAME_MS = 50;
/** Share of long frames that counts as slow. Throttled but smooth (e.g. 30 fps) never hits it. */
const SLOW_SHARE = 0.2;

/**
 * Watches the frame rate for a few seconds and calls `onSlow` if it stutters; runs again each
 * time `run` changes (null turns it off). Aborts if the tab is hidden meanwhile, since
 * background tabs barely get frames.
 */
const useSlowFrameProbe = (run: string | null, onSlow: () => void) => {
  useEffect(() => {
    if (run === null) return;
    let frame = 0;
    let start = 0;
    let last = 0;
    let frames = 0;
    let longFrames = 0;
    let aborted = false;

    const onVisibility = () => {
      if (!document.hidden) return;
      aborted = true;
      cancelAnimationFrame(frame);
    };

    const tick = (time: number) => {
      if (!start) {
        start = last = time;
      } else {
        frames += 1;
        if (time - last > LONG_FRAME_MS) longFrames += 1;
        last = time;
      }
      if (time - start < SAMPLE_MS) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (!aborted && frames > 0 && longFrames / frames > SLOW_SHARE) onSlow();
    };

    const timeout = window.setTimeout(() => {
      if (document.hidden) return;
      document.addEventListener('visibilitychange', onVisibility);
      frame = requestAnimationFrame(tick);
    }, SETTLE_MS);

    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // `onSlow` is a fresh closure each render; the probe only needs the latest one at the end.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);
};

const buttonClassName =
  'rounded-sm border px-2 py-1 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-pcnGreen';

/**
 * Tells visitors when PCN OS runs in its liviano mode because of their computer, so they know
 * they aren't seeing the full experience, and lets them pick another mode. Detection happens
 * before paint (low-end hardware) or here, measuring the frame rate when nobody chose a mode
 * yet: a stuttering full desktop falls back to liviano, a stuttering liviano one suggests the
 * classic layout. Once the visitor picks a mode, nothing is measured or suggested again.
 */
export function OsPerformanceNotice() {
  const mode = useDisplayMode();
  const auto = useIsAutoDisplayMode();
  // Read on every render (mode changes re-render): a choice made meanwhile stops the probe.
  // Never server-rendered, it only mounts with the desktop parts.
  const chosen = hasChosenDisplayMode();
  const [stillSlow, setStillSlow] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Measured again after falling back to liviano, to tell whether even that is too much.
  const probing = !chosen && (mode === 'full' || (mode === 'lite' && auto));
  useSlowFrameProbe(probing ? mode : null, () => {
    if (mode === 'full') fallBackToLite();
    else setStillSlow(true);
  });

  if (mode !== 'lite' || !auto || hidden) return null;

  return (
    <div
      role="status"
      className="fixed right-3 top-10 z-[5600] w-[22rem] rounded-sm border border-pcnGreen-400 bg-black/95 font-mono text-xs shadow-[0_0_24px_-8px_rgba(4,244,190,0.5)] duration-300 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-center gap-2 border-b border-pcnGreen-200 px-3 py-2">
        <Gauge className="size-3.5 shrink-0 text-pcnGreen" />
        <span className="flex-1 font-semibold text-pcnGreen">PCN OS liviano</span>
        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-label="Ocultar aviso"
          title="Ocultar por ahora"
          className="text-pcnGreen-600 transition-colors hover:text-pcnGreen"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="space-y-3 px-3 py-3 leading-relaxed text-foreground/80">
        {stillSlow ? (
          <p>
            Aun en modo liviano, PCN OS va lento en tu compu. La versión clásica no tiene escritorio
            ni ventanas y es la más rápida.
          </p>
        ) : (
          <p>
            Detectamos que tu compu tiene pocos recursos, así que apagamos el desenfoque, los
            widgets, el cursor y las animaciones para que todo vaya fluido.{' '}
            <span className="text-pcnGreen">
              No estás viendo la experiencia completa de PCN OS.
            </span>
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {stillSlow ? (
            <button
              type="button"
              onClick={() => setDisplayMode('classic')}
              className={cn(buttonClassName, 'border-pcnGreen bg-pcnGreen font-medium text-black')}
            >
              usar versión clásica
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDisplayMode('lite')}
              className={cn(buttonClassName, 'border-pcnGreen bg-pcnGreen font-medium text-black')}
            >
              entendido
            </button>
          )}
          <button
            type="button"
            onClick={() => setDisplayMode('full')}
            className={cn(
              buttonClassName,
              'border-pcnGreen-300 text-pcnGreen hover:border-pcnGreen',
            )}
          >
            experiencia completa
          </button>
          {stillSlow ? (
            <button
              type="button"
              onClick={() => setDisplayMode('lite')}
              className={cn(
                buttonClassName,
                'border-pcnGreen-300 text-pcnGreen hover:border-pcnGreen',
              )}
            >
              seguir en liviano
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDisplayMode('classic')}
              className={cn(
                buttonClassName,
                'border-pcnGreen-300 text-pcnGreen hover:border-pcnGreen',
              )}
            >
              versión clásica
            </button>
          )}
        </div>
        <p className="text-[10px] text-foreground/40">
          Podés cambiarlo cuando quieras desde el menú PCN_OS.
        </p>
      </div>
    </div>
  );
}
