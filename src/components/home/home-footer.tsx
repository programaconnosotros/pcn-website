import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { SocialIcon } from './social-icon';
import { socialNetworks } from './social-links';

const directories = [
  {
    name: 'actividades',
    links: [
      { label: 'eventos', href: '/eventos' },
      { label: 'charlas', href: '/charlas' },
      { label: 'podcast', href: '/podcast' },
      { label: 'conversaciones', href: '/conversaciones' },
    ],
  },
  {
    name: 'recursos',
    links: [
      { label: 'cursos', href: '/cursos' },
      { label: 'lectura', href: '/lectura' },
      { label: 'consejos', href: '/consejos' },
      { label: 'herramientas', href: '/herramientas' },
    ],
  },
  {
    name: 'comunidad',
    links: [
      { label: 'historia', href: '/historia' },
      { label: 'galería', href: '/galeria' },
      { label: 'sponsors', href: '/sponsors' },
      { label: 'testimonios', href: '/testimonios' },
    ],
  },
];

const Prompt = ({ command }: { command: string }) => (
  <p className="text-xs text-muted-foreground">
    <span className="text-pcnGreen">pcn@comunidad</span>
    <span className="text-muted-foreground/60">:</span>
    <span className="text-foreground">~</span>
    <span className="text-muted-foreground/60">$ </span>
    <span className="text-foreground/90">{command}</span>
  </p>
);

export const HomeFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(GeistMono.className, 'relative overflow-hidden border-t border-pcnGreen-200')}
    >
      {/* Backdrop: grid + green haze rising from the bottom */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-grid-fade absolute inset-0 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_100%,rgba(4,244,190,0.12),transparent_70%)]" />
      </div>

      {/* Scanning line along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#04f4be,transparent)] opacity-70" />

      <div className="relative mx-auto max-w-6xl px-6 pt-10 lg:px-8">
        {/* Terminal window */}
        <div className="overflow-hidden rounded-sm border border-pcnGreen-200 bg-black/70 shadow-[0_0_40px_-12px_rgba(4,244,190,0.35)] backdrop-blur-sm">
          <div className="flex items-center gap-3 border-b border-pcnGreen-200 px-3 py-2">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-pcnGreen-200" />
              <span className="size-2.5 rounded-full bg-pcnGreen-400" />
              <span className="size-2.5 rounded-full bg-pcnGreen" />
            </div>
            <p className="flex-1 truncate text-center text-[11px] text-muted-foreground">
              pcn@comunidad: ~/footer — zsh — 80×24
            </p>
            <Link
              href="#top"
              aria-label="Volver arriba"
              className="group flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-pcnGreen"
            >
              <ArrowUp className="size-3 transition-transform group-hover:-translate-y-0.5" />
              <span className="hidden sm:inline">cd /</span>
            </Link>
          </div>

          <div className="grid md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* Site map as `tree` output */}
            <div className="border-b border-pcnGreen-200 p-4 md:border-b-0 md:border-r">
              <Prompt command="tree ~/pcn -L 2" />
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                {directories.map((directory) => (
                  <div key={directory.name} className="text-sm">
                    <p className="font-semibold text-pcnGreen">{directory.name}/</p>
                    <ul>
                      {directory.links.map((link, index) => (
                        <li key={link.href} className="flex">
                          <span
                            aria-hidden="true"
                            className="select-none whitespace-pre text-pcnGreen-400"
                          >
                            {index === directory.links.length - 1 ? '└── ' : '├── '}
                          </span>
                          <Link
                            href={link.href}
                            className="group relative truncate text-foreground/70 transition-colors hover:text-pcnGreen"
                          >
                            <span className="group-hover:text-glow">{link.label}</span>
                            <span className="ml-0.5 hidden text-pcnGreen group-hover:inline group-hover:animate-blink">
                              _
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground/60">3 directories, 12 files</p>
            </div>

            {/* About + socials */}
            <div className="flex flex-col p-4">
              <Prompt command="cat README.md" />
              <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                <span className="text-pcnGreen-600"># </span>
                Comunidad de apasionados por la ingeniería de software.{' '}
                <span className="text-pcnGreen">Sin fronteras</span>, abierta a todo el mundo.
              </p>

              <div className="mt-5">
                <Prompt command="ls ~/.redes" />
                <ul className="mt-3 flex flex-wrap gap-2">
                  {socialNetworks.map((network) => (
                    <li key={network.name}>
                      <Link
                        href={network.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={network.name}
                        className="group flex items-center gap-1.5 rounded-sm border border-pcnGreen-200 bg-pcnGreen-50 px-2 py-1 text-xs text-pcnGreen-700 transition-all hover:border-pcnGreen hover:bg-pcnGreen hover:text-black hover:shadow-[0_0_16px_-2px_rgb(4_244_190/0.7)]"
                      >
                        <SocialIcon name={network.name} className="size-3.5" />
                        <span>{network.name.toLowerCase()}</span>
                        <ArrowUpRight className="size-3 opacity-50 transition-all group-hover:-translate-y-px group-hover:translate-x-px group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-5 text-xs text-muted-foreground md:mt-auto md:pt-5">
                <span className="text-pcnGreen">pcn@comunidad</span>
                <span className="text-muted-foreground/60">:~$ </span>
                <span className="inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-pcnGreen" />
              </p>
            </div>
          </div>

          {/* vim/tmux-style status line */}
          <div className="flex items-stretch overflow-hidden border-t border-pcnGreen-200 text-[11px]">
            <span className="bg-pcnGreen px-2 py-1 font-semibold text-black">NORMAL</span>
            <span className="border-r border-pcnGreen-200 bg-pcnGreen-100 px-2 py-1 text-pcnGreen">
              ⎇ main
            </span>
            <span className="min-w-0 flex-1 truncate px-2 py-1 text-muted-foreground">
              © 2020–{year} programaConNosotros
            </span>
            <span className="hidden border-l border-pcnGreen-200 px-2 py-1 text-muted-foreground sm:block">
              hecho con <span className="text-pcnGreen">♥</span> por la comunidad
            </span>
            <span className="hidden border-l border-pcnGreen-200 px-2 py-1 text-muted-foreground md:block">
              utf-8
            </span>
            <span className="bg-pcnGreen-200 px-2 py-1 text-pcnGreen">100%</span>
          </div>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge */}
      <div aria-hidden="true" className="relative mx-auto max-w-6xl select-none px-6 lg:px-8">
        <p className="-mb-[0.28em] mt-6 whitespace-nowrap bg-[linear-gradient(180deg,rgba(4,244,190,0.55),rgba(4,244,190,0.04)_85%)] bg-clip-text text-center text-[clamp(1.75rem,7.4vw,5.75rem)] font-bold leading-none tracking-[-0.06em] text-transparent [filter:drop-shadow(0_0_24px_rgba(4,244,190,0.25))]">
          programaConNosotros
        </p>
      </div>
    </footer>
  );
};
