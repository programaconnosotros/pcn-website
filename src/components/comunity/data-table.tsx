'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SearchBar } from '@/components/ui/search-bar';
import { personRowFilter } from '@/lib/people-search';
import { StickyHeader } from '@/components/ui/sticky-header';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Page title, pinned together with the toolbar. */
  header?: ReactNode;
  /** Shown between the pinned header and the table, e.g. a row of stats. */
  intro?: ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  header,
  intro,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    emailVerified: false,
    province: false,
    enterprise: false,
    studyPlace: false,
    updatedAt: false,
    xAccountUrl: false,
    linkedinUrl: false,
    gitHubUrl: false,
    image: false,
  });
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: personRowFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 100 },
    },
  });

  const columnLabels: Record<string, string> = {
    name: 'Nombre',
    email: 'Email',
    emailVerified: 'Verificado',
    phoneNumber: 'Teléfono',
    role: 'Rol',
    image: 'Avatar',
    countryOfOrigin: 'Ubicación',
    province: 'Provincia',
    languages: 'Lenguajes',
    linkedinUrl: 'LinkedIn',
    xAccountUrl: 'X / Twitter',
    gitHubUrl: 'GitHub',
    slogan: 'Slogan',
    jobTitle: 'Trabajo',
    enterprise: 'Empresa',
    career: 'Estudios',
    studyPlace: 'Lugar de estudio',
    createdAt: 'Alta',
    updatedAt: 'Actualizado',
    id: 'ID',
  };

  return (
    <div>
      <StickyHeader>
        {header}
        {/* Toolbar */}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            searchQuery={globalFilter}
            setSearchQuery={setGlobalFilter}
            placeholder="usuario"
            label="Buscar usuario"
            className="max-w-none flex-1"
          />

          <div className="flex items-center gap-2">
            <span
              className="font-mono text-xs tabular-nums text-muted-foreground"
              aria-live="polite"
            >
              <span className="text-pcnGreen">{table.getFilteredRowModel().rows.length}</span>/
              {data.length}
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center gap-1.5 rounded-sm border border-pcnGreen-200 px-2.5 font-mono text-xs text-muted-foreground transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen data-[state=open]:border-pcnGreen-600 data-[state=open]:text-pcnGreen"
                >
                  <SlidersHorizontal className="size-3.5" />
                  --columnas
                  <span className="text-[10px] tabular-nums opacity-60">
                    {table.getVisibleLeafColumns().length}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((col) => col.getCanHide())
                  .map((col) => (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={col.getIsVisible()}
                      onCheckedChange={(value) => col.toggleVisibility(!!value)}
                    >
                      {columnLabels[col.id] ?? col.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </StickyHeader>

      {intro}

      <div className="mb-14 space-y-2">
        {/* Table */}
        <div className="max-h-[calc(100dvh-12rem)] overflow-auto border border-pcnGreen-200 [scrollbar-width:thin]">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        (header.column.columnDef.meta as { className?: string } | undefined)
                          ?.className
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={
                          (cell.column.columnDef.meta as { className?: string } | undefined)
                            ?.className
                        }
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center font-mono text-muted-foreground"
                  >
                    <span className="text-pcnGreen-500">$ </span>grep: 0 usuarios
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination: hidden while everything fits on one page. */}
        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-end gap-2 font-mono text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Página anterior"
              className="rounded-sm border border-pcnGreen-200 p-1 transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen disabled:opacity-30"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="tabular-nums">
              página{' '}
              <span className="text-pcnGreen">{table.getState().pagination.pageIndex + 1}</span>/
              {table.getPageCount()}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Página siguiente"
              className="rounded-sm border border-pcnGreen-200 p-1 transition-colors hover:border-pcnGreen-600 hover:text-pcnGreen disabled:opacity-30"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
