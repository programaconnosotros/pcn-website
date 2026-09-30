import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ArrowUpRight, Award, Crown, Medal, MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Sumate como sponsor · Zero to Agent | programaConNosotros',
  description:
    'Sumate como sponsor a Zero to Agent, el evento de inteligencia artificial más importante de Tucumán. Organizado junto a Vercel y Xetro.',
  openGraph: {
    title: 'Sumate como sponsor · Zero to Agent | programaConNosotros',
    description:
      'Sumate como sponsor a Zero to Agent, el evento de inteligencia artificial más importante de Tucumán. Organizado junto a Vercel y Xetro.',
    images: [`${SITE_URL}/zero-to-agent-card.png`],
    url: `${SITE_URL}/zero-to-agent-sponsors`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sumate como sponsor · Zero to Agent | programaConNosotros',
    description:
      'Sumate como sponsor a Zero to Agent, el evento de inteligencia artificial más importante de Tucumán. Organizado junto a Vercel y Xetro.',
    images: [`${SITE_URL}/zero-to-agent-card.png`],
  },
};

const organizers = [
  {
    name: 'Vercel',
    url: 'https://vercel.com',
    description:
      'Empresa de infraestructura de software muy apreciada mundialmente por la facilidad que ofrece para desarrollar software y las herramientas de vanguardia con inteligencia artificial como foco principal.',
  },
  {
    name: 'programaConNosotros',
    url: 'https://programaConNosotros.com',
    description:
      'Comunidad sin fines de lucro de apasionados por el software, radicada en Tucumán, cuyo propósito es elevar la calidad técnica de la industria del software mediante eventos y recursos que faciliten descubrir oportunidades, compartir experiencias y conocimientos.',
  },
  {
    name: 'Xetro',
    url: 'https://xetro.ai',
    description:
      'Empresa de software B2B que permite optimizar los procesos de venta utilizando inteligencia artificial para aumentar ganancias, bajar los costos y mejorar la experiencia de los clientes.',
  },
];

const whyKeyBullets = [
  'Es el evento más importante de inteligencia artificial en lo que va del año.',
  'Las personas no solo escucharán charlas técnicas sino que podrán poner manos a la obra para crear software con agentes de inteligencia artificial.',
  'Los proyectos serán calificados por un jurado de Vercel y hay más de 6.000 dólares en premios a los mejores proyectos a nivel mundial.',
];

const whySponsorBullets = [
  'Para poder recibir más personas en el evento, haciéndolo en un lugar más grande.',
  'Para poder elevar al máximo la experiencia de los participantes.',
  'Para amplificar el propósito del evento y demostrar que la industria del software en Tucumán está activa y adaptándose a los nuevos tiempos.',
];

const tiers = [
  {
    name: 'Oro',
    icon: Crown,
    amount: 'AR$ 2.000.000',
    accent: '#D4AF37',
    variant: 'gold' as const,
    waText: 'Hola%21+Quiero+patrocinar+el+evento+Zero+to+Agent+como+sponsor+Oro.',
    benefits: [
      'Logo destacado en cartelería del evento, llegando a miles de personas apasionadas por el software.',
      'Posibilidad de incluir merchandising propio para todos los participantes del evento.',
      'Posibilidad de poner un banner en el lugar del evento.',
      'Mención especial en las charlas de apertura y cierre del evento.',
      'Posibilidad de poner un stand de la empresa durante el evento.',
      'Mención especial en biografía de Instagram durante un mes.',
      'Asociación pública con programaConNosotros y con una iniciativa global de Vercel.',
      'Inclusión en el post de agradecimiento a sponsors en LinkedIn e Instagram.',
      'Será incluido como sponsor destacado en la página web de programaConNosotros.',
      'Publicación técnica de tipo carrusel en el Instagram de PCN con la empresa como sponsor.',
    ],
  },
  {
    name: 'Plata',
    icon: Medal,
    amount: 'AR$ 1.500.000',
    accent: '#A8A8A8',
    variant: 'silver' as const,
    waText: 'Hola%21+Quiero+patrocinar+el+evento+Zero+to+Agent+como+sponsor+Plata.',
    benefits: [
      'Logo en ubicación secundaria en cartelería del evento.',
      'Posibilidad de incluir merchandising propio para todos los participantes del evento.',
      'Mención durante la apertura del evento.',
      'Asociación pública con programaConNosotros y con una iniciativa global de Vercel.',
      'Inclusión en el post de agradecimiento a sponsors en LinkedIn e Instagram.',
      'Publicación técnica de tipo carrusel en el Instagram de PCN con la empresa como sponsor.',
    ],
  },
  {
    name: 'Bronce',
    icon: Award,
    amount: 'AR$ 1.000.000',
    accent: '#CD7F32',
    variant: 'bronze' as const,
    waText: 'Hola%21+Quiero+patrocinar+el+evento+Zero+to+Agent+como+sponsor+Bronce.',
    benefits: [
      'Mención durante el cierre del evento junto al resto de los sponsors bronce.',
      'Logo en ubicación terciaria en cartelería del evento.',
      'Asociación pública con programaConNosotros y con una iniciativa global de Vercel.',
      'Inclusión en el post de agradecimiento a sponsors en LinkedIn e Instagram.',
    ],
  },
];

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="mb-2 font-mono text-sm font-semibold">
    <span className="text-pcnGreen-500">## </span>
    {children}
  </h2>
);

