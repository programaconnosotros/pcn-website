import { Skeleton } from '@/components/ui/skeleton';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { formActionBarClassName } from '@/components/ui/form-action-bar';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { PageTitleSkeleton } from './page-skeletons';

const cellClassName = 'border-b border-r border-pcnGreen-200';

/** Mirrors the HUD tab strip (`tabsListClassName`): h-7 with one cell per tab. */
export function TabStripSkeleton({ tabs, className }: { tabs: string[]; className?: string }) {
  return (
    <div className={cn('inline-flex h-7 border border-pcnGreen-200', className)}>
      {tabs.map((width, i) => (
        <div
          key={i}
          className="flex items-center border-r border-pcnGreen-200 px-2.5 last:border-r-0"
        >
          <Skeleton className={cn('h-2.5', width)} />
        </div>
      ))}
    </div>
  );
}

/** Mirrors the shared TableOfContents: a sticky prompt bar on phones, the `tree` pane on lg+. */
export function TableOfContentsSkeleton({ rows = 14 }: { rows?: number }) {
  return (
    <>
      <div className="-mx-4 border-b border-pcnGreen-200 px-4 pt-2 pb-2 lg:hidden">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-8 shrink-0 rounded-none" />
          <Skeleton className="h-8 flex-1 rounded-none" />
          <Skeleton className="h-8 w-8 shrink-0 rounded-none" />
        </div>
        <Skeleton className="mt-2 h-1 w-full rounded-none" />
      </div>

      <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 flex-col border border-pcnGreen-200 lg:flex">
        <div className="flex items-center justify-between border-b border-pcnGreen-200 px-3 py-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="border-b border-pcnGreen-200 px-3 py-2">
          <Skeleton className="h-2 w-full rounded-none" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 py-3 pl-8">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex h-7 shrink-0 items-center gap-2">
              <Skeleton className="h-2.5 w-4" />
              <Skeleton
                className={cn('h-3', i % 3 === 0 ? 'w-36' : i % 3 === 1 ? 'w-28' : 'w-40')}
              />
            </div>
          ))}
        </div>
        <div className="flex h-6 items-center justify-between border-t border-pcnGreen-200 pr-2">
          <Skeleton className="h-full w-16 rounded-none" />
          <Skeleton className="h-3 w-8" />
        </div>
      </aside>
    </>
  );
}

/** Mirrors EventSection: a `// title` heading over its content. */
export function EventSectionSkeleton({
  titleWidth = 'w-16',
  children,
}: {
  titleWidth?: string;
  children: ReactNode;
}) {
  return (
    <section className="p-3">
      <div className="mb-2 flex h-4 items-center">
        <Skeleton className={cn('h-3', titleWidth)} />
      </div>
      {children}
    </section>
  );
}

