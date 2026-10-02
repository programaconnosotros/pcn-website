import { AdviseCard } from '@/components/advises/advise-card';
import { CommentSection } from '@/components/advises/comment-section';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { findSession } from '@/lib/session';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const advise = await prisma.advise.findUnique({
    where: { id: params.id },
    select: {
      content: true,
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!advise) {
    return {
      title: 'Consejo no encontrado',
      description: 'El consejo que buscas no existe.',
    };
  }

  const title = `Consejo de ${advise.author.name}`;
  const description =
    advise.content.length > 160 ? advise.content.substring(0, 157) + '...' : advise.content;
  const pageUrl = `${SITE_URL}/consejos/${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function AdvisePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const sessionId = (await cookies()).get('sessionId');

  const session = sessionId ? await findSession(sessionId.value) : null;

  const advise = await prisma.advise.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
      comments: {
        where: {
          parentCommentId: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: { select: { id: true, name: true, image: true } },
          replies: {
            include: { author: { select: { id: true, name: true, image: true } } },
          },
        },
      },
    },
  });

  if (!advise) {
    return <div>Consejo no encontrado</div>;
  }

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle
              path={`consejos/${advise.id.slice(0, 8)}`}
              meta={`${advise.comments.length} ${advise.comments.length === 1 ? 'comentario' : 'comentarios'}`}
            />
          </StickyHeader>
          <div className="mb-14 border-l border-t border-pcnGreen-200">
            <AdviseCard advise={advise} session={session} className="hover:bg-transparent" />
            <CommentSection adviseId={advise.id} comments={advise.comments} session={session} />
          </div>
        </div>
      </div>
    </>
  );
}
