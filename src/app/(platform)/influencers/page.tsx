import { InfluencerCard } from '@/components/influencers/influencer-card';
import { Heading2 } from '@/components/ui/heading-2';
import { Users } from 'lucide-react';
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

import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://programaconnosotros.com';

export const metadata: Metadata = {
  title: 'Creadores de contenido recomendados',
  description:
    'Una lista curada de creadores de contenido sobre ingeniería de software que la comunidad recomienda seguir.',
  openGraph: {
    title: 'Creadores de contenido recomendados | programaConNosotros',
    description:
      'Una lista curada de creadores de contenido sobre ingeniería de software que la comunidad recomienda seguir.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
    url: `${SITE_URL}/influencers`,
    type: 'website',
    siteName: 'programaConNosotros',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creadores de contenido recomendados | programaConNosotros',
    description:
      'Una lista curada de creadores de contenido sobre ingeniería de software que la comunidad recomienda seguir.',
    images: [`${SITE_URL}/pcn-link-preview.png`],
  },
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
    {
      id: '4',
      name: 'ThePrimeagen - @ThePrimeagen',
      image: 'theprimeagen.png',
      description:
        'Ex-ingeniero de Netflix y creador de contenido sobre rendimiento, algoritmos y productividad con Vim/Neovim. Uno de los streamers más conocidos del mundo de la programación, reconocido por su entusiasmo por Rust y las estructuras de datos.',
      platforms: {
        youtube: 'https://www.youtube.com/@ThePrimeagen',
        twitter: 'https://x.com/ThePrimeagen',
        github: 'https://github.com/ThePrimeagen',
      },
      specialties: ['rust', 'vim', 'algoritmos', 'performance', 'go'],
    },
    {
      id: '5',
      name: 'Theo Browne - @t3dotgg',
      image: 'theo.png',
      description:
        'Creador del T3 Stack y referente en el ecosistema TypeScript/Next.js. Comparte opiniones directas sobre el mundo del desarrollo web moderno y es conocido por sus análisis de tecnologías y tendencias del frontend.',
      platforms: {
        youtube: 'https://www.youtube.com/@t3dotgg',
        twitter: 'https://x.com/t3dotgg',
        github: 'https://github.com/t3dotgg',
        page: 'https://t3.gg',
      },
      specialties: ['typescript', 'react', 'nextjs', 't3 stack', 'trpc'],
    },
    {
      id: '6',
      name: 'Kyle Cook - @WebDevSimplified',
      image: 'webdevsimplified.png',
      description:
        'Simplifica los conceptos más complejos del desarrollo web. Sus tutoriales de JavaScript, React y CSS son usados por millones de desarrolladores que buscan entender el "por qué" detrás de cada tecnología.',
      platforms: {
        youtube: 'https://www.youtube.com/@WebDevSimplified',
        twitter: 'https://x.com/DevSimplified',
        github: 'https://github.com/WebDevSimplified',
        page: 'https://blog.webdevsimplified.com/',
      },
      specialties: ['javascript', 'react', 'css', 'html', 'web development'],
    },
    {
      id: '7',
      name: 'Kevin Powell - @KevinPowell',
      image: 'kevinpowell.png',
      description:
        'El referente mundial de CSS. Comparte trucos, técnicas y buenas prácticas para dominar las hojas de estilo en profundidad. Su contenido es esencial para cualquier desarrollador que quiera dominar el diseño web moderno.',
      platforms: {
        youtube: 'https://www.youtube.com/@KevinPowell',
        twitter: 'https://x.com/KevinJPowell',
        github: 'https://github.com/kevin-powell',
      },
      specialties: ['css', 'html', 'responsive design', 'web development'],
    },
    {
      id: '8',
      name: 'Brad Traversy - @TraversyMedia',
      image: 'traversymedia.png',
      description:
        'Uno de los creadores de contenido de programación más influyentes en inglés. Cuenta con millones de suscriptores y cubre un amplísimo espectro de tecnologías web: desde HTML/CSS hasta Python, Go, y frameworks modernos.',
      platforms: {
        youtube: 'https://www.youtube.com/@TraversyMedia',
        twitter: 'https://x.com/traversymedia',
        github: 'https://github.com/bradtraversy',
        page: 'https://www.traversymedia.com/',
      },
      specialties: ['javascript', 'python', 'react', 'nodejs', 'full stack'],
    },
    {
      id: '9',
      name: 'Wes Bos - @wesbos',
      image: 'wesbos.png',
      description:
        'Desarrollador full stack y educador reconocido en la comunidad JavaScript. Creador de cursos premium sobre JavaScript, CSS Grid, React y Node.js. Co-host del popular podcast Syntax junto a Scott Tolinski.',
      platforms: {
        youtube: 'https://www.youtube.com/@WesBos',
        twitter: 'https://x.com/wesbos',
        github: 'https://github.com/wesbos',
        page: 'https://wesbos.com/',
      },
      specialties: ['javascript', 'css', 'react', 'nodejs', 'web development'],
    },
    {
      id: '10',
      name: 'Kent C. Dodds - @kentcdodds',
      image: 'kentcdodds.png',
      description:
        'Referente global en testing de JavaScript y React. Creador de React Testing Library y autor del reconocido blog sobre buenas prácticas de testing. Evangelizador de la filosofía "test the way users use the app".',
      platforms: {
        youtube: 'https://www.youtube.com/@KentCDodds-vids',
        twitter: 'https://x.com/kentcdodds',
        github: 'https://github.com/kentcdodds',
        page: 'https://kentcdodds.com/',
        linkedin: 'https://www.linkedin.com/in/kentcdodds/',
      },
      specialties: ['javascript', 'react', 'testing', 'open source'],
    },
    {
      id: '11',
      name: 'Dan Abramov - @dan_abramov',
      image: 'danabramov.png',
      description:
        'Co-creador de Redux y parte central del equipo de React durante años. Sus explicaciones profundas sobre el funcionamiento interno de React y JavaScript son imprescindibles para cualquier desarrollador que quiera entender estos ecosistemas en profundidad.',
      platforms: {
        twitter: 'https://x.com/dan_abramov2',
        github: 'https://github.com/gaearon',
      },
      specialties: ['react', 'javascript', 'open source', 'redux'],
    },
    {
      id: '12',
      name: 'Addy Osmani - @addyosmani',
      image: 'addyosmani.png',
      description:
        'Engineering Manager en Google Chrome y experto en rendimiento web. Autor de libros reconocidos sobre patrones de diseño en JavaScript. Su trabajo en Core Web Vitals y optimización de la web es de referencia a nivel mundial.',
      platforms: {
        youtube: 'https://www.youtube.com/@AddyOsmani',
        twitter: 'https://x.com/addyosmani',
        github: 'https://github.com/addyosmani',
        page: 'https://addyosmani.com/',
      },
      specialties: ['performance', 'javascript', 'chrome', 'web development'],
    },
    {
      id: '13',
      name: 'Cassidy Williams - @cassidoo',
      image: 'cassidywilliams.png',
      description:
        'Ingeniera de software, divulgadora y creadora de contenido sobre carrera y tecnología. Conocida por su newsletter semanal y por hacer la industria tech más accesible y divertida. Ha trabajado en Amazon, Netlify y CodePen, entre otras.',
      platforms: {
        youtube: 'https://www.youtube.com/@cassidoo',
        twitter: 'https://x.com/cassidoo',
        github: 'https://github.com/cassidoo',
        linkedin: 'https://www.linkedin.com/in/cassidywilliams/',
      },
      specialties: ['javascript', 'react', 'carrera', 'open source'],
    },
    {
      id: '14',
      name: 'Lee Robinson - @leeerob',
      image: 'leerobinson.png',
      description:
        'VP de Product en Vercel y uno de los principales evangelistas de Next.js. Comparte contenido de alta calidad sobre React, TypeScript y el ecosistema de Vercel. Sus tutoriales sobre el App Router de Next.js son referencia en la comunidad.',
      platforms: {
        youtube: 'https://www.youtube.com/@leerob',
        twitter: 'https://x.com/leeerob',
        github: 'https://github.com/leerob',
        page: 'https://leerob.io/',
      },
      specialties: ['nextjs', 'react', 'typescript', 'vercel'],
    },
    {
      id: '15',
      name: 'Josh Comeau - @JoshWComeau',
      image: 'joshcomeau.png',
      description:
        'Desarrollador frontend conocido por sus artículos interactivos y visuales sobre CSS, React y animaciones. Sus posts en joshwcomeau.com son ampliamente reconocidos por su claridad y la forma innovadora de explicar conceptos complejos.',
      platforms: {
        youtube: 'https://www.youtube.com/@JoshWComeau',
        twitter: 'https://x.com/JoshWComeau',
        github: 'https://github.com/joshwcomeau',
        page: 'https://www.joshwcomeau.com/',
      },
      specialties: ['react', 'css', 'animación', 'javascript', 'web development'],
    },
    {
      id: '16',
      name: 'Ben Awad - @benawad',
      image: 'benawad.png',
      description:
        'Desarrollador full stack y creador de contenido sobre React, GraphQL, TypeScript y Rust. Conocido tanto por sus tutoriales técnicos como por su humor particular. Construye proyectos reales en vivo y comparte el proceso completo.',
      platforms: {
        youtube: 'https://www.youtube.com/@bawad',
        twitter: 'https://x.com/benawad',
        github: 'https://github.com/benawad',
      },
      specialties: ['react', 'graphql', 'typescript', 'full stack', 'rust'],
    },
    {
      id: '17',
      name: 'Jack Herrington - @jherr',
      image: 'jackherrington.png',
      description:
        'Desarrollador senior y educador especializado en patrones avanzados de React, Module Federation y microfrontends. Sus tutoriales profundizan en arquitectura frontend a un nivel que pocos creadores abordan.',
      platforms: {
        youtube: 'https://www.youtube.com/@jherr',
        twitter: 'https://x.com/jherr',
        github: 'https://github.com/jherr',
      },
      specialties: ['react', 'typescript', 'module federation', 'microfrontends', 'arquitectura'],
    },
    {
      id: '18',
      name: 'Fireship - @fireship_dev',
      image: 'fireship.png',
      description:
        'Canal de YouTube reconocido por sus videos ultra-cortos pero densos en información. Sus "X in 100 seconds" son referencia mundial para entender tecnologías rápidamente. Creado por Jeff Delaney, cubre desde Firebase hasta IA y Rust.',
      platforms: {
        youtube: 'https://www.youtube.com/@Fireship',
        twitter: 'https://x.com/fireship_dev',
        github: 'https://github.com/fireship-io',
        page: 'https://fireship.io/',
      },
      specialties: ['javascript', 'firebase', 'web development', 'full stack'],
    },
    {
      id: '19',
      name: 'Sarah Drasner - @sarah_edo',
      image: 'sarahdrasner.png',
      description:
        'Engineering Director en Google y experta mundial en animaciones web y Vue.js. Autora del libro "SVG Animations" y reconocida conferencista internacional. Una de las voces más influyentes en developer experience y herramientas de desarrollo.',
      platforms: {
        twitter: 'https://x.com/sarah_edo',
        github: 'https://github.com/sdras',
        page: 'https://sarah.dev/',
      },
      specialties: ['vue', 'animación', 'css', 'svg', 'developer experience'],
    },
    {
      id: '20',
      name: 'Florin Pop - @florinpop1705',
      image: 'florinpop.png',
      description:
        'Desarrollador y creador de contenido conocido por sus desafíos de programación como el famoso "100 Days 100 Projects". Comparte tutoriales de JavaScript, CSS y React orientados a desarrolladores que aprenden construyendo proyectos reales.',
      platforms: {
        youtube: 'https://www.youtube.com/@FlorinPop',
        twitter: 'https://x.com/florinpop1705',
        github: 'https://github.com/florinpop17',
        page: 'https://florin-pop.com/',
      },
      specialties: ['javascript', 'css', 'react', 'web development', 'desafíos'],
    },
    {
      id: '21',
      name: 'Carlos Azaustre - @carlosazaustre',
      image: 'carlosazaustre.png',
      description:
        'Google Developer Expert en Web Technologies y uno de los referentes del desarrollo web en español. Comparte contenido sobre JavaScript, React, Node.js y arquitectura web desde hace más de 10 años. Con más de 100k seguidores en YouTube.',
      platforms: {
        youtube: 'https://www.youtube.com/@carlosazaustre',
        twitter: 'https://x.com/carlosazaustre',
        github: 'https://github.com/carlosazaustre',
        linkedin: 'https://www.linkedin.com/in/carlosazaustre/',
        page: 'https://carlosazaustre.es/',
      },
      specialties: ['javascript', 'react', 'nodejs', 'typescript', 'web development'],
    },
    {
      id: '22',
      name: 'Fazt - @FaztTech',
      image: 'fazt.png',
      description:
        'Creador de contenido latinoamericano con más de 400k suscriptores. Cubre una enorme variedad de tecnologías: JavaScript, Go, Rust, Python, bases de datos y más. Sus tutoriales son claros, directos y muy bien valorados por la comunidad hispanohablante.',
      platforms: {
        youtube: 'https://www.youtube.com/@FaztTech',
        twitter: 'https://x.com/faztm',
        github: 'https://github.com/FaztWeb',
      },
      specialties: ['javascript', 'golang', 'python', 'nodejs', 'web development'],
    },
    {
      id: '23',
      name: 'S4vitar - @s4vitar',
      image: 's4vitar.png',
      description:
        'Marcelo Vázquez, referente de la ciberseguridad ofensiva en habla hispana. Experto en hacking ético, pentesting y CTF. Su plataforma hack4u es una de las más reconocidas para aprender seguridad informática desde cero de forma estructurada.',
      platforms: {
        youtube: 'https://www.youtube.com/@s4vitar',
        twitter: 'https://x.com/s4vitar',
        github: 'https://github.com/s4vitar',
        page: 'https://hack4u.io/',
      },
      specialties: ['ciberseguridad', 'hacking ético', 'linux', 'python', 'pentesting'],
    },
    {
      id: '24',
      name: 'Gentleman Programming - @GentlemanCoding',
      image: 'gentlemanprogramming.png',
      description:
        'Alan Buscaglia, desarrollador argentino y creador de contenido sobre buenas prácticas, arquitectura limpia y el ecosistema Angular/TypeScript. Sus videos abordan temas avanzados de frontend con un estilo didáctico y muy entretenido.',
      platforms: {
        youtube: 'https://www.youtube.com/@GentlemanProgramming',
        twitter: 'https://x.com/GentlemanCoding',
        github: 'https://github.com/Gentleman-Programming',
      },
      specialties: ['typescript', 'angular', 'rxjs', 'arquitectura', 'frontend'],
    },
    {
      id: '25',
      name: 'Matt Pocock - @mattpocockuk',
      image: 'mattpocock.png',
      description:
        'El mayor referente mundial de TypeScript avanzado. Creador de Total TypeScript, el recurso más completo para dominar el sistema de tipos de TypeScript. Sus workshops y artículos son usados por equipos de las empresas más importantes del mundo.',
      platforms: {
        youtube: 'https://www.youtube.com/@mattpocockuk',
        twitter: 'https://x.com/mattpocockuk',
        github: 'https://github.com/mattpocock',
        page: 'https://www.totaltypescript.com/',
      },
      specialties: ['typescript', 'react', 'tipos avanzados', 'open source'],
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
            <Heading2 className="m-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                <Users className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Influencers</span>
            </Heading2>
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
