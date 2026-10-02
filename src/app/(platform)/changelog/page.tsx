import { changelog } from '@/data/changelog';
import { getAdminUser } from '@/lib/admin';
import { visibleChangelog } from '@/lib/changelog';
import { getIdentityMap } from '@/lib/identity-links';
import { ChangelogClient } from './changelog-client';

export default async function ChangelogPage() {
  const [profiles, admin] = await Promise.all([getIdentityMap('github'), getAdminUser()]);

  return (
    <ChangelogClient entries={visibleChangelog(changelog, !!admin, profiles)} isAdmin={!!admin} />
  );
}
