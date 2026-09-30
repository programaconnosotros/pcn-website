import { GeistMono } from 'geist/font/mono';
import { cn } from '@/lib/utils';

/** Desktop background: brand glows, a faint grid and the PCN OS watermark. */
export function OsWallpaper({ showHint }: { showHint: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#020504]">
      <div className="absolute left-1/2 top-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pcnGreen/[0.07] blur-[180px]" />
      <div className="bg-grid-fade absolute inset-0" />
      <div className="absolute inset-0 flex select-none flex-col items-center justify-center gap-5 pb-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.webp"
          alt=""
          className="size-24 opacity-[0.22] drop-shadow-[0_0_24px_#04f4be]"
        />
        <p
          className={cn(GeistMono.className, 'text-sm uppercase tracking-[0.5em] text-pcnGreen/25')}
        >
          PCN_OS
        </p>
        {showHint && (
          <p className="cursor-blink text-sm text-pcnGreen-600">
            &gt; abrí una app desde el dock para empezar
          </p>
        )}
      </div>
    </div>
  );
}
