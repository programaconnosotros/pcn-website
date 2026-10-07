import { Fragment } from 'react';
import Link from 'next/link';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FlyerCredit {
  id: string;
  flyerSrc: string;
  name: string;
  user: { id: string; name: string; image: string | null } | null;
}

const Names = ({ credits }: { credits: FlyerCredit[] }) =>
  credits.map((credit, index) => (
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
  ));

/**
 * Who designed the event's flyers, as a credit line: one line when every flyer shares the same
 * designers (or there's a single one), one per flyer otherwise. Nothing without credits.
 */
export function FlyerCredits({
  flyers,
  credits,
  className,
}: {
  flyers: string[];
  credits: FlyerCredit[];
  className?: string;
}) {
  const perFlyer = flyers
    .map((src, index) => ({
      index,
      credits: credits.filter((credit) => credit.flyerSrc === src),
    }))
    .filter((flyer) => flyer.credits.length > 0);
  if (perFlyer.length === 0) return null;

  const key = (list: FlyerCredit[]) =>
    list
      .map((credit) => credit.user?.id ?? credit.name)
      .sort()
      .join('|');
  const shared =
    perFlyer.length === flyers.length &&
    perFlyer.every((f) => key(f.credits) === key(perFlyer[0].credits));

  return (
    <div className={cn('flex flex-col gap-0.5 font-mono text-[11px]', className)}>
      {shared || flyers.length === 1 ? (
        <p>
          <Palette className="mr-1.5 inline size-3 text-pcnGreen-500" aria-hidden />
          <span className="text-muted-foreground">diseño: </span>
          <Names credits={perFlyer[0].credits} />
        </p>
      ) : (
        perFlyer.map((flyer) => (
          <p key={flyer.index}>
            <Palette className="mr-1.5 inline size-3 text-pcnGreen-500" aria-hidden />
            <span className="text-muted-foreground">flyer {flyer.index + 1}: </span>
            <Names credits={flyer.credits} />
          </p>
        ))
      )}
    </div>
  );
}
