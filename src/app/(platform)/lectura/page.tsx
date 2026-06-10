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
import { ArrowUpRight, Book, MessageCircle, Search, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { GeistMono } from 'geist/font/mono';
import { cn } from '@/lib/utils';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  year?: number;
  cover: string;
  isbn: string;
}

const books: Book[] = [
  {
    id: '1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Programación',
    description:
      'Un manual de artesanía de software ágil que te enseñará a escribir código limpio y mantenible.',
    year: 2008,
    cover: '/lectura/clean-code.jpg',
    isbn: '0132350882',
  },
  {
    id: '2',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    category: 'Programación',
    description:
      'Un enfoque práctico para convertirse en un programador más efectivo y productivo.',
    year: 1999,
    cover: '/lectura/the-pragmatic-programmer.jpg',
    isbn: '020161622X',
  },
  {
    id: '3',
    title: 'Design Patterns',
    author: 'Gang of Four',
    category: 'Arquitectura',
    description:
      'Patrones de diseño reutilizables para resolver problemas comunes en el diseño de software.',
    year: 1994,
    cover: '/lectura/design-patterns.jpg',
    isbn: '0201633612',
  },
  {
    id: '4',
    title: 'Refactoring',
    author: 'Martin Fowler',
    category: 'Programación',
    description:
      'Mejora del diseño del código existente, mostrando cómo mejorar la estructura del código sin cambiar su comportamiento.',
    year: 1999,
    cover: '/lectura/refactoring.jpg',
    isbn: '0134757599',
  },
  {
    id: '5',
    title: "You Don't Know JS",
    author: 'Kyle Simpson',
    category: 'Programación',
    description:
      'Serie de libros que profundiza en los mecanismos internos del lenguaje JavaScript.',
    cover: '/lectura/you-dont-know-js.jpg',
    isbn: '1491924462',
  },
  {
    id: '6',
    title: 'The Mythical Man-Month',
    author: 'Frederick P. Brooks Jr.',
    category: 'Gestión',
    description:
      'Ensayos sobre ingeniería de software que explican por qué agregar más personas a un proyecto retrasado lo retrasa aún más.',
    year: 1975,
    cover: '/lectura/the-mythical-man-month.jpg',
    isbn: '0201835959',
  },
  {
    id: '7',
    title: 'Code Complete',
    author: 'Steve McConnell',
    category: 'Programación',
    description:
      'Una guía práctica para la construcción de software que cubre todo el proceso de desarrollo.',
    year: 1993,
    cover: '/lectura/code-complete.jpg',
    isbn: '0735619670',
  },
  {
    id: '8',
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    category: 'Arquitectura',
    description:
      'Un enfoque para el desarrollo de software complejo conectando la implementación a un modelo en evolución.',
    year: 2003,
    cover: '/lectura/domain-driven-design.jpg',
    isbn: '0321125215',
  },
  {
    id: '9',
    title: 'Mastering Event-Driven Microservices on AWS',
    author: 'Sheen Brisals, Luke Hedger',
    category: 'Arquitectura',
    description:
      'Una guía práctica para diseñar y construir arquitecturas de microservicios orientadas a eventos utilizando los servicios nativos de AWS.',
    year: 2024,
    cover: '/lectura/mastering-event-driven-microservices.jpg',
    isbn: 'B0DF49L9QJ',
  },
  {
    id: '10',
    title: 'Mastering Serverless Computing with AWS Lambda',
    author: 'Marcia Villalba',
    category: 'Arquitectura',
    description:
      'Una guía completa para dominar el cómputo serverless con AWS Lambda, abarcando patrones, rendimiento y mejores prácticas de producción.',
    year: 2024,
    cover: '/lectura/mastering-serverless-computing.jpg',
    isbn: 'B0DN6TJ323',
  },
  {
    id: '11',
    title: '97 Things Every Software Architect Should Know',
    author: 'Richard Monson-Haefel (ed.)',
    category: 'Arquitectura',
    description:
      'Una colección de consejos prácticos de los arquitectos de software más experimentados del mundo, organizados en 97 lecciones esenciales.',
    year: 2009,
    cover: '/lectura/97-things-software-architect.jpg',
    isbn: '059652269X',
  },
  {
    id: '12',
    title: 'Balancing Coupling in Software Design',
    author: 'Vladislav Khononov',
    category: 'Arquitectura',
    description:
      'Un análisis profundo del acoplamiento en el diseño de software, con estrategias para balancearlo y construir sistemas más mantenibles y evolutivos.',
    year: 2023,
    cover: '/lectura/balancing-coupling.jpg',
    isbn: '0137353480',
  },
  {
    id: '13',
    title: 'Patterns for API Design',
    author: 'Olaf Zimmermann, Mirko Stocker, Daniel Lübke, Uwe Zdun, Cesare Pautasso',
    category: 'Arquitectura',
    description:
      'Un catálogo de patrones probados para diseñar APIs robustas, comprensibles y evolutivas, con énfasis en comunicación entre servicios.',
    year: 2022,
    cover: '/lectura/patterns-of-api-design.jpg',
    isbn: '0137670109',
  },
  {
    id: '14',
    title: 'Principles of Web API Design',
    author: 'James Higginbotham',
    category: 'Arquitectura',
    description:
      'Un enfoque sistemático para diseñar APIs web de alta calidad, cubriendo modelado de dominio, contratos y gestión del ciclo de vida.',
    year: 2021,
    cover: '/lectura/principles-web-api-design.jpg',
    isbn: '0137355637',
  },
  {
    id: '15',
    title: 'Strategic Monoliths and Microservices',
    author: 'Vaughn Vernon, Tomasz Jaskula',
    category: 'Arquitectura',
    description:
      'Una guía estratégica para decidir cuándo usar monolitos o microservicios, con énfasis en Domain-Driven Design y contextos acotados.',
    year: 2022,
    cover: '/lectura/strategic-monoliths-microservices.jpg',
    isbn: '0137355467',
  },
  {
    id: '16',
    title: 'Continuous Architecture in Practice',
    author: 'Murat Erder, Pierre Pureur, Eoin Woods',
    category: 'Arquitectura',
    description:
      'Un enfoque para practicar la arquitectura de software de forma continua en equipos ágiles, integrando decisiones de diseño en el flujo de desarrollo.',
    year: 2021,
    cover: '/lectura/continuous-architecture.jpg',
    isbn: '0136523560',
  },
  {
    id: '17',
    title: 'Adaptive Systems with Domain-Driven Design, Wardley Mapping, and Team Topologies',
    author: 'Michael Plöd, Christian Stettler, Alban Frei, Nick Tune',
    category: 'Arquitectura',
    description:
      'Combina Domain-Driven Design, Wardley Maps y Team Topologies para construir organizaciones y sistemas de software verdaderamente adaptativos.',
    year: 2022,
    cover: '/lectura/adaptive-systems-ddd.jpg',
    isbn: '0137393032',
  },
  {
    id: '18',
    title: 'Test Driven Development: By Example',
    author: 'Kent Beck',
    category: 'Programación',
    description:
      'El libro fundacional del TDD: muestra paso a paso cómo escribir tests antes que el código para producir software más limpio y con menos defectos.',
    year: 2002,
    cover: '/lectura/test-driven-development.jpg',
    isbn: '0321146530',
  },
  {
    id: '19',
    title: 'Modern Software Engineering',
    author: 'David Farley',
    category: 'Programación',
    description:
      'Un manifiesto para la ingeniería de software moderna, que integra entrega continua, TDD y principios de diseño para construir software de calidad.',
    year: 2021,
    cover: '/lectura/modern-software-engineering.jpg',
    isbn: '0137314914',
  },
  {
    id: '20',
    title: 'Designing Data-Intensive Applications',
    author: 'Martin Kleppmann',
    category: 'Arquitectura',
    description:
      'Una guía profunda sobre los principios y prácticas detrás de los sistemas de datos confiables, escalables y mantenibles.',
    year: 2017,
    cover: '/lectura/designing-data-intensive.jpg',
    isbn: 'B0FWY1P6PS',
  },
  {
    id: '21',
    title: 'Agile Testing',
    author: 'Lisa Crispin, Janet Gregory',
    category: 'Programación',
    description:
      'Una guía práctica para testers y equipos ágiles que muestra cómo integrar el testing en el proceso de desarrollo para entregar software de calidad.',
    year: 2008,
    cover: '/lectura/agile-testing.jpg',
    isbn: '0321534468',
  },
  {
    id: '22',
    title: 'Cracking the Coding Interview',
    author: 'Gayle Laakmann McDowell',
    category: 'Programación',
    description:
      'La guía más completa para preparar entrevistas técnicas de programación, con 189 preguntas y soluciones detalladas.',
    year: 2015,
    cover: '/lectura/cracking-the-coding-interview.jpg',
    isbn: '0984782850',
  },
  {
    id: '23',
    title: 'Applying UML and Patterns',
    author: 'Craig Larman',
    category: 'Arquitectura',
    description:
      'Una introducción al análisis y diseño orientado a objetos con UML y patrones de diseño aplicados al desarrollo iterativo.',
    year: 2004,
    cover: '/lectura/applying-uml-and-patterns.jpg',
    isbn: '0131489062',
  },
  {
    id: '24',
    title: 'Algoritmos a Fondo',
    author: 'Pablo Albero Sznajdleder',
    category: 'Programación',
    description:
      'Un recorrido exhaustivo por las estructuras de datos y algoritmos fundamentales, con implementaciones prácticas en C y Java.',
    year: 2013,
    cover: '/lectura/algoritmos-a-fondo.jpg',
    isbn: '987160937X',
  },
  {
    id: '25',
    title: 'Construcción de software con una mirada ágil',
    author: 'Diego Fontdevila, Alfredo Fernández, Jorge Aguirre',
    category: 'Programación',
    description:
      'Un enfoque ágil para la construcción de software que combina prácticas de ingeniería moderna con metodologías iterativas de desarrollo.',
    year: 2016,
    cover: '/lectura/construccion-software-agil.jpg',
    isbn: 'B01M1L858Z',
  },
  {
    id: '26',
    title: 'Engineering Management for the Rest of Us',
    author: 'Sarah Drasner',
    category: 'Gestión',
    description:
      'Una guía práctica sobre gestión de ingeniería para quienes no tienen formación formal en management, cubriendo comunicación, contratación, retroalimentación y cultura de equipo.',
    year: 2022,
    cover: '/lectura/engineering-management-rest-of-us.jpg',
    isbn: '9798986769318',
  },
].sort((a, b) => a.title.localeCompare(b.title));

