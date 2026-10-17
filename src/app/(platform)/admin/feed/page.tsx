import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { StickyHeader } from '@/components/ui/sticky-header';
import { requireAdminPage } from '@/lib/admin';
import { listHiddenFeedItems } from '@/lib/feed';
import { displayName } from '@/lib/people-names';
import { tabTitle } from '@/lib/tab-title';
import { cn } from '@/lib/utils';
import { ShowFeedItemButton } from './show-feed-item-button';

export const metadata: Metadata = {
  title: tabTitle.sudo('admin/feed'),
  robots: { index: false, follow: false },
};

export const revalidate = 0;

const dateFormat = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Argentina/Buenos_Aires',
});

// What the admins took off /feed for everyone (with the "ocultar" button on each item), newest
// first, to bring any of it back.
export default async function HiddenFeedItemsPage() {
  await requireAdminPage();
  const hidden = await listHiddenFeedItems();

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14 max-w-3xl">
        <StickyHeader>
          <PageTitle
            path={[{ label: 'admin', href: '/admin' }, { label: 'feed' }]}
            meta={hidden.length === 1 ? '1 item oculto' : `${hidden.length} items ocultos`}
          />
        </StickyHeader>

        {hidden.length === 0 ? (
          <EmptyState
            command="ls ~/admin/feed/ocultos"
            output="(vacío)"
            title="No hay nada oculto"
            description="Desde /feed, los admins pueden ocultar cualquier item con el botón ocultar: deja de verse para todos y aparece acá para volver a mostrarlo."
          />
        ) : (
          <RuledGrid className="grid-cols-1">
            {hidden.map((item) => (
              <div
                key={item.itemId}
                className={cn(ruledCellClassName, 'flex items-start justify-between gap-3 p-3')}
              >
                <div className="min-w-0">
                  <Link
                    href={item.href}
                    className="font-mono text-sm font-semibold break-words hover:text-pcnGreen"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    oculto el {dateFormat.format(item.createdAt)}
                    {item.hiddenBy && ` por ${displayName(item.hiddenBy.name)}`}
                  </p>
                </div>
                <ShowFeedItemButton itemId={item.itemId} title={item.title} />
              </div>
            ))}
          </RuledGrid>
        )}
      </div>
    </div>
  );
}
