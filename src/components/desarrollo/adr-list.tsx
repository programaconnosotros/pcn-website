import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { adrAnchor, adrNumber, type Adr, type AdrStatus } from '@/app/(platform)/desarrollo/adrs';

const REPO_BLOB_URL = 'https://github.com/programaconnosotros/pcn-website/blob/main';

const statusClassName: Record<AdrStatus, string> = {
  aceptada: 'border-pcnGreen-500 text-pcnGreen',
  propuesta: 'border-amber-400/60 text-amber-300',
  reemplazada: 'border-pcnGreen-200 text-muted-foreground line-through',
};

/** Renders `backtick` spans as inline code. */
const inline = (text: string): ReactNode =>
  text.split(/(`[^`]+`)/).map((part, index) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
      <code
        key={index}
        className="break-words bg-pcnGreen-100 px-1 font-mono text-[0.92em] text-pcnGreen"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );

const Block = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-4">
    <h4 className="font-mono text-[11px] uppercase tracking-[0.15em] text-pcnGreen-600">{label}</h4>
    <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
  </div>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-1">
    {items.map((item) => (
      <li key={item} className="flex gap-2">
        <span className="shrink-0 font-mono text-pcnGreen-500">›</span>
        <span>{inline(item)}</span>
      </li>
    ))}
  </ul>
);

/**
 * The architecture decision records, one collapsible row each: number, title and status at a
 * glance, and the context, decision, consequences and discarded alternatives inside.
 */
export function AdrList({ adrs }: { adrs: Adr[] }) {
  return (
    <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
      {adrs.map((adr) => (
        <details key={adr.number} id={adrAnchor(adr)} className="group scroll-mt-40">
          <summary className="flex cursor-pointer list-none items-start gap-3 px-3 py-2.5 transition-colors hover:bg-pcnGreen/[0.05] [&::-webkit-details-marker]:hidden">
            <span className="mt-0.5 shrink-0 font-mono text-[11px] text-pcnGreen-500 transition-transform group-open:rotate-90">
              ▸
            </span>
            <span className="shrink-0 font-mono text-[11px] tabular-nums text-pcnGreen-600">
              {adrNumber(adr)}
            </span>
            <span className="min-w-0 flex-1 text-sm font-medium">{adr.title}</span>
            <span
              className={cn(
                'hidden shrink-0 rounded-sm border px-1.5 font-mono text-[10px] sm:inline',
                statusClassName[adr.status],
              )}
            >
              {adr.status}
            </span>
            <time
              dateTime={adr.date}
              className="hidden shrink-0 font-mono text-[11px] text-muted-foreground md:inline"
            >
              {adr.date}
            </time>
          </summary>
          <div className="flex flex-col gap-3 border-t border-dashed border-pcnGreen-200 px-3 py-3 sm:pl-10">
            <Block label="contexto">{inline(adr.context)}</Block>
            <Block label="decisión">{inline(adr.decision)}</Block>
            <Block label="consecuencias">
              <Bullets items={adr.consequences} />
            </Block>
            {adr.alternatives?.length ? (
              <Block label="descartado">
                <Bullets items={adr.alternatives} />
              </Block>
            ) : null}
            {adr.supersededBy ? (
              <Block label="reemplazada">
                por{' '}
                <a
                  href={`#${adrAnchor(adrs.find((a) => a.number === adr.supersededBy)!)}`}
                  className="text-pcnGreen hover:underline"
                >
                  ADR-{String(adr.supersededBy).padStart(3, '0')}
                </a>
              </Block>
            ) : null}
            {adr.references?.length ? (
              <Block label="ver">
                <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs">
                  {adr.references.map((ref) => (
                    <a
                      key={ref}
                      href={`${REPO_BLOB_URL}/${ref}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pcnGreen-700 underline-offset-4 hover:text-pcnGreen hover:underline"
                    >
                      {ref}
                    </a>
                  ))}
                </span>
              </Block>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
