'use client';
import { EmptyState } from '@/components/empty-state';
import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/ui/page-title';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { StickyHeader } from '@/components/ui/sticky-header';
import {
  softwareRecommendations,
  type PricingTier,
  type SoftwareRecommendation,
  type SoftwareType,
  type TypingDiscipline,
} from './software';

interface SoftwareRecommendationCardProps extends SoftwareRecommendation {}

const PRICING_LABEL: Record<PricingTier, string> = {
  free: 'gratis',
  freemium: 'freemium',
  paid: 'de pago',
};

const TYPING_LABEL: Record<TypingDiscipline, string> = {
  static: 'tipado estático',
  dynamic: 'tipado dinámico',
  mixed: 'tipado mixto',
};

function SoftwareRecommendationCard({
  name,
  description,
  logo,
  tags,
  category,
  website,
  pricing,
  type,
  isPopular: _isPopular = false,
  usedHere = false,
  typing,
  paradigms,
}: SoftwareRecommendationCardProps) {
  const isLanguage = type === 'language';
  const chips = isLanguage
    ? [...(typing ? [TYPING_LABEL[typing]] : []), ...(paradigms ?? [])]
    : tags;

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
          {usedHere && <Badge className="px-1.5 py-0 text-[10px]">usado acá</Badge>}
          <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground group-hover:text-pcnGreen">
            {isLanguage ? category.toLowerCase() : PRICING_LABEL[pricing]}
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>

        <p className="truncate font-mono text-[11px] text-muted-foreground/70">
          <span className="text-pcnGreen-500"># </span>
          {chips.join(' · ')}
        </p>
      </div>
    </a>
  );
}

const TABS: SoftwareType[] = ['app', 'library', 'language'];

interface RecommendationsListProps {
  header: ReactNode;
  recommendations: SoftwareRecommendation[];
}

function RecommendationsList({ header, recommendations }: RecommendationsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<SoftwareType>('app');

  const matches = (software: SoftwareRecommendation) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      software.name.toLowerCase().includes(searchLower) ||
      software.description.toLowerCase().includes(searchLower) ||
      software.category.toLowerCase().includes(searchLower) ||
      software.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  };
  const matchesIn = (tab: SoftwareType) =>
    recommendations.filter((software) => software.type === tab && matches(software));

  // A search with nothing in the open tab jumps to the first tab that has matches, so a link
  // like /herramientas?q=react (from the global search) shows the library, not an empty list.
  const shownTab =
    searchTerm && matchesIn(activeTab).length === 0
      ? (TABS.find((tab) => matchesIn(tab).length > 0) ?? activeTab)
      : activeTab;

  const filteredRecommendations = matchesIn(shownTab).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Tabs value={shownTab} onValueChange={(v) => setActiveTab(v as SoftwareType)}>
      <StickyHeader>
        {header}
        <TabsList className="mb-4">
          <TabsTrigger value="app">Apps</TabsTrigger>
          <TabsTrigger value="library">Librerías</TabsTrigger>
          <TabsTrigger value="language">Lenguajes</TabsTrigger>
        </TabsList>

        {/* Search — shared across all tabs */}
        <div className="mb-4 flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <SearchBar
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            placeholder="nombre, categoría o tecnología"
            label="Buscar por nombre, categoría o tecnología"
          />
        </div>
      </StickyHeader>

      {TABS.map((tab) => (
        <TabsContent key={tab} value={tab}>
          {filteredRecommendations.length > 0 ? (
            <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredRecommendations.map((software) => (
                <SoftwareRecommendationCard key={software.name} {...software} />
              ))}
            </RuledGrid>
          ) : (
            <EmptyState
              title="No se encontraron resultados"
              description="No pudimos encontrar nada que coincida con tus criterios de búsqueda. Intenta ajustar los filtros o buscar con otros términos."
              onRefresh={() => setSearchTerm('')}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function SoftwareRecommendationsPage() {
  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="mt-4">
          <RecommendationsList
            header={
              <PageTitle
                path="herramientas"
                meta={`${softwareRecommendations.length} herramientas recomendadas por la comunidad`}
              />
            }
            recommendations={softwareRecommendations}
          />
        </div>
      </div>
    </>
  );
}
