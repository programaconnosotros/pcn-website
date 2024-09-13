import Link from 'next/link';
import { Button } from '@components/ui/button';

export const Discord = () => (
  <section className="w-full py-12 dark:bg-black md:py-24 lg:py-32">
    <div className="container px-4 md:px-6">
      <div className="flex flex-col items-center space-y-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Sumate en Discord!</h2>

        <img alt="Discord" height="310" src="/discord-demo.png" />

        <p className="mx-auto max-w-[800px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Tenemos canales de texto y voz para que puedas interactuar con los miembros de la
          comunidad, y un foro súper copado donde podes encontrar o compartir información valiosa!
        </p>

        <p className="mx-auto max-w-[800px] text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          Ya seas un desarrollador súper experimentado, o una persona que recién está empezando a
          explorar el universo de la programación, todos son bienvenidos en nuestra comunidad.
          Animate!
        </p>

        <Link href="https://discord.gg/dTQexKw56S" target="_blank">
          <Button className="mt-8">Ir a Discord</Button>
        </Link>
      </div>
    </div>
  </section>
);
