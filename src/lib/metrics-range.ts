// Date ranges for /metricas, shared by the page, its filter (client) and src/lib/product-metrics.

export const METRICS_TIME_ZONE = 'America/Argentina/Buenos_Aires';

export const RANGE_PRESETS = [
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
  { id: '90d', label: '90d', days: 90 },
  { id: '12m', label: '12m', days: 365 },
] as const;

export type RangePreset = (typeof RANGE_PRESETS)[number]['id'];

export type MetricsRange = {
  from: Date;
  to: Date;
  /** The preset it came from, or `null` for custom dates. */
  preset: RangePreset | null;
};

const DAY = 86_400_000;
const isDateParam = (value?: string) => !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);

/** `?rango=30d` or `?desde=2026-01-01&hasta=2026-01-31` (both inclusive). Defaults to 30 days. */
export const parseMetricsRange = (
  params: { rango?: string; desde?: string; hasta?: string },
  now = new Date(),
): MetricsRange => {
  if (isDateParam(params.desde) && isDateParam(params.hasta)) {
    const from = new Date(`${params.desde}T00:00:00-03:00`);
    const to = new Date(new Date(`${params.hasta}T00:00:00-03:00`).getTime() + DAY);
    if (from < to) return { from, to: to > now ? now : to, preset: null };
  }
  const preset = RANGE_PRESETS.find(({ id }) => id === params.rango) ?? RANGE_PRESETS[1];
  return { from: new Date(now.getTime() - preset.days * DAY), to: now, preset: preset.id };
};

/** The period of the same length that ends where `range` starts. */
export const previousRange = ({ from, to }: MetricsRange) => ({
  from: new Date(from.getTime() - (to.getTime() - from.getTime())),
  to: from,
});
