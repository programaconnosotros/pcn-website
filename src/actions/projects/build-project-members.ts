import type { ProjectData } from '@/schemas/project-schema';

// Normaliza la lista de compañeros: el autor nunca figura como compañero y cada usuario
// registrado aparece una sola vez.
export function buildProjectMembers(members: ProjectData['members'], authorId: string | null) {
  const seenUserIds = new Set<string>();

  return members
    .filter((member) => {
      if (!member.userId) return true;
      if (member.userId === authorId || seenUserIds.has(member.userId)) return false;
      seenUserIds.add(member.userId);
      return true;
    })
    .map((member, index) => ({
      userId: member.userId ?? null,
      memberName: member.memberName,
      role: member.role ?? null,
      order: index,
    }));
}
