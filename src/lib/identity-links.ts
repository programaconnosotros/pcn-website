import prisma from '@/lib/prisma';

export const IDENTITY_SOURCES = ['whatsapp', 'github', 'articulos', 'historia'] as const;
export type IdentitySource = (typeof IDENTITY_SOURCES)[number];

export type LinkedUser = { id: string; name: string; image: string | null };

/**
 * External name (WhatsApp member, GitHub login, /lectura article author or person mentioned in
 * /historia) → the platform user an admin linked it to.
 */
export const getIdentityMap = async (
  source: IdentitySource,
): Promise<Record<string, LinkedUser>> => {
  const links = await prisma.identityLink.findMany({
    where: { source },
    include: { user: { select: { id: true, name: true, image: true } } },
  });
  return Object.fromEntries(links.map((link) => [link.externalName, link.user]));
};

/** The WhatsApp names, GitHub logins and article author names linked to a user. */
export const getUserIdentities = async (userId: string) => {
  const links = await prisma.identityLink.findMany({
    where: { userId },
    select: { source: true, externalName: true },
  });
  const of = (source: IdentitySource) =>
    links.filter((link) => link.source === source).map((link) => link.externalName);
  return { whatsapp: of('whatsapp'), github: of('github'), articulos: of('articulos') };
};
