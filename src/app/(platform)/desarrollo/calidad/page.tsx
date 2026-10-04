import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { TestCaseBrowser } from '@/components/desarrollo/quality/test-case-browser';
import { cn } from '@/lib/utils';
import {
  AUTOMATED_CASES_UPDATED_AT,
  automatedCases,
  layerLabels,
  manualCases,
} from './quality-cases';
import type { AutomatedLayer } from './quality-areas';
import {
  qualityGates,
  qualityRoadmap,
  qualityTechniques,
  qualityTools,
  type QualityItem,
} from './quality-stack';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';
const REPO_BLOB_URL = 'https://github.com/programaconnosotros/pcn-website/blob/main';

const description =
  'Cómo se prueba el website de PCN: las herramientas y técnicas de testing que usamos, los checks que pasa cada cambio y un repositorio público de casos de prueba manuales y automatizados.';

export const metadata: Metadata = {
  title: 'Quality engineering',
  description,
  openGraph: {
    title: 'Quality engineering | programaConNosotros',
    description,
    url: `${SITE_URL}/desarrollo/calidad`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quality engineering | programaConNosotros',
    description,
  },
};

const Section = ({ id, title, children }: { id: string; title: string; children: ReactNode }) => (
  <section id={id} className="scroll-mt-32 p-4">
    <h2 className="mb-3 font-mono text-sm font-semibold">
      <span className="text-pcnGreen-500">## </span>
      {title}
    </h2>
    {children}
  </section>
);

const Intro = ({ children }: { children: ReactNode }) => (
  <p className="mb-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{children}</p>
);

