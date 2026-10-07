import { PageTitleSkeleton, TextLineSkeleton } from '@/components/skeletons/page-skeletons';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

// One ruled cell per question: the numbered question and a two or three line answer.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <PageTitleSkeleton titleClassName="w-56" />
        <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={cn(ruledCellClassName, 'flex flex-col gap-1 p-3')}>
              <TextLineSkeleton
                lineClassName="h-5"
                className={i % 2 ? 'h-3.5 w-2/3' : 'h-3.5 w-1/2'}
              />
              <TextLineSkeleton lineClassName="h-5" className="h-3 w-full" />
              <TextLineSkeleton
                lineClassName="h-5"
                className={i % 3 ? 'h-3 w-3/4' : 'h-3 w-full'}
              />
              {i % 3 === 0 && <TextLineSkeleton lineClassName="h-5" className="h-3 w-1/3" />}
            </div>
          ))}
        </RuledGrid>
      </div>
    </div>
  );
}
