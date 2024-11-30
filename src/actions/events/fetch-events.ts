'use server'

import prisma from '@/lib/prisma';
import { EVENTS_PER_PAGE } from '@/lib/constants';

export const fetchEvents = (page: number) => prisma.event.findMany({
    orderBy: { date: 'desc' }, take: EVENTS_PER_PAGE,
    skip: (page - 1) * EVENTS_PER_PAGE,
});
