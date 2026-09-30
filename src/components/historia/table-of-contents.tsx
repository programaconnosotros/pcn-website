'use client';

import { TableOfContents as SharedTableOfContents } from '@/components/ui/table-of-contents';
import { historiaSections } from '@/components/historia/sections';

export function TableOfContents() {
  return <SharedTableOfContents sections={historiaSections} />;
}
