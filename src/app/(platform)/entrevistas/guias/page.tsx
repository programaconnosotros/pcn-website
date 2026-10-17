import {
  InterviewGuidesList,
  type GuideGroup,
} from '@/components/interviews/interview-guides-list';
import { InterviewsTabs } from '@/components/interviews/interviews-tabs';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { endpointCourses } from '@/data/recommended-courses';
import type { Metadata } from 'next';
import { AREAS } from '../questions/types';
import { crossTrackGuides, orderedGuides } from './guides';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

const DESCRIPTION =
  'Guías para prepararte para entrevistas de frontend, backend, AI engineering, agentic engineering, quality engineering, seguridad informática, DevOps, diseño UX/UI, product engineering, project management, soft skills y liderazgo, tech lead, software architect y engineering manager. Marcá cada sección como leída y seguí tu progreso.';

export const metadata: Metadata = {
  title: tabTitle.ls('entrevistas/guias'),
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
  const simulatorCta = {
    href: '/entrevistas',
    hint: '¿ya estudiaste? ponete a prueba',
    label: 'simularEntrevista();',
  };
  const groups: GuideGroup[] = [
    {
      label: 'Para cualquier entrevista',
      guides: crossTrackGuides.map(({ id, label, stack, guide }) => ({
        track: id,
        label,
        fullLabel: label,
        stack,
        summary: guide.summary,
        sectionIds: guide.sections.map((section) => section.id),
      })),
      cta: {
        href: '/entrevistas/live-coding',
        hint: 'enunciados y leetcode por tecnología',
        label: 'practicarLiveCoding();',
      },
    },
    ...multiTrackAreas.map((area) => ({
      label: area.label,
      guides: items.filter((item) => item.area === area.id),
      cta: simulatorCta,
    })),
    {
      label: 'Más áreas',
      guides: items.filter((item) => !multiTrackAreas.some((area) => area.id === item.area)),
      cta: simulatorCta,
    },
  ];
  const sectionCount = groups
    .flatMap((group) => group.guides)
    .reduce((count, item) => count + item.sectionIds.length, 0);

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4 mb-14">
        {/* Pinned while scrolling the long list of guides, with the tabs at hand. */}
        <StickyHeader pinnedOnDesktop>
          <PageTitle
            path="entrevistas/guias"
            meta={`${items.length + crossTrackGuides.length} guías · ${sectionCount} secciones`}
            action={<InterviewsTabs active="guias" />}
          />
        </StickyHeader>
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Qué estudiar antes de una entrevista, área por área: cómo suele ser el proceso, los temas
          que más se preguntan de junior a senior y qué tenés que poder explicar en voz alta. Cuando
          termines una guía, ponete a prueba en el simulador.
        </p>
        <InterviewGuidesList groups={groups} courses={endpointCourses} />
      </div>
    </div>
  );
};

export default GuiasPage;
