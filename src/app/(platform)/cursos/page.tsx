import { CoursesBrowser } from '@/components/courses/courses-browser';
import { PageTitle } from '@/components/ui/page-title';
import { LearningPlatforms } from '@/components/courses/learning-platforms';
import { RecommendButton } from '@/components/recommendations/recommend-button';
import { getAllCourses } from '@/lib/recommendations';
import type { Metadata } from 'next';
import { tabTitle } from '@/lib/tab-title';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: tabTitle.ls('cursos'),
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

const Courses = async () => (
  <div className="flex flex-1 flex-col p-4 pt-0">
    <div className="mt-4">
      <CoursesBrowser
        header={
          <PageTitle
            path="cursos"
            meta="gratis · curados por la comunidad"
            action={<RecommendButton kind="COURSE" />}
          />
        }
        courses={await getAllCourses()}
      />
      <LearningPlatforms />
    </div>
  </div>
);

export default Courses;