const categories = [
  'Todas las categorías',
  ...Array.from(new Set(books.map((book) => book.category))),
];

const categoryStyles: Record<string, string> = {
  Programación:
    'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
  Arquitectura:
    'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  Gestión:
    'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
};
const defaultCategoryStyle = 'bg-secondary text-secondary-foreground';

const ReadingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las categorías');

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Todas las categorías' || book.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);
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
                <BreadcrumbPage>Lectura</BreadcrumbPage>
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
                <Book className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
              </div>
              <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Lectura</span>
            </Heading2>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-xl font-semibold">Lecturas recomendadas</h3>

            {/* Filtros */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
              {/* Búsqueda */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, autor o descripción..."
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

              {/* Filtro por categoría */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid de libros */}
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredBooks.map((book) => (
                  <Card
                    key={book.id}
                    className="flex flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800"
                  >
                    {/* Cover portrait */}
                    <div className="relative h-56 w-full overflow-hidden rounded-t-lg bg-muted">
                      <Image
                        src={book.cover}
                        alt={`Portada de ${book.title}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="mb-2 text-lg">{book.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {book.author}
                            {book.year && ` (${book.year})`}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'mt-2 w-fit',
                          categoryStyles[book.category] ?? defaultCategoryStyle,
                        )}
                      >
                        {book.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground">{book.description}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        ISBN: <span className={GeistMono.className}>{book.isbn}</span>
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-lg text-muted-foreground">
                  No se encontraron libros con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>

          {/* Banner AgusLogs */}
          <Card className="flex flex-col gap-4 border border-pcnPurple/30 bg-pcnPurple/5 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.3)]">
            <div className="flex items-center gap-4">
              <Image
                src="/aguslogs-logo.png"
                alt="AgusLogs"
                width={64}
                height={64}
                className="rounded-lg"
              />
              <div>
                <p className="font-semibold">AgusLogs</p>
                <p className="text-sm text-muted-foreground">
                  Aprendé y crecé como ingeniero de software.
                </p>
              </div>
            </div>
            <Link href="https://aguslogs.com/" target="_blank" rel="noopener noreferrer">
              <Button variant="pcn" size="sm" className="flex items-center gap-2">
                Ir a AgusLogs
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ReadingPage;
