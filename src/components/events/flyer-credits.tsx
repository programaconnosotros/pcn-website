import { Fragment } from 'react';
import Link from 'next/link';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlyerCredit {
  id: string;
  name: string;
  user: { id: string; name: string; image: string | null } | null;
}

/** Who designed the event's flyer, as a single "diseño: …" line. Nothing without credits. */
export function FlyerCredits({
  credits,
  className,
}: {
  credits: FlyerCredit[];
  className?: string;
}) {
  if (credits.length === 0) return null;

  return (
    <p className={cn('font-mono text-[11px]', className)}>
      <Palette className="mr-1.5 inline size-3 text-pcnGreen-500" aria-hidden />
      <span className="text-muted-foreground">diseño: </span>
      {credits.map((credit, index) => (
        <Fragment key={credit.id}>
          {index > 0 && <span className="text-muted-foreground">, </span>}
          {credit.user ? (
            <Link href={`/perfil/${credit.user.id}`} className="text-pcnGreen hover:underline">
              @{credit.user.name}
            </Link>
          ) : (
            <span className="text-foreground/85">{credit.name}</span>
          )}
        </Fragment>
      ))}
    </p>
  );
}
