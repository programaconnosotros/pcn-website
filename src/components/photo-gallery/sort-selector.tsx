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
}

export function SortSelector({ sortOrder, onSortChange }: SortSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {sortOrder === 'default' && (
            <>
              <ArrowDownUp className="h-4 w-4" />
              <span>Orden Predeterminado</span>
            </>
          )}
          {sortOrder === 'date-asc' && (
            <>
              <ArrowUpAZ className="h-4 w-4" />
              <span>Más Antiguas Primero</span>
            </>
          )}
          {sortOrder === 'date-desc' && (
            <>
              <ArrowDownAZ className="h-4 w-4" />
              <span>Más Recientes Primero</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSortChange('default')}>
          <ArrowDownUp className="mr-2 h-4 w-4" />
          <span>Orden Predeterminado</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('date-asc')}>
          <ArrowUpAZ className="mr-2 h-4 w-4" />
          <span>Más Antiguas Primero</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('date-desc')}>
          <ArrowDownAZ className="mr-2 h-4 w-4" />
          <span>Más Recientes Primero</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
