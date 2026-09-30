import prisma from '@/lib/prisma';
import { loadCardImage } from '@/lib/og/load-image';
import { OG_CONTENT_TYPE, OG_SIZE, renderTerminalCard } from '@/lib/og/terminal-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Perfil de un miembro de programaConNosotros';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Only public profile fields: never email, phone or anything else private.
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      image: true,
      slogan: true,
      jobTitle: true,
      enterprise: true,
      career: true,
      studyPlace: true,
    },
  });

  if (!user) {
    return renderTerminalCard({
      path: 'perfil',
      command: 'finger',
      title: 'Miembros de programaConNosotros',
      meta: ['500+ miembros'],
    });
  }

  const firstName = user.name.split(' ')[0]?.toLowerCase() ?? 'dev';
  const work = user.jobTitle
    ? user.enterprise
      ? `${user.jobTitle} en ${user.enterprise}`
      : user.jobTitle
    : null;
  const study = user.career
    ? user.studyPlace
      ? `${user.career} · ${user.studyPlace}`
      : user.career
    : null;

  return renderTerminalCard({
    path: 'perfil',
    command: `finger ${firstName}`,
    title: user.name,
    description: user.slogan ?? work ?? study ?? 'Miembro de la comunidad programaConNosotros.',
    meta: ['miembro de PCN', ...(user.slogan && work ? [work] : [])],
    avatar: { src: await loadCardImage(user.image), initials: initials(user.name) },
  });
}
