import type { Metadata } from 'next';
import { Activity } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { RangeFilter } from '@/components/admin/metrics/range-filter';
import { TrafficChart } from '@/components/admin/metrics/traffic-chart';
import {
  HourHeatmap,
  KpiTile,
  ModuleDetails,
  ModuleRanking,
  Panel,
  PanelTitle,
  RankedList,
  RuledGrid,
  SignupFunnel,
  TopPages,
} from '@/components/admin/metrics/metrics-panels';
import { getCachedProductMetrics } from '@/lib/product-metrics';
import { METRICS_TIME_ZONE } from '@/lib/metrics-range';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: tabTitle.ls('metricas'),
  description:
    'Las métricas de producto de programaConNosotros, abiertas: tráfico, módulos más usados, funnel de registro y engagement.',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

// Referers from the site itself are navigation, not traffic sources.
const OWN_HOSTS = [
  new URL(SITE_URL).hostname.replace(/^www\./, ''),
  'programaconnosotros.com',
  'localhost',
  'pcn-website.localhost',
];

const shortDate = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: METRICS_TIME_ZONE,
});
const isoDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: METRICS_TIME_ZONE }).format(date);

const number = (value: number) => value.toLocaleString('es-AR');
const ratio = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const percent = (value: number) =>
  `${value.toLocaleString('es-AR', { maximumFractionDigits: value < 10 ? 1 : 0 })}%`;

type Props = {
  searchParams: Promise<{ rango?: string; desde?: string; hasta?: string; admins?: string }>;
};

