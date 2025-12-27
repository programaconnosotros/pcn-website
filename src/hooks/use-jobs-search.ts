import { useState, useEffect, useCallback } from 'react';
import { JobOffers } from '@prisma/client';

interface UseJobsSearchProps {
  initialJobs: JobOffers[];
}

interface JobSearchParams {
  search?: string;
  location?: string;
  type?: string;
  available?: boolean;
}

export function useJobsSearch({ initialJobs }: UseJobsSearchProps) {
  const [jobs, setJobs] = useState<JobOffers[]>(initialJobs);
  const [filteredJobs, setFilteredJobs] = useState<JobOffers[]>(initialJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para aplicar filtros adicionales (location, type, available)
  const searchJobs = useCallback(
    async (params: JobSearchParams) => {
      setIsLoading(true);
      setError(null);

      try {
        let filtered = [...initialJobs];

        // Aplicar filtros por parámetros
        if (params.location) {
          filtered = filtered.filter((job) =>
            job.location.toLowerCase().includes(params.location!.toLowerCase()),
          );
        }

        if (params.type) {
          filtered = filtered.filter(
            (job) => job.type.toLowerCase() === params.type!.toLowerCase(),
          );
        }

        if (params.available !== undefined) {
          filtered = filtered.filter((job) => job.available === params.available);
        }

        setJobs(filtered);
        setFilteredJobs(filtered);
      } catch (err) {
        setError('Error al filtrar las ofertas');
        console.error('Error filtering jobs:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [initialJobs],
  );

  // Filtrado local para búsqueda en tiempo real
  useEffect(() => {
    if (!searchTerm) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter((job) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    });

    setFilteredJobs(filtered);
  }, [searchTerm, jobs]);

  const handleResetSearch = useCallback(() => {
    setSearchTerm('');
    setJobs(initialJobs);
    setFilteredJobs(initialJobs);
  }, [initialJobs]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return {
    jobs,
    filteredJobs,
    searchTerm,
    isLoading,
    error,
    searchJobs,
    handleResetSearch,
    handleSearchChange,
  };
}
