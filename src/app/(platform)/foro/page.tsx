import type { Metadata } from 'next';
import { ForumIndex } from '@/components/forum/forum-index';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';
const DESCRIPTION =
  'El foro de la comunidad: preguntas técnicas, carrera, proyectos y recursos, con respuestas de otros devs.';

export const metadata: Metadata = {
  title: tabTitle.ls('foro'),
  description: DESCRIPTION,
  openGraph: {
    title: 'Foro de la comunidad | programaConNosotros',
    description: DESCRIPTION,
    url: `${SITE_URL}/foro`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
};

export default function ForoPage() {
  return <ForumIndex />;
}