export default async function MetricasPage(props: Props) {
  const metrics = await getCachedProductMetrics(await props.searchParams, OWN_HOSTS);
  const {
    range,
    traffic,
    previousTraffic,
    signups,
    previousSignups,
    series,
    activity,
    previousActivity,
    funnel,
  } = metrics;

  // The range's last day, inclusive, for the filter inputs and the command line.
  const lastDay = new Date(range.to.getTime() - 1);
  const spark = (key: 'visits' | 'visitors' | 'signups') =>
    series.points.map((point) => point[key]);
  const conversion = ratio(signups, traffic.visitors);
  const previousConversion = ratio(previousSignups, previousTraffic.visitors);
  const activation = ratio(funnel.at(-1)?.count ?? 0, funnel[1]?.count ?? 0);
  const { desktop, mobile, tablet, bots } = metrics.deviceSplit;

  const engagementTiles = [
    { label: 'inscripciones a eventos', key: 'registrations' },
    { label: 'artículos leídos', key: 'articlesRead' },
    { label: 'videos vistos', key: 'videos' },
    { label: 'likes', key: 'likes' },
    { label: 'comentarios', key: 'comments' },
    { label: 'consejos', key: 'advice' },
    { label: 'proyectos', key: 'projects' },
    { label: 'propuestas de charla', key: 'proposals' },
  ] as const;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        <PageTitle
          path="metricas"
          meta={
            <span className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-pcnGreen opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-pcnGreen" />
              </span>
              métricas de producto
            </span>
          }
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-pcnGreen-200 bg-pcnGreen/[0.03] px-3 py-2">
          <p className="flex min-w-0 items-center gap-2 truncate font-mono text-[11px] text-muted-foreground">
            <Activity className="size-3.5 shrink-0 text-pcnGreen" aria-hidden />
            <span className="text-pcnGreen-500">$</span> metrics --from {isoDate(range.from)} --to{' '}
            {isoDate(lastDay)} --compare previous
          </p>
          <RangeFilter
            preset={range.preset}
            from={range.from}
            to={lastDay}
            includeAdmins={metrics.includeAdmins}
          />
        </div>

        <p className="mb-2 font-mono text-[10px] text-muted-foreground">
          {shortDate.format(range.from)} → {shortDate.format(lastDay)}
          <span className="text-muted-foreground/60">
            {' '}
            · comparado con {shortDate.format(metrics.previous.from)} →{' '}
            {shortDate.format(new Date(metrics.previous.to.getTime() - 1))} ·{' '}
            {metrics.includeAdmins ? 'con admins' : 'sin admins'} · se actualiza cada hora
          </span>
        </p>

        <RuledGrid className="mb-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <KpiTile
            label="visitas"
            value={number(traffic.visits)}
            current={traffic.visits}
            previous={previousTraffic.visits}
            spark={spark('visits')}
          />
          <KpiTile
            label="visitantes únicos"
            value={number(traffic.visitors)}
            current={traffic.visitors}
            previous={previousTraffic.visitors}
            spark={spark('visitors')}
          />
          <KpiTile
            label="miembros activos"
            value={number(traffic.members)}
            current={traffic.members}
            previous={previousTraffic.members}
            hint="logueados que navegaron"
          />
          <KpiTile
            label="altas"
            value={number(signups)}
            current={signups}
            previous={previousSignups}
            spark={spark('signups')}
          />
          <KpiTile
            label="conversión a alta"
            value={percent(conversion)}
            current={conversion}
            previous={previousConversion}
            hint="altas / visitantes"
          />
          <KpiTile
            label="visitantes que vuelven"
            value={percent(ratio(metrics.returning, traffic.visitors))}
            current={metrics.returning}
            hint={`${number(metrics.returning)} en 2+ días`}
          />
        </RuledGrid>

        <RuledGrid className="mb-6 grid-cols-1">
          <Panel>
            <PanelTitle note="pasá el mouse para ver cada día">tráfico</PanelTitle>
            <TrafficChart
              unit={series.unit as 'day' | 'week'}
              points={series.points.map((point) => ({ ...point, day: point.day.toISOString() }))}
            />
          </Panel>
        </RuledGrid>

        <RuledGrid className="mb-6 grid-cols-1 xl:grid-cols-2">
          <Panel>
            <PanelTitle note="visitas · % del total · vs período anterior">
              módulos más usados
            </PanelTitle>
            <ModuleRanking modules={metrics.modules} previous={metrics.previousModules} />
          </Panel>
          <Panel>
            <PanelTitle note={`activación ${percent(activation)} de las cuentas nuevas`}>
              funnel de registro
            </PanelTitle>
            <SignupFunnel steps={funnel} />
          </Panel>
        </RuledGrid>

        <div className="mb-6">
          <PanelTitle note="tráfico, profundidad, recurrencia y uso de cada módulo">
            módulos en detalle
          </PanelTitle>
          <ModuleDetails
            modules={metrics.modules}
            previous={metrics.previousModules}
            usage={metrics.usage}
            previousUsage={metrics.previousUsage}
            pages={metrics.pagesByModule}
            returning={metrics.returningByModule}
          />
        </div>

        <RuledGrid className="mb-6 grid-cols-1 xl:grid-cols-[1fr_1fr]">
          <Panel>
            <PanelTitle note="top 15">páginas más vistas</PanelTitle>
            <TopPages pages={metrics.pages} />
          </Panel>
          <Panel>
            <PanelTitle note="hora de Argentina">cuándo entra la gente</PanelTitle>
            <HourHeatmap grid={metrics.hours} />
          </Panel>
        </RuledGrid>

        <RuledGrid className="mb-6 grid-cols-1 md:grid-cols-2">
          <Panel>
            <PanelTitle note="por referer">de dónde vienen</PanelTitle>
            <RankedList
              items={metrics.sources.map(({ host, visits }) => ({ label: host, value: visits }))}
              empty="todas las visitas son directas"
            />
          </Panel>
          <Panel>
            <PanelTitle note={bots > 0 ? `${number(bots)} visitas de bots aparte` : undefined}>
              dispositivos
            </PanelTitle>
            <RankedList
              items={[
                { label: 'desktop', value: desktop },
                { label: 'mobile', value: mobile },
                { label: 'tablet', value: tablet },
              ].filter(({ value }) => value > 0)}
            />
          </Panel>
        </RuledGrid>

        <PanelTitle note="acciones hechas en el período">engagement</PanelTitle>
        <RuledGrid className="grid-cols-2 md:grid-cols-4">
          {engagementTiles.map(({ label, key }) => (
            <KpiTile
              key={key}
              label={label}
              value={number(activity[key])}
              current={activity[key]}
              previous={previousActivity[key]}
            />
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
