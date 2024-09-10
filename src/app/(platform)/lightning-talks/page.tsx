import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
import { Youtube, Zap } from 'lucide-react';
import Link from 'next/link';

type LightningTalk = {
  name: string;
  speakerName: string;
  speakerPhoto: string;
  date: Date;
  youtubeUrl?: string;
};

const lightningTalks: LightningTalk[] = [
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

  {
    name: 'Sitios para alojar repositorios de Git',
    speakerName: 'Camila Rodriguez',
    speakerPhoto: '/lightning-talks/camila-rodriguez.jpeg',
    date: new Date('2021-10-09'),
  },
  {
    name: 'Creación de repositorios en GitHub y conexión a repositorio local',
    speakerName: 'Marcelo Núñez',
    speakerPhoto: '/lightning-talks/marcelo-nunez.jpeg',
    date: new Date('2021-10-09'),
  },
  {
    name: 'Subida de cambios locales a repositorio de GitHub',
    speakerName: 'Lucas Pérez',
    speakerPhoto: '/lightning-talks/lucas-perez.jpeg',
    date: new Date('2021-10-09'),
  },
  {
    name: 'Conflictos y soluciones trabajando en equipo usando Git y GitHub',
    speakerName: 'Mauricio Sánchez y Tobías Paz Posse',
    speakerPhoto: '/lightning-talks/mauricio-tobias.jpeg',
    date: new Date('2021-10-09'),
  },
  {
    name: 'Repaso de conceptos básicos de computación y desarrollo de software',
    speakerName: 'Lucas Perez',
    speakerPhoto: '/lightning-talks/lucas-perez.jpeg',
    date: new Date('2021-06-26'),
  },
  {
    name: '¿Qué es un sistema de control de versiones y cómo nos beneficia utilizarlo?',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2021-06-26'),
  },
  {
    name: 'Conceptos fundamentales de Git',
    speakerName: 'Marcelo Nuñez',
    speakerPhoto: '/lightning-talks/marcelo-nunez.jpeg',
    date: new Date('2021-06-26'),
  },
  {
    name: 'Instalación de Git en Windows y Linux',
    speakerName: 'Jeremías Moreno Ivanoff',
    speakerPhoto: '/lightning-talks/jeremias-moreno-ivanoff.jpeg',
    date: new Date('2021-06-26'),
  },
  {
    name: 'Workflow básico local con Git',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/agustin-sanchez.jpeg',
    date: new Date('2021-06-26'),
  },
  {
    name: 'Claves de la Ingeniería en Sistemas',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/agustin-sanchez.jpeg',
    date: new Date('2021-04-24'),
  },
  {
    name: '¿Qué es un Algoritmo?',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2021-04-24'),
  },
  {
    name: 'Terminal vs. Interfaz Gráfica',
    speakerName: 'Jeremías Moreno Ivanoff',
    speakerPhoto: '/lightning-talks/jeremias-moreno-ivanoff.jpeg',
    date: new Date('2021-04-24'),
  },
  {
    name: 'Superando la Facultad Virtual con un Equipo',
    speakerName: 'Gadiel Scharf y Tobías Paz Posse',
    speakerPhoto: '/lightning-talks/gadiel-tobias.jpeg',
    date: new Date('2021-04-24'),
  },
  {
    name: 'Herramientas para el Trabajo en Equipo',
    speakerName: 'Gadiel Scharf y Tobías Paz Posse',
    speakerPhoto: '/lightning-talks/gadiel-tobias.jpeg',
    date: new Date('2021-04-24'),
  },
  {
    name: 'La Visión Sistémica en la Programación',
    speakerName: 'Germán Navarro',
    speakerPhoto: '/lightning-talks/german-navarro.jpeg',
    date: new Date('2021-04-24'),
  },
  {
    name: 'El Camino del Programador',
    speakerName: 'Esteban Sánchez',
    speakerPhoto: '/lightning-talks/esteban-sanchez.jpeg',
    date: new Date('2021-04-24'),
  },
  {
    name: '¿Qué es Linux? ¿Qué es una distribución?',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2020-11-28'),
    youtubeUrl: 'https://www.youtube.com/live/t41jcBED8y0?si=TRYJWUVIj_XAxaq3&t=214',
  },
  {
    name: '¿Por qué la gente le tiene miedo a Linux?',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/agustin-sanchez.jpeg',
    date: new Date('2020-11-28'),
    youtubeUrl: 'https://www.youtube.com/live/t41jcBED8y0?si=lEiOYsrQDKkUwkMc&t=559',
  },
  {
    name: '¿Qué es un entorno de escritorio?',
    speakerName: 'Esteban Sánchez',
    speakerPhoto: '/lightning-talks/esteban-sanchez.jpeg',
    date: new Date('2020-11-28'),
    youtubeUrl: 'https://www.youtube.com/live/t41jcBED8y0?si=s4ml8mAJTKJ413Ph&t=1284',
  },
  {
    name: 'One Line Linux',
    speakerName: 'Marcelo Nuñez',
    speakerPhoto: '/lightning-talks/marcelo-nunez.jpeg',
    date: new Date('2020-11-28'),
    youtubeUrl: 'https://www.youtube.com/live/t41jcBED8y0?si=yXcElQHdNoBIFRUF&t=1530',
  },
  {
    name: 'Revisión de conceptos básicos de Git',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/agustin-sanchez.jpeg',
    date: new Date('2020-10-24'),
    youtubeUrl: 'https://www.youtube.com/live/Nb0qN3x3Wfs?si=TvQENg_AF2Wro5f1&t=987',
  },
  {
    name: 'Sitios web para alojar repositorios de Git',
    speakerName: 'Iván Taddei',
    speakerPhoto: '/lightning-talks/ivan-taddei.jpeg',
    date: new Date('2020-10-24'),
    youtubeUrl: 'https://www.youtube.com/live/Nb0qN3x3Wfs?si=Nset4A1cy_o76QR4&t=2252',
  },
  {
    name: 'Creación de repositorio en GitHub y conexión a repositorio local',
    speakerName: 'Marcelo Núñez',
    speakerPhoto: '/lightning-talks/marcelo-nunez.jpeg',
    date: new Date('2020-10-24'),
    youtubeUrl: 'https://www.youtube.com/live/Nb0qN3x3Wfs?si=FxBJof6AqcRWVCXf&t=2743',
  },
  {
    name: 'Clonación de repositorio de GitHub',
    speakerName: 'Agustín Lencina',
    speakerPhoto: '/lightning-talks/agustin-lencina.jpeg',
    date: new Date('2020-10-24'),
    youtubeUrl: 'https://www.youtube.com/live/Nb0qN3x3Wfs?si=Y_Dkqt1I8O1qmmqq&t=3694',
  },
  {
    name: 'Subida de cambios locales a repositorio de GitHub',
    speakerName: 'Esteban Sánchez',
    speakerPhoto: '/lightning-talks/esteban-sanchez.jpeg',
    date: new Date('2020-10-24'),
    youtubeUrl: 'https://www.youtube.com/live/Nb0qN3x3Wfs?si=M4MUtBD-CW9XhX3z&t=4222',
  },
  {
    name: 'Trabajo en repositorios compartidos de GitHub',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2020-10-24'),
    youtubeUrl: 'https://www.youtube.com/live/Nb0qN3x3Wfs?si=JjChJbKXI8nw2VXi&t=4772',
  },
  {
    name: 'Conflictos y su solución trabajando en equipo usando Git y GitHub',
    speakerName: 'Germán Navarro & Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/german-mauricio.jpeg',
    date: new Date('2020-10-24'),
    youtubeUrl: 'https://www.youtube.com/live/Nb0qN3x3Wfs?si=oIZvZoLA1vWjR7Lb&t=5551',
  },
  {
    name: 'Introducción conceptual a bases de datos',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2020-09-19'),
    youtubeUrl: 'https://www.youtube.com/live/o-rHlSQHNEk?si=0eP6jjlNw-xfzw_W&t=1057',
  },
  {
    name: 'Introducción a las redes de computadoras',
    speakerName: 'Agustín Sánchez, Ivan Taddei & Marcelo Nuñez',
    speakerPhoto: '/lightning-talks/agustin-ivan-marcelo.jpeg',
    date: new Date('2020-09-19'),
    youtubeUrl: 'https://www.youtube.com/live/o-rHlSQHNEk?si=w_Bh1R7asBNfLL09&t=1553',
  },
  {
    name: 'Redes en juegos online',
    speakerName: 'German Navarro',
    speakerPhoto: '/lightning-talks/german-navarro.jpeg',
    date: new Date('2020-09-19'),
    youtubeUrl: 'https://www.youtube.com/live/o-rHlSQHNEk?si=VPc2D5X-sbc_iN8u&t=2316',
  },
  {
    name: 'Sobrecarga vs Polimorfismo',
    speakerName: 'Facundo Gelatti',
    speakerPhoto: '/lightning-talks/facundo-gelatti.jpeg',
    date: new Date('2020-09-19'),
    youtubeUrl: 'https://www.youtube.com/live/o-rHlSQHNEk?si=zXUtSGCEJBnflfIe&t=2808',
  },
  {
    name: '¿Qué son los puertos en redes informáticas?',
    speakerName: 'Agustín Lencina',
    speakerPhoto: '/lightning-talks/agustin-lencina.jpeg',
    date: new Date('2020-09-19'),
    youtubeUrl: 'https://www.youtube.com/live/o-rHlSQHNEk?si=zBEWxgpnEd8NaWM-&t=3620',
  },
  {
    name: 'Sistemas de gestión de bases de datos. Uso de comandos y ejemplos',
    speakerName: 'Franco Tarchini',
    speakerPhoto: '/lightning-talks/franco-tarchini.jpeg',
    date: new Date('2020-09-19'),
    youtubeUrl: 'https://www.youtube.com/live/o-rHlSQHNEk?si=1kuz4w_m-e27BYHx&t=4140',
  },
  {
    name: 'Búsqueda web y fuentes de información',
    speakerName: 'David Leila',
    speakerPhoto: '/lightning-talks/david-leila.jpeg',
    date: new Date('2020-08-01'),
    youtubeUrl: 'https://www.youtube.com/live/cZiYoiNyVN0?si=NHQUbJAPLOJdlLba&t=5620s',
  },
  {
    name: 'Programación competitiva',
    speakerName: 'Esteban Sánchez & Iván Taddei',
    speakerPhoto: '/lightning-talks/esteban-ivan.jpeg',
    date: new Date('2020-08-01'),
    youtubeUrl: 'https://www.youtube.com/live/cZiYoiNyVN0?si=8ZMRFwhD3emaK01Y&t=3960',
  },
  {
    name: 'Filosofía del software: Charlando sobre software libre, privativo, código abierto, etc.',
    speakerName: 'Agustín Sánchez & Marcelo Nuñez',
    speakerPhoto: '/lightning-talks/agustin-marcelo.jpeg',
    date: new Date('2020-08-01'),
    youtubeUrl: 'https://www.youtube.com/live/cZiYoiNyVN0?si=jHJbsyUeeKjLGWTN&t=1391',
  },
  {
    name: '¿De qué se trata la ingeniería en sistemas de información?',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/agustin-sanchez.jpeg',
    date: new Date('2020-07-04'),
    youtubeUrl: 'https://www.youtube.com/live/L4RP34KjHns?si=fkbuYOhExaCzCzmY&t=632',
  },
  {
    name: 'Introducción al desarrollo de videojuegos con Godot Engine',
    speakerName: 'Germán Navarro',
    speakerPhoto: '/lightning-talks/german-navarro.jpeg',
    date: new Date('2020-07-04'),
    youtubeUrl: 'https://www.youtube.com/live/L4RP34KjHns?si=-IK0Gp2rTMTi2cxQ&t=2345',
  },
  {
    name: 'Funciones recursivas',
    speakerName: 'Esteban Sánchez',
    speakerPhoto: '/lightning-talks/esteban-sanchez.jpeg',
    date: new Date('2020-07-04'),
    youtubeUrl: 'https://www.youtube.com/live/L4RP34KjHns?si=lZtUBr3TNpo-yYG6&t=3491',
  },
  {
    name: 'Aplicación insegura = desastre en el sistema operativo',
    speakerName: 'Marcelo Núñez',
    speakerPhoto: '/lightning-talks/marcelo-nunez.jpeg',
    date: new Date('2020-07-04'),
    youtubeUrl: 'https://www.youtube.com/live/L4RP34KjHns?si=NxC6oQu8ZsMtEtDI&t=5255',
  },
  {
    name: 'DevOps, cultura y cambio',
    speakerName: 'Marco Canevaro',
    speakerPhoto: '/lightning-talks/marco-canevaro.jpeg',
    date: new Date('2020-07-04'),
    youtubeUrl: 'https://www.youtube.com/live/L4RP34KjHns?si=A4heB1QGNAJm9pJK&t=7045',
  },
  {
    name: 'Deno... y no es sólo un acrónimo de Node',
    speakerName: 'Agustín Lencina',
    speakerPhoto: '/lightning-talks/agustin-lencina.jpeg',
    date: new Date('2020-07-04'),
    youtubeUrl: 'https://www.youtube.com/live/L4RP34KjHns?si=lGkJ9ClsGH9NxM5G&t=7890',
  },
  {
    name: 'Patrón de diseño orientado a objetos "Observer"',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2020-07-04'),
    youtubeUrl: 'https://www.youtube.com/live/L4RP34KjHns?si=NRFGpSTE7D0VWJvw&t=9400',
  },
];

const LightningTalks = () => (
  <div className="mt-4 md:px-20">
    <div className="mb-8 flex w-full flex-row items-center justify-between">
      <Heading2>Lightning Talks</Heading2>

      <Link className="block" href="https://wa.me/5493815777562">
        <Button className="flex flex-row items-center gap-2">
          Quiero dar una charla
          <Zap className="h-5 w-5" />
        </Button>
      </Link>
    </div>

    <div className="my-5 ml-0 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

            <CardFooter>
              {talk.youtubeUrl && (
                <Link href={talk.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="mt-2 flex w-full items-center gap-2" variant="youtube">
                    Ver en YouTube
                    <Youtube className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardFooter>
          </Card>
        ))}
    </div>
  </div>
);

export default LightningTalks;
