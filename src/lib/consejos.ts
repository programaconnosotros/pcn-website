import type { Advise, Like, User } from '@prisma/client';
import type { ExtractedConsejo } from '@/data/consejos-extraidos';
import type { LinkedUser } from '@/lib/identity-links';

// One shape for every consejo on /consejos: the ones members publish (Advise rows) and the ones
// extracted automatically from /conversaciones (src/data/consejos-extraidos). Plain data, so
// server pages can hand it to client components.

export type ConsejoAuthor = {
  /** Platform user id, or `null` for a WhatsApp member nobody linked to a profile yet. */
  id: string | null;
  name: string;
  image: string | null;
};

export type ConsejoSource = {
  /** Title and date of the conversation the consejo was extracted from. */
  title: string;
  date: string;
  hash: string;
  href: string;
};

export type Consejo = {
  id: string;
  content: string;
  /** ISO date: when it was published, or the day of the conversation it came from. */
  createdAt: string;
  author: ConsejoAuthor;
  /** Who liked it. Only published consejos can be liked; extracted ones are `null`. */
  likes: Pick<Like, 'userId'>[] | null;
  commentCount: number;
  tags: string[];
  /** Set when the consejo was extracted automatically from a conversation. */
  source: ConsejoSource | null;
};

export type AdviseWithAuthor = Advise & {
  author: Pick<User, 'id' | 'name' | 'image'>;
  likes: Pick<Like, 'userId'>[];
  _count?: { comments: number };
};

export const fromAdvise = (advise: AdviseWithAuthor): Consejo => ({
  id: advise.id,
  content: advise.content,
  createdAt: new Date(advise.createdAt).toISOString(),
  author: { id: advise.author.id, name: advise.author.name, image: advise.author.image },
  likes: advise.likes.map(({ userId }) => ({ userId })),
  commentCount: advise._count?.comments ?? 0,
  tags: [],
  source: null,
});

export const fromExtracted = (
  consejo: ExtractedConsejo,
  profiles: Record<string, LinkedUser>,
): Consejo => {
  const linked = profiles[consejo.member];
  return {
    id: consejo.id,
    content: consejo.content,
    // Noon UTC keeps the conversation's calendar day in every Argentine timezone.
    createdAt: `${consejo.conversation.date}T12:00:00.000Z`,
    author: linked
      ? { id: linked.id, name: linked.name, image: linked.image }
      : { id: null, name: consejo.member, image: null },
    likes: null,
    commentCount: 0,
    tags: consejo.tags,
    source: { ...consejo.conversation },
  };
};

/** Newest first; ties keep their order. */
export const sortByNewest = (consejos: Consejo[]) =>
  [...consejos].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
