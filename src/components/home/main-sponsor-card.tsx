'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { HandHeart } from 'lucide-react';
import Link from 'next/link';

export const MainSponsorCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Sponsors</CardTitle>

      <CardDescription>
        <p className="mt-3">
          Estamos en búsqueda de sponsors para este proyecto. Podemos mostrar tu logo aquí y tu
          sitio web, para que miles de profesionales y estudiantes de la industria del software lo
          vean y sepan de tu interés en apoyar este tipo de iniciativas.
        </p>
      </CardDescription>
    </CardHeader>

    <CardContent className="flex flex-col">
      <Link className="block" href="https://wa.me/5493815777562">
        <Button className="mt-4 flex flex-row items-center gap-2">
          Quiero ser sponsor
          <HandHeart className="h-5 w-5" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);
