import { cn } from '@/lib/utils';

// How much of a guide has been read, drawn like the simulator's progress line.
export const GuideProgressBar = ({
  read,
  total,
  className,
}: {
  read: number;
  total: number;
  className?: string;
}) => (
  <div
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={total}
    aria-valuenow={read}
    aria-label={`${read} de ${total} secciones leídas`}
    className={cn('h-px bg-pcnGreen-200', className)}
  >
    <div
      className="h-px bg-pcnGreen shadow-[0_0_8px_rgba(4,244,190,0.8)] transition-[width] duration-300"
      style={{ width: `${total ? (read / total) * 100 : 0}%` }}
    />
  </div>
);
