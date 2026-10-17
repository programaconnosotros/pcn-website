import { getForumPost } from '@/lib/forum';
import { OG_CONTENT_TYPE, OG_SIZE, renderTerminalCard } from '@/lib/og/terminal-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Tema del foro de programaConNosotros';

// A thread shared in a chat shows its own title, author and replies, not the forum's card.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getForumPost(id);
  const replies = post?.comments.length ?? 0;

  return renderTerminalCard({
    path: post ? `foro/${post.category.slug}` : 'foro',
    command: post ? `cat tema.md --por "${post.author.name}"` : 'ls ~/foro',
    title: post?.title ?? 'El foro de la comunidad',
    meta: post
      ? [`@${post.author.name}`, `${replies} ${replies === 1 ? 'respuesta' : 'respuestas'}`]
      : [],
  });
}
