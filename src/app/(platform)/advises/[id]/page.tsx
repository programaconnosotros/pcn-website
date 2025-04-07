import { getAdviseById } from '@/actions/advises/get-advise';
import { AdviseCard } from '@/components/advises/advise-card';
import { CommentSection } from '@/components/advises/comment-section';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export default async function AdvisePage({ params }: { params: { id: string } }) {
  const sessionId = cookies().get('sessionId');
  const session = sessionId
    ? await prisma.session.findUnique({
        where: { id: sessionId.value },
        include: { user: true },
      })
    : null;

  const advise = await getAdviseById(params.id);

  if (!advise) {
    return <div>Consejo no encontrado</div>;
  }

  return (
    <div className="mt-4 md:max-w-screen-xl md:px-20">
      <AdviseCard advise={advise} session={session} />
      <CommentSection adviseId={advise.id} comments={advise.comments ?? []} session={session} />
    </div>
  );
}
