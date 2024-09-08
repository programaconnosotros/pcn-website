import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';

const lightningTalks = [
  {
    name: 'Arquitectura de software: frontend, backend, bases de datos y más',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/arquitectura-software.jpeg',
    date: new Date('2023-05-06'),
  },
  {
    name: 'Arquitectura modular en aplicaciones móviles',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/arquitectura-modular.jpeg',
    date: new Date('2023-05-06'),
  },
  {
    name: 'Depuración de código',
    speakerName: 'Tobías Paz Posse',
    speakerPhoto: '/lightning-talks/debugging.jpeg',
    date: new Date('2023-05-06'),
  },
  {
    name: 'Paradigmas de programación',
    speakerName: 'Marcelo Núñez',
    speakerPhoto: '/lightning-talks/paradigmas.jpeg',
    date: new Date('2023-05-06'),
  },
  {
    name: 'Programación optimizada con ChatGPT',
    speakerName: 'Facundo Bazán',
    speakerPhoto: '/lightning-talks/chatgpt.jpeg',
    date: new Date('2023-05-06'),
  },
  {
    name: 'Java funcional: agilizando el procesamiento de datos',
    speakerName: 'Marcelo Núñez',
    speakerPhoto: '/lightning-talks/java-funcional.jpeg',
    date: new Date('2023-05-06'),
  },
  {
    name: 'Database indexing',
    speakerName: 'Josefina Japaze',
    speakerPhoto: '/lightning-talks/database-indexing.jpeg',
    date: new Date('2023-09-16'),
  },
  {
    name: 'Introducción al unit testing',
    speakerName: 'Tobías Paz Posse',
    speakerPhoto: '/lightning-talks/unit-testing.jpg',
    date: new Date('2023-09-16'),
  },
  {
    name: 'Domain-driven design, hexagonal architecture & vertical slicing',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/ddd-y-hexagonal.jpg',
    date: new Date('2023-09-16'),
  },
  {
    name: 'Diseño perfecto',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/diseno-perfecto.jpeg',
    date: new Date('2023-09-16'),
  },
];

const LightningTalks = () => (
  <div className="container mx-auto py-8">
    <Heading2>Lightning Talks</Heading2>

    <div className="my-5 ml-0 grid grid-cols-1 gap-5 md:mr-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {lightningTalks
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((talk, index) => (
          <Card key={index}>
            <div className="relative aspect-video">
              <img
                src={talk.speakerPhoto}
                alt={`${talk.speakerName}'s photo`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{talk.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{talk.speakerName}</p>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-muted-foreground">
                {new Date(talk.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
    </div>
  </div>
);

export default LightningTalks;
