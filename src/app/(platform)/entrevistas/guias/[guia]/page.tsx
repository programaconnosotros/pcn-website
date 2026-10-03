import { InterviewGuide } from '@/components/interviews/interview-guide';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TRACKS } from '../../questions/types';
import { getInterviewGuide } from '../guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

type Props = { params: Promise<{ guia: string }> };

export const dynamicParams = false;

export const generateStaticParams = () => TRACKS.map(({ id }) => ({ guia: id }));

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { guia } = await props.params;
  const guide = getInterviewGuide(guia);
  const track = TRACKS.find(({ id }) => id === guia);
  if (!guide || !track) return { title: 'Guía no encontrada' };

  const title = `Guía de entrevista: ${track.label}`;
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
  const guide = getInterviewGuide(guia);
  const track = TRACKS.find(({ id }) => id === guia);
  if (!guide || !track) notFound();

  return (
    <div className="flex flex-1 flex-col p-4 pt-0">
      <div className="mt-4">
        <InterviewGuide guide={guide} label={track.label} stack={track.stack} />
      </div>
    </div>
  );
};

export default GuiaPage;
