'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  placeholder = 'Buscar fotos...',
}: SearchBarProps) {
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <Search className="h-4 w-4 text-gray-400" />
      </div>

      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full py-2 pl-10 pr-10"
      />

      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={handleClearSearch}
        >
          <X className="h-4 w-4 text-gray-400" />
          <span className="sr-only">Limpiar búsqueda</span>
        </Button>
      )}
    </div>
  );
}
