'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const updateSetupImage = async (setupId: string, imageUrl: string) => {
    await prisma.setup.update({
        where: { id: setupId },
        data: { imageUrl }
    });

    revalidatePath('/setups');
    revalidatePath('/');
}; 