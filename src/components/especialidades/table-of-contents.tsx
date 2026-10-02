'use client';

import {
  TableOfContents as SharedTableOfContents,
  type TocSection,
} from '@/components/ui/table-of-contents';
import { specialtyGroups } from '@/components/especialidades/specialties';

const sections: TocSection[] = specialtyGroups.flatMap((group) =>
  group.specialties.map((specialty) => ({
    id: specialty.id,
    title: specialty.title,
    icon: specialty.icon,
    group: group.title,
  })),
);

export function TableOfContents() {
  return <SharedTableOfContents sections={sections} path="especialidades" />;
}
