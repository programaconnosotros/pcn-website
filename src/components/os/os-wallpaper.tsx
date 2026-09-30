import { GeistMono } from 'geist/font/mono';
import { cn } from '@/lib/utils';

/** Desktop background: brand glows, a faint grid and the PCN OS watermark. */
export function OsWallpaper({ showHint }: { showHint: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#050608]">
      <div className="absolute -left-48 -top-48 size-[720px] rounded-full bg-pcnGreen/[0.14] blur-[160px]" />
      <div className="absolute -bottom-64 -right-48 size-[820px] rounded-full bg-pcnPurple/30 blur-[180px]" />
      <div className="bg-grid-fade absolute inset-0" />
      <div className="absolute inset-0 flex select-none flex-col items-center justify-center gap-5 pb-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="" className="size-24 opacity-[0.18]" />
        <p
          className={cn(
            GeistMono.className,
            'text-sm uppercase tracking-[0.5em] text-white/[0.18]',
          )}
        >
          PCN OS
        </p>
        {showHint && (
          <p className="text-sm text-white/40">Abrí una app desde el dock para empezar.</p>
        )}
      </div>
    </div>
  );
}
