'use client';

import { Heading2 } from '@/components/ui/heading-2';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, MessageCircle, Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';

interface Title {
  id: string;
  title: string;
  director: string;
  type: 'Serie' | 'Película';
  genre: string;
  description: string;
  year?: number;
  poster: string;
}

const featuredOrder = [
  'Silicon Valley',
  'Mr. Robot',
  'The Social Network',
  'Jobs',
  'Snowden',
  'The Imitation Game',
];

const titles: Title[] = [
  {
    id: '1',
    title: 'General Magic',
    director: 'Sarah Kerruish, Matt Maude',
    type: 'Película',
    genre: 'Documental',
    description:
      'La historia de General Magic, la startup más importante de la que nunca has oído hablar. Fundada por ex-empleados de Apple, sus creadores inventaron tecnologías que darían forma al iPhone y al mundo digital moderno, décadas antes de que el mundo estuviera listo.',
    year: 2018,
    poster: '/series-y-peliculas/general-magic.jpg',
  },
  {
    id: '2',
    title: 'Hackers',
    director: 'Iain Softley',
    type: 'Película',
    genre: 'Thriller',
    description:
      'Un grupo de jóvenes hackers descubre un virus informático que podría usarse para causar un desastre ecológico masivo. Clásico de culto de los años 90 que capturó el imaginario de la cultura hacker y la contracultura digital.',
    year: 1995,
    poster: '/series-y-peliculas/hackers.jpg',
  },
  {
    id: '3',
    title: 'Halt and Catch Fire',
    director: 'Christopher Cantwell, Christopher C. Rogers',
    type: 'Serie',
    genre: 'Drama',
    description:
      'Ambientada en los años 80 y 90, sigue a un equipo de visionarios que intentan construir el futuro de la computación personal. Una exploración íntima y honesta de la industria tecnológica, la creatividad, el liderazgo y el costo humano de la innovación.',
    year: 2014,
    poster: '/series-y-peliculas/halt-and-catch-fire.jpg',
  },
  {
    id: '4',
    title: 'Jobs',
    director: 'Joshua Michael Stern',
    type: 'Película',
    genre: 'Biográfica',
    description:
      'Biopic que retrata la vida de Steve Jobs desde sus días en Reed College hasta la revolución del iPod. Ashton Kutcher interpreta al cofundador de Apple mostrando su visión, su genio y sus contradicciones personales.',
    year: 2013,
    poster: '/series-y-peliculas/jobs.jpg',
  },
  {
    id: '5',
    title: 'Mr. Robot',
    director: 'Sam Esmail',
    type: 'Serie',
    genre: 'Thriller',
    description:
      'Elliot Alderson, un ingeniero de ciberseguridad con trastornos de ansiedad social, es reclutado por un misterioso anarquista conocido como Mr. Robot para destruir la corporación para la que trabaja. Considerada la representación más técnicamente precisa del hacking en la ficción.',
    year: 2015,
    poster: '/series-y-peliculas/mr-robot.jpg',
  },
  {
    id: '6',
    title: 'Pirates of Silicon Valley',
    director: 'Martyn Burke',
    type: 'Película',
    genre: 'Biográfica',
    description:
      'La historia del nacimiento de Apple y Microsoft a través de la rivalidad entre Steve Jobs y Bill Gates. Una mirada íntima y a veces irónica a los hombres que revolucionaron la industria tecnológica y cambiaron el mundo.',
    year: 1999,
    poster: '/series-y-peliculas/pirates-of-silicon-valley.jpg',
  },
  {
    id: '7',
    title: 'Silicon Valley',
    director: 'Mike Judge, John Altschuler, Dave Krinsky',
    type: 'Serie',
    genre: 'Comedia',
    description:
      'Richard Hendricks, un joven programador, crea un algoritmo de compresión revolucionario y trata de convertirlo en una startup exitosa en el Valle del Silicio. La comedia más fiel y despiadada sobre la cultura de las startups tech, sus rituales, contradicciones y personajes.',
    year: 2014,
    poster: '/series-y-peliculas/silicon-valley.jpg',
  },
  {
    id: '17',
    title: 'Snowden',
    director: 'Oliver Stone',
    type: 'Película',
    genre: 'Biográfica',
    description:
      'La historia de Edward Snowden, el analista de la NSA que filtró al mundo los secretos del programa de vigilancia masiva del gobierno estadounidense. Oliver Stone dirige este thriller político que plantea preguntas profundas sobre privacidad, lealtad y el precio de la verdad.',
    year: 2016,
    poster: '/series-y-peliculas/snowden.jpg',
  },
  {
    id: '8',
    title: 'Steve Jobs',
    director: 'Danny Boyle',
    type: 'Película',
    genre: 'Biográfica',
    description:
      'Con guion de Aaron Sorkin, la película retrata tres momentos clave en la vida de Steve Jobs: los lanzamientos del Mac, del NeXT y del iMac. Michael Fassbender ofrece una interpretación compleja de un genio brillante y profundamente difícil.',
    year: 2015,
    poster: '/series-y-peliculas/steve-jobs.jpg',
  },
  {
    id: '9',
    title: 'Super Pumped',
    director: 'Brian Koppelman, David Levien',
    type: 'Serie',
    genre: 'Drama',
    description:
      'La turbulenta historia de Travis Kalanick y el ascenso meteórico de Uber, una de las startups más controvertidas y transformadoras de la historia reciente. Basada en el libro homónimo de Mike Isaac.',
    year: 2022,
    poster: '/series-y-peliculas/super-pumped.jpg',
  },
  {
    id: '10',
    title: 'The Dropout',
    director: 'Elizabeth Meriwether',
    type: 'Serie',
    genre: 'Drama',
    description:
      'La historia de Elizabeth Holmes y Theranos, la startup de diagnósticos médicos que prometió revolucionar la medicina y resultó ser uno de los fraudes corporativos más grandes de Silicon Valley. Amanda Seyfried es extraordinaria en el papel principal.',
    year: 2022,
    poster: '/series-y-peliculas/the-dropout.jpg',
  },
  {
    id: '11',
    title: 'The Great Hack',
    director: 'Karim Amer, Jehane Noujaim',
    type: 'Película',
    genre: 'Documental',
    description:
      'Cómo Cambridge Analytica recolectó datos de millones de usuarios de Facebook para influir en elecciones alrededor del mundo. Un documental perturbador sobre privacidad, datos personales y la weaponización de la información en la era digital.',
    year: 2019,
    poster: '/series-y-peliculas/the-great-hack.jpg',
  },
  {
    id: '12',
    title: 'The Imitation Game',
    director: 'Morten Tyldum',
    type: 'Película',
    genre: 'Biográfica',
    description:
      'La historia de Alan Turing, el matemático que descifró el código Enigma durante la Segunda Guerra Mundial y sentó las bases de la computación moderna. Benedict Cumberbatch interpreta a uno de los padres de la informática en esta película de gran profundidad humana.',
    year: 2014,
    poster: '/series-y-peliculas/the-imitation-game.png',
  },
  {
    id: '13',
    title: 'The Internship',
    director: 'Shawn Levy',
    type: 'Película',
    genre: 'Comedia',
    description:
      'Dos vendedores analógicos que han quedado obsoletos consiguen una pasantía en Google y deben competir con jóvenes genios digitales. Una comedia ligera que ofrece una mirada curiosa (aunque idealizada) a la cultura interna de Google.',
    year: 2013,
    poster: '/series-y-peliculas/the-internship.jpg',
  },
  {
    id: '14',
    title: 'The Social Dilemma',
    director: 'Jeff Orlowski',
    type: 'Película',
    genre: 'Documental',
    description:
      'Ex-empleados de las grandes plataformas tecnológicas revelan cómo las redes sociales están diseñadas para manipular el comportamiento humano, con consecuencias devastadoras para la salud mental, la democracia y la cohesión social.',
    year: 2020,
    poster: '/series-y-peliculas/the-social-dilemma.jpg',
  },
  {
    id: '15',
    title: 'The Social Network',
    director: 'David Fincher',
    type: 'Película',
    genre: 'Drama',
    description:
      'La historia del nacimiento de Facebook contada a través de múltiples juicios y traiciones. Con guion de Aaron Sorkin y dirección de David Fincher, es una de las mejores películas sobre startups, ambición y el precio del éxito.',
    year: 2010,
    poster: '/series-y-peliculas/the-social-network.png',
  },
  {
    id: '16',
    title: 'WeCrashed',
    director: 'Lee Eisenberg, Drew Crevello',
    type: 'Serie',
    genre: 'Drama',
    description:
      'El ascenso y la caída de WeWork y su carismático pero errático fundador Adam Neumann. Jared Leto y Anne Hathaway protagonizan esta historia sobre ambición desmedida, cultura corporativa tóxica y el culto al emprendimiento.',
    year: 2022,
    poster: '/series-y-peliculas/we-crashed.jpg',
  },
].sort((a, b) => {
  const aIndex = featuredOrder.indexOf(a.title);
  const bIndex = featuredOrder.indexOf(b.title);
  if (aIndex !== -1 || bIndex !== -1) {
    return (aIndex === -1 ? Infinity : aIndex) - (bIndex === -1 ? Infinity : bIndex);
  }
  return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
}) as Title[];

