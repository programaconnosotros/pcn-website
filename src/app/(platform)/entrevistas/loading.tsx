import { PageTitleSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid } from '@/components/ui/ruled-grid';
import { Skeleton } from '@/components/ui/skeleton';

const StepHeading = () => <Skeleton className="mb-3 h-3 w-36" />;

const Option = ({ hint = true }: { hint?: boolean }) => (
  <div className="flex h-[45px] items-center gap-3 border-r border-b border-pcnGreen-200 px-3">
    <Skeleton className="h-3.5 w-5 shrink-0" />
    <Skeleton className="h-3.5 w-32" />
    {hint && <Skeleton className="ml-auto h-2.5 w-28 max-sm:hidden" />}
  </div>
);

const PanelHeader = () => (
  <div className="flex h-[33px] items-center justify-between border-b border-pcnGreen-200 px-3">
    <Skeleton className="h-2.5 w-32" />
    <Skeleton className="h-2.5 w-14" />
  </div>
);

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        {/* Title, meta and the simulador / guías / live coding tabs. */}
        <PageTitleSkeleton
          titleClassName="w-44"
          action={<Skeleton className="h-8 w-64 rounded-none" />}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
          {/* The setup: intro, interview types and seniority. */}
          <div className="min-w-0">
            <div className="mb-6 space-y-2.5 py-1">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-3/5" />
            </div>
            <StepHeading />
            <RuledGrid className="mb-6 grid-cols-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <Option key={i} />
              ))}
            </RuledGrid>
            <StepHeading />
            <RuledGrid className="grid-cols-1 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Option key={i} hint={false} />
              ))}
            </RuledGrid>
          </div>

          {/* `entrevista.conf` and the guides panel. */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
            <div className="border border-pcnGreen-200">
              <PanelHeader />
              <div className="p-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex h-[22px] items-center gap-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="ml-8 h-3 w-4" />
                  </div>
                ))}
                <Skeleton className="mt-4 h-[30px] w-full rounded-none" />
                <Skeleton className="mx-auto mt-2 h-2.5 w-48" />
              </div>
            </div>
            <div className="border border-pcnGreen-200">
              <PanelHeader />
              <div className="space-y-2 p-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
