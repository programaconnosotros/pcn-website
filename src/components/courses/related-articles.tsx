'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { ArticleReaderDialog } from '@/app/(platform)/lectura/article-reader-dialog';
import type { Article } from '@/app/(platform)/lectura/articles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';

// Articles from /lectura, opened in the same reader the reading page uses.
export const RelatedArticles = ({ articles }: { articles: Article[] }) => {
  const [reading, setReading] = useState<Article | null>(null);

  return (
    <>
      <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        {articles.map((article) => (
          <button
            key={article.id}
            type="button"
            onClick={() => setReading(article)}
            className={cn(
              ruledCellClassName,
              'group flex gap-3 p-3 text-left hover:shadow-[inset_2px_0_0_#04f4be] focus-visible:shadow-[inset_2px_0_0_#04f4be] focus-visible:outline-none',
            )}
          >
            <Avatar className="size-9 shrink-0 rounded-sm">
              <AvatarImage src={article.avatar} alt="" />
              <AvatarFallback className="rounded-sm text-[10px]">
                {article.author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start gap-2">
                <h3 className="min-w-0 flex-1 font-mono text-sm font-semibold leading-snug transition-colors group-hover:text-pcnGreen">
                  {article.title}
                </h3>
                <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-pcnGreen" />
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {article.description}
              </p>
              <p className="truncate font-mono text-[11px] text-muted-foreground/80">
                <span className="text-pcnGreen-500">@ </span>
                {article.author} · {article.source}
              </p>
            </div>
          </button>
        ))}
      </RuledGrid>

      <ArticleReaderDialog
        article={reading}
        open={!!reading}
        onOpenChange={(open) => !open && setReading(null)}
      />
    </>
  );
};
