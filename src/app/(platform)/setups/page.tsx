import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { SetupFormDialog } from '@/components/setups/setup-form-dialog';
import { SetupTile } from '@/components/setups/setup-tile';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { StickyHeader } from '@/components/ui/sticky-header';
import { TabBrackets, tabsListClassName, tabsTriggerClassName } from '@/components/ui/tab-styles';
import { fetchSetups, parseSetupSort, type SetupSort } from '@/lib/setups';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';
const DESCRIPTION =
  'Los lugares de trabajo de la comunidad: escritorios, equipos y periféricos con los que programan los miembros de PCN.';

export const metadata: Metadata = {
  title: 'Setups',
  description: DESCRIPTION,
  openGraph: {
    title: 'Setups de la comunidad | programaConNosotros',
    description: DESCRIPTION,
    url: `${SITE_URL}/setups`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Setups de la comunidad | programaConNosotros',
    description: DESCRIPTION,
  },
};

const SORTS: SetupSort[] = ['recientes', 'populares'];

export default async function SetupsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sort = parseSetupSort((await props.searchParams).orden);
  const [setups, session] = await Promise.all([fetchSetups(sort), getCurrentSession()]);
  const viewerId = session?.user.id ?? null;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <PageTitle
              path="setups"
              meta={`${setups.length} ${setups.length === 1 ? 'setup' : 'setups'} de la comunidad`}
              className="mb-0 flex-1"
            />
            <div className="flex items-center gap-3">
              {setups.length > 1 && (
                <nav aria-label="Orden" className={tabsListClassName}>
                  {SORTS.map((value) => (
                    <Link
                      key={value}
                      href={value === 'recientes' ? '/setups' : `/setups?orden=${value}`}
                      scroll={false}
                      data-state={sort === value ? 'active' : 'inactive'}
                      aria-current={sort === value ? 'page' : undefined}
                      className={tabsTriggerClassName}
                    >
                      <TabBrackets>{value}</TabBrackets>
                    </Link>
                  ))}
                </nav>
              )}
              {session ? (
                <SetupFormDialog withTrigger />
              ) : (
                <Button variant="pcn" size="sm" asChild>
                  <Link href="/autenticacion/iniciar-sesion?redirect=/setups">
                    <Plus className="mr-1.5 size-4" />
                    compartirSetup();
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </StickyHeader>

        {setups.length === 0 ? (
          <p className="border border-pcnGreen-200 p-4 font-mono text-xs text-muted-foreground">
            <span className="text-pcnGreen-500">$ </span>
            Todavía nadie compartió su setup. ¡Estrenalo vos!
          </p>
        ) : (
          <RuledGrid className="mb-14 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {setups.map((setup) => (
              <SetupTile key={setup.id} setup={setup} viewerId={viewerId} />
            ))}
          </RuledGrid>
        )}
      </div>
    </div>
  );
}
