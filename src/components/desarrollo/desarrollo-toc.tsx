'use client';

import { useEffect } from 'react';
import { TableOfContents, type TocSection } from '@/components/ui/table-of-contents';

/** The page's index; jumping to a stack note also unfolds it so it is not just a title. */
export const DesarrolloToc = ({ sections }: { sections: TocSection[] }) => {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLElement>('[data-toc-id^="nota-"]');
      const note = link && document.getElementById(link.dataset.tocId!);
      if (note instanceof HTMLDetailsElement) note.open = true;
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return <TableOfContents sections={sections} path="desarrollo" label="Índice" />;
};
