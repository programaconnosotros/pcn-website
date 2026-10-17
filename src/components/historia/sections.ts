import type { TocSection } from '@/components/ui/table-of-contents';

/**
 * Sections of the history page, in reading order.
 * `meta` is the period shown next to each entry in the table of contents.
 */
export const historiaSections: TocSection[] = [
  { id: 'introduccion', title: 'Introducción' },
  { id: 'comienzos-utn', title: 'Comienzos en la UTN-FRT', meta: '2015' },
  { id: 'voluntariado-ieee', title: 'Voluntariado en el IEEE', meta: '2017' },
  { id: 'code-warfare', title: 'Code Warfare', meta: '2017' },
  { id: 'ieee-computer-society', title: 'IEEE Computer Society', meta: '2018' },
  { id: 'club-algoritmos', title: 'Club de Algoritmos', meta: '2018' },
  { id: 'tucuman-hacking', title: 'Actividades con Tucumán Hacking', meta: '2018' },
  { id: 'nibble', title: 'Nibble', meta: '2019' },
  { id: 'nacimiento-pcn', title: 'El nacimiento de programaConNosotros', meta: '2020' },
  { id: 'cursos-git', title: 'Cursos de Git & GitHub con la cátedra de AED', meta: '2020' },
  { id: 'lightning-talks', title: 'Lightning Talks', meta: '2021' },
  { id: 'pcn-global-learning', title: 'PCN & Global Learning', meta: '2023' },
  { id: 'charlas-comunidad', title: 'Compartiendo con la industria y las escuelas', meta: '2023' },
  { id: 'desarrollo-website', title: 'Empezamos a desarrollar el website', meta: '2024' },
  { id: 'tech-in-action', title: 'Tech in Action', meta: '2025' },
  { id: 'era-meetups', title: 'La era de las Meetups', meta: '2025' },
  { id: 'zero-to-agent', title: 'Zero to Agent', meta: '2026' },
  { id: 'nextgen-software-2026', title: 'NextGen Software 2026', meta: '2026' },
  { id: 'comunidad-whatsapp', title: 'La comunidad en WhatsApp', meta: 'Hoy' },
];
