import { AdviseCard } from '@/components/advises/advise-card';
import { CommentSection } from '@/components/advises/comment-section';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { findSession } from '@/lib/session';
import { MISSING_TAB_TITLE, tabTitle } from '@/lib/tab-title';
import { getConsejoDetail } from '@/lib/consejos-server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const detail = await getConsejoDetail(params.id);

  if (!detail) {
    return {
      title: { absolute: MISSING_TAB_TITLE },
      description: 'El consejo que buscas no existe.',
    };
  }

  const { consejo } = detail;
  const title = `Consejo de ${consejo.author.name}`;
  const description =
    consejo.content.length > 160 ? consejo.content.substring(0, 157) + '...' : consejo.content;
  const pageUrl = `${SITE_URL}/consejos/${params.id}`;

  return {
    title: tabTitle.cat('consejos', consejo.author.name),
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

  const [session, detail] = await Promise.all([
    sessionId ? findSession(sessionId.value) : null,
    getConsejoDetail(params.id),
  ]);

  if (!detail) {
    return <div>Consejo no encontrado</div>;
  }

  const { consejo, comments } = detail;

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <StickyHeader>
            <PageTitle
              path={`consejos/${consejo.id.slice(0, 8)}`}
              meta={
                consejo.source
                  ? 'auto-extraído de una conversación'
                  : `${comments.length} ${comments.length === 1 ? 'comentario' : 'comentarios'}`
              }
            />
          </StickyHeader>
          <div className="mb-14 border-l border-t border-pcnGreen-200">
            <AdviseCard
              consejo={consejo}
              session={session}
              clamped={false}
              className="hover:bg-transparent"
            />
            {!consejo.source && (
              <CommentSection adviseId={consejo.id} comments={comments} session={session} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
