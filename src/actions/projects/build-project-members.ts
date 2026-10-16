import { notifyUsers } from '@/actions/notifications/notify-users';
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

/** Tells the registered members who weren't on the team before that they were added to it. */
export async function notifyNewProjectMembers(
  project: { id: string; title: string },
  memberUserIds: (string | null)[],
  previousUserIds: (string | null)[],
  actor: { id: string; name: string },
) {
  const previous = new Set(previousUserIds);
  await notifyUsers(
    memberUserIds.filter((id) => !previous.has(id)),
    {
      type: 'project_member_added',
      title: 'Te sumaron a un proyecto',
      message: `${actor.name} te sumó al equipo de "${project.title}".`,
      href: `/proyectos/${project.id}`,
      metadata: { projectId: project.id, userId: actor.id },
    },
    actor.id,
  );
}
