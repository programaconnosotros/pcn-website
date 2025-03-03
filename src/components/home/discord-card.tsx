import Link from 'next/link';
import { Heading3 } from '@components/ui/heading-3';
import { Button } from '@components/ui/button';
import { SquareArrowOutUpRight } from 'lucide-react';

export const DiscordCard = () => (
  <div className="flex h-fit flex-col rounded-md border p-6">
    <Heading3>No te pierdas de nada</Heading3>

    <p className="mb-4 mt-2 text-sm text-muted-foreground">
      En Discord tenemos más de 600 miembros con los que podés interactuar por chat, por llamadas de
      voz y video, compartir pantalla, chusmear sesiones de pair-programming y mucho más. Sumate y
      lleva tu carrera al siguiente nivel!
    </p>

    <img alt="Discord" src="/discord-demo.png" className="w-full object-cover" />

    <div className="flex w-full justify-center">
      <Link className="w-full" href="https://discord.gg/dTQexKw56S" target="_blank">
        <Button className="flex w-full flex-row gap-2" variant="outline">
          Ir a Discord <SquareArrowOutUpRight size={16} />
        </Button>
      </Link>
    </div>
  </div>
);
