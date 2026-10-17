import type { CSSProperties } from 'react';
import { BADGE_ICONS, BADGE_TONES, type BadgeIcon, type BadgeTone } from '@/lib/badges';
import { cn } from '@/lib/utils';

// Pointy-top hexagon: medals read as earned, not as plain tags.
const HEX = 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)';

const SIZES = {
  xs: { width: 16, rim: 1.5, icon: 8 },
  sm: { width: 22, rim: 2, icon: 11 },
  lg: { width: 60, rim: 3, icon: 26 },
} as const;

/**
 * A hexagonal medal with a metallic rim, a glowing core and a light sweep. `lg` medals shine
 * every few seconds on their own; every size shines on hover.
 */
export function BadgeMedal({
  icon,
  tone,
  size = 'lg',
  className,
}: {
  icon: BadgeIcon;
  tone: BadgeTone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const Icon = BADGE_ICONS[icon];
  const t = BADGE_TONES[tone];
  const { width, rim, icon: iconSize } = SIZES[size];

  const glow: CSSProperties = {
    width,
    height: width / 0.866,
    filter: `drop-shadow(0 0 ${size === 'lg' ? 10 : 4}px rgba(${t.glow},0.55))`,
  };

  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-block shrink-0 transition-transform duration-300 group-hover/badge:-translate-y-0.5 group-hover/badge:scale-105',
        className,
      )}
      style={glow}
    >
      {/* Metallic rim */}
      <span
        className="absolute inset-0"
        style={{
          clipPath: HEX,
          background: `conic-gradient(from 200deg, ${t.light}, ${t.base} 18%, ${t.dark} 35%, ${t.base} 52%, ${t.light} 62%, ${t.dark} 80%, ${t.light})`,
        }}
      />
      {/* Core */}
      <span
        className="absolute flex items-center justify-center overflow-hidden"
        style={{
          inset: rim,
          clipPath: HEX,
          background: `radial-gradient(circle at 50% 28%, rgba(${t.glow},0.45), #06090b 72%)`,
        }}
      >
        {size === 'lg' && (
          <>
            {/* Engraved inner ring and scanlines */}
            <span
              className="absolute inset-[4px] opacity-60"
              style={{ clipPath: HEX, boxShadow: `inset 0 0 0 1px rgba(${t.glow},0.5)` }}
            />
            <span className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.35)_0_1px,transparent_1px_3px)]" />
          </>
        )}
        <Icon
          className="relative"
          style={{
            width: iconSize,
            height: iconSize,
            color: t.light,
            filter: `drop-shadow(0 0 ${size === 'lg' ? 6 : 2}px rgba(${t.glow},0.9))`,
          }}
          strokeWidth={size === 'lg' ? 1.75 : 2.25}
        />
      </span>
      {/* Light sweep */}
      <span className="absolute inset-0 overflow-hidden" style={{ clipPath: HEX }}>
        <span
          className={cn(
            'absolute inset-y-0 -left-full w-full bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.55)_50%,transparent_70%)] transition-transform duration-700 group-hover/badge:translate-x-[200%]',
            size === 'lg' && 'badge-shine',
          )}
        />
      </span>
    </span>
  );
}
