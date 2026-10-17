import { ConsejoPanel } from '@/components/advice/consejo-panel';
import { consejoHash } from '@/components/advice/consejo-utils';
import Link from 'next/link';
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

export default async function AdviceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const sessionId = (await cookies()).get('sessionId');

  const [session, detail] = await Promise.all([
    sessionId ? findSession(sessionId.value) : null,
    getConsejoDetail(params.id),
  ]);

  if (!detail) {
    return (
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <PageTitle path="consejos/404" />
          <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
            <span className="text-pcnGreen-500">$ cat consejo.txt: </span>no existe ese consejo.{' '}
            <Link href="/consejos" className="text-pcnGreen-600 hover:text-pcnGreen">
              cd ~/consejos →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const { consejo, comments } = detail;

  // Reached directly (shared link, reload): the same terminal reader as the modal, on its page.
  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path={`consejos/${consejoHash(consejo.id)}`}
            meta={
              consejo.source
                ? 'auto-extraído de una conversación'
                : `${comments.length} ${comments.length === 1 ? 'comentario' : 'comentarios'}`
            }
            action={
              <Link
                href="/consejos"
                className="font-mono text-xs text-pcnGreen-700 hover:text-pcnGreen"
              >
                cd .. ← todos los consejos
              </Link>
            }
          />
        </StickyHeader>
        <article className="mx-auto mb-14 w-full max-w-3xl border border-pcnGreen-200 bg-black/40 shadow-[0_0_40px_-20px_rgba(4,244,190,0.5)]">
          <ConsejoPanel consejo={consejo} comments={comments} session={session} variant="page" />
        </article>
      </div>
    </div>
  );
}
