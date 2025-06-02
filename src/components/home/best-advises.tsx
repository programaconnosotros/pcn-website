import { getBestAdvises } from '@/actions/advises/get-best-advises';
import { AdviseCard } from '../advises/advise-card';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export const BestAdvises = async () => {
  const bestAdvises = await getBestAdvises();

  if (!bestAdvises) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <h2 className="text-lg font-bold text-white">Mejores consejos</h2>

      <ScrollArea className="w-96 whitespace-nowrap">
        <div className="flex w-max space-x-4">
          {bestAdvises.map((advise) => (
            <div key={advise.id} className="shrink-0">
              <AdviseCard advise={advise} session={null} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Link href="/advises" className="text-sm text-white">
        Ver todos los consejos
      </Link>
    </div>
  );
};
