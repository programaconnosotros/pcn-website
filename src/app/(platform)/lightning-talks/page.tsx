import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';

export default function LightningTalks() {
  return (
    <div className="mt-4 md:px-20">
      <Heading2>Lightning Talks</Heading2>

      <Heading3>Primera edición</Heading3>

      <p className="mt-3">
        La primera edición de Lightning Talks se realizó en julio del 2020, en directo por el canal
        de YouTube de la comunidad. Estabamos en cuarentena por la pandemia de COVID-19 y no quedaba
        otra que hacer el evento por internet.
      </p>
    </div>
  );
}
