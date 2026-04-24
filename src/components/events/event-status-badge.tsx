'use client';

import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

const endOfDayFrom = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const computeStatus = (
  date: Date,
  endDate: Date | null,
): 'upcoming' | 'in-progress' | 'ended' => {
  const start = new Date(date);
  const end = endDate ? new Date(endDate) : endOfDayFrom(start);
  const now = new Date();
  if (now < start) return 'upcoming';
  if (now <= end) return 'in-progress';
  return 'ended';
};

export const EventStatusBadge: React.FC<{ date: Date; endDate: Date | null }> = ({
  date,
  endDate,
}) => {
  const [status, setStatus] = useState<'upcoming' | 'in-progress' | 'ended' | null>(null);

  useEffect(() => {
    const tick = () => setStatus(computeStatus(date, endDate));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [date, endDate]);

  if (status === null || status === 'ended') return null;

  if (status === 'in-progress') {
    return (
      <Badge className="shrink-0 whitespace-nowrap border-transparent bg-red-500 text-white hover:bg-red-500">
        <span className="relative mr-1.5 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        En vivo
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="shrink-0 animate-pulse whitespace-nowrap border-pcnPurple/40 text-pcnPurple dark:border-pcnGreen/40 dark:text-pcnGreen"
    >
      Inscripciones abiertas
    </Badge>
  );
};
