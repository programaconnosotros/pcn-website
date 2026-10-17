import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Small play mark on a thumbnail that opens a video. */
export const VideoBadge = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'pointer-events-none absolute bottom-1 left-1 flex size-5 items-center justify-center rounded-sm bg-black/70 text-pcnGreen backdrop-blur-xs',
      className,
    )}
  >
    <Play className="size-2.5 fill-current" />
    <span className="sr-only">Video</span>
  </span>
);
