import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        programaConNosotros
      </h1>

      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Comunidad nerd de programación e ingeniería de software en general. Sumate para compartir
        conocimiento, experiencia y conocer más gente copada 🙌
      </p>

      <div className="mt-5 flex flex-row gap-2">
        <Link href="/join">
          <Button>Quiero unirme 🤚</Button>
        </Link>

        <Link href="/lightning-talks">
          <Button variant="outline">Lightning Talks ⚡️</Button>
        </Link>

        <Link href="/advises">
          <Button variant="outline">Consejos 👌</Button>
        </Link>
      </div>
    </main>
  );
}
