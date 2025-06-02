'use client';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 text-gray-900 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-black dark:text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500/5 to-blue-500/5 dark:from-gray-500/10"></div>

      {/* Animated background on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-gray-500/20"></div>

      <div className="relative z-10">

        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-gray-400/40 bg-white p-2 transition-colors duration-300 group-hover:border-gray-300 dark:bg-gray-800">
                <Image
                  src={logo || '/placeholder.svg?height=48&width=48'}
                  alt={`${name} logo`}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold transition-colors duration-300">{name}</h3>
              <p className="text-sm font-medium text-gray-600/60 dark:text-gray-300">{category}</p>
              {isFree && (
                <Badge className="mt-1 border-green-500/30 bg-green-500/20 text-green-700 dark:text-green-300">
                  Gratis
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isPopular && (
              <Badge className="border-orange-500/30 bg-orange-500/20 text-orange-700 hover:bg-orange-500/30 dark:text-orange-300">
                Popular
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {description}
        </p>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="border-gray-200 bg-gray-100 text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Button */}
        <div className="bg-r flex w-full justify-center">
          <Button
            size="sm"
            className="flex w-full transform items-center justify-center space-x-2 bg-gray-600/10 text-black transition-all duration-200 hover:scale-105 hover:bg-gray-700/10 hover:shadow-lg hover:shadow-gray-500/25 dark:bg-gray-600/50 dark:text-white"
            onClick={() => window.open(website, '_blank')}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <ExternalLink
              className={cn('h-4 w-4 transition-transform duration-200', isHovered && 'rotate-12')}
            />
            <span>Visitar sitio</span>
          </Button>
        </div>

      </div>

    </div>
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
      <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          
          <Input
            placeholder="Buscar software, categoría o tecnología..."
            className="pl-10 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

        </div>
      </div>

      {/* Software Grid or Empty State */}
      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 pb-4 lg:grid-cols-2">
          {filteredRecommendations.map((software, index) => (
            <SoftwareRecommendationCard key={index} {...software} />
          ))}
        </div>
      ) : (
        <EmptyState title="No se encontró software recomendado" description="No pudimos encontrar ningún software que coincida con tus criterios de búsqueda. Intenta ajustar los filtros o buscar con otros términos." onRefresh={() => setSearchTerm('')} />
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
    <div className="mt-4 md:px-20">
      <div className="mb-8">
        <div className="mb-2 flex items-center space-x-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Recomendaciones de Software
          </h1>
        </div>
        
        <p className="text-gray-600">
          Descubre las mejores herramientas recomendadas por nuestra comunidad de desarrolladores
        </p>
      </div>

      <RecommendationsList recommendations={softwareRecommendations} />
    </div>
  );
}
