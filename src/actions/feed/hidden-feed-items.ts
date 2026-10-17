'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

const itemIdSchema = z.string().trim().min(1).max(200);

const hideSchema = z.object({
  itemId: itemIdSchema,
  title: z.string().trim().min(1).max(300),
  // Feed links are always paths on the site.
  href: z
    .string()
    .max(500)
    .regex(/^\/(?!\/)/),
});

/**
 * Takes an item off the feed (and the notification center) for everyone. Idempotent: hiding it
 * twice keeps the first record. The feed's cache expires on its own with the write.
 */
export const hideFeedItem = async (input: z.input<typeof hideSchema>) => {
  const admin = await requireAdmin();
  const { itemId, title, href } = hideSchema.parse(input);
  await prisma.hiddenFeedItem.upsert({
    where: { itemId },
    create: { itemId, title, href, hiddenById: admin.id },
    update: {},
  });
  return { success: true as const };
};

/** Puts a hidden item back in the feed. */
export const showFeedItem = async (itemId: string) => {
  await requireAdmin();
  await prisma.hiddenFeedItem.deleteMany({ where: { itemId: itemIdSchema.parse(itemId) } });
  return { success: true as const };
};
