import { ConsejoModal } from '@/components/advice/consejo-modal';
import { getConsejoDetail } from '@/lib/consejos-server';
import { findSession } from '@/lib/session';
import { cookies } from 'next/headers';

// Opening a consejo from the list intercepts /consejos/<id> and shows it as a modal over the
// list. A direct visit or a reload renders the full page in ../../[id] instead.
export default async function ConsejoModalPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const sessionId = (await cookies()).get('sessionId')?.value;

  const [session, detail] = await Promise.all([
    sessionId ? findSession(sessionId) : null,
    getConsejoDetail(id),
  ]);

  if (!detail) return null;

  return <ConsejoModal consejo={detail.consejo} comments={detail.comments} session={session} />;
}
