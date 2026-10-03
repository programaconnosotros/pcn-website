import { InterviewGuidesList } from '@/components/interviews/interview-guides-list';
import { PageTitle } from '@/components/ui/page-title';
import type { Metadata } from 'next';
import { AREAS } from '../questions/types';
import { orderedGuides } from './guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const DESCRIPTION =
  'Guías para prepararte para entrevistas técnicas de frontend, backend, AI engineering, agentic engineering, quality engineering, product engineering y project management. Marcá cada sección como leída y seguí tu progreso.';

export const metadata: Metadata = {
  title: 'Guías de preparación para entrevistas',
  description: DESCRIPTION,
  openGraph: {
    title: 'Guías de preparación para entrevistas | programaConNosotros',
    description: DESCRIPTION,
    url: `${SITE_URL}/entrevistas/guias`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guías de preparación para entrevistas | programaConNosotros',
    description: DESCRIPTION,
  },
};

const GuiasPage = () => {
  const guides = orderedGuides.map(({ id, area, label, technology, stack, guide }) => ({
    track: id,
    area,
    label: technology ?? label,
    stack,
    summary: guide.summary,
    sectionIds: guide.sections.map((section) => section.id),
  }));
  const sectionCount = guides.reduce((count, guide) => count + guide.sectionIds.length, 0);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mb-14 mt-4 max-w-2xl">
        <PageTitle
          path="entrevistas/guias"
          meta={`${guides.length} guías · ${sectionCount} secciones`}
        />
        <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
          Qué estudiar antes de una entrevista, área por área: cómo suele ser el proceso, los temas
          que más se preguntan de junior a senior y qué tenés que poder explicar en voz alta. Cuando
          termines una guía, ponete a prueba en el simulador.
        </p>
        <InterviewGuidesList
          areas={AREAS.map(({ id, label }) => ({ id, label }))}
          guides={guides}
        />
      </div>
    </div>
  );
};

export default GuiasPage;
