import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';
import { SocialIcon, type SocialNetworkName } from './social-icon';

export const socialNetworks = [
  {
    name: 'WhatsApp',
    description: 'Conversaciones y oportunidades',
    url: 'https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh',
  },
  {
    name: 'Discord',
    description: 'Voz, texto y eventos online',
    url: 'https://discord.gg/dTQexKw56S',
  },
  {
    name: 'Instagram',
    description: 'Recuerdos y novedades',
    url: 'https://www.instagram.com/programaconnosotros/',
  },
  {
    name: 'YouTube',
    description: 'Charlas y cursos grabados',
    url: 'https://www.youtube.com/@programaconnosotros2689/videos',
  },
  {
    name: 'LinkedIn',
    description: 'Visibilidad profesional',
    url: 'https://www.linkedin.com/company/programaconnosotros',
  },
] satisfies { name: SocialNetworkName; description: string; url: string }[];

export const SocialLinks = () => (
  <section>
    <SectionHeader
      eyebrow="Redes"
      title="Estamos donde vos estás"
      description="Elegí el canal que más te guste. Todo lo importante se comparte en todos."
    />

    <RuledGrid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      {socialNetworks.map((network) => (
        <Link
          key={network.name}
          href={network.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            ruledCellClassName,
            'relative flex group items-center gap-3 overflow-hidden p-3',
          )}
        >
          <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_2px,rgb(4_244_190/0.04)_2px,rgb(4_244_190/0.04)_3px)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative flex size-8 shrink-0 items-center justify-center rounded-sm border border-pcnGreen-200 bg-pcnGreen-50 text-pcnGreen-700 transition-all duration-300 group-hover:border-pcnGreen-500 group-hover:text-pcnGreen group-hover:shadow-[0_0_12px_-2px_rgb(4_244_190/0.5)]">
            <SocialIcon
              name={network.name}
              className="size-4 transition-[filter] duration-300 group-hover:drop-shadow-[0_0_4px_rgb(4_244_190/0.8)]"
            />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="font-mono text-sm font-semibold text-foreground group-hover:text-pcnGreen">
              <span className="text-pcnGreen-600">~/</span>
              {network.name.toLowerCase()}
              <span className="ml-0.5 hidden text-pcnGreen group-hover:inline group-hover:animate-blink">
                _
              </span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              <span className="font-mono text-pcnGreen-400">{'// '}</span>
              {network.description}
            </p>
          </div>
          <ArrowUpRight className="relative size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-pcnGreen" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,#04f4be,transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
      ))}
    </RuledGrid>
  </section>
);
