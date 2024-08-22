'use client';

import { ThemeToggle } from '../themes/theme-toggle';
import { AddAdvise } from './add-advise';
import { Advise } from './advise';

const advises = [
  {
    id: 1,
    author: {
      name: 'Jane Doe',
      avatar: '/placeholder.svg?height=40&width=40',
      subtitle: 'Senior Developer @TechCorp',
    },
    content:
      'Siempre escribe código autodescriptivo. Usa nombres de variables y funciones claros que describan lo que hacen. Te ahorrará a ti y a tu equipo mucho tiempo a largo plazo.',
    likes: 42,
    comments: 5,
  },
  {
    id: 2,
    author: {
      name: 'John Smith',
      avatar: '/placeholder.svg?height=40&width=40',
      subtitle: 'Software Architect @InnovativeSolutions',
    },
    content:
      'No optimices prematuramente. Primero haz que funcione, luego hazlo bien, y finalmente hazlo rápido. Pero solo si no es lo suficientemente rápido ya.',
    likes: 38,
    comments: 7,
  },
  {
    id: 3,
    author: {
      name: 'Alice Johnson',
      avatar: '/placeholder.svg?height=40&width=40',
      subtitle: 'Full Stack Developer @Eagerworks',
    },
    content:
      'Aprende a usar el control de versiones de manera efectiva. Git no es solo para hacer copias de seguridad de tu código, es una herramienta poderosa para la colaboración y la gestión del historial de tu proyecto.',
    likes: 55,
    comments: 10,
  },
];

const Advises = ({
  advises,
}: {
  advises: {
    id: string;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string;
    };
  }[];
}) => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
          <h1 className="text-lg font-semibold">
            <code>programaConNosotros</code>
          </h1>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* <SignOut /> */}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl p-4">
        <AddAdvise />

        <div className="space-y-4">
          {advises.map((advise) => (
            <Advise key={advise.id} advise={advise} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Advises;
