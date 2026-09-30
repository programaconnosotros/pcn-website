import { Github, Linkedin } from 'lucide-react';

type Person = {
  name: string;
  role: string;
  company?: string;
  imageUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

const people: Person[] = [
  {
    name: 'Agus',
    role: 'Team Leader & Sr. Full-Stack (JS/TS)',
    company: 'Eagerworks',
    imageUrl: '/colaborators/agus.webp',
    linkedinUrl: 'https://www.linkedin.com/in/agustinsanc/',
    githubUrl: 'https://github.com/agustin-sanc',
  },
  {
    name: 'Chelo',
    role: 'Sr. Backend (Python & Java)',
    company: 'Bowery',
    imageUrl: '/colaborators/chelo.webp',
    linkedinUrl: 'https://www.linkedin.com/in/marcelo-de-jes%C3%BAs-nu%C3%B1ez-490b05191/',
    githubUrl: 'https://github.com/Chelo154',
  },
  {
    name: 'Germán',
    role: 'Sr. Backend (JS/TS)',
    company: 'Entropy',
    imageUrl: '/colaborators/german.webp',
    linkedinUrl: 'https://www.linkedin.com/in/germanavarro/',
    githubUrl: 'https://github.com/gmanavarro',
  },
  {
    name: 'Carlos',
    role: 'Sr. Frontend (JS/TS)',
    company: 'WebExport',
    imageUrl: '/colaborators/carlos.webp',
    linkedinUrl: 'https://www.linkedin.com/in/carlos-spagnolo-andres/',
    githubUrl: 'https://github.com/SpagnoloCarlos',
  },
  {
    name: 'Benja',
    role: 'Sr. Full-Stack',
    imageUrl: '/colaborators/benja.webp',
    linkedinUrl: 'https://www.linkedin.com/in/jpbenjamin-cortes/',
    githubUrl: 'https://github.com/cortesjpb',
  },
  {
    name: 'Alejo',
    role: 'Sr. Full-Stack (TS/Python)',
    company: 'Pendo.io',
    imageUrl: '/colaborators/alejo.webp',
    linkedinUrl: 'https://www.linkedin.com/in/alejoboga/',
    githubUrl: 'https://github.com/Alejoboga20',
  },
  {
    name: 'Facu M.',
    role: 'Sr. Full-Stack & AI Engineer',
    imageUrl: 'https://avatars.githubusercontent.com/u/43690718?v=4',
    linkedinUrl: 'https://www.linkedin.com/in/facundo-garcia-martoni/',
    githubUrl: 'https://github.com/facmartoni',
  },
  {
    name: 'Facu',
    role: 'Ssr. Backend (JS/TS)',
    company: 'C&S Informática',
    imageUrl: '/colaborators/facu.webp',
    linkedinUrl: 'https://www.linkedin.com/in/juanfacundobazanalvarez/',
    githubUrl: 'https://github.com/FacuBzn',
  },
  {
    name: 'Mauri',
    role: 'Ssr. Full-Stack (JS/TS)',
    company: 'DIZENZ',
    imageUrl: '/colaborators/mauric.webp',
    linkedinUrl: 'https://www.linkedin.com/in/mauriciojavierchaile/',
    githubUrl: 'https://github.com/MauriJC',
  },
  {
    name: 'Nico',
    role: 'Ssr. Frontend (JS/TS)',
    company: 'DIZENZ',
    imageUrl: '/colaborators/nico.webp',
    linkedinUrl: 'https://www.linkedin.com/in/nicolas-fuentes-garcia-7997a1236/',
    githubUrl: 'https://github.com/nicofuentesg',
  },
  {
    name: 'Mati',
    role: 'Jr. Frontend (JS/TS)',
    company: 'DIZENZ',
    imageUrl: '/colaborators/mati.webp',
    linkedinUrl: 'https://www.linkedin.com/in/matias-daniel-gutierrez/',
    githubUrl: 'https://github.com/MatiasDG539',
  },
  {
    name: 'Lemi',
    role: 'Jr. QA (JS/TS)',
    company: 'DIZENZ',
    imageUrl: '/colaborators/lemi.webp',
    linkedinUrl: 'https://www.linkedin.com/in/emiliano-grillo-905895296/',
    githubUrl: 'https://github.com/emilianogsh',
  },
  {
    name: 'Vicky',
    role: 'Jr. QA (JS/TS)',
    company: 'DIZENZ',
    imageUrl: '/colaborators/vicky.webp',
    linkedinUrl: 'https://www.linkedin.com/in/maria-victoria-grillo/',
    githubUrl: 'https://github.com/vickygrillo',
  },
  {
    name: 'Lean',
    role: 'Contributor',
    imageUrl: 'https://avatars.githubusercontent.com/u/92434825?v=4',
    linkedinUrl: 'https://www.linkedin.com/in/contrera-lean',
    githubUrl: 'https://github.com/contrera-lean',
  },
  {
    name: 'Maxi',
    role: 'Contributor',
    imageUrl: 'https://avatars.githubusercontent.com/u/55162138?v=4',
    linkedinUrl: 'https://www.linkedin.com/in/maxi-rebolo/',
    githubUrl: 'https://github.com/MaxiR23',
  },
];

const handleOf = (person: Person) =>
  person.githubUrl?.split('/').pop() ?? person.name.toLowerCase();

const iconLinkClassName =
  'text-muted-foreground transition-colors hover:text-pcnGreen focus-visible:text-pcnGreen';

export const teamSize = people.length;

// Terminal-style roster: every cell shares hairlines with its neighbours and
// the avatar stays tinted until hover, like a process coming back to life.
export const Team = () => (
  <ul
    role="list"
    className="grid grid-cols-1 border-l border-t border-pcnGreen-200 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
  >
    {people.map((person, index) => (
      <li
        key={person.name}
        className="group flex items-center gap-3 border-b border-r border-pcnGreen-200 px-3 py-2 transition-colors hover:bg-pcnGreen/[0.04]"
      >
        <span className="w-5 shrink-0 font-mono text-[10px] text-pcnGreen-500/70">
          {String(index + 1).padStart(2, '0')}
        </span>

        <div className="relative h-9 w-9 shrink-0 overflow-hidden border border-pcnGreen-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={person.name}
            src={person.imageUrl}
            loading="lazy"
            className="h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-pcnGreen/40 mix-blend-color transition-opacity duration-300 group-hover:opacity-0" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm">
            {person.name}
            <span className="ml-1.5 text-xs text-pcnGreen-500">@{handleOf(person)}</span>
            <span className="ml-0.5 hidden animate-blink text-pcnGreen group-hover:inline">_</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {person.role}
            {person.company && <span className="text-pcnGreen/80"> · {person.company}</span>}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {person.githubUrl && (
            <a
              href={person.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`GitHub de ${person.name}`}
              className={iconLinkClassName}
            >
              <Github className="h-3.5 w-3.5" />
            </a>
          )}
          {person.linkedinUrl && (
            <a
              href={person.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn de ${person.name}`}
              className={iconLinkClassName}
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </li>
    ))}
  </ul>
);
