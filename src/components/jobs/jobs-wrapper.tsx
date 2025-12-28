'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Briefcase, Search, X, Plus } from 'lucide-react';
import { Heading2 } from '@/components/ui/heading-2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { JobCard } from './job-card';
import { JobForm } from './job-form';
import { JobOffers } from '@prisma/client';
import { useJobsSearch } from '@/hooks/use-jobs-search';
import { EmptyState } from '@/components/empty-state';
import { createJob } from '@/actions/jobs/create-job';
import { JobFormData } from '@/schemas/job-schema';
import { toast } from 'sonner';

interface JobsWrapperProps {
  initialJobs: JobOffers[];
  totalJobs: number;
  isAdmin?: boolean;
}

export function JobsWrapper({ initialJobs, totalJobs, isAdmin = false }: JobsWrapperProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const {
    filteredJobs,
    searchTerm,
    isLoading,
    error,
    searchJobs,
    handleResetSearch,
    handleSearchChange,
  } = useJobsSearch({ initialJobs });

  const handleCreate = async (data: JobFormData) => {
    setIsCreating(true);
    try {
      await createJob(data);
      toast.success('Oferta creada exitosamente');
      setIsCreateOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la oferta');
    } finally {
      setIsCreating(false);
    }
  };

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
        <Heading2 className="m-0 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pcnPurple/30 bg-pcnPurple/10 dark:border-pcnGreen/50 dark:bg-pcnGreen/10 dark:shadow-[0_0_10px_rgba(4,244,190,0.4)]">
            <Briefcase className="h-5 w-5 text-pcnPurple dark:text-pcnGreen dark:drop-shadow-[0_0_8px_rgba(4,244,190,0.8)]" />
          </div>
          <span className="dark:drop-shadow-[0_0_12px_rgba(4,244,190,0.8)]">Ofertas de trabajo</span>
        </Heading2>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva oferta
          </Button>
        )}
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
            <JobCard key={job.id} job={job} isAdmin={isAdmin} />
          ))}
        </div>
      ) : !isLoading ? (
        <EmptyState
          title="No se encontraron ofertas"
          description="No pudimos encontrar ninguna oferta que coincida con tu búsqueda. Intenta con otros términos."
          onRefresh={handleResetSearch}
        />
      ) : null}

      {/* Dialog para crear nueva oferta */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nueva oferta de trabajo</DialogTitle>
            <DialogDescription>
              Completa los datos para publicar una nueva oferta de trabajo.
            </DialogDescription>
          </DialogHeader>
          <JobForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={isCreating}
            submitLabel="Crear oferta"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