/** Mirrors an upcoming event's page: the flyer at the left and the registration and info at the right. */
export function EventDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton
          titleClassName="w-56"
          meta={false}
          action={<Skeleton className="h-8 w-20" />}
        />
      </div>

      <div className="mb-14 grid grid-cols-1 divide-y divide-pcnGreen-200 border border-pcnGreen-200 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:divide-x md:divide-y-0">
        <div className="flex flex-col">
          <Skeleton className="aspect-4/5 w-full rounded-none" />
        </div>

        <div className="flex flex-col divide-y divide-pcnGreen-200">
          <div className="space-y-3 p-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="mx-auto h-3 w-48" />
          </div>

          <EventSectionSkeleton titleWidth="w-8">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
              {['w-40', 'w-64'].map((width, i) => (
                <div key={i} className="contents">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className={cn('h-3 max-w-full', width)} />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </EventSectionSkeleton>

          <EventSectionSkeleton titleWidth="w-20">
            <div className="space-y-2.5">
              {['w-full', 'w-full', 'w-11/12', 'w-full', 'w-3/4', 'w-full', 'w-2/3'].map(
                (width, i) => (
                  <Skeleton key={i} className={cn('h-3.5', width)} />
                ),
              )}
            </div>
          </EventSectionSkeleton>

          <EventSectionSkeleton titleWidth="w-24">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {['w-28', 'w-24', 'w-32'].map((width, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="size-6 rounded-full" />
                  <Skeleton className={cn('h-3', width)} />
                </div>
              ))}
            </div>
          </EventSectionSkeleton>

          <Skeleton className="h-56 w-full rounded-none" />
        </div>
      </div>
    </div>
  );
}

function FieldSkeleton({ label = 'w-28', control = 'h-9' }: { label?: string; control?: string }) {
  return (
    <div className="space-y-1.5">
      <Skeleton className={cn('h-3', label)} />
      <Skeleton className={cn('w-full', control)} />
    </div>
  );
}

function FormSectionSkeleton({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex h-9 items-center border-b border-pcnGreen-200 bg-pcnGreen/[0.03] px-4">
        <Skeleton className={cn('h-3.5', title)} />
      </div>
      <div className="space-y-6 p-4">{children}</div>
    </section>
  );
}

/** Mirrors EventForm: numbered sections in one bordered box, with the pinned save/cancel bar. */
export function EventFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="space-y-6">
        <div className="divide-y divide-pcnGreen-200 border border-pcnGreen-200">
          <FormSectionSkeleton title="w-48">
            <FieldSkeleton label="w-36" />
            <FieldSkeleton label="w-24" control="h-[120px]" />
          </FormSectionSkeleton>
          <FormSectionSkeleton title="w-52">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldSkeleton label="w-32" />
              <FieldSkeleton label="w-32" />
            </div>
          </FormSectionSkeleton>
          <FormSectionSkeleton title="w-44">
            <div className="flex items-center gap-3">
              <Skeleton className="size-4" />
              <Skeleton className="h-3 w-40" />
            </div>
            <FieldSkeleton label="w-20" />
            <FieldSkeleton label="w-36" />
            <FieldSkeleton label="w-24" />
            <FieldSkeleton label="w-40" />
          </FormSectionSkeleton>
          <FormSectionSkeleton title="w-40">
            <FieldSkeleton label="w-48" control="h-28" />
          </FormSectionSkeleton>
        </div>

        <div className={cn(formActionBarClassName, 'flex gap-4 border-t border-pcnGreen-200')}>
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors EventPoster: an upcoming event's flyer with its details below. */
function EventPosterSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(cellClassName, 'flex flex-col gap-4 p-4', className)}>
      <Skeleton className="aspect-4/5 w-full" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="mt-1 h-3 w-40" />
      </div>
    </div>
  );
}

/** Mirrors EventExhibit: a past event's flyer on its mat, with the plaque underneath. */
function EventExhibitSkeleton() {
  return (
    <div className={cn(cellClassName, 'flex flex-col gap-3 p-3 sm:gap-4 sm:p-5')}>
      <div className="bg-pcnGreen/[0.03] p-2 sm:p-4">
        <Skeleton className="aspect-4/5 w-full rounded-none" />
      </div>
      <div className="flex flex-col gap-1.5 border-l-2 border-pcnGreen-200 pl-2.5 sm:pl-3">
        <Skeleton className="h-2.5 w-12" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function ListHeadingSkeleton({ width, note }: { width: string; note?: boolean }) {
  return (
    <div className="mb-3">
      <div className="flex h-4 items-center gap-2">
        <Skeleton className={cn('h-3', width)} />
        <span className="h-px flex-1 bg-pcnGreen-200" />
      </div>
      {note && <Skeleton className="mt-2 h-3 w-full max-w-lg" />}
    </div>
  );
}

/** Mirrors EventsList: the upcoming billboard, then the museum of past events by year. */
export function EventsListSkeleton() {
  return (
    <div className="mb-14 flex flex-col gap-12">
      <section>
        <ListHeadingSkeleton width="w-32" />
        <RuledGrid className="grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {/* Usually one or two events are coming up: a single poster on phones. */}
          <EventPosterSkeleton />
          <EventPosterSkeleton className="max-sm:hidden" />
        </RuledGrid>
      </section>
      <section>
        <ListHeadingSkeleton width="w-24" note />
        <div className="mb-2 flex items-baseline gap-3">
          <Skeleton className="h-8 w-20 sm:h-9" />
          <Skeleton className="h-3 w-16" />
        </div>
        <RuledGrid className="grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <EventExhibitSkeleton key={i} />
          ))}
        </RuledGrid>
      </section>
    </div>
  );
}
