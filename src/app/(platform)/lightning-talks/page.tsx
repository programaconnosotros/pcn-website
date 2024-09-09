import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heading2 } from '@/components/ui/heading-2';
import { Podcast } from 'lucide-react';
import Link from 'next/link';

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
  },
  {
    name: '¿Por qué la gente le tiene miedo a Linux?',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/agustin-sanchez.jpeg',
    date: new Date('2020-11-28'),
  },
  {
    name: '¿Qué es un entorno de escritorio?',
    speakerName: 'Esteban Sánchez',
    speakerPhoto: '/lightning-talks/esteban-sanchez.jpeg',
    date: new Date('2020-11-28'),
  },
  {
    name: 'One Line Linux',
    speakerName: 'Marcelo Nuñez',
    speakerPhoto: '/lightning-talks/marcelo-nunez.jpeg',
    date: new Date('2020-11-28'),
  },
  {
    name: 'Revisión de conceptos básicos de Git',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/agustin-sanchez.jpeg',
    date: new Date('2020-10-24'),
  },
  {
    name: 'Sitios web para alojar repositorios de Git',
    speakerName: 'Iván Taddei',
    speakerPhoto: '/lightning-talks/ivan-taddei.jpeg',
    date: new Date('2020-10-24'),
  },
  {
    name: 'Creación de repositorio en GitHub y conexión a repositorio local',
    speakerName: 'Marcelo Núñez',
    speakerPhoto: '/lightning-talks/marcelo-nunez.jpeg',
    date: new Date('2020-10-24'),
  },
  {
    name: 'Clonación de repositorio de GitHub',
    speakerName: 'Agustín Lencina',
    speakerPhoto: '/lightning-talks/agustin-lencina.jpeg',
    date: new Date('2020-10-24'),
  },
  {
    name: 'Subida de cambios locales a repositorio de GitHub',
    speakerName: 'Esteban Sánchez',
    speakerPhoto: '/lightning-talks/esteban-sanchez.jpeg',
    date: new Date('2020-10-24'),
  },
  {
    name: 'Trabajo en repositorios compartidos de GitHub',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2020-10-24'),
  },
  {
    name: 'Conflictos y su solución trabajando en equipo usando Git y GitHub',
    speakerName: 'Germán Navarro y Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/german-mauricio.jpeg',
    date: new Date('2020-10-24'),
  },
  {
    name: 'Introducción conceptual a bases de datos',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2020-09-19'),
  },
  {
    name: 'Introducción a las redes de computadoras',
    speakerName: 'Agustín Sánchez, Ivan Taddei y Marcelo Nuñez',
    speakerPhoto: '/lightning-talks/agustin-ivan-marcelo.jpeg',
    date: new Date('2020-09-19'),
  },
  {
    name: 'Redes en juegos online',
    speakerName: 'German Navarro',
    speakerPhoto: '/lightning-talks/german-navarro.jpeg',
    date: new Date('2020-09-19'),
  },
  {
    name: 'Sobrecarga vs Polimorfismo',
    speakerName: 'Facundo Gelatti',
    speakerPhoto: '/lightning-talks/facundo-gelatti.jpeg',
    date: new Date('2020-09-19'),
  },
  {
    name: '¿Qué son los puertos en redes informáticas?',
    speakerName: 'Agustín Lencina',
    speakerPhoto: '/lightning-talks/agustin-lencina.jpeg',
    date: new Date('2020-09-19'),
  },
  {
    name: 'Sistemas de gestión de bases de datos. Uso de comandos y ejemplos',
    speakerName: 'Franco Tarchini',
    speakerPhoto: '/lightning-talks/franco-tarchini.jpeg',
    date: new Date('2020-09-19'),
  },
  {
    name: 'Búsqueda web y fuentes de información',
    speakerName: 'David Leila',
    speakerPhoto: '/lightning-talks/david-leila.jpeg',
    date: new Date('2020-08-01'),
  },
  {
    name: 'Programación competitiva',
    speakerName: 'Esteban Sánchez, Iván Taddei',
    speakerPhoto: '/lightning-talks/esteban-ivan.jpeg',
    date: new Date('2020-08-01'),
  },
  {
    name: 'Charlando sobre software libre, privativo, código abierto, etc.',
    speakerName: 'Agustín Sánchez, Marcelo Nuñez',
    speakerPhoto: '/lightning-talks/agustin-marcelo.jpeg',
    date: new Date('2020-08-01'),
  },
  {
    name: '¿De qué se trata la ingeniería en sistemas de información?',
    speakerName: 'Agustín Sánchez',
    speakerPhoto: '/lightning-talks/agustin-sanchez.jpeg',
    date: new Date('2020-07-04'),
  },
  {
    name: 'Introducción al desarrollo de videojuegos con Godot Engine',
    speakerName: 'Germán Navarro',
    speakerPhoto: '/lightning-talks/german-navarro.jpeg',
    date: new Date('2020-07-04'),
  },
  {
    name: 'Funciones recursivas',
    speakerName: 'Esteban Sánchez',
    speakerPhoto: '/lightning-talks/esteban-sanchez.jpeg',
    date: new Date('2020-07-04'),
  },
  {
    name: 'Aplicación insegura = desastre en el sistema operativo',
    speakerName: 'Marcelo Núñez',
    speakerPhoto: '/lightning-talks/marcelo-nunez.jpeg',
    date: new Date('2020-07-04'),
  },
  {
    name: 'DevOps, cultura y cambio',
    speakerName: 'Marco Canevaro',
    speakerPhoto: '/lightning-talks/marco-canevaro.jpeg',
    date: new Date('2020-07-04'),
  },
  {
    name: 'Deno... y no es sólo un acrónimo de Node',
    speakerName: 'Agustín Lencina',
    speakerPhoto: '/lightning-talks/agustin-lencina.jpeg',
    date: new Date('2020-07-04'),
  },
  {
    name: 'Patrón de diseño orientado a objetos "Observer"',
    speakerName: 'Mauricio Sánchez',
    speakerPhoto: '/lightning-talks/mauricio-sanchez.jpeg',
    date: new Date('2020-07-04'),
  },
];

const LightningTalks = () => (
  <div className="mt-4 md:px-20">
    <div className="flex w-full flex-row items-center justify-between">
      <Heading2>Lightning Talks</Heading2>

      <Link className="block" href="https://wa.me/5493815777562">
        <Button className="mt-4 flex flex-row items-center gap-2">
          Quiero dar una charla
          <Podcast className="h-5 w-5" />
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
          </Card>
        ))}
    </div>
  </div>
);

export default LightningTalks;
