'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { findExtractedConsejo } from '@/data/consejos-extraidos';
import { getSessionUser } from '@/actions/projects/get-session-user';
import { getIdentityMap } from '@/lib/identity-links';
import prisma from '@/lib/prisma';

const idSchema = z.string().startsWith('auto-').max(120);

// Only the member a consejo is attributed to (through the WhatsApp name linked to their profile)
// or an admin can take it down or bring it back.
const authorize = async (id: string) => {
  const consejo = findExtractedConsejo(idSchema.parse(id));
  if (!consejo) throw new Error('Consejo no encontrado');
  const user = await getSessionUser();
  if (!user) throw new Error('Debes estar autenticado');
  if (user.role !== 'ADMIN') {
    const profiles = await getIdentityMap('whatsapp');
    if (profiles[consejo.member]?.id !== user.id) {
      throw new Error('Solo la persona a la que se atribuye el consejo puede ocultarlo');
    }
  }
  return { consejo, user };
};

const revalidate = (id: string, userId: string) => {
  revalidatePath('/consejos');
  revalidatePath(`/consejos/${id}`);
  revalidatePath(`/perfil/${userId}`);
};

/** Take an extracted consejo off /consejos, the profile, search and the sitemap. */
export const hideExtractedConsejo = async (id: string) => {
  const { consejo, user } = await authorize(id);
  await prisma.hiddenConsejo.upsert({
    where: { extractedId: consejo.id },
    create: { extractedId: consejo.id, hiddenById: user.id },
    update: {},
  });
  revalidate(consejo.id, user.id);
};

/** Undo `hideExtractedConsejo`. */
export const restoreExtractedConsejo = async (id: string) => {
  const { consejo, user } = await authorize(id);
  await prisma.hiddenConsejo.deleteMany({ where: { extractedId: consejo.id } });
  revalidate(consejo.id, user.id);
};
