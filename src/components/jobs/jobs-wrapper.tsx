'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Heading2 } from '@/components/ui/heading-2';
import { JobCard } from './job-card';
import { JobOffers } from '@prisma/client';
import { useJobsSearch } from '@/hooks/use-jobs-search';
import { EmptyState } from '@/components/empty-state';

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
      <EmptyState
        title="Error al cargar las ofertas"
        description={error}
        onRefresh={() => searchJobs({})}
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Heading2 className="m-0">Ofertas de Trabajo</Heading2>
      </div>

      <p className="mb-6 text-muted-foreground">
        Explora las {totalJobs} ofertas disponibles en la comunidad.
      </p>

      {/* Search */}
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Busca por puesto, empresa o palabras clave..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            disabled={isLoading}
          />
          {searchTerm && (
            <button
              onClick={handleResetSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : !isLoading ? (
        <EmptyState
          title="No se encontraron ofertas"
          description="No pudimos encontrar ninguna oferta que coincida con tu búsqueda. Intenta con otros términos."
          onRefresh={handleResetSearch}
        />
      ) : null}
    </>
  );
}
