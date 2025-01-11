'use client';

import { Card, CardHeader, CardContent, CardDescription } from '@/components/ui/card';
import { Event } from '@prisma/generated/zod';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { BreadcrumbLink } from '../ui/breadcrumb';

export const EventCard = ({ event }: { event: Event }) => {

    return (
        <Card key={event.id} className="h-full flex flex-col">
            <Image src={event.flyerSrc} alt="" width={400} height={200} />

            <CardContent className="px-4 py-2">
                <div className="flex justify-between mt-1">
                    <p className="mt-2 text-xs text-gray-500">
                        {format(new Date(event.date), "EEE, d MMM, HH:mm", { locale: es })}
                        {event.endDate && ` - ${format(new Date(event.endDate), "HH:mm", { locale: es })}`}
                    </p>
                </div>

                <CardHeader className='px-0 py-2'>
                    {event.name}
                </CardHeader>

                <div className="flex">
                    <MapPin className="mt-4 h-4 w-4 text-gray-500" />
                    <p className="mt-4 text-xs text-gray-500 ml-1">
                        {event.city}, AR
                    </p>
                </div>

            </CardContent>

            <BreadcrumbLink href={`events/${event.id}`} className='mt-auto'>
                <Button className='mt-1 ml-4 mb-4'>
                    Ver evento
                </Button>
            </BreadcrumbLink>
        </Card>
    );
};
