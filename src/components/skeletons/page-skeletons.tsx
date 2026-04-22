import { Skeleton } from '@/components/ui/skeleton';

export function PageHeaderSkeleton({ breadcrumbs = 1 }: { breadcrumbs?: number }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <Skeleton className="h-7 w-7" />
        <div className="mx-2 h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          {Array.from({ length: breadcrumbs }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <div className="h-3 w-3 bg-muted rounded-sm" />}
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

export function TitleRowSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-8 w-48" />
      </div>
      {withAction && <Skeleton className="h-9 w-32 rounded-md" />}
    </div>
  );
}

export function CardRowItem() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function CardListSkeleton({
  count = 5,
  variant = 'row',
  withImage = false,
}: {
  count?: number;
  variant?: 'row' | 'grid';
  withImage?: boolean;
}) {
  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-4">
            {withImage && <Skeleton className="h-40 w-full rounded-md" />}
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardRowItem key={i} />
      ))}
    </div>
  );
}

export function DetailTwoColumnSkeleton() {
  return (
    <div className="my-5 flex flex-col gap-5 xl:flex-row">
      <div className="flex flex-1 flex-col gap-5">
        <div className="rounded-lg border p-4">
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-md" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-5 xl:w-80">
        <div className="rounded-lg border p-4">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border p-4 space-y-3">
          <Skeleton className="h-5 w-20" />
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 rounded-md" />
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex gap-4 border-b bg-muted/50 px-4 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProseSkeleton({ paragraphs = 6 }: { paragraphs?: number }) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      {Array.from({ length: paragraphs }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3 rounded-lg border p-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccordionSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="rounded-lg border px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-4" />
        </div>
      ))}
    </div>
  );
}

export function GalleryGridSkeleton({ tiles = 12 }: { tiles?: number }) {
  return (
    <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
      {Array.from({ length: tiles }).map((_, i) => (
        <Skeleton
          key={i}
          className="mb-4 w-full rounded-lg"
          style={{ height: `${120 + (i % 3) * 60}px` }}
        />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border p-4 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-48 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
