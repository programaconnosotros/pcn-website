import {
  PageTitleSkeleton,
  SectionLabelSkeleton,
  TextLineSkeleton,
} from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const panelClassName = cn(ruledCellClassName, 'min-w-0 p-4');

// A ranked list panel (`módulos más usados`, `funnel de registro`): its title over a few rows.
const ListPanel = ({ rows }: { rows: number }) => (
  <section className={panelClassName}>
    <SectionLabelSkeleton className="w-36" />
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-2 border-b border-pcnGreen/60 py-1.5 last:border-b-0"
      >
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-1.5 flex-1" />
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </section>
);

// Mirrors the page: title, the `metrics --from … --to …` bar with the range filter, the six KPI
// tiles, the traffic chart and the first row of panels.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        <PageTitleSkeleton titleClassName="w-32" />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-pcnGreen-200 px-3 py-2">
          <TextLineSkeleton className="h-2.5 w-80 max-w-full" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-8 w-60" />
          </div>
        </div>

        <TextLineSkeleton lineClassName="mb-2 h-4" className="h-2 w-96 max-w-full" />

        <RuledGrid className="mb-6 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3')}>
              <TextLineSkeleton className="h-2.5 w-2/3" />
              <TextLineSkeleton lineClassName="h-8" className="h-6 w-1/2" />
              <TextLineSkeleton className="h-2.5 w-1/3" />
              <Skeleton className="h-7 w-full" />
            </div>
          ))}
        </RuledGrid>

        <RuledGrid className="mb-6 grid-cols-1">
          <section className={panelClassName}>
            <SectionLabelSkeleton className="w-24" />
            <div className="flex flex-col gap-3">
              <div className="flex h-5 items-center justify-between gap-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-56 w-full" />
            </div>
          </section>
        </RuledGrid>

        <RuledGrid className="mb-6 grid-cols-1 xl:grid-cols-2">
          <ListPanel rows={8} />
          <ListPanel rows={5} />
        </RuledGrid>
      </div>
    </div>
  );
}
