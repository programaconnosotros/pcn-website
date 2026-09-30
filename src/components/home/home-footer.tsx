import { cn } from '@/lib/utils';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import { socialNetworks } from './social-links';

const columns = [
  {
    title: 'Actividades',
    links: [
      { label: 'Eventos', href: '/eventos' },
      { label: 'Charlas', href: '/charlas' },
      { label: 'Podcast', href: '/podcast' },
      { label: 'Conversaciones', href: '/conversaciones' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Cursos', href: '/cursos' },
      { label: 'Lectura', href: '/lectura' },
      { label: 'Consejos', href: '/consejos' },
      { label: 'Herramientas', href: '/herramientas' },
    ],
  },
  {
    title: 'Comunidad',
    links: [
      { label: 'Historia', href: '/historia' },
      { label: 'Galería', href: '/galeria' },
      { label: 'Sponsors', href: '/sponsors' },
      { label: 'Testimonios', href: '/testimonios' },
    ],
  },
];

export const HomeFooter = () => (
  <footer className="border-t border-pcnGreen-200">
    <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
      <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-black ring-1 ring-inset ring-pcnGreen-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.webp" alt="programaConNosotros" className="size-6" />
            </span>
            <span className="text-sm font-semibold tracking-tight">programaConNosotros</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Comunidad de apasionados por la ingeniería de software. Sin fronteras, abierta a todo el
            mundo.
          </p>
          <ul className="mt-5 flex items-center gap-2">
            {socialNetworks.map((network) => (
              <li key={network.name}>
                <Link
                  href={network.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={network.name}
                  className="flex size-9 items-center justify-center rounded-lg border border-pcnGreen-200 bg-pcnGreen-50 opacity-70 transition-all hover:border-pcnGreen-300 hover:opacity-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={network.icon} alt="" className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <p
              className={cn(
                GeistMono.className,
                'text-[11px] uppercase tracking-[0.2em] text-muted-foreground',
              )}
            >
              {column.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/75 transition-colors hover:text-pcnGreen"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col gap-3 border-t border-pcnGreen-200 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© 2020–{new Date().getFullYear()} programaConNosotros</p>
        <p>
          Hecho con <span className="text-pcnGreen">♥</span> por la comunidad.
        </p>
      </div>
    </div>
  </footer>
);
