import { getConsejoDetail } from '@/lib/consejos-server';
import { OG_CONTENT_TYPE, OG_SIZE, renderTerminalCard } from '@/lib/og/terminal-card';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Consejo de la comunidad programaConNosotros';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const consejo = (await getConsejoDetail(id))?.consejo;

  return renderTerminalCard({
    path: 'consejos',
    command: consejo ? `fortune --from "${consejo.author.name}"` : 'fortune',
    title: consejo ? `“${consejo.content}”` : 'Consejos de la comunidad',
    meta: consejo ? [`@${consejo.author.name}`, ...(consejo.source ? ['auto-extraído'] : [])] : [],
  });
}
