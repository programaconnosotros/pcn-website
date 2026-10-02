import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ruledCellClassName } from '@/components/ui/ruled-grid';
import type { SetupWithAuthor } from '@/lib/setups';
import { cn } from '@/lib/utils';
import { SetupLikeButton } from './setup-like-button';

interface SetupTileProps {
  setup: SetupWithAuthor;
  viewerId: string | null;
  /** Off where every setup is by the same person, like their own profile. */
  showAuthor?: boolean;
}

// One setup in the grid: the photo dimmed until hover (like the gallery), then its title, a
// couple of lines of description and who shared it.
export function SetupTile({ setup, viewerId, showAuthor = true }: SetupTileProps) {
  const href = `/setups/${setup.id}`;

  return (
    <article className={cn(ruledCellClassName, 'group flex flex-col')}>
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-black"
        aria-label={`Ver setup: ${setup.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={setup.thumbUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover brightness-[0.85] saturate-[0.8] transition duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-100 group-hover:saturate-100"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={href} className="min-w-0">
          <h2 className="truncate font-mono text-sm font-semibold transition-colors group-hover:text-pcnGreen">
            {setup.title}
          </h2>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {setup.description}
          </p>
        </Link>

        <footer className="mt-auto flex items-center gap-2 pt-1">
          {showAuthor && (
            <Link
              href={`/perfil/${setup.author.id}`}
              className="group/author flex min-w-0 items-center gap-2"
            >
              <Avatar className="size-5 rounded-sm">
                <AvatarImage src={setup.author.image ?? undefined} alt="" />
                <AvatarFallback className="rounded-sm text-[10px]">
                  {setup.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-mono text-xs font-semibold transition-colors group-hover/author:text-pcnGreen">
                {setup.author.name}
              </span>
            </Link>
          )}
          <time
            dateTime={setup.createdAt.toISOString()}
            className="shrink-0 font-mono text-[11px] text-muted-foreground"
          >
            {showAuthor && <span className="text-pcnGreen-500/60">· </span>}
            {format(setup.createdAt, 'd MMM yyyy', { locale: es })}
          </time>
          <SetupLikeButton
            setupId={setup.id}
            likes={setup.likes.length}
            liked={!!viewerId && setup.likes.some((like) => like.userId === viewerId)}
            isLoggedIn={!!viewerId}
            className="ml-auto shrink-0"
          />
        </footer>
      </div>
    </article>
  );
}
