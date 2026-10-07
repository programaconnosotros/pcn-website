import { GeistMono } from 'geist/font/mono';
import { cn } from '@/lib/utils';

/** Desktop background: brand glows, a faint grid and the PCN OS watermark. */
export function OsWallpaper({
  showHint,
  onPointerDown,
}: {
  showHint: boolean;
  onPointerDown: () => void;
}) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden bg-[#020504]"
      onPointerDown={onPointerDown}
    >
      {/* A 900px blur is one of the costliest layers on a weak GPU: PCN OS liviano drops it. */}
      <div className="absolute top-1/2 left-1/2 size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pcnGreen/[0.07] blur-[180px] lite:hidden" />
      <div className="absolute inset-0 bg-grid-fade" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 pb-24 select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="" className="size-24 drop-shadow-[0_0_24px_#04f4be]" />
        <p
          className={cn(
            GeistMono.className,
            'text-lg font-semibold tracking-[-0.04em] text-pcnGreen',
          )}
        >
          programaConNosotros
        </p>
        {showHint && (
          <p className="cursor-blink text-sm text-pcnGreen-600">
            &gt; abrí un programa desde el dock para empezar
          </p>
        )}
      </div>
    </div>
  );
}
