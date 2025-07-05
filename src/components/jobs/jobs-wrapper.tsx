'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Heading2 } from '@/components/ui/heading-2';
import { JobCard } from './job-card';
import { JobOffers } from '@prisma/client';
import { useJobsSearch } from '@/hooks/use-jobs-search';

interface JobsWrapperProps {
  initialJobs: JobOffers[];
  totalJobs: number;
}

export function JobsWrapper({ initialJobs, totalJobs }: JobsWrapperProps) {
  const {
    filteredJobs,
    searchTerm,
    isLoading,
    error,
    searchJobs,
    handleResetSearch,
    handleSearchChange,
  } = useJobsSearch({ initialJobs });

  if (error) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-lg font-medium text-destructive">{error}</h3>
        <Button variant="outline" className="mt-4" onClick={() => searchJobs({})}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 md:px-20">
      <div className="relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 pb-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between">
            <Heading2>Ofertas de Trabajo</Heading2>
          </div>
        </div>
        <p className="mt-2 text-muted-foreground">Explora las {totalJobs} ofertas disponibles</p>
        {/* Search */}
        <div className="relative mt-2 flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Busca por puesto, empresa o palabras clave..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Results count */}
        <div>
          <p className="mb-2 mt-1 text-sm text-muted-foreground">
            Mostrando {filteredJobs.length} de {totalJobs} ofertas
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Cargando ofertas...</p>
          </div>
        )}

        {/* Job listings */}
        {!isLoading && filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : !isLoading ? (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium">No se encontraron ofertas</h3>
            <p className="mt-2 text-muted-foreground">Intenta otra búsqueda.</p>
            <Button variant="outline" className="mt-4" onClick={handleResetSearch}>
              Resetear búsqueda
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
