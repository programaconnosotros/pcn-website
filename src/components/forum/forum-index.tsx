import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { FamousForums } from '@/components/forum/famous-forums';
import { ForumPostList } from '@/components/forum/forum-post-list';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { listForumCategories, listForumPosts } from '@/lib/forum';
import { cn } from '@/lib/utils';

type Category = Awaited<ReturnType<typeof listForumCategories>>[number];

// /foro and /foro/categoria/<slug>: the threads (all, or one category's) next to the categories
// and the other developer forums worth knowing.
export async function ForumIndex({ category }: { category?: Category }) {
  const [session, categories, posts] = await Promise.all([
    getCurrentSession(),
    listForumCategories(),
    listForumPosts(category?.id ?? null),
  ]);
  const total = categories.reduce((sum, c) => sum + c._count.posts, 0);
  const newHref = category ? `/foro/nuevo?categoria=${category.slug}` : '/foro/nuevo';

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <StickyHeader>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <PageTitle
              path={
                category ? [{ label: 'foro', href: '/foro' }, { label: category.slug }] : 'foro'
              }
              meta={
                category
                  ? category.description
                  : `${total} ${total === 1 ? 'tema' : 'temas'} en ${categories.length} categorías`
              }
              className="mb-0 flex-1"
            />
            <Button variant="pcn" size="sm" asChild>
              <Link
                href={
                  session
                    ? newHref
                    : `/autenticacion/iniciar-sesion?redirect=${encodeURIComponent(newHref)}`
                }
              >
                <Plus className="mr-1.5 size-4" />
                nuevoTema();
              </Link>
            </Button>
          </div>
        </StickyHeader>

        <div className="mb-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <ForumPostList posts={posts} showCategory={!category} />

          <aside className="flex flex-col gap-6">
            <nav aria-label="Categorías" className="border border-pcnGreen-200">
              <h2 className="border-b border-dashed border-pcnGreen-200 px-3 py-2 font-mono text-xs text-muted-foreground">
                <span className="text-pcnGreen-500">$ </span>ls categorias/
              </h2>
              <ul className="divide-y divide-dashed divide-pcnGreen-200 font-mono text-xs">
                <li>
                  <Link
                    href="/foro"
                    aria-current={!category ? 'page' : undefined}
                    className={cn(
                      'flex justify-between px-3 py-2 hover:bg-pcnGreen/[0.04] hover:text-pcnGreen',
                      !category && 'bg-pcnGreen/10 text-pcnGreen',
                    )}
                  >
                    todas
                    <span className="text-muted-foreground">{total}</span>
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/foro/categoria/${c.slug}`}
                      aria-current={category?.id === c.id ? 'page' : undefined}
                      title={c.description}
                      className={cn(
                        'flex justify-between px-3 py-2 hover:bg-pcnGreen/[0.04] hover:text-pcnGreen',
                        category?.id === c.id && 'bg-pcnGreen/10 text-pcnGreen',
                      )}
                    >
                      #{c.slug}
                      <span className="text-muted-foreground">{c._count.posts}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <FamousForums />
          </aside>
        </div>
      </div>
    </div>
  );
}
