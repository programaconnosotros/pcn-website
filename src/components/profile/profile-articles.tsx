'use client';

import { useState } from 'react';
import { FullRowsCell, RuledGrid } from '@/components/ui/ruled-grid';
import { ARTICLE_COLUMNS } from './profile-grid-columns';
import { useContentMarks } from '@/hooks/use-content-marks';
import { ArticleRow } from '@/app/(platform)/lectura/articles-panel';
import { ArticleReaderDialog } from '@/app/(platform)/lectura/article-reader-dialog';
import type { Article } from '@/app/(platform)/lectura/articles';
import type { Writer } from '@/app/(platform)/lectura/article-writers';

// Articles the person wrote, shown and read just like in /lectura: same rows, same read and
// "para leer" marks, and the reader window instead of a new browser tab. `index` is the
// article's position in /lectura, so its 0x number matches there.
export function ProfileArticles({
  articles,
  writer,
  fillRows = false,
}: {
  articles: { article: Article; index: number }[];
  /** The profile's owner, who wrote all of them. */
  writer: Writer;
  /** A capped preview: hide what would leave a row half empty. */
  fillRows?: boolean;
}) {
  const marks = useContentMarks('article');
  const readIds = marks.ids('read');
  const savedIds = marks.ids('saved');
  const [readerArticle, setReaderArticle] = useState<Article | null>(null);

  // Reading an article takes it off the "to read" list.
  const toggleRead = (id: string) =>
    marks.set(
      readIds.has(id)
        ? [{ contentId: id, mark: 'read', value: false }]
        : [
            { contentId: id, mark: 'read', value: true },
            ...(savedIds.has(id) ? [{ contentId: id, mark: 'saved' as const, value: false }] : []),
          ],
    );

  return (
    <>
      <RuledGrid className="grid-cols-1 2xl:grid-cols-2">
        {articles.map(({ article, index }, position) => (
          <FullRowsCell
            key={article.id}
            index={position}
            count={fillRows ? articles.length : 0}
            columns={ARTICLE_COLUMNS}
          >
            <ArticleRow
              article={article}
              index={index}
              onOpen={() => setReaderArticle(article)}
              read={readIds.has(article.id)}
              onToggleRead={() => toggleRead(article.id)}
              saved={savedIds.has(article.id)}
              onToggleSaved={() => marks.toggle(article.id, 'saved')}
              writers={[writer]}
              isAdmin={false}
            />
          </FullRowsCell>
        ))}
      </RuledGrid>
      <ArticleReaderDialog
        article={readerArticle}
        open={!!readerArticle}
        onOpenChange={(open) => {
          if (!open) setReaderArticle(null);
        }}
      />
    </>
  );
}
