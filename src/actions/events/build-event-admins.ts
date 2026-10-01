import prisma from '@/lib/prisma';

// Normaliza los administradores de un evento: usuarios existentes, sin repetir y sin quien
// creó el evento (que ya lo administra). Los admins del sitio pueden asignar a cualquier
// usuario; los ambassadors, solo a otros ambassadors.
export async function buildEventAdmins(
  adminIds: string[],
  createdById: string | null,
  { anyUser }: { anyUser: boolean },
) {
  const ids = [...new Set(adminIds)].filter((id) => id !== createdById);
  if (ids.length === 0) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: ids }, ...(!anyUser && { isAmbassador: true }) },
    select: { id: true },
  });
  const valid = new Set(users.map((user) => user.id));

  return ids.filter((id) => valid.has(id)).map((userId) => ({ userId }));
}
