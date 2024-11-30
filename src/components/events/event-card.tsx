'use client';

import { Card, CardHeader, CardContent, CardDescription } from '@/components/ui/card';
import { Event, User } from '@prisma/generated/zod';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { BreadcrumbLink } from '../ui/breadcrumb';

export const EventCard = ({ event }: { event: Event }) => {


    // TODO : determinar si el autor debe ir incluido en algun lado
    // 2. Preguntar si a eventos que ya se dieron se les debe poder agregar fotos aparte del flyer
    // 3. Los eventos tendran alguna especie de comentarios?

    return (
        <Card key={event.id} className="w-full">
            <Image src={event.flyerSrc} alt="" width={400} height={200} />

            <CardContent className="px-4 py-2">
                <div className="flex justify-between">
                    <p className="mt-4 text-xs text-gray-500">
                        {format(new Date(event.date), "EEE, d MMM, HH:mm", { locale: es })}
                        {event.endDate && ` - ${format(new Date(event.endDate), "HH:mm", { locale: es })}`}
                    </p>
                    <BreadcrumbLink href={`events/${event.id}`}>
                        <Button className="rounded-full font-blue">
                            Ver evento
                        </Button>
                    </BreadcrumbLink>
                </div>

                <CardHeader className='px-0 py-2'>{event.name}</CardHeader>
                <div className="flex">
                    <MapPin className="mt-4 h-4 w-4 text-gray-500"></MapPin>
                    <p className="mt-4 text-xs text-gray-500">
                        {event.location}, AR
                    </p>
                </div>

            </CardContent>
        </Card>
    );
};
