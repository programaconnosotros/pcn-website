import type { Metadata } from 'next';
import Link from 'next/link';
import { PageTitle } from '@/components/ui/page-title';
import {
  KpiTile,
  Panel,
  PanelTitle,
  RankedList,
  RuledGrid,
} from '@/components/admin/metrics/metrics-panels';
import { getCommunityStats } from '@/lib/community-stats';
import { tabTitle } from '@/lib/tab-title';

export const metadata: Metadata = {
  title: tabTitle.ls('estadisticas'),
  description:
    'Quiénes somos en programaConNosotros: los lenguajes, sistemas operativos, IDEs, países y especialidades de la comunidad.',
};

const number = (value: number) => value.toLocaleString('es-AR');

// Cuántos de los miembros cargaron un dato, para la nota de cada panel.
const answered = (items: { value: number }[], unit = 'miembros') =>
  `${number(items.reduce((sum, { value }) => sum + value, 0))} ${unit}`;

const EMPTY = 'todavía nadie lo cargó en su perfil';

export default async function EstadisticasPage() {
  const stats = await getCommunityStats();
  const top = (items: { label: string; value: number }[], count = 10) => items.slice(0, count);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        <PageTitle
          path="estadisticas"
          meta="quiénes somos, según lo que cada uno cargó en su perfil"
        />

        <RuledGrid className="mb-6 grid-cols-2 md:grid-cols-4">
          <KpiTile label="miembros" value={number(stats.members)} current={stats.members} />
          <KpiTile label="países" value={number(stats.countryCount)} current={stats.countryCount} />
          <KpiTile
            label="lenguajes distintos"
            value={number(stats.languages.length)}
            current={stats.languages.length}
          />
          <KpiTile
            label="usan linux"
            value={stats.linuxShare === null ? '—' : `${Math.round(stats.linuxShare * 100)}%`}
            current={stats.linuxShare ?? 0}
            hint="de quienes contaron su SO"
          />
        </RuledGrid>

        <RuledGrid className="mb-6 grid-cols-1 xl:grid-cols-2">
          <Panel>
            <PanelTitle note="miembros que lo usan · top 10">lenguajes</PanelTitle>
            <RankedList items={top(stats.languages)} empty={EMPTY} />
          </Panel>
          <Panel>
            <PanelTitle note="se puede usar más de uno">sistemas operativos</PanelTitle>
            <RankedList items={stats.operatingSystems} empty={EMPTY} />
          </Panel>
          <Panel>
            <PanelTitle note={answered(stats.ides)}>ide favorito</PanelTitle>
            <RankedList items={top(stats.ides)} empty={EMPTY} />
          </Panel>
          <Panel>
            <PanelTitle note="miembros que se consideran especialistas · top 10">
              especialidades
            </PanelTitle>
            <RankedList items={top(stats.specialties)} empty={EMPTY} />
          </Panel>
          <Panel>
            <PanelTitle note={answered(stats.countries)}>países</PanelTitle>
            <RankedList items={top(stats.countries)} empty={EMPTY} />
          </Panel>
          <Panel>
            <PanelTitle note={answered(stats.provinces, 'de Argentina')}>provincias</PanelTitle>
            <RankedList items={top(stats.provinces)} empty={EMPTY} />
          </Panel>
          <Panel className="xl:col-span-2">
            <PanelTitle note="cuentas creadas en la plataforma cada año">altas por año</PanelTitle>
            <RankedList items={stats.joinedByYear} empty={EMPTY} />
          </Panel>
        </RuledGrid>

        <p className="font-mono text-[11px] text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>
          ¿no aparecés? completá tu stack en{' '}
          <Link href="/perfil" className="text-pcnGreen hover:underline">
            /perfil
          </Link>
        </p>
      </div>
    </div>
  );
}
