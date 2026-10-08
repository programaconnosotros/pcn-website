import type { ChangelogEntry } from '@/data/changelog';
import type { LinkedUser } from '@/lib/identity-links';

export type ChangelogAuthor = { login: string; user: LinkedUser | null };

export type VisibleChangelogEntry = Omit<ChangelogEntry, 'authors' | 'audience'> & {
  adminOnly: boolean;
  authors: ChangelogAuthor[];
};

/**
 * The entries a viewer may see, newest first, with each GitHub login resolved to the PCN user it
 * is linked to. Admin-only entries are dropped here, on the server, so they never reach the
 * browser of anyone else.
 */
export const visibleChangelog = (
  entries: ChangelogEntry[],
  isAdmin: boolean,
  profiles: Record<string, LinkedUser>,
): VisibleChangelogEntry[] =>
  entries
    .filter((entry) => isAdmin || entry.audience !== 'admins')
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ authors, audience, ...entry }) => ({
      ...entry,
      adminOnly: audience === 'admins',
      authors: authors.map((login) => ({ login, user: profiles[login] ?? null })),
    }));

/**
 * The entries one person built, for their profile: those crediting any of their GitHub logins,
 * with only the co-authors left as authors since the profile already says who they are.
 */
export const changelogBy = (entries: VisibleChangelogEntry[], logins: string[]) =>
  entries
    .filter((entry) => entry.authors.some((author) => logins.includes(author.login)))
    .map((entry) => ({
      ...entry,
      authors: entry.authors.filter((author) => !logins.includes(author.login)),
    }));
