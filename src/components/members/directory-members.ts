import type { CommunityMember } from '@/actions/users/fetch-community-members';
import { normalizeSearchText } from '@/lib/people-search';

/**
 * A member as /miembros ships it to the browser: only what the page shows or searches, with the
 * roles already joined, so hundreds of members stay a small payload and nothing is rebuilt per
 * keystroke.
 */
export type DirectoryMember = Pick<
  CommunityMember,
  | 'id'
  | 'name'
  | 'image'
  | 'slogan'
  | 'career'
  | 'studyPlace'
  | 'isCofounder'
  | 'isAmbassador'
  | 'createdAt'
  | 'talks'
  | 'events'
  | 'projects'
> & {
  /** Each current position as "cargo @ empresa", joined by " · ". */
  role: string;
  /** Whether next/image can resize the photo (its host is allowed in next.config.mjs). */
  optimizeImage: boolean;
};

// Cada puesto actual como "cargo @ empresa"; perfiles sin puestos guardados usan el cargo viejo.
export function memberRoles(
  member: Pick<CommunityMember, 'positions' | 'jobTitle' | 'enterprise'>,
) {
  const positions =
    member.positions.length > 0
      ? member.positions
      : [{ jobTitle: member.jobTitle, enterprise: member.enterprise }];
  return positions
    .map((p) => [p.jobTitle, p.enterprise].filter(Boolean).join(' @ '))
    .filter(Boolean);
}

/** Server side: trims the cached members to what the directory needs. */
export const toDirectoryMembers = (
  members: CommunityMember[],
  canOptimize: (_src: string | null) => boolean = () => false,
): DirectoryMember[] =>
  members.map((member) => ({
    id: member.id,
    name: member.name,
    image: member.image,
    slogan: member.slogan,
    career: member.career,
    studyPlace: member.studyPlace,
    isCofounder: member.isCofounder,
    isAmbassador: member.isAmbassador,
    createdAt: member.createdAt,
    talks: member.talks,
    events: member.events,
    projects: member.projects,
    role: memberRoles(member).join(' · '),
    optimizeImage: canOptimize(member.image),
  }));

/** The text a search runs against, normalized once instead of on every keystroke. */
export const memberSearchText = (member: DirectoryMember) =>
  normalizeSearchText(
    [member.name, member.slogan, member.career, member.studyPlace, member.role]
      .filter(Boolean)
      .join(' \u0000 '),
  );
