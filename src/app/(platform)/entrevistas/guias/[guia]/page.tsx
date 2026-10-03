import { InterviewGuide } from '@/components/interviews/interview-guide';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allGuideIds, getGuideMeta } from '../guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

type Props = { params: Promise<{ guia: string }> };

export const dynamicParams = false;

export const generateStaticParams = () => allGuideIds.map((id) => ({ guia: id }));

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { guia } = await props.params;
  const meta = getGuideMeta(guia);
  if (!meta) return { title: 'Guía no encontrada' };

  const { guide } = meta;
  const title = `Guía de entrevista: ${meta.label}`;
  return {
    title,
    description: guide.summary,
    openGraph: {
      title: `${title} | programaConNosotros`,
      description: guide.summary,
      url: `${SITE_URL}/entrevistas/guias/${guia}`,
      type: 'article',
      siteName: 'programaConNosotros',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | programaConNosotros`,
      description: guide.summary,
    },
  };
}

const GuiaPage = async (props: Props) => {
  const { guia } = await props.params;
  const meta = getGuideMeta(guia);
  if (!meta) notFound();

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <InterviewGuide
          guide={meta.guide}
          label={meta.label}
          stack={meta.stack}
          practice={meta.practice}
        />
      </div>
    </div>
  );
};

export default GuiaPage;
