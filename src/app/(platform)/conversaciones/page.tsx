import { getAdminUser } from '@/lib/admin';
import { getIdentityMap } from '@/lib/identity-links';
import { ConversationsClient } from './conversations-client';

export default async function ConversationsPage() {
  const [profiles, admin] = await Promise.all([getIdentityMap('whatsapp'), getAdminUser()]);

  return <ConversationsClient profiles={profiles} isAdmin={!!admin} />;
}
