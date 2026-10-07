'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { SearchBar } from '@/components/ui/search-bar';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { normalize } from '@/components/conversations/highlight';
import { cn } from '@/lib/utils';
import {
  qualityAreas,
  type QualityAreaId,
  type TestCase,
  type TestCasePriority,
  type TestCaseType,
} from '@/app/(platform)/desarrollo/calidad/quality-areas';
import { layerLabels, testCases } from '@/app/(platform)/desarrollo/calidad/quality-cases';

const REPO_BLOB_URL = 'https://github.com/programaconnosotros/pcn-website/blob/main';
const PAGE_SIZE = 50;
const ALL = 'todas';

const priorityClassName: Record<TestCasePriority, string> = {
  alta: 'border-red-400/60 text-red-400',
  media: 'border-amber-400/60 text-amber-400',
  baja: 'border-pcnGreen-200 text-muted-foreground',
};

const areaLabel = (id: QualityAreaId) => qualityAreas.find((a) => a.id === id)?.label ?? id;

const searchableText = (c: TestCase) =>
  normalize(
    [
      c.id,
      c.title,
      areaLabel(c.area),
      c.expected,
      ...c.steps,
      ...c.preconditions,
      c.automation?.file ?? '',
    ].join(' '),
  );

const coverage = qualityAreas.map((area) => {
  const cases = testCases.filter((c) => c.area === area.id);
  const automated = cases.filter((c) => c.type === 'automatizado').length;
  return { ...area, total: cases.length, automated, manual: cases.length - automated };
});

const totals = {
  total: testCases.length,
  manual: testCases.filter((c) => c.type === 'manual').length,
  automated: testCases.filter((c) => c.type === 'automatizado').length,
  high: testCases.filter((c) => c.priority === 'alta').length,
};

