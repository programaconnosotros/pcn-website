'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { addArticleAuthor, removeArticleAuthor } from '@/actions/articles/article-authors';
import { searchCommunityMembers } from '@/actions/users/search-community-members';
import { UserCombobox } from '@/components/admin/user-combobox';
import { PersonLink, type Person } from '@/components/people/person-link';

/** `linkedAuthor` is set when the writer comes from an author name linked in /vinculos. */
export type Writer = Person & { linkedAuthor?: string };

type Props = {
  articleId: string;
  writers: Writer[];
  isAdmin: boolean;
  isEditing: boolean;
  onEditingChange: (_editing: boolean) => void;
};

// Admin controls to tag the community members who wrote the article right on the card; the
// ones linked by author name are managed in /vinculos. Everyone else sees the writers through
// the row's avatar and author names, which link to their profiles.
export function ArticleWriters({ articleId, writers, isAdmin, isEditing, onEditingChange }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<unknown>, success: string) =>
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'No se pudo guardar');
      }
    });

  if (!isAdmin) return null;

  return (
    <div className="relative z-10 space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {isEditing && writers.length > 0 && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-pcnGreen-500">
            escrito por
          </span>
        )}
        {isEditing &&
          writers.map((writer) => (
            <span key={writer.id} className="flex items-center gap-1">
              <PersonLink person={writer} />
              {isAdmin && isEditing && !writer.linkedAuthor && (
                <button
                  type="button"
                  onClick={() =>
                    run(
                      () => removeArticleAuthor(articleId, writer.id),
                      `${writer.name} ya no figura como escritor`,
                    )
                  }
                  disabled={isPending}
                  aria-label={`Quitar a ${writer.name} como escritor`}
                  className="rounded-sm p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </span>
          ))}
        {isAdmin && (
          <button
            type="button"
            onClick={() => onEditingChange(!isEditing)}
            className="flex items-center gap-0.5 font-mono text-[10px] text-muted-foreground hover:text-pcnGreen"
          >
            {isEditing ? (
              'listo'
            ) : writers.length > 0 ? (
              <>
                <Pencil className="size-2.5" />
                escritores ({writers.length})
              </>
            ) : (
              <>
                <Plus className="size-3" />
                escritor
              </>
            )}
          </button>
        )}
      </div>
      {isAdmin && isEditing && (
        <UserCombobox
          search={searchCommunityMembers}
          excludeIds={writers.map((writer) => writer.id)}
          onSelect={(user) =>
            run(
              () => addArticleAuthor(articleId, user.id),
              `${user.name} figura como escritor del artículo`,
            )
          }
          placeholder="buscar escritor"
          disabled={isPending}
        />
      )}
    </div>
  );
}
