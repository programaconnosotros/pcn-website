import { InfluencerCard } from '@/components/influencers/influencer-card';

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
        'Creador de Contenido sobre Programación y Tecnología además de Ingeniero de Software, con más de 15 años de experiencia. Cuenta con una comunidad de más de 700k de seguidores en sus redes sociales. Su canal de programación en Twitch es el más visto en el mundo de habla hispana. Uno de los divulgadores más influyentes en el mundo de JavaScript según la encuesta mundial State of JS.',
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
        'Desarrollador Full Stack con más de 10 años de experiencia. Comparte tutoriales sobre programación, tecnologías y herramientas de desarrollo. Cuenta con una comunidad de más de 100k de seguidores en sus redes sociales.',
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
        'Hola 👋🏼 Mi nombre es Brais Moure. Soy ingeniero de software desde 2010. Actualmente trabajo como freelance fullstack y creo contenido formativo sobre programación y desarrollo en redes',
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
    <div className="mt-4 md:max-w-screen-xl md:px-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Influencers</h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Te presentamos algunas personas o grupos que consideramos referentes en el mundo del
          software.
        </p>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Si queres sumar a alguien, avisa por WhatsApp o Discord!
        </p>
      </div>

      <div className="mb-4 space-y-6">
        {influencersData.influencers.map((influencer: Influencer) => (
          <InfluencerCard key={influencer.id} influencer={influencer} />
        ))}
      </div>
    </div>
  );
}