function Flag({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-8 shrink-0 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-[11px] transition-colors',
        active
          ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen'
          : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-600 hover:text-pcnGreen',
      )}
    >
      <span className="text-pcnGreen-600">[{active ? 'x' : ' '}]</span>
      {children}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={cn(ruledCellClassName, 'px-3 py-2')}>
      <p className="font-mono text-xl font-semibold text-pcnGreen tabular-nums">{value}</p>
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function CaseRow({
  testCase,
  open,
  onToggle,
}: {
  testCase: TestCase;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `caso-${testCase.id}`;
  return (
    <li className={cn(ruledCellClassName, open && 'bg-pcnGreen/[0.04]')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-2 px-3 py-2 text-left"
      >
        <ChevronRight
          className={cn(
            'mt-0.5 size-3.5 shrink-0 text-pcnGreen-600 transition-transform',
            open && 'rotate-90',
          )}
        />
        <span className="w-26 shrink-0 font-mono text-[11px] leading-5 text-pcnGreen">
          {testCase.id}
        </span>
        <span className="min-w-0 flex-1 text-sm leading-5">{testCase.title}</span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] leading-4 max-sm:hidden">
          <span className="text-muted-foreground">{areaLabel(testCase.area)}</span>
          <span
            className={cn(
              'border px-1',
              testCase.type === 'manual'
                ? 'border-sky-400/60 text-sky-400'
                : 'border-pcnGreen-600 text-pcnGreen',
            )}
          >
            {testCase.type === 'manual' ? 'manual' : 'auto'}
          </span>
          {testCase.automatedBy && (
            <span
              className="border border-pcnGreen-600 px-1 text-pcnGreen"
              title="Lo corre la regresión e2e semanal"
            >
              e2e
            </span>
          )}
          <span
            className={cn('w-12 border px-1 text-center', priorityClassName[testCase.priority])}
          >
            {testCase.priority}
          </span>
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className="space-y-3 border-t border-dashed border-pcnGreen-200 px-3 py-3 text-xs leading-relaxed sm:pl-35"
        >
          <p className="flex flex-wrap gap-1.5 font-mono text-[10px] sm:hidden">
            <span className="text-muted-foreground">{areaLabel(testCase.area)}</span>
            <span>· {testCase.type}</span>
            <span>· prioridad {testCase.priority}</span>
          </p>
          {testCase.automation && (
            <div className="font-mono">
              <p className="text-pcnGreen-600">
                # archivo · {layerLabels[testCase.automation.layer]}
              </p>
              <a
                href={`${REPO_BLOB_URL}/${testCase.automation.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-pcnGreen underline-offset-4 hover:underline"
              >
                {testCase.automation.file} ↗
              </a>
            </div>
          )}
          {testCase.automatedBy && (
            <div className="font-mono">
              <p className="text-pcnGreen-600"># automatizado en la regresión e2e semanal</p>
              <ul className="space-y-1">
                {testCase.automatedBy.map((test) => (
                  <li key={test.name}>
                    <a
                      href={`${REPO_BLOB_URL}/${test.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-pcnGreen underline-offset-4 hover:underline"
                    >
                      {test.file} ↗
                    </a>
                    <code className="block break-all text-foreground">$ {test.command}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {testCase.preconditions.length > 0 && (
            <div>
              <p className="font-mono text-pcnGreen-600"># precondiciones</p>
              <ul className="text-muted-foreground">
                {testCase.preconditions.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="font-mono text-pcnGreen-500">›</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="font-mono text-pcnGreen-600">
              # {testCase.type === 'manual' ? 'pasos' : 'cómo correrlo'}
            </p>
            <ol className="text-muted-foreground">
              {testCase.steps.map((step, i) => (
                <li key={step} className="flex gap-2">
                  <span className="shrink-0 font-mono text-pcnGreen-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {testCase.automation ? (
                    <code className="font-mono break-all text-foreground">$ {step}</code>
                  ) : (
                    step
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="font-mono text-pcnGreen-600"># resultado esperado</p>
            <p className="text-foreground">{testCase.expected}</p>
          </div>
        </div>
      )}
    </li>
  );
}

export function TestCaseBrowser({ updatedAt }: { updatedAt: string }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState<QualityAreaId | typeof ALL>(ALL);
  const [type, setType] = useState<TestCaseType | null>(null);
  const [priority, setPriority] = useState<TestCasePriority | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState(PAGE_SIZE);

  // `#TC-GAL-001` links straight to one case: filter to it and open it.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (testCases.some((c) => c.id === id)) {
      setQuery(id);
      setOpenIds(new Set([id]));
    }
  }, []);

  const searchIndex = useMemo(() => new Map(testCases.map((c) => [c.id, searchableText(c)])), []);

  const filtered = useMemo(() => {
    const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
    return testCases.filter(
      (c) =>
        (area === ALL || c.area === area) &&
        (!type || c.type === type) &&
        (!priority || c.priority === priority) &&
        words.every((word) => searchIndex.get(c.id)!.includes(word)),
    );
  }, [query, area, type, priority, searchIndex]);

  useEffect(() => setVisible(PAGE_SIZE), [query, area, type, priority]);

  const toggle = (id: string) =>
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const filtering = query.trim() || area !== ALL || type || priority;

  return (
    <div className="space-y-4">
      <RuledGrid className="grid-cols-2 sm:grid-cols-4">
        <Stat label="casos en total" value={totals.total} />
        <Stat label="manuales" value={totals.manual} />
        <Stat label="automatizados" value={totals.automated} />
        <Stat label="prioridad alta" value={totals.high} />
      </RuledGrid>

      <div>
        <h3 className="mb-2 font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">### </span>cobertura por área · tocá un área para
          filtrar
        </h3>
        <RuledGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {coverage.map((a) => {
            const ratio = a.total ? Math.round((a.automated / a.total) * 100) : 0;
            const active = area === a.id;
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={active}
                onClick={() => setArea(active ? ALL : a.id)}
                className={cn(
                  ruledCellClassName,
                  'flex flex-col gap-1 px-3 py-2 text-left',
                  active && 'bg-pcnGreen/10',
                )}
              >
                <span className="flex items-baseline justify-between gap-2 font-mono text-xs">
                  <span className={cn(active ? 'text-pcnGreen' : 'text-foreground')}>
                    <span className="text-pcnGreen-600">{a.code}</span> {a.label}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{a.total}</span>
                </span>
                <span
                  aria-hidden
                  className="flex h-1.5 w-full overflow-hidden bg-pcnGreen-100"
                  title={`${a.automated} automatizados · ${a.manual} manuales`}
                >
                  <span className="bg-pcnGreen" style={{ width: `${ratio}%` }} />
                  <span className="bg-sky-400/70" style={{ width: `${100 - ratio}%` }} />
                </span>
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {a.automated} auto · {a.manual} manual ·{' '}
                  <span className={cn(a.automated === 0 ? 'text-amber-400' : 'text-pcnGreen')}>
                    {ratio}% automatizado
                  </span>
                </span>
              </button>
            );
          })}
        </RuledGrid>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBar
          searchQuery={query}
          setSearchQuery={setQuery}
          placeholder="id, título, paso o archivo"
          label="Buscar casos de prueba"
          className="sm:max-w-xs"
        />
        <Select value={area} onValueChange={(value) => setArea(value as QualityAreaId)}>
          <SelectTrigger
            aria-label="Filtrar por área"
            className="h-8 w-auto min-w-40 font-mono text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>todas las áreas</SelectItem>
            {qualityAreas.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div
          aria-label="Filtrar por tipo y prioridad"
          className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0"
        >
          {(['manual', 'automatizado'] as const).map((value) => (
            <Flag
              key={value}
              active={type === value}
              onClick={() => setType(type === value ? null : value)}
            >
              {value}
            </Flag>
          ))}
          {(['alta', 'media', 'baja'] as const).map((value) => (
            <Flag
              key={value}
              active={priority === value}
              onClick={() => setPriority(priority === value ? null : value)}
            >
              {value}
            </Flag>
          ))}
        </div>
        <p
          className="ml-auto font-mono text-xs text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          <span className={cn(filtering ? 'text-pcnGreen' : 'text-foreground')}>
            {filtered.length}
          </span>
          /{testCases.length} casos
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>0 casos con esos filtros
        </p>
      ) : (
        <ul className="border-t border-l border-pcnGreen-200">
          {filtered.slice(0, visible).map((c) => (
            <CaseRow
              key={c.id}
              testCase={c}
              open={openIds.has(c.id)}
              onToggle={() => toggle(c.id)}
            />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground">
        <span>
          <span className="text-pcnGreen-500">$ </span>pnpm qa:cases{' '}
          <span className="text-pcnGreen-700"># regenera los casos automatizados</span> · última
          actualización: {updatedAt}
        </span>
        {visible < filtered.length && (
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="flex h-8 items-center rounded-sm border border-pcnGreen-200 px-3 text-xs text-pcnGreen transition-colors hover:border-pcnGreen-600"
          >
            cargarMás(); <span className="ml-1.5 opacity-60">+{filtered.length - visible}</span>
          </button>
        )}
      </div>
    </div>
  );
}
