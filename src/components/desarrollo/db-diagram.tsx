'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadMermaid } from './mermaid';
import type { DbDomain, DbModel, DbRelation } from '@/app/(platform)/desarrollo/db-schema';

type View = 'todo' | DbDomain;

const VIEW_LABELS: Record<View, string> = {
  todo: 'todo',
  comunidad: 'comunidad',
  consejos: 'consejos',
  foro: 'foro',
  eventos: 'eventos',
  charlas: 'charlas',
  galeria: 'galería',
  proyectos: 'proyectos',
  auth: 'auth',
  sistema: 'sistema',
};

const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.1;

// Mermaid's ER cardinality: the side holding the FK can be many (`o{`) or at most one (`o|`),
// and the side it points at is required (`||`) or optional (`|o`).
const relationLine = (relation: DbRelation) =>
  `  ${relation.to} ${relation.optional ? '|o' : '||'}--${relation.many ? 'o{' : 'o|'} ${
    relation.from
  } : ${relation.label}`;

const attributeLines = (model: DbModel) =>
  model.fields.map((field) => {
    const keys = [field.pk && 'PK', field.fk && 'FK', field.unique && 'UK']
      .filter(Boolean)
      .join(', ');
    const type = `${field.type}${field.list ? '[]' : ''}`;
    return `    ${type} ${field.name}${keys ? ` ${keys}` : ''}${field.optional ? ' "opcional"' : ''}`;
  });

/**
 * One domain shows its models with every column, plus the models of other domains they point
 * to as bare boxes; `todo` shows every model and relation without columns, to see the shape.
 */
const buildSource = (view: View, models: DbModel[], relations: DbRelation[]) => {
  const inView = (name: string) =>
    view === 'todo' || models.find((m) => m.name === name)?.domain === view;
  const visible = relations.filter((r) => inView(r.from) || inView(r.to));
  const lines = ['erDiagram', '  direction LR'];
  for (const model of models) {
    if (view === 'todo') {
      lines.push(`  ${model.name}`);
    } else if (model.domain === view) {
      lines.push(`  ${model.name} {`, ...attributeLines(model), '  }');
    }
  }
  lines.push(...visible.map(relationLine));
  return lines.join('\n');
};

export const DbDiagram = ({
  models,
  relations,
}: {
  models: DbModel[];
  relations: DbRelation[];
}) => {
  const [view, setView] = useState<View>('todo');
  const [zoom, setZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const renderId = useId().replace(/:/g, '');

  const views = useMemo(
    () =>
      (Object.keys(VIEW_LABELS) as View[]).filter(
        (v) => v === 'todo' || models.some((m) => m.domain === v),
      ),
    [models],
  );
  const source = useMemo(() => buildSource(view, models, relations), [view, models, relations]);
  const counts = useMemo(() => {
    const own = view === 'todo' ? models : models.filter((m) => m.domain === view);
    const names = new Set(own.map((m) => m.name));
    return {
      models: own.length,
      relations: relations.filter((r) => names.has(r.from) || names.has(r.to)).length,
    };
  }, [view, models, relations]);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(false);
    loadMermaid()
      .then((mermaid) => mermaid.render(`db-${renderId}-${view}`, source))
      .then(({ svg }) => {
        if (cancelled) return;
        setSvg(svg);
        // Start fitted to the frame's width; the buttons zoom in from there.
        const width = Number(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+)/.exec(svg)?.[1]);
        const frame = frameRef.current?.clientWidth;
        const fit = width && frame ? Math.min(1, Math.max(MIN_ZOOM, (frame - 32) / width)) : 1;
        setFitZoom(fit);
        setZoom(fit);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [source, view, renderId]);

  const zoomButtonClassName =
    'flex h-6 w-6 items-center justify-center border border-pcnGreen-200 text-muted-foreground transition-colors hover:border-pcnGreen hover:text-pcnGreen disabled:opacity-30';

  return (
    <figure className="min-w-0 border border-pcnGreen-200 bg-black/40">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-pcnGreen-200 px-3 py-1.5 font-mono text-[11px]">
        <div role="tablist" aria-label="Parte del esquema" className="flex flex-wrap gap-1">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => {
                setView(v);
              }}
              className={cn(
                'px-1.5 py-0.5 transition-colors',
                view === v
                  ? 'bg-pcnGreen/15 text-pcnGreen'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {view === v ? `[${VIEW_LABELS[v]}]` : VIEW_LABELS[v]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="tabular-nums">
            {counts.models} modelos · {counts.relations} relaciones
          </span>
          <span className="flex items-center gap-1">
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
              disabled={zoom >= 2}
              onClick={() => setZoom((z) => Math.min(2, z + ZOOM_STEP))}
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
        </div>
      </figcaption>

      <div ref={frameRef} className="h-[70vh] min-h-80 overflow-auto [scrollbar-width:thin]">
        {svg ? (
          <div
            className="w-max p-4 [&_svg]:h-auto [&_svg]:max-w-none"
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
