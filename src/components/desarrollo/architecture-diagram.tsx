'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { loadMermaid } from './mermaid';

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
// Below this the labels stop being readable, so wider diagrams scroll sideways instead.
const MIN_FIT_ZOOM = 0.6;

/** One Mermaid diagram (flowchart or sequence) in a frame with zoom, fitted to the width. */
export const ArchitectureDiagram = ({
  id,
  title,
  source,
}: {
  id: string;
  title: string;
  source: string;
}) => {
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/:/g, '');

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(false);
    loadMermaid()
      .then((mermaid) => mermaid.render(`arch-${renderId}-${id}`, source))
      .then(({ svg }) => {
        if (cancelled) return;
        setSvg(svg);
        // Start fitted to the frame's width, never bigger than the natural size nor unreadably small.
        const width = Number(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+)/.exec(svg)?.[1]);
        const frame = frameRef.current?.clientWidth;
        const fit = width && frame ? Math.min(1, Math.max(MIN_FIT_ZOOM, (frame - 32) / width)) : 1;
        setFitZoom(fit);
        setZoom(fit);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [id, source, renderId]);

  const zoomButtonClassName =
    'flex h-6 w-6 items-center justify-center border border-pcnGreen-200 text-muted-foreground transition-colors hover:border-pcnGreen hover:text-pcnGreen disabled:opacity-30';

  return (
    <figure className="min-w-0 border border-pcnGreen-200 bg-black/40">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-pcnGreen-200 px-3 py-1.5 font-mono text-[11px]">
        <span className="text-pcnGreen">{title.toLowerCase()}</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            aria-label="Alejar"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            className={zoomButtonClassName}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-9 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            aria-label="Acercar"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            className={zoomButtonClassName}
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label="Ajustar al ancho"
            onClick={() => setZoom(fitZoom)}
            className={zoomButtonClassName}
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </span>
      </figcaption>

      <div ref={frameRef} className="min-h-40 scrollbar-thin overflow-auto">
        {svg ? (
          <div
            className="mx-auto w-max p-4 [&_svg]:h-auto [&_svg]:max-w-none"
            style={{ zoom }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <p className="p-4 font-mono text-xs text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>
            {error ? 'no se pudo dibujar el diagrama' : 'dibujando el diagrama…'}
          </p>
        )}
      </div>
    </figure>
  );
};
