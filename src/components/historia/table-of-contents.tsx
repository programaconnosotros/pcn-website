'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const sections = [
  { id: 'introduccion', title: 'Introducción' },
  { id: 'comienzos-utn', title: 'Comienzos en la UTN-FRT' },
  { id: 'voluntariado-ieee', title: 'Voluntariado en el IEEE' },
  { id: 'code-warfare', title: 'Code Warfare' },
  { id: 'ieee-computer-society', title: 'IEEE Computer Society' },
  { id: 'club-algoritmos', title: 'Club de Algoritmos' },
  { id: 'tucuman-hacking', title: 'Actividades con Tucumán Hacking' },
  { id: 'nibble', title: 'Nibble' },
  { id: 'nacimiento-pcn', title: 'El nacimiento de programaConNosotros' },
  { id: 'cursos-git', title: 'Cursos de Git & GitHub con la cátedra de AED' },
  { id: 'lightning-talks', title: 'Lightning Talks' },
  { id: 'pcn-global-learning', title: 'PCN & Global Learning' },
  { id: 'desarrollo-website', title: 'Empezamos a desarrollar el website' },
];

export function TableOfContents() {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    // Check for hash in URL on mount
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash && sections.some((s) => s.id === hash)) {
        setActiveSection(hash);
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section) {
          const offsetTop = section.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="sticky top-24 hidden h-[calc(100vh-8rem)] w-64 overflow-y-auto pr-4 lg:block">
      <div className="space-y-2">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Contenido
        </h3>
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`#${section.id}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(section.id);
              const element = document.getElementById(section.id);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className={cn(
              'block rounded-md px-3 py-2 text-sm transition-colors',
              activeSection === section.id
                ? 'bg-pcnPurple/10 font-medium text-pcnPurple dark:bg-pcnGreen/10 dark:text-pcnGreen'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {section.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
