import {
  InterviewGuidesList,
  type GuideGroup,
} from '@/components/interviews/interview-guides-list';
import { InterviewsTabs } from '@/components/interviews/interviews-tabs';
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
  const items = orderedGuides.map(({ id, area, label, technology, stack, guide }) => ({
    area,
    track: id,
    label: technology ?? label,
    fullLabel: label,
    stack,
    summary: guide.summary,
    sectionIds: guide.sections.map((section) => section.id),
  }));
  // Areas with a guide per technology get their own group; the rest share one.
  const multiTrackAreas = AREAS.filter(
    (area) => items.filter((item) => item.area === area.id).length > 1,
  );
  const groups: GuideGroup[] = [
    ...multiTrackAreas.map((area) => ({
      label: area.label,
      guides: items.filter((item) => item.area === area.id),
    })),
    {
      label: 'Más áreas',
      guides: items.filter((item) => !multiTrackAreas.some((area) => area.id === item.area)),
    },
  ];
  const sectionCount = items.reduce((count, item) => count + item.sectionIds.length, 0);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mb-14 mt-4">
        <PageTitle
          path="entrevistas/guias"
          meta={`${items.length} guías · ${sectionCount} secciones`}
          action={<InterviewsTabs active="guias" />}
        />
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Qué estudiar antes de una entrevista, área por área: cómo suele ser el proceso, los temas
          que más se preguntan de junior a senior y qué tenés que poder explicar en voz alta. Cuando
          termines una guía, ponete a prueba en el simulador.
        </p>
        <InterviewGuidesList groups={groups} />
      </div>
    </div>
  );
};

export default GuiasPage;
