import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { SectionHeader } from './section-header';

export const socialNetworks = [
  {
    name: 'WhatsApp',
    description: 'Conversaciones y oportunidades',
    url: 'https://chat.whatsapp.com/IFwKhHXoMwM6ysKcbfHiEh',
    icon: '/social-networks/whatsapp.svg',
    color: '#25D366',
  },
  {
    name: 'Discord',
    description: 'Voz, texto y eventos online',
    url: 'https://discord.gg/dTQexKw56S',
    icon: '/social-networks/discord.svg',
    color: '#5865F2',
  },
  {
    name: 'Instagram',
    description: 'Recuerdos y novedades',
    url: 'https://www.instagram.com/programaconnosotros/',
    icon: '/social-networks/instagram.svg',
    color: '#E4405F',
  },
  {
    name: 'YouTube',
    description: 'Charlas y cursos grabados',
    url: 'https://www.youtube.com/@programaconnosotros2689/videos',
    icon: '/social-networks/youtube.svg',
    color: '#FF0000',
  },
  {
    name: 'LinkedIn',
    description: 'Visibilidad profesional',
    url: 'https://www.linkedin.com/company/programaconnosotros',
    icon: '/social-networks/linkedin.svg',
    color: '#0A66C2',
  },
];

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
            'group relative flex items-center gap-3 overflow-hidden p-3',
          )}
          style={{ ['--brand' as string]: network.color }}
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-sm"
            style={{ backgroundColor: `${network.color}1f` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={network.icon} alt="" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm font-semibold text-foreground group-hover:text-pcnGreen">
              {network.name.toLowerCase()}
            </p>
            <p className="truncate text-xs text-muted-foreground">{network.description}</p>
          </div>
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/50 group-hover:text-pcnGreen" />
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `linear-gradient(90deg, transparent, ${network.color}, transparent)`,
            }}
          />
        </Link>
      ))}
    </RuledGrid>
  </section>
);
