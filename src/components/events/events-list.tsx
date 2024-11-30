'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { EVENTS_PER_PAGE } from '@/lib/constants';
import { fetchEvents } from '@/actions/events/fetch-events';
import { EventCard } from './event-card';


export const EventsList = () => {
    const ref = useRef(null);
    const isInView = useInView(ref);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ['events'],
        queryFn: ({ pageParam = 1 }) => fetchEvents(pageParam),
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length === EVENTS_PER_PAGE ? allPages.length + 1 : undefined,
        initialPageParam: 1,
    });

    useEffect(() => {
        if (isInView && hasNextPage) {
            fetchNextPage();
        }
    }, [isInView, fetchNextPage, hasNextPage]);

    const events = data?.pages.flat() ?? [];
    console.log("events", data);

    return (
        <>
            <div className="mb-10 flex flex-col md:-mx-2 lg:flex-row">
                {events.length === 0 && (
                    <p className="w-full text-center text-sm text-muted-foreground">
                        No hay eventos aún.
                    </p>
                )}


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {events
                        .map((event, index) => (
                            <div key={event.id} className={`mb-4 md:mb-0 ${index >= 0 ? 'mt-4' : ''}`}>
                                <EventCard event={event} />
                            </div>
                        ))}
                </div>

            </div>

            {hasNextPage && (
                <div ref={ref} className="flex justify-center">
                    {isFetchingNextPage ? (
                        <p>Cargando más eventos...</p>
                    ) : (
                        <button onClick={() => fetchNextPage()}>Cargar más</button>
                    )}
                </div>
            )}
        </>
    );
};
