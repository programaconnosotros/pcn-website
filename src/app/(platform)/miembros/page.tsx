import { fetchCommunityMembers } from '@/actions/users/fetch-community-members';
import { MiembrosClient } from './miembros-client';

export const revalidate = 0;

export default async function MiembrosPage() {
  const members = await fetchCommunityMembers();
  return <MiembrosClient members={members} />;
}
