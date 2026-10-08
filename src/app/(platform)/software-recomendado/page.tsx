'use client';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { StickyHeader } from '@/components/ui/sticky-header';

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
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(ruledCellClassName, 'flex group gap-3 p-3')}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-white p-1">
        <Image
          src={logo || '/placeholder.svg?height=48&width=48'}
          alt={`${name} logo`}
          width={28}
          height={28}
          className="h-full w-full object-contain"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 font-mono text-sm">
          <h3 className="truncate font-semibold group-hover:text-pcnGreen">{name}</h3>
          {isPopular && <Badge className="px-1.5 py-0 text-[10px]">popular</Badge>}
          <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground group-hover:text-pcnGreen">
            {isFree ? 'gratis' : category.toLowerCase()}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>

        <p className="truncate font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500"># </span>
          {tags.join(' · ')}
        </p>
      </div>
    </a>
  );
}

interface RecommendationsListProps {
  header: ReactNode;
  recommendations: SoftwareRecommendation[];
}

function RecommendationsList({ header, recommendations }: RecommendationsListProps) {
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
      <StickyHeader>
        {header}
        {/* Search */}
        <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <SearchBar
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            placeholder="software, categoría o tecnología"
            label="Buscar software, categoría o tecnología"
          />
        </div>
      </StickyHeader>

      {/* Software Grid or Empty State */}
      {filteredRecommendations.length > 0 ? (
        <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredRecommendations.map((software) => (
            <SoftwareRecommendationCard key={software.name} {...software} />
          ))}
        </RuledGrid>
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
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <RecommendationsList
            header={
              <PageTitle
                path="software-recomendado"
                meta={`${softwareRecommendations.length} apps recomendadas por la comunidad`}
              />
            }
            recommendations={softwareRecommendations}
          />
        </div>
      </div>
    </>
  );
}
