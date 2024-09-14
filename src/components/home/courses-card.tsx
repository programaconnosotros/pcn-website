import { Presentation } from 'lucide-react';
import { StatCard } from './stat-card';

export const CoursesCard = () => (
  <StatCard
    href="/courses"
    title="Cursos"
    Icon={Presentation}
    value={6}
    description="Estamos armando un catálogo de cursos muy interesantes!"
  />
);
