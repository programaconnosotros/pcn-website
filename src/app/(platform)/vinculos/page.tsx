import type { Metadata } from 'next';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { articleAuthors, articles } from '@/app/(platform)/lectura/articles';
import { conversations } from '@/data/whatsapp-conversations';
import { members } from '@/data/whatsapp-conversations/members';
import { HISTORIA_PEOPLE } from '@/components/historia/people';
import { requireAdminPage } from '@/lib/admin';
import { getCollaborationStats } from '@/lib/github-stats';
import { getIdentityMap } from '@/lib/identity-links';
import { IdentityLinksTable, type IdentityRow } from './identity-links-table';

export const metadata: Metadata = {
  title: 'Vínculos',
  robots: { index: false, follow: false },
};

export default async function VinculosPage() {
  await requireAdminPage();

  const [whatsappLinks, githubLinks, authorLinks, historiaLinks, stats] = await Promise.all([
    getIdentityMap('whatsapp'),
    getIdentityMap('github'),
    getIdentityMap('articulos'),
    getIdentityMap('historia'),
    getCollaborationStats(),
  ]);

  const conversationCounts = new Map<string, number>();
  for (const conversation of conversations) {
    for (const name of conversation.participants) {
      conversationCounts.set(name, (conversationCounts.get(name) ?? 0) + 1);
    }
  }

  const whatsappRows: IdentityRow[] = members
    .map((member) => ({
      externalName: member.name,
      detail: `${conversationCounts.get(member.name) ?? 0} conversaciones`,
      weight: conversationCounts.get(member.name) ?? 0,
      user: whatsappLinks[member.name] ?? null,
    }))
    .sort((a, b) => b.weight - a.weight || a.externalName.localeCompare(b.externalName));

  // Contributors from the GitHub API, plus logins linked earlier that it no longer lists.
  const contributors = stats?.topContributors ?? [];
  const githubRows: IdentityRow[] = [
    ...contributors.map((contributor) => ({
      externalName: contributor.login,
      detail: `${contributor.mergedPrs} PRs · ${contributor.commits} commits`,
      weight: contributor.mergedPrs,
      avatarUrl: contributor.avatarUrl,
      user: githubLinks[contributor.login] ?? null,
    })),
    ...Object.entries(githubLinks)
      .filter(([login]) => !contributors.some((contributor) => contributor.login === login))
      .map(([login, user]) => ({ externalName: login, detail: '—', weight: 0, user })),
  ];

  const articleCounts = new Map<string, number>();
  for (const name of articles.flatMap(articleAuthors)) {
    articleCounts.set(name, (articleCounts.get(name) ?? 0) + 1);
  }
  const authorRows: IdentityRow[] = [...articleCounts]
    .map(([name, count]) => ({
      externalName: name,
      detail: `${count} ${count === 1 ? 'artículo' : 'artículos'}`,
      weight: count,
      user: authorLinks[name] ?? null,
    }))
    .sort((a, b) => b.weight - a.weight || a.externalName.localeCompare(b.externalName));

  // In order of appearance in the story.
  const historiaRows: IdentityRow[] = HISTORIA_PEOPLE.map((name) => ({
    externalName: name,
    detail: 'mencionado',
    weight: 0,
    user: historiaLinks[name] ?? null,
  }));

  const linked = (rows: IdentityRow[]) => rows.filter((row) => row.user).length;

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <PageTitle
            path="vinculos"
            meta={`${linked(whatsappRows)}/${whatsappRows.length} de whatsapp · ${linked(githubRows)}/${githubRows.length} de github · ${linked(authorRows)}/${authorRows.length} de artículos · ${linked(historiaRows)}/${historiaRows.length} de historia`}
          />
        </StickyHeader>

        <p className="mb-4 max-w-3xl font-mono text-xs leading-relaxed text-muted-foreground">
          <span className="text-pcnGreen-500"># </span>
          Asigná quién es quién. Un miembro de WhatsApp vinculado muestra sus conversaciones en su
          perfil y su nombre en /conversaciones lleva al perfil; un login de GitHub vinculado
          muestra sus contribuciones al sitio en el perfil y en /desarrollo; un autor de /lectura
          vinculado suma todos sus artículos al perfil y figura como escritor en cada uno; una
          persona mencionada en /historia vinculada lleva a su perfil desde la historia.
        </p>

        <div className="mb-14 grid gap-6 2xl:grid-cols-2">
          <IdentityLinksTable
            source="whatsapp"
            title="whatsapp"
            command="cat members.ts"
            rows={whatsappRows}
          />
          <IdentityLinksTable
            source="github"
            title="github"
            command="gh api repos/pcn-website/contributors"
            rows={githubRows}
            emptyMessage={
              stats ? 'sin contribuidores' : 'no pudimos conectarnos con GitHub, probá más tarde'
            }
          />
          <IdentityLinksTable
            source="articulos"
            title="artículos"
            command="grep author lectura/articles.ts"
            rows={authorRows}
          />
          <IdentityLinksTable
            source="historia"
            title="historia"
            command="grep HistoriaPerson historia/page.tsx"
            rows={historiaRows}
          />
        </div>
      </div>
    </div>
  );
}
