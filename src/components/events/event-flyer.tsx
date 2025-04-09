import React from 'react';
import Image from 'next/image';

import { Heading1 } from '../ui/heading-1';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Event } from '@prisma/client';

type EventFlyerProps = {
  name: string;
  flyerSrc: string;
  date: Event['date'];
  endDate?: Event['endDate'];
};

const EventFlyer: React.FC<EventFlyerProps> = ({ name, flyerSrc, date, endDate }) => (
  <>
    <Heading1>{name}</Heading1>

    {flyerSrc && (
      <Dialog>
        <DialogTrigger>
          <div className="mt-4">
            <Image
              src={flyerSrc}
              alt={`Flyer del evento ${name}`}
              width={600}
              height={600}
              priority
              quality={85}
              className="rounded-lg object-cover shadow-lg"
            />
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-4xl px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">{`Flyer del evento ${name}`}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center">
            <Image
              src={flyerSrc}
              alt={`Flyer del evento ${name}`}
              width={600}
              height={600}
              priority
              quality={85}
              className="h-full w-auto rounded-lg object-cover shadow-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    )}

    <p className="mt-2">
      Horario del evento: {format(new Date(date), 'EEE, d MMM, HH:mm', { locale: es })}
      {endDate && ` - ${format(new Date(endDate), 'HH:mm', { locale: es })}`}
    </p>
  </>
);

export default EventFlyer;
