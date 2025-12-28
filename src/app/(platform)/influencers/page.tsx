import { InfluencerCard } from '@/components/influencers/influencer-card';
import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface Platform {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  page?: string;
}

interface Influencer {
  id: string;
  name: string;
  image: string;
  description: string;
  platforms: Platform;
  specialties: string[];
}

interface InfluencersData {
  influencers: Influencer[];
}

export const metadata = {
  title: 'Influencers - PCN',
  description: 'Influencers recomendados por la comunidad.',
};

const influencersData: InfluencersData = {
  influencers: [
    {
      id: '1',
      name: 'Miguel Ángel Durán Garcia - @midudev',
      image: 'midudev.webp',
      description:
        'Creador de contenido sobre programación y tecnología, además de ingeniero de software con más de 15 años de experiencia. Tiene una comunidad de más de 700k seguidores en sus redes sociales. Su canal de programación en Twitch es el más visto en el mundo de habla hispana. Es uno de los divulgadores más influyentes en el mundo de JavaScript según la encuesta mundial State of JS.',
      platforms: {
        youtube: 'https://www.youtube.com/@midudev',
        instagram: 'https://www.instagram.com/midu.dev/',
        twitter: 'https://x.com/midudev',
        linkedin: 'https://www.linkedin.com/in/midudev/',
      },
      specialties: ['React', 'Node.js', 'Full Stack'],
    },
    {
      id: '2',
      name: 'Fernando Herrera - @fernando_her85',
      image: 'ferherrera.webp',
      description:
        'Desarrollador Full Stack con más de 10 años de experiencia. Comparte tutoriales sobre programación, tecnologías y herramientas de desarrollo. Tiene una comunidad de más de 100k seguidores en sus redes sociales.',
      platforms: {
        youtube: 'https://www.youtube.com/@fernando_her85',
        page: 'https://cursos.devtalles.com/',
        linkedin: 'https://www.linkedin.com/in/fernando-herrera-b6b204200/',
        twitter: 'https://x.com/Fernando_Her85',
      },
      specialties: ['javascript', 'typescript', 'react', 'nodejs', 'python', 'sql', 'aws'],
    },
    {
      id: '3',
      name: 'Brais Moure - @mouredev',
      image: 'mouredev.webp',
      description:
        'Ingeniero de software desde 2010. Actualmente trabaja como freelance fullstack y crea contenido formativo sobre programación y desarrollo en redes sociales.',
      platforms: {
        youtube: 'https://www.youtube.com/@mouredev',
        page: 'https://mouredev.pro/',
        twitter: 'https://x.com/MoureDev',
        github: 'https://github.com/mouredev',
      },
      specialties: ['javascript', 'typescript', 'react', 'nodejs', 'python', 'sql', 'aws'],
    },
  ],
};

export default async function InfluencersPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
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
                <BreadcrumbPage>Influencers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Heading2 className="m-0">Influencers</Heading2>
          </div>

          <div className="mb-6">
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Acá te mostramos algunas personas o grupos que consideramos referentes en el mundo del
              software y que creemos que pueden aportar mucho a tu crecimiento profesional.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {influencersData.influencers.map((influencer: Influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
