import { fetchCommunityMembers } from '@/actions/users/fetch-community-members';
import { toDirectoryMembers } from '@/components/members/directory-members';
import { canOptimizeImage } from '@/lib/image-hosts';
import { MiembrosClient } from './miembros-client';

export const revalidate = 0;

export default async function MiembrosPage() {
  const members = await fetchCommunityMembers();
  return <MiembrosClient members={toDirectoryMembers(members, (src) => canOptimizeImage(src))} />;
}
