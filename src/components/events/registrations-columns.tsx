'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { EventRegistrationRow } from '@/actions/events/get-event-registrations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocalDateTime } from '@/components/ui/local-date-time';
import { DeleteRegistrationButton } from '@/components/events/delete-registration-button';

function SortableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3 gap-1" onClick={onClick}>
      {label}
      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  );
}

export const registrationColumns: ColumnDef<EventRegistrationRow>[] = [
  {
    accessorKey: 'name',
    meta: { className: 'min-w-[260px] whitespace-nowrap' },
    header: ({ column }) => (
      <SortableHeader
        label="Nombre"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      />
    ),
    cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span>,
  },
  {
    accessorKey: 'email',
    meta: { className: 'min-w-[280px]' },
    header: 'Email',
    cell: ({ getValue }) => <span className="text-sm">{getValue<string>()}</span>,
  },
  {
    id: 'info',
    meta: { className: 'min-w-[320px]' },
    header: 'Información',
    enableSorting: false,
    cell: ({ row }) => {
      const { jobTitle, enterprise, career, studyPlace } = row.original;
      const hasProfessionalData = jobTitle && enterprise;
      const hasStudentData = career && studyPlace;

      if (hasProfessionalData) {
        return (
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline" className="mb-1">
              Profesional
            </Badge>
            <p>
              <span className="font-medium">Trabaja:</span> {jobTitle}
            </p>
            <p>
              <span className="font-medium">En:</span> {enterprise}
            </p>
          </div>
        );
      }

      if (hasStudentData) {
        return (
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline" className="mb-1">
              Estudiante
            </Badge>
            <p>
              <span className="font-medium">Estudia:</span> {career}
            </p>
            <p>
              <span className="font-medium">Dónde:</span> {studyPlace}
            </p>
          </div>
        );
      }

      return <span className="text-sm text-muted-foreground">Sin información adicional</span>;
    },
  },
  {
    accessorKey: 'cancelledAt',
    meta: { className: 'min-w-[120px]' },
    header: 'Estado',
    enableSorting: false,
    cell: ({ getValue }) => {
      const v = getValue<Date | null>();
      return v ? (
        <Badge variant="destructive">Cancelada</Badge>
      ) : (
        <Badge variant="default">Activa</Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    meta: { className: 'min-w-[200px]' },
    header: ({ column }) => (
      <SortableHeader
        label="Fecha de inscripción"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      />
    ),
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        <LocalDateTime date={getValue<Date>()} />
      </span>
    ),
  },
  {
    id: 'actions',
    meta: { className: 'text-right' },
    header: () => <span className="block text-right">Acciones</span>,
    enableSorting: false,
    cell: ({ row }) => {
      const { id, name, cancelledAt } = row.original;
      if (cancelledAt) return null;
      return (
        <div className="flex justify-end">
          <DeleteRegistrationButton registrationId={id} userName={name} />
        </div>
      );
    },
  },
];
