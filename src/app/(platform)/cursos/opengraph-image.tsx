import { OG_CONTENT_TYPE, OG_SIZE } from '@/lib/og/terminal-card';
import { renderSectionCard, sectionCardAlt } from '@/lib/og/section-cards';
import { getAllCourses } from '@/lib/recommendations';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = sectionCardAlt('cursos');
// The count comes from the database, which `next build` doesn't have: rendered per request.
export const dynamic = 'force-dynamic';

export default async function Image() {
  const courses = await getAllCourses().catch(() => null);
  return renderSectionCard('cursos', courses ? [`${courses.length} cursos`, 'gratis'] : undefined);
}
