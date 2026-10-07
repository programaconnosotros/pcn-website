import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';
import type { LinkedUser } from '@/lib/identity-links';
import githubStats from '@/data/github-stats.json';

type Person = {
  name: string;
  role: string;
  company?: string;
  imageUrl: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

// The people we know by name, with their role: ordered by lines changed in the website (excluding
// lockfiles and data dumps). Everyone else who contributed is added below from the GitHub snapshot.
const knownPeople: Person[] = [
  {
    name: 'Agus',
    role: 'Tech Lead & Sr. Full-Stack Engineer',
    company: 'Dizenz & Eagerworks',
    imageUrl: '/colaborators/agus.webp',
    linkedinUrl: 'https://www.linkedin.com/in/agustinsanc/',
    githubUrl: 'https://github.com/agustin-sanc',
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
    company: 'Dizenz',
    imageUrl: '/colaborators/mauric.webp',
    linkedinUrl: 'https://www.linkedin.com/in/mauriciojavierchaile/',
    githubUrl: 'https://github.com/MauriJC',
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
    name: 'Nico',
    role: 'Ssr. Frontend (JS/TS)',
    company: 'Dizenz',
    imageUrl: '/colaborators/nico.webp',
    linkedinUrl: 'https://www.linkedin.com/in/nicolas-fuentes-garcia-7997a1236/',
    githubUrl: 'https://github.com/nicofuentesg',
  },
  {
    name: 'Mati',
    role: 'Jr. Engineer',
    company: 'Eagerworks',
    imageUrl: '/colaborators/mati.webp',
    linkedinUrl: 'https://www.linkedin.com/in/matias-daniel-gutierrez/',
    githubUrl: 'https://github.com/MatiasDG539',
  },
  {
    name: 'Lemi',
    role: 'Ssr. QA Engineer',
    company: 'Dizenz',
    imageUrl: '/colaborators/lemi.webp',
    linkedinUrl: 'https://www.linkedin.com/in/emiliano-grillo-905895296/',
    githubUrl: 'https://github.com/emilianogsh',
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
    name: 'Carlos',
    role: 'Sr. Frontend (JS/TS)',
    company: 'WebExport',
    imageUrl: '/colaborators/carlos.webp',
    linkedinUrl: 'https://www.linkedin.com/in/carlos-spagnolo-andres/',
    githubUrl: 'https://github.com/SpagnoloCarlos',
  },
  {
    name: 'Maxi',
    role: 'Contributor',
    imageUrl: 'https://avatars.githubusercontent.com/u/55162138?v=4',
    linkedinUrl: 'https://www.linkedin.com/in/maxi-rebolo/',
    githubUrl: 'https://github.com/MaxiR23',
  },
  {
    name: 'Lean',
    role: 'Contributor',
    imageUrl: 'https://avatars.githubusercontent.com/u/92434825?v=4',
    linkedinUrl: 'https://www.linkedin.com/in/contrera-lean',
    githubUrl: 'https://github.com/contrera-lean',
  },
  {
    name: 'Facu M.',
    role: 'Sr. Full-Stack & AI Engineer',
    imageUrl: 'https://avatars.githubusercontent.com/u/43690718?v=4',
    linkedinUrl: 'https://www.linkedin.com/in/facundo-garcia-martoni/',
    githubUrl: 'https://github.com/facmartoni',
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
    name: 'Benja',
    role: 'Sr. Full-Stack Engineer',
    imageUrl: '/colaborators/benja.webp',
    linkedinUrl: 'https://www.linkedin.com/in/jpbenjamin-cortes/',
    githubUrl: 'https://github.com/cortesjpb',
  },
  {
    name: 'Vicky',
    role: 'Ssr. QA Engineer',
    company: 'Dizenz',
    imageUrl: '/colaborators/vicky.webp',
    linkedinUrl: 'https://www.linkedin.com/in/maria-victoria-grillo/',
    githubUrl: 'https://github.com/vickygrillo',
  },
];

const handleOf = (person: Person) =>
  person.githubUrl?.split('/').pop() ?? person.name.toLowerCase();

const knownLogins = new Set(knownPeople.map((person) => handleOf(person).toLowerCase()));

/**
 * Contributors in the GitHub snapshot (`pnpm github:stats`) who aren't listed above yet, so a
 * first PR shows up in the team on the next stats refresh without anyone editing this file. Add
 * them to `knownPeople` to give them a name and a role.
 */
const newContributors: Person[] = githubStats.topContributors
  .filter((contributor) => !knownLogins.has(contributor.login.toLowerCase()))
  .filter((contributor) => !/\[bot\]$/.test(contributor.login))
  .map((contributor) => ({
    name: contributor.login,
    role: 'Contributor',
    imageUrl: contributor.avatarUrl,
    githubUrl: contributor.htmlUrl,
  }));

const people: Person[] = [...knownPeople, ...newContributors];

const iconLinkClassName =
  'text-muted-foreground transition-colors hover:text-pcnGreen focus-visible:text-pcnGreen';

export const teamSize = people.length;

/** A person's PCN profile, through the GitHub login an admin linked in /vinculos. */
const profileOf = (person: Person, profiles: Record<string, LinkedUser>) => {
  const login = handleOf(person).toLowerCase();
  return Object.entries(profiles).find(([name]) => name.toLowerCase() === login)?.[1] ?? null;
};

// Terminal-style roster: every cell shares hairlines with its neighbours and the avatar stays
// tinted until hover, like a process coming back to life. Columns follow the space the roster
// has (a container query), not the screen: in a narrow PCN OS window it's a plain list, where
// names and roles fit instead of being cut to three letters.
export const Team = ({ profiles = {} }: { profiles?: Record<string, LinkedUser> }) => (
  <div className="@container">
    <ul
      role="list"
      className="grid grid-cols-1 border-l border-t border-pcnGreen-200 @2xl:grid-cols-2 @5xl:grid-cols-3 @7xl:grid-cols-4"
    >
      {people.map((person, index) => {
        const profile = profileOf(person, profiles);
        return (
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
                {profile ? (
                  <Link
                    href={`/perfil/${profile.id}`}
                    className="transition-colors hover:text-pcnGreen"
                    title={`Perfil de ${profile.name} en PCN`}
                  >
                    {person.name}
                  </Link>
                ) : (
                  person.name
                )}
                {person.name !== handleOf(person) && (
                  <span className="ml-1.5 text-xs text-pcnGreen-500">@{handleOf(person)}</span>
                )}
                <span className="ml-0.5 hidden animate-blink text-pcnGreen group-hover:inline">
                  _
                </span>
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
        );
      })}
    </ul>
  </div>
);