const BulletList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-1">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
        <span className="shrink-0 font-mono text-pcnGreen-500">›</span>
        {item}
      </li>
    ))}
  </ul>
);

const ZeroToAgentSponsors = () => (
  <>
    <header className="sticky top-0 z-40 -mx-1 flex h-16 shrink-0 items-center gap-2 bg-background md:-mx-6">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Zero to Agent · Sponsors</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>

    <div className="mt-4 px-4 pb-16 md:px-10">
      <PageTitle
        path="zero-to-agent/sponsors"
        meta="30 abr · 18:00–23:00 · +6.000 USD en premios"
      />

      <Image
        src="/zero-to-agent-card.png"
        alt="Zero to Agent"
        width={2400}
        height={1256}
        priority
        className="w-full border border-pcnGreen-200"
      />

      <div className="divide-y divide-pcnGreen-200 border-x border-b border-pcnGreen-200">
        <section className="p-4">
          <SectionTitle>¿De qué se trata el evento?</SectionTitle>
          <div className="space-y-2 text-sm leading-6 text-muted-foreground">
            <p>
              Zero to Agent es un evento que reúne a personas apasionadas por el software que
              quieren aprender a desarrollar agentes de inteligencia artificial utilizando la
              plataforma &ldquo;v0&rdquo; de Vercel, y poder participar por más de 6.000 USD en
              premios otorgados por Vercel a los mejores proyectos presentados.
            </p>
            <p>
              El objetivo del evento es que las personas creen software real con inteligencia
              artificial, además de adquirir nuevos conocimientos con las charlas y recursos que
              serán brindados durante la jornada.
            </p>
          </div>
        </section>

        <section className="p-4">
          <SectionTitle>Fecha y lugar</SectionTitle>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
            <dt className="text-pcnGreen-500">fecha</dt>
            <dd>Jueves 30 de abril, 18:00 – 23:00</dd>
            <dt className="text-pcnGreen-500">lugar</dt>
            <dd>Xetro AI · Lamadrid 525, Tucumán</dd>
            <dt className="text-pcnGreen-500">cupo</dt>
            <dd>50 personas</dd>
          </dl>
        </section>

        <section className="grid md:grid-cols-2 md:divide-x md:divide-pcnGreen-200">
          <div className="p-4">
            <SectionTitle>¿Por qué es clave?</SectionTitle>
            <BulletList items={whyKeyBullets} />
          </div>
          <div className="border-t border-pcnGreen-200 p-4 md:border-t-0">
            <SectionTitle>¿Por qué necesitamos sponsors?</SectionTitle>
            <BulletList items={whySponsorBullets} />
          </div>
        </section>
      </div>

      <h2 className="mb-2 mt-8 font-mono text-sm font-semibold">
        <span className="text-pcnGreen-500">## </span>Organizadores
      </h2>
      <RuledGrid className="grid-cols-1 lg:grid-cols-3">
        {organizers.map((org) => (
          <Link
            key={org.name}
            href={org.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(ruledCellClassName, 'group flex flex-col gap-1 p-3')}
          >
            <span className="flex items-center gap-1 font-mono text-sm font-semibold group-hover:text-pcnGreen">
              {org.name}
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
            </span>
            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {org.description}
            </p>
          </Link>
        ))}
      </RuledGrid>

      <h2 className="mb-2 mt-8 font-mono text-sm font-semibold">
        <span className="text-pcnGreen-500">## </span>Niveles de sponsorship
      </h2>
      <RuledGrid className="grid-cols-1 lg:grid-cols-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div key={tier.name} className={cn(ruledCellClassName, 'flex min-w-0 flex-col p-4')}>
              <div className="mb-3 flex items-baseline justify-between gap-2 font-mono">
                <span
                  className="flex items-center gap-1.5 text-base font-bold"
                  style={{ color: tier.accent }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tier.name}
                </span>
                <span className="text-sm font-semibold">{tier.amount}</span>
              </div>

              <ul className="mb-4 flex flex-1 flex-col gap-1">
                {tier.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-xs leading-5">
                    <span className="shrink-0 font-mono" style={{ color: tier.accent }}>
                      ›
                    </span>
                    <span className="break-words text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`https://wa.me/5493815777562?text=${tier.waText}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant={tier.variant} size="sm" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Patrocinar como {tier.name}
                </Button>
              </Link>
            </div>
          );
        })}
      </RuledGrid>
    </div>
  </>
);

export default ZeroToAgentSponsors;