const ItemList = ({ items, planned }: { items: QualityItem[]; planned?: boolean }) => (
  <dl className="grid grid-cols-[minmax(0,1fr)] gap-x-4 gap-y-2 text-xs sm:grid-cols-[200px_minmax(0,1fr)]">
    {items.map((item) => (
      <div key={item.term} className="contents">
        <dt className={cn('font-mono', planned ? 'text-amber-400' : 'text-pcnGreen')}>
          {planned && <span className="text-amber-400/70">[ ] </span>}
          {item.term}
        </dt>
        <dd className="leading-relaxed text-muted-foreground">
          {item.detail}
          {item.file && (
            <>
              {' '}
              <a
                href={`${REPO_BLOB_URL}/${item.file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all font-mono text-pcnGreen-700 underline-offset-4 hover:text-pcnGreen hover:underline"
              >
                {item.file} ↗
              </a>
            </>
          )}
        </dd>
      </div>
    ))}
  </dl>
);

// How the automated suite splits by layer, widest at the bottom like the testing pyramid.
const layers: AutomatedLayer[] = [
  'e2e',
  'integration',
  'route-handler',
  'server-action',
  'component',
  'unit',
];
const layerDetail: Record<AutomatedLayer, string> = {
  e2e: 'navegador real con Playwright contra la app corriendo',
  integration: 'server actions y queries contra un Postgres real (pnpm test:db)',
  'route-handler': 'endpoints de src/app/api con Request y Response reales',
  'server-action': 'src/actions con Prisma, cookies y headers mockeados',
  component: 'componentes de React en jsdom con Testing Library',
  unit: 'funciones puras de src/lib, schemas y contenido',
};
const layerCounts = layers.map((layer) => ({
  layer,
  tests: automatedCases.filter((c) => c.automation?.layer === layer).length,
  files: new Set(
    automatedCases.filter((c) => c.automation?.layer === layer).map((c) => c.automation!.file),
  ).size,
}));
const maxLayer = Math.max(...layerCounts.map((l) => l.tests));
const testFiles = new Set(automatedCases.map((c) => c.automation!.file)).size;

const updatedAt = new Date(`${AUTOMATED_CASES_UPDATED_AT}T12:00:00Z`).toLocaleDateString('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const CalidadPage = () => (
  <div className="flex flex-1 flex-col p-4 pt-0">
    <div className="mt-4">
      <StickyHeader>
        <PageTitle
          path="desarrollo/calidad"
          meta={`quality engineering · ${manualCases.length + automatedCases.length} casos de prueba`}
        />
      </StickyHeader>

      <div className="mb-14 divide-y divide-pcnGreen-200 border border-pcnGreen-200">
        <Section id="enfoque" title="Cómo probamos el sitio">
          <Intro>
            Este sitio lo usa una comunidad real: gente que se inscribe a eventos con cupo, sube
            fotos, deja su contraseña. Por eso lo tratamos como software serio: {testFiles} archivos
            de tests automatizados con {automatedCases.length} casos que corren antes de cada push,
            validación en el cliente y en el servidor, tipos estrictos y {manualCases.length} casos
            manuales escritos para lo que todavía se prueba a mano. Todo está acá abajo, con el link
            al código.
          </Intro>
          <ol className="space-y-2">
            {qualityGates.map((gate, i) => (
              <li
                key={gate.stage}
                className="grid gap-x-4 gap-y-0.5 text-xs sm:grid-cols-[200px_1fr]"
              >
                <span className="font-mono text-pcnGreen">
                  <span className="text-pcnGreen-500">{String(i + 1).padStart(2, '0')} </span>
                  {gate.stage}
                </span>
                <span className="leading-relaxed text-muted-foreground">
                  <code className="mb-0.5 block break-all font-mono text-foreground">
                    <span className="text-pcnGreen-500">$ </span>
                    {gate.command}
                  </code>
                  {gate.checks}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="piramide" title="La suite automatizada por capa">
          <Intro>
            La mayoría de los tests están en la base de la pirámide: rápidos, sin red ni base de
            datos, y la suite completa tarda segundos. Cada caso automatizado del repositorio de
            abajo es uno de estos tests.
          </Intro>
          <RuledGrid className="grid-cols-1">
            {layerCounts.map(({ layer, tests, files }) => (
              <div
                key={layer}
                className={cn(ruledCellClassName, 'grid gap-2 px-3 py-2 sm:grid-cols-[200px_1fr]')}
              >
                <div className="font-mono text-xs">
                  <p className="text-pcnGreen">{layerLabels[layer]}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {tests} tests · {files} archivos
                  </p>
                </div>
                <div className="flex flex-col justify-center gap-1">
                  <div className="flex h-2 items-center justify-center">
                    <span
                      className="h-2 bg-pcnGreen/70"
                      style={{ width: `${Math.max((tests / maxLayer) * 100, 1)}%` }}
                    />
                  </div>
                  <p className="text-center text-[11px] text-muted-foreground">
                    {layerDetail[layer]}
                  </p>
                </div>
              </div>
            ))}
          </RuledGrid>
        </Section>

        <Section id="herramientas" title="Herramientas">
          <ItemList items={qualityTools} />
        </Section>

        <Section id="tecnicas" title="Técnicas">
          <ItemList items={qualityTechniques} />
        </Section>

        <Section id="pendiente" title="Lo que falta (planeado, todavía no está)">
          <Intro>
            Ser honestos con lo que no hay también es parte de la calidad. Esto no existe todavía en
            el repo; es lo próximo que sumaríamos. Si te interesa, es un buen lugar para contribuir.
          </Intro>
          <ItemList items={qualityRoadmap} planned />
        </Section>

        <Section id="casos" title="Repositorio de casos de prueba">
          <Intro>
            Todo lo que se prueba en el sitio, área por área. Los casos manuales son los que
            corremos a mano antes de llevar cambios a producción; los automatizados salen directo de
            la suite de Jest (y Playwright), con el archivo y el comando para correr cada uno. Podés
            linkear un caso con <code className="font-mono text-pcnGreen">#TC-GAL-001</code>.
          </Intro>
          <TestCaseBrowser updatedAt={updatedAt} />
        </Section>

        <div className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
          <p className="font-mono text-sm">
            <span className="text-pcnGreen-500">$ </span>
            ¿Encontraste algo que no está cubierto? Sumá el caso o el test en una PR.
          </p>
          <Link
            href="/desarrollo#contribuir"
            className="font-mono text-sm text-pcnGreen underline-offset-4 hover:underline"
          >
            ~/desarrollo#contribuir →
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default CalidadPage;
