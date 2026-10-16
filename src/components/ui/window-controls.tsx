import { Minus, Square, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// The close, maximize and minimize keys of a PCN OS window (os-window.tsx), drawn as decoration
// for the site's other "terminal windows" (an empty state, a hover card). Never macOS dots.

const ICONS = [X, Square, Minus];

const SIZES = {
  sm: {
    box: 'size-3',
    icon: 'size-2',
    chamfer:
      '[clip-path:polygon(0_0,calc(100%-3px)_0,100%_3px,100%_100%,3px_100%,0_calc(100%-3px))]',
  },
  md: {
    box: 'size-[18px]',
    icon: 'size-2.5',
    chamfer:
      '[clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,4px_100%,0_calc(100%-4px))]',
  },
} as const;

export function WindowControls({
  size = 'md',
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { box, icon, chamfer } = SIZES[size];
  return (
    <span aria-hidden className={cn('flex shrink-0 items-center gap-1', className)}>
      {ICONS.map((Icon, index) => (
        <span
          key={index}
          className={cn(
            'flex items-center justify-center border border-pcnGreen-300 text-pcnGreen-500',
            box,
            chamfer,
          )}
        >
          <Icon strokeWidth={2.5} className={icon} />
        </span>
      ))}
    </span>
  );
}
