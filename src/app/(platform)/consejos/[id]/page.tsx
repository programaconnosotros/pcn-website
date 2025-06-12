import { AdviseCard } from '@/components/advises/advise-card';
import { CommentSection } from '@/components/advises/comment-section';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { ArrowLeftIcon } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function AdvisePage({ params }: { params: { id: string } }) {
  const sessionId = cookies().get('sessionId');

  const session = sessionId
    ? await prisma.session.findUnique({
        where: { id: sessionId.value },
        include: { user: true },
      })
    : null;

  const advise = await prisma.advise.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      likes: true,
      comments: {
        where: {
          parentCommentId: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: true,
          replies: {
            include: { author: true },
          },
        },
      },
    },
  });

  if (!advise) {
    return <div>Consejo no encontrado</div>;
  }

  return (
    <div className="mt-4 md:max-w-screen-xl md:px-20">
      <div className="mb-4">
        <Link href="/consejos">
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" /> Volver a todos los consejos
          </Button>
        </Link>
      </div>

      <AdviseCard advise={advise} session={session} />
      <CommentSection adviseId={advise.id} comments={advise.comments} session={session} />
    </div>
  );
}
