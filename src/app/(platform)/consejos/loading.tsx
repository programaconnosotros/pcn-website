import { Skeleton } from '@/components/ui/skeleton';

const LoadingAdvises = () => {
  return (
    <div className="mt-4 md:px-20">
      <div className="space-y-4">
        {/* Simulando múltiples consejos */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingAdvises;
