import fs from 'fs';
import path from 'path';
import { InfluencerCard } from '@/components/influencers/influencer-card';
import { Influencer, InfluencersData } from '@/types/influencer';

export const metadata = {
  title: 'Influencers - PCN',
  description: 'Conoce a los influencers que forman parte de nuestra comunidad.',
};

export default async function InfluencersPage() {
  // Leer el archivo JSON de influencers
  const filePath = path.join(process.cwd(), 'public', 'influencers', 'influencers.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const data: InfluencersData = JSON.parse(fileContents);

  return (
    <div className="mt-4 md:max-w-screen-xl md:px-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Influencers de la Comunidad</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Conoce a los creadores de contenido que comparten sus conocimientos y experiencias con la
          comunidad.
        </p>
      </div>

      <div className="space-y-6">
        {data.influencers.map((influencer: Influencer) => (
          <InfluencerCard key={influencer.id} influencer={influencer} />
        ))}
      </div>
    </div>
  );
}
