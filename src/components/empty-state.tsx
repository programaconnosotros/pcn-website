'use client';

import { Button } from '@/components/ui/button';
import { Package, RefreshCw, Search } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export function EmptyState({
  title,
  description,
  showRefresh = true,
  onRefresh,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="relative mb-6">
        {/* Background circle */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Search icon overlay */}
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-100 bg-white">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
      </div>

      <h3 className="mb-2 text-center text-xl font-semibold text-gray-600">{title}</h3>
      <p className="mb-6 max-w-md text-center leading-relaxed text-gray-600">{description}</p>

      {showRefresh && (
        <Button
          variant="outline"
          onClick={onRefresh}
          className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Limpiar filtros</span>
        </Button>
      )}
    </div>
  );
}
