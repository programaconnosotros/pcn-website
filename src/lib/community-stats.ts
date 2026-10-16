// Las estadísticas de la comunidad que muestra /estadisticas: de qué lenguajes, sistemas
// operativos, IDEs, países y especialidades son los miembros, contadas sobre lo que cada uno cargó
// en su perfil. Solo números agregados, nunca quién es quién.

import prisma from '@/lib/prisma';
import { cached } from '@/lib/cache';
import { programmingLanguages } from '@/types/programming-language';
import { specialties } from '@/components/especialidades/specialties';
import { IDES, OPERATING_SYSTEMS } from '@/lib/tech-stack';

export type StatItem = { label: string; value: number };

export type MemberProfile = {
  countryOfOrigin: string | null;
  province: string | null;
  operatingSystems: string[];
  favoriteIde: string | null;
  specialties: string[];
  createdAt: Date;
  languages: { language: string }[];
};

const LINUX = new Set(['ubuntu', 'debian', 'fedora', 'arch', 'linux-mint', 'pop-os', 'otro-linux']);

/** How many times each key shows up, labeled and from most to least; unknown keys are dropped. */
const ranking = (keys: Iterable<string>, labelOf: (_key: string) => string | undefined) => {
  const counts = new Map<string, number>();
  for (const key of keys) {
    const label = labelOf(key);
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'es'));
};

const labelsOf = (
  options: readonly { id: string; label?: string; name?: string; title?: string }[],
) => {
  const labels = new Map(
    options.map((option) => [option.id, option.label ?? option.name ?? option.title]),
  );
  return (id: string) => labels.get(id);
};

const asIs = (value: string) => value || undefined;

export const communityStats = (members: MemberProfile[]) => {
  const withSystems = members.filter((member) => member.operatingSystems.length > 0);

  return {
    members: members.length,
    countryCount: new Set(members.map((member) => member.countryOfOrigin).filter(Boolean)).size,
    // Sobre quienes contaron qué sistema usan: cuántos usan al menos una distro de Linux.
    linuxShare:
      withSystems.length > 0
        ? withSystems.filter((member) => member.operatingSystems.some((os) => LINUX.has(os)))
            .length / withSystems.length
        : null,
    languages: ranking(
      members.flatMap((member) => [...new Set(member.languages.map(({ language }) => language))]),
      labelsOf(programmingLanguages),
    ),
    operatingSystems: ranking(
      members.flatMap((member) => [...new Set(member.operatingSystems)]),
      labelsOf(OPERATING_SYSTEMS),
    ),
    ides: ranking(
      members.flatMap((member) => (member.favoriteIde ? [member.favoriteIde] : [])),
      labelsOf(IDES),
    ),
    countries: ranking(
      members.map((member) => member.countryOfOrigin ?? ''),
      asIs,
    ),
    provinces: ranking(
      members
        .filter((member) => member.countryOfOrigin === 'Argentina')
        .map((member) => member.province ?? ''),
      asIs,
    ),
    specialties: ranking(
      members.flatMap((member) => [...new Set(member.specialties)]),
      labelsOf(specialties.map((specialty) => ({ id: specialty.id, title: specialty.title }))),
    ),
    // Altas por año, en orden cronológico.
    joinedByYear: ranking(
      members.map((member) => String(member.createdAt.getFullYear())),
      asIs,
    ).sort((a, b) => a.label.localeCompare(b.label)),
  };
};

export type CommunityStats = ReturnType<typeof communityStats>;

/** The profiles of every active member (suspended accounts don't count). */
export const getCommunityStats = cached(
  'community-stats',
  async () =>
    communityStats(
      await prisma.user.findMany({
        where: { suspendedAt: null },
        select: {
          countryOfOrigin: true,
          province: true,
          operatingSystems: true,
          favoriteIde: true,
          specialties: true,
          createdAt: true,
          languages: { select: { language: true } },
        },
      }),
    ),
  { models: ['User', 'UserLanguage'] },
);
