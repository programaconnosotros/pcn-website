import { ExternalLink } from 'lucide-react';

// The developer forums worth knowing, listed next to ours on /foro.
export const FAMOUS_FORUMS = [
  {
    name: 'Stack Overflow',
    href: 'https://stackoverflow.com/',
    description: 'Preguntas y respuestas técnicas; también en español en es.stackoverflow.com.',
  },
  {
    name: 'Hacker News',
    href: 'https://news.ycombinator.com/',
    description: 'Noticias de tecnología y startups, con discusiones largas y exigentes.',
  },
  {
    name: 'Lobsters',
    href: 'https://lobste.rs/',
    description: 'Links de programación curados por invitación, con etiquetas por tema.',
  },
  {
    name: 'r/programming',
    href: 'https://www.reddit.com/r/programming/',
    description: 'El subreddit general de programación; hay uno por cada lenguaje.',
  },
  {
    name: 'DEV Community',
    href: 'https://dev.to/',
    description: 'Artículos y debates de devs de todos los niveles.',
  },
  {
    name: 'GitHub Discussions',
    href: 'https://github.com/orgs/community/discussions',
    description: 'Los foros de cada proyecto open source, donde se habla con quienes lo hacen.',
  },
  {
    name: 'Indie Hackers',
    href: 'https://www.indiehackers.com/',
    description: 'Gente construyendo productos propios: ingresos, marketing y lanzamientos.',
  },
  {
    name: 'Discourse Meta',
    href: 'https://meta.discourse.org/',
    description: 'El foro del software de foros que usan Rust, Swift, Ember y muchos más.',
  },
] as const;

export function FamousForums() {
  return (
    <section aria-labelledby="famous-forums" className="border border-pcnGreen-200">
      <h2
        id="famous-forums"
        className="border-b border-dashed border-pcnGreen-200 px-3 py-2 font-mono text-xs text-muted-foreground"
      >
        <span className="text-pcnGreen-500">$ </span>cat otros-foros.txt
      </h2>
      <ul className="divide-y divide-dashed divide-pcnGreen-200">
        {FAMOUS_FORUMS.map((forum) => (
          <li key={forum.href}>
            <a
              href={forum.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-0.5 px-3 py-2 transition-colors hover:bg-pcnGreen/[0.04]"
            >
              <span className="flex items-center gap-1.5 font-mono text-xs text-foreground group-hover:text-pcnGreen">
                {forum.name}
                <ExternalLink className="size-3 text-pcnGreen-600" aria-hidden />
              </span>
              <span className="text-xs text-muted-foreground">{forum.description}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
