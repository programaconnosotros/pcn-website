'use server'

import prisma from "@/lib/prisma";

export const fetchEvent = (id: string) => prisma.event.findUnique({
    where: {
        id: id,
    },
    include: {
        images: true
    }
});