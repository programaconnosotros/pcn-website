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
import { BookOpen, MessageCircle, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  year?: number;
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
  },
  {
    id: '2',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    category: 'Programación',
    description:
      'Un enfoque práctico para convertirse en un programador más efectivo y productivo.',
    year: 1999,
  },
  {
    id: '3',
    title: 'Design Patterns',
    author: 'Gang of Four',
    category: 'Arquitectura',
    description:
      'Patrones de diseño reutilizables para resolver problemas comunes en el diseño de software.',
    year: 1994,
  },
  {
    id: '4',
    title: 'Refactoring',
    author: 'Martin Fowler',
    category: 'Programación',
    description:
      'Mejora del diseño del código existente, mostrando cómo mejorar la estructura del código sin cambiar su comportamiento.',
    year: 1999,
  },
  {
    id: '5',
    title: "You Don't Know JS",
    author: 'Kyle Simpson',
    category: 'Programación',
    description:
      'Serie de libros que profundiza en los mecanismos internos del lenguaje JavaScript.',
  },
  {
    id: '6',
    title: 'The Mythical Man-Month',
    author: 'Frederick P. Brooks Jr.',
    category: 'Gestión',
    description:
      'Ensayos sobre ingeniería de software que explican por qué agregar más personas a un proyecto retrasado lo retrasa aún más.',
    year: 1975,
  },
  {
    id: '7',
    title: 'Code Complete',
    author: 'Steve McConnell',
    category: 'Programación',
    description:
      'Una guía práctica para la construcción de software que cubre todo el proceso de desarrollo.',
    year: 1993,
  },
  {
    id: '8',
    title: 'Domain-Driven Design',
    author: 'Eric Evans',
    category: 'Arquitectura',
    description:
      'Un enfoque para el desarrollo de software complejo conectando la implementación a un modelo en evolución.',
    year: 2003,
  },
];

const categories = [
  'Todas las categorías',
  ...Array.from(new Set(books.map((book) => book.category))),
];

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
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Lectura</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Heading2 className="m-0">Lectura</Heading2>
          </div>

          <div className="mb-6 rounded-lg border bg-gradient-to-r from-neutral-100 to-neutral-50 p-6 dark:from-neutral-800 dark:to-neutral-900">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold">Club de Lectura PCN</h3>
                <p className="mb-4 text-muted-foreground">
                  En PCN tenemos un club de lectura donde compartimos y discutimos libros sobre
                  programación, tecnología y desarrollo profesional. ¡Sumate al grupo de WhatsApp y
                  participá de nuestras lecturas!
                </p>
                <div>
                  <Link
                    href="https://chat.whatsapp.com/FX1o4keOhJbFgB8mS1Sxem"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="pcn" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Unirme al grupo
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
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
                    className="flex flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20"
                  >
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
                      <Badge variant="secondary" className="mt-2 w-fit">
                        {book.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground">{book.description}</p>
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
        </div>
      </div>
    </>
  );
};

export default ReadingPage;
