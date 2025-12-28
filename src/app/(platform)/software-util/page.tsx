'use client';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heading2 } from '@/components/ui/heading-2';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { ExternalLink, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface SoftwareRecommendation {
  name: string;
  description: string;
  logo: string;
  tags: string[];
  category: string;
  website: string;
  isFree?: boolean;
  isPopular?: boolean;
}

interface SoftwareRecommendationCardProps extends SoftwareRecommendation {}

function SoftwareRecommendationCard({
  name,
  description,
  logo,
  tags,
  category,
  website,
  isFree = false,
  isPopular = false,
}: SoftwareRecommendationCardProps) {
  return (
    <Card className="flex flex-col border-2 border-transparent bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:scale-[1.02] hover:border-pcnPurple hover:shadow-xl dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-800 dark:hover:border-pcnGreen dark:hover:shadow-pcnGreen/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-white p-2 dark:bg-neutral-800">
              <Image
                src={logo || '/placeholder.svg?height=48&width=48'}
                alt={`${name} logo`}
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground">{category}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {isFree && (
              <Badge className="border-green-500/30 bg-green-500/20 text-green-700 dark:text-green-300">
                Gratis
              </Badge>
            )}
            {isPopular && (
              <Badge className="border-orange-500/30 bg-orange-500/20 text-orange-700 dark:text-orange-300">
                Popular
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 flex-1 text-sm text-muted-foreground">{description}</p>

        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <Button size="sm" className="w-full" onClick={() => window.open(website, '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Visitar sitio
        </Button>
      </CardContent>
    </Card>
  );
}

interface RecommendationsListProps {
  recommendations: SoftwareRecommendation[];
}

function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecommendations = recommendations.filter((software) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      software.name.toLowerCase().includes(searchLower) ||
      software.description.toLowerCase().includes(searchLower) ||
      software.category.toLowerCase().includes(searchLower) ||
      software.tags.some((tag) => tag.toLowerCase().includes(searchLower));

    return matchesSearch;
  });

  return (
    <>
      {/* Search */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Buscar software, categoría o tecnología..."
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
      </div>

      {/* Software Grid or Empty State */}
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecommendations.map((software, index) => (
            <SoftwareRecommendationCard key={index} {...software} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No se encontró software útil"
          description="No pudimos encontrar ningún software que coincida con tus criterios de búsqueda. Intenta ajustar los filtros o buscar con otros términos."
          onRefresh={() => setSearchTerm('')}
        />
      )}
    </>
  );
}

const softwareRecommendations = [
  {
    name: 'Visual Studio Code',
    description:
      'Editor de código fuente ligero pero potente. Incluye soporte para debugging, Git integrado, syntax highlighting y extensiones.',
    logo: '/software-logos/vsc.webp',
    tags: ['Editor', 'JavaScript', 'TypeScript', 'Python', 'Git'],
    category: 'Desarrollo',
    website: 'https://code.visualstudio.com',
    isFree: true,
    isPopular: true,
  },
  {
    name: 'Figma',
    description:
      'Herramienta de diseño colaborativo basada en la web. Perfecta para UI/UX design, prototipado y trabajo en equipo.',
    logo: '/software-logos/figma.webp',
    tags: ['Diseño', 'UI/UX', 'Prototipado', 'Colaborativo'],
    category: 'Diseño',
    website: 'https://figma.com',
    isFree: true,
    isPopular: true,
  },
  {
    name: 'Docker',
    description:
      'Plataforma de contenedores que permite empaquetar aplicaciones con todas sus dependencias para un despliegue consistente.',
    logo: '/software-logos/docker.webp',
    tags: ['Contenedores', 'DevOps', 'Deployment', 'Microservicios'],
    category: 'DevOps',
    website: 'https://docker.com',
    isFree: true,
  },
  {
    name: 'Notion',
    description:
      'Espacio de trabajo todo-en-uno que combina notas, tareas, wikis y bases de datos en una sola aplicación.',
    logo: '/software-logos/notion.webp',
    tags: ['Productividad', 'Notas', 'Organización', 'Colaboración'],
    category: 'Productividad',
    website: 'https://notion.so',
    isFree: true,
    isPopular: true,
  },
  {
    name: 'Postman',
    description:
      'Plataforma de colaboración para el desarrollo de APIs. Simplifica cada paso del ciclo de vida de las APIs.',
    logo: '/software-logos/postman.webp',
    tags: ['API', 'Testing', 'Desarrollo', 'HTTP'],
    category: 'Desarrollo',
    website: 'https://postman.com',
    isFree: true,
  },
  {
    name: 'Slack',
    description:
      'Plataforma de comunicación empresarial que organiza conversaciones en canales dedicados por proyecto, tema o equipo.',
    logo: '/software-logos/slack.webp',
    tags: ['Comunicación', 'Equipos', 'Chat', 'Integraciones'],
    category: 'Comunicación',
    website: 'https://slack.com',
    isFree: true,
  },
  {
    name: 'Adobe Photoshop',
    description:
      'Software profesional de edición de imágenes y diseño gráfico. Estándar de la industria para diseñadores y fotógrafos.',
    logo: '/software-logos/photoshop.webp',
    tags: ['Diseño', 'Edición', 'Fotografía', 'Gráficos'],
    category: 'Diseño',
    website: 'https://adobe.com/photoshop',
    isFree: false,
    isPopular: true,
  },
];

export default function SoftwareRecommendationsPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
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
                <BreadcrumbPage>Software útil</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <div className="mb-6 flex items-center justify-between">
            <Heading2 className="m-0">Software útil</Heading2>
          </div>

          <p className="mb-6 text-muted-foreground">
            Acá podés encontrar una lista de software útil recomendado por la comunidad de PCN. Si querés
            sumar alguno, ¡avisanos!
          </p>

          <RecommendationsList recommendations={softwareRecommendations} />
        </div>
      </div>
    </>
  );
}
