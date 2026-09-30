import { OG_CONTENT_TYPE, OG_SIZE, renderTerminalCard } from '@/lib/og/terminal-card';
import { getCourseById } from '../courses';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = 'Curso de programaConNosotros';

export default async function Image({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  return renderTerminalCard({
    path: `cursos/${courseId}`,
    command: 'cat curso.md',
    title: course?.name ?? 'Cursos',
    description: course?.description,
    meta: course
      ? [
          course.isMadeByCommunity ? 'hecho por la comunidad' : 'recomendado',
          `por ${course.teachedBy}`,
          ...(course.hours ? [`${course.hours} horas`] : []),
        ]
      : [],
  });
}
