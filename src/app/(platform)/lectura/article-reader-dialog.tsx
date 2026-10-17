'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WebReaderDialog } from '@/components/web-reader/web-reader-dialog';
import { articleAuthors, type Article } from './articles';

interface ArticleReaderDialogProps {
  article: Article | null;
  open: boolean;
  onOpenChange: (_open: boolean) => void;
}

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Shows an article on its original website, framed like a browser window. */
export function ArticleReaderDialog({ article, open, onOpenChange }: ArticleReaderDialogProps) {
  return (
    <WebReaderDialog
      open={open}
      onOpenChange={onOpenChange}
      page={
        article && {
          url: article.url,
          title: article.title,
          subtitle: articleAuthors(article).join(', '),
          embedCheckUrl: `/api/lectura/embed?url=${encodeURIComponent(article.url)}`,
          icon: (
            <Avatar className="size-7 shrink-0 rounded-sm">
              <AvatarImage src={article.avatar} alt={article.author} />
              <AvatarFallback className="rounded-sm text-[10px]">
                {initials(article.author)}
              </AvatarFallback>
            </Avatar>
          ),
        }
      }
    />
  );
}
