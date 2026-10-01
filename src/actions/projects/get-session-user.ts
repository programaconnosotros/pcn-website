import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

// Helper de servidor (no es una Server Action): devuelve el usuario logueado o null.
export async function getSessionUser() {
  const sessionId = (await cookies()).get('sessionId')?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  return session?.user ?? null;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Debes estar autenticado');
  }
  return user;
}

type ProjectOwnership = { authorId: string | null };
type ProjectTeam = ProjectOwnership & { members: { userId: string | null }[] };
type SessionUser = { id: string; role: string };

// El autor (o un admin) controla todo el proyecto: equipo, roles y eliminarlo.
export function canManageProject(user: SessionUser | null, project: ProjectOwnership) {
  if (!user) return false;
  return user.role === 'ADMIN' || project.authorId === user.id;
}

export function isProjectCollaborator(user: SessionUser | null, project: ProjectTeam) {
  if (!user) return false;
  return project.members.some((member) => member.userId === user.id);
}

// Los colaboradores también pueden editar la información básica del proyecto.
export function canEditProject(user: SessionUser | null, project: ProjectTeam) {
  return canManageProject(user, project) || isProjectCollaborator(user, project);
}