const genres = ['Todos los géneros', ...Array.from(new Set(titles.map((t) => t.genre)))];

const SeriesYPeliculasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos los géneros');

  const filteredTitles = useMemo(() => {
    return titles.filter((title) => {
      const matchesSearch =
        title.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre =
        selectedGenre === 'Todos los géneros' || title.genre === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [searchTerm, selectedGenre]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Series y Películas</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="px-4">
          <Link
            href="https://chat.whatsapp.com/FX1o4keOhJbFgB8mS1Sxem"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="pcn" size="sm" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Unirme al grupo
            </Button>
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Heading2 className="m-0 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
                <Clapperboard className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">
                Series y Películas
              </span>
            </Heading2>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-xl font-semibold">Series y películas recomendadas</h3>

            {/* Filtros */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, director o descripción..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filtro por género */}
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Todos los géneros" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid de títulos */}
            {filteredTitles.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredTitles.map((item) => (
                  <Card
                    key={item.id}
                    className="flex flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800"
                  >
                    {/* Poster */}
                    <div className="relative h-56 w-full overflow-hidden rounded-t-lg bg-muted">
                      <Image
                        src={item.poster}
                        alt={`Póster de ${item.title}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2 text-lg">{item.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {item.director}
                            {item.year && ` (${item.year})`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          variant={item.type === 'Serie' ? 'default' : 'secondary'}
                          className="w-fit"
                        >
                          {item.type}
                        </Badge>
                        <Badge variant="outline" className="w-fit">
                          {item.genre}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-muted-foreground">
                  No se encontraron títulos con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesYPeliculasPage;
