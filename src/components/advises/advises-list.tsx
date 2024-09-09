'use client';

import { AdviseCard } from '@components/advises/advise-card';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { fetchAdvises } from '@/actions/advises/fetch-advises';
import { ADVISES_PER_PAGE } from '@/lib/constants';

export const AdvisesList = () => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['advises'],
    queryFn: ({ pageParam = 1 }) => fetchAdvises(pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === ADVISES_PER_PAGE ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (isInView && hasNextPage) {
      fetchNextPage();
    }
  }, [isInView, fetchNextPage, hasNextPage]);

  const advises = data?.pages.flat() ?? [];

  return (
    <>
      <div className="mb-10 flex flex-col md:-mx-2 md:flex-row">
        {advises.length === 0 && (
          <p className="w-full text-center text-sm text-muted-foreground">
            No hay consejos para ver aún.
          </p>
        )}

        {[0, 1, 2].map((columnIndex) => (
          <div key={columnIndex} className="flex-1 md:px-2">
            {advises
              .filter((_, index) => index % 3 === columnIndex)
              .map((advise, index) => (
                <div key={advise.id} className={`mb-4 md:mb-0 ${index > 0 ? 'mt-4' : ''}`}>
                  <AdviseCard advise={advise} />
                </div>
              ))}
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="flex justify-center">
          {isFetchingNextPage ? (
            <p>Cargando más consejos...</p>
          ) : (
            <button onClick={() => fetchNextPage()}>Cargar más</button>
          )}
        </div>
      )}
    </>
  );
};
