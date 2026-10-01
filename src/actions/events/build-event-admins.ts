import prisma from '@/lib/prisma';

// Normaliza los administradores de un evento: solo ambassadors existentes, sin repetir y sin
// quien creó el evento (que ya lo administra).
export async function buildEventAdmins(adminIds: string[], createdById: string | null) {
  const ids = [...new Set(adminIds)].filter((id) => id !== createdById);
  if (ids.length === 0) return [];

  const ambassadors = await prisma.user.findMany({
    where: { id: { in: ids }, isAmbassador: true },
    select: { id: true },
  });
  const valid = new Set(ambassadors.map((user) => user.id));

  return ids.filter((id) => valid.has(id)).map((userId) => ({ userId }));
}
