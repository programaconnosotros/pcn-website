'use client';

import { EmptyState } from '@/components/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import { CollapsibleFilters } from '@/components/ui/collapsible-filters';
import { RecommendButton } from '@/components/recommendations/recommend-button';
import type { Title } from './titles';

/** The list with its search and genre filter; `titles` comes merged and sorted from the page. */
export function SeriesClient({ titles }: { titles: Title[] }) {
  const genres = useMemo(
    () => ['Todos los géneros', ...Array.from(new Set(titles.map((t) => t.genre)))],
    [titles],
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Todos los géneros');

  const filteredTitles = useMemo(() => {
    return titles.filter((title) => {
      const matchesSearch =
        title.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
        title.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre = selectedGenre === 'Todos los géneros' || title.genre === selectedGenre;

      return matchesSearch && matchesGenre;
    });
  }, [titles, searchTerm, selectedGenre]);

  return (
    <>
      <div className="flex flex-1 flex-col p-4 pt-0">
        <div className="mt-4">
          <div className="mb-14">
            <StickyHeader>
              <PageTitle
                path="series-y-peliculas"
                meta={`${titles.filter((t) => t.type === 'Serie').length} series · ${
                  titles.filter((t) => t.type === 'Película').length
                } películas`}
                action={<RecommendButton kind="SERIES" />}
              />

              <CollapsibleFilters
                className="mb-4"
                activeCount={Number(selectedGenre !== 'Todos los géneros')}
                search={
                  <SearchBar
                    searchQuery={searchTerm}
                    setSearchQuery={setSearchTerm}
                    placeholder="título, director o descripción"
                    label="Buscar por título, director o descripción"
                    className="max-w-none flex-1"
                  />
                }
              >
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="h-8 w-full md:w-[200px]">
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
              </CollapsibleFilters>
            </StickyHeader>

            {/* Grid de títulos */}
            {filteredTitles.length > 0 ? (
              <RuledGrid className="grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                {filteredTitles.map((item) => (
                  <div key={item.id} className={cn(ruledCellClassName, 'flex gap-3 p-3')}>
                    <div className="relative flex h-14 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-pcnGreen-200 bg-muted font-mono text-sm text-pcnGreen-600">
                      {item.poster?.startsWith('/') ? (
                        <Image
                          src={item.poster}
                          alt={`Póster de ${item.title}`}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : item.poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.poster}
                          alt={`Póster de ${item.title}`}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <span aria-hidden>{item.title.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <h2 className="truncate font-semibold">{item.title}</h2>
                        {item.type === 'Serie' && (
                          <Badge className="px-1.5 py-0 text-[10px]">serie</Badge>
                        )}
                        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                          {item.year}
                        </span>
                      </div>

                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>

                      <p className="truncate font-mono text-[11px] text-muted-foreground/70">
                        {item.director && (
                          <>
                            <span className="text-pcnGreen-500">@ </span>
                            {item.director}
                          </>
                        )}
                        <span className="text-pcnGreen-500"> # </span>
                        {item.genre.toLowerCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </RuledGrid>
            ) : (
              <EmptyState
                command={`grep -i "${searchTerm}" ~/series-y-peliculas`}
                output="0 coincidencias"
                title="Ningún título coincide con los filtros"
                description="Probá con otro género o con otra búsqueda."
                showRefresh
                onRefresh={() => {
                  setSearchTerm('');
                  setSelectedGenre('Todos los géneros');
                }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
