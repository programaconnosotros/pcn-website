import { getBestAdvises } from '@/actions/advises/get-best-advises';
import { AdviseCard } from '../advises/advise-card';
import Link from 'next/link';

export const BestAdvises = async () => {
  const bestAdvises = await getBestAdvises();

  if (!bestAdvises) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <h2 className="text-lg font-bold text-white">Mejores consejos</h2>

      <div className="flex w-full flex-col gap-4">
        {bestAdvises.map((advise) => (
          <AdviseCard key={advise.id} advise={advise} session={null} />
        ))}
      </div>

      <Link href="/advises" className="text-sm text-white">
        Ver todos los consejos
      </Link>
    </div>
  );
};
