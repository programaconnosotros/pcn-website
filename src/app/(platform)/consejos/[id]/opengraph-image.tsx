import prisma from '@/lib/prisma';
import { OG_CONTENT_TYPE, OG_SIZE, renderTerminalCard } from '@/lib/og/terminal-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Consejo de la comunidad programaConNosotros';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const advise = await prisma.advise.findUnique({
    where: { id },
    select: { content: true, author: { select: { name: true } } },
  });

  return renderTerminalCard({
    path: 'consejos',
    command: advise ? `fortune --from "${advise.author.name}"` : 'fortune',
    title: advise ? `“${advise.content}”` : 'Consejos de la comunidad',
    meta: advise ? [`@${advise.author.name}`] : [],
  });
}
