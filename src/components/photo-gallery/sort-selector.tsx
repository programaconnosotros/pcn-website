'use client';

import { ArrowDownAZ, ArrowUpAZ, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOrder = 'default' | 'date-asc' | 'date-desc';

interface SortSelectorProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  className?: string;
}

export function SortSelector({ sortOrder, onSortChange, className = '' }: SortSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`flex items-center gap-2 ${className}`}>
          {sortOrder === 'default' && (
            <>
              <ArrowDownUp className="h-4 w-4" />
              <span>Orden predeterminado</span>
            </>
          )}
          {sortOrder === 'date-asc' && (
            <>
              <ArrowUpAZ className="h-4 w-4" />
              <span>Más antiguas primero</span>
            </>
          )}
          {sortOrder === 'date-desc' && (
            <>
              <ArrowDownAZ className="h-4 w-4" />
              <span>Más recientes primero</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSortChange('default')}>
          <ArrowDownUp className="mr-2 h-4 w-4" />
          <span>Orden predeterminado</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('date-asc')}>
          <ArrowUpAZ className="mr-2 h-4 w-4" />
          <span>Más antiguas primero</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('date-desc')}>
          <ArrowDownAZ className="mr-2 h-4 w-4" />
          <span>Más recientes primero</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
