import type { ConsejoSource } from '@/lib/consejos';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Says plainly that nobody published this consejo by hand: it was picked out automatically from a
// conversation in the community's WhatsApp group, and links to that conversation on /conversaciones.
export function ExtractedNotice({
  source,
  author,
  className,
}: {
  source: ConsejoSource;
  author: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 font-mono text-[11px] leading-5 text-muted-foreground',
        className,
      )}
    >
      <span className="border border-dashed border-pcnGreen-600 px-1 text-[10px] leading-4 tracking-wider text-pcnGreen uppercase">
        auto-extraído
      </span>
      <span>
        de{' '}
        <Link
          href={source.href}
          className="text-pcnGreen-600 underline decoration-dotted underline-offset-2 transition-colors hover:text-pcnGreen"
          title={source.title}
        >
          una conversación #{source.hash}
        </Link>
        . {author} no lo publicó manualmente.
      </span>
    </p>
  );
}
