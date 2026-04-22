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
import { Card, CardContent } from '@/components/ui/card';
import { Heading1 } from '@/components/ui/heading-1';
import { Heading3 } from '@/components/ui/heading-3';
import { Paragraph } from '@/components/ui/paragraph';
import { GeistMono } from 'geist/font/mono';
import {
  Calendar,
  MapPin,
  Users,
  Check,
  Crown,
  Medal,
  Award,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';

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

    <div className="mt-4 px-4 pb-16 md:px-20">
      {/* Hero */}
      <Image
        src="/zero-to-agent-card.png"
        alt="Zero to Agent"
        width={2400}
        height={1256}
        priority
        className="mb-6 w-full rounded-lg"
      />
      <Paragraph className="text-muted-foreground">
        El evento más importante de inteligencia artificial de Tucumán en lo que va del año.
        Organizado por Vercel, programaConNosotros y Xetro — con más de 6.000 USD en premios.
      </Paragraph>

      {/* ¿De qué se trata? */}
      <Heading3 className="mb-4 mt-10">¿De qué se trata el evento?</Heading3>
      <Paragraph>
        Zero to Agent es un evento que reúne a personas apasionadas por el software que quieren
        aprender a desarrollar agentes de inteligencia artificial utilizando la plataforma
        &ldquo;v0&rdquo; de Vercel, y poder participar por más de 6.000 USD en premios otorgados por
        Vercel a los mejores proyectos presentados.
      </Paragraph>
      <Paragraph>
        El objetivo del evento es que las personas creen software real con inteligencia artificial,
        además de adquirir nuevos conocimientos con las charlas y recursos que serán brindados
        durante la jornada.
      </Paragraph>
      <Paragraph>
        Es el evento más importante de inteligencia artificial de la provincia en lo que va del año
        y marcará un gran precedente para la industria del software de nuestra provincia,
        demostrando que Tucumán está haciendo un esfuerzo por estar a la vanguardia con las nuevas
        prácticas y tecnologías de la industria del software.
      </Paragraph>

      {/* Organizadores */}
      <Heading3 className="mb-6 mt-10">Organizadores</Heading3>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {organizers.map((org) => (
          <Card
            key={org.name}
            className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 dark:border-neutral-900 dark:from-black dark:to-neutral-950"
          >
            <CardContent className="p-6">
              <h4 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                {org.name}
              </h4>
              <p className="break-words text-sm leading-6 text-muted-foreground">
                {org.description}
              </p>
              <Link
                href={org.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visitar sitio web
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fecha y lugar */}
      <Heading3 className="mb-4 mt-10">Fecha y lugar</Heading3>
      <Card className="border-2 border-transparent bg-gradient-to-br from-white to-gray-50 dark:border-neutral-900 dark:from-black dark:to-neutral-950">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 shrink-0 text-pcnPurple dark:text-pcnGreen" />
            <span className="text-sm md:text-base">Jueves 30 de abril, 18:00 – 23:00</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 shrink-0 text-pcnPurple dark:text-pcnGreen" />
            <span className="text-sm md:text-base">Xetro AI · Lamadrid 525, Tucumán</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 shrink-0 text-pcnPurple dark:text-pcnGreen" />
            <span className="text-sm md:text-base">Capacidad: 50 personas</span>
          </div>
        </CardContent>
      </Card>

      {/* ¿Por qué es clave? */}
      <Heading3 className="mb-4 mt-10">¿Por qué este evento es clave para la provincia?</Heading3>
      <ul className="flex flex-col gap-3">
        {whyKeyBullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-pcnPurple dark:text-pcnGreen" />
            <span className="text-sm leading-6 text-muted-foreground md:text-base">{bullet}</span>
          </li>
        ))}
      </ul>

      {/* ¿Por qué sponsors? */}
      <Heading3 className="mb-4 mt-10">¿Por qué necesitamos sponsors?</Heading3>
      <ul className="flex flex-col gap-3">
        {whySponsorBullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-pcnPurple dark:text-pcnGreen" />
            <span className="text-sm leading-6 text-muted-foreground md:text-base">{bullet}</span>
          </li>
        ))}
      </ul>

      {/* Niveles de sponsorship */}
      <Heading3 className="mb-6 mt-10 text-pcnPurple drop-shadow-[0_0_15px_rgba(80,56,189,0.4)] dark:text-white dark:drop-shadow-none">
        Niveles de sponsorship
      </Heading3>
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <Card
              key={tier.name}
              className="flex min-w-0 flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 dark:border-neutral-900 dark:from-black dark:to-neutral-950"
            >
              <CardContent className="flex flex-1 flex-col p-6">
                {/* Tier header */}
                <div className="mb-4 flex items-center gap-2">
                  <Icon className="h-6 w-6 shrink-0" style={{ color: tier.accent }} />
                  <span className="text-xl font-bold" style={{ color: tier.accent }}>
                    {tier.name}
                  </span>
                </div>
                <p className="mb-5 text-lg font-semibold text-neutral-900 dark:text-white">
                  {tier.amount}
                </p>

                {/* Benefits */}
                <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: tier.accent }} />
                      <span className="break-words text-sm leading-5 text-muted-foreground">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={`https://wa.me/5493815777562?text=${tier.waText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant={tier.variant} className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Patrocinar como {tier.name}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Closing hero banner */}
      <div className="relative mt-10 min-h-[400px] w-full overflow-hidden rounded-lg bg-background md:h-[500px]">
        <div className="absolute inset-0 z-0">
          <Image src="/home.GIF" alt="" fill className="object-cover" unoptimized />
        </div>
        <div className="absolute inset-0 z-0 bg-black/60" />

        <div className="relative z-10 flex h-full min-h-[400px] w-full flex-col items-center justify-center px-4 py-6 md:min-h-[500px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.webp"
            alt="programaConNosotros"
            className="w-[80px] drop-shadow-[0_0_20px_rgba(4,244,190,0.6)] md:w-[100px]"
          />

          <Heading1
            className={`${GeistMono.className} mb-4 mt-6 text-center text-3xl text-pcnGreen drop-shadow-[0_0_15px_rgba(4,244,190,0.8)] md:mb-6 md:mt-8 md:text-4xl`}
          >
            programaConNosotros
          </Heading1>

          <p className="px-4 text-center text-lg leading-relaxed text-white drop-shadow-[0_0_10px_rgba(4,244,190,0.6)] md:text-lg">
            Apasionados por el software.
          </p>
        </div>
      </div>
    </div>
  </>
);

export default ZeroToAgentSponsors;
