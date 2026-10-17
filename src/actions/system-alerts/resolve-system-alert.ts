'use server';

import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import prisma from '@/lib/prisma';

/** An admin marks a platform problem as fixed: the critical dialog stops showing. */
export const resolveSystemAlert = async (alertId: string) => {
  const admin = await requireAdmin();
  const id = z.string().min(1).max(40).parse(alertId);

  await prisma.systemAlert.updateMany({
    where: { id, resolvedAt: null },
    data: { resolvedAt: new Date(), resolvedBy: admin.id },
  });
};
