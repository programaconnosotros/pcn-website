import { CoursesBrowser } from '@/components/courses/courses-browser';
import { PageTitle } from '@/components/ui/page-title';
import { communityCourses, externalCourses } from './courses';
import type { Metadata } from 'next';

const allCourses = [...communityCourses, ...externalCourses];

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Cursos',
  description:
    'Una selección curada de cursos sobre ingeniería de software, recomendados por la comunidad. Recursos gratuitos y pagos para crecer en tu carrera.',
  openGraph: {
    title: 'Cursos recomendados | programaConNosotros',
    description:
      'Una selección curada de cursos sobre ingeniería de software, recomendados por la comunidad. Recursos gratuitos y pagos para crecer en tu carrera.',
    url: `${SITE_URL}/cursos`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cursos recomendados | programaConNosotros',
    description:
      'Una selección curada de cursos sobre ingeniería de software, recomendados por la comunidad. Recursos gratuitos y pagos para crecer en tu carrera.',
  },
};

const Courses = () => (
  <div className="flex flex-1 flex-col p-4 pt-0">
    <PageTitle path="cursos" className="mt-4" meta="gratis · curados por la comunidad" />
    <CoursesBrowser courses={allCourses} />
  </div>
);

export default Courses;
