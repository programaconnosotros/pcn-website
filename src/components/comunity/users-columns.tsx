'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Github, Linkedin, Twitter } from 'lucide-react';

import { UserWithoutPassword } from '@/actions/users/get-users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LocalDateTime } from '@/components/ui/local-date-time';

function SortableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3 gap-1" onClick={onClick}>
      {label}
      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  );
}

function EmptyCell() {
  return <span className="text-muted-foreground">—</span>;
}

export const columns: ColumnDef<UserWithoutPassword>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-muted-foreground">{getValue<string>()}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: 'name',
    meta: { className: 'min-w-[220px] whitespace-nowrap' },
    header: ({ column }) => (
      <SortableHeader label="Nombre" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
    ),
    cell: ({ row }) => {
      const { name, image } = row.original;
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={image ?? undefined} alt={name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <SortableHeader label="Email" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
    ),
    cell: ({ row }) => {
      const { email, emailVerified } = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm">{email}</span>
          {emailVerified ? (
            <Badge variant="outline" className="w-fit border-green-500/40 bg-green-500/10 text-xs text-green-600 dark:text-green-400">
              Verificado
            </Badge>
          ) : (
            <Badge variant="outline" className="w-fit text-xs text-muted-foreground">
              Sin verificar
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'emailVerified',
    header: 'Email verificado',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge variant="outline" className="border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400">
          Sí
        </Badge>
      ) : (
        <Badge variant="outline" className="text-muted-foreground">
          No
        </Badge>
      ),
    enableHiding: true,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <SortableHeader label="Rol" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
    ),
    cell: ({ getValue }) => {
      const role = getValue<'REGULAR' | 'ADMIN'>();
      return role === 'ADMIN' ? (
        <Badge className="bg-pcnPurple/20 text-pcnPurple dark:bg-pcnGreen/20 dark:text-pcnGreen">
          Admin
        </Badge>
      ) : (
        <Badge variant="secondary">Regular</Badge>
      );
    },
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Teléfono',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <span className="text-sm">{v}</span> : <EmptyCell />;
    },
  },
  {
    accessorKey: 'countryOfOrigin',
    header: ({ column }) => (
      <SortableHeader label="País" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} />
    ),
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <span className="text-sm">{v}</span> : <EmptyCell />;
    },
  },
  {
    accessorKey: 'province',
    header: 'Provincia',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <span className="text-sm">{v}</span> : <EmptyCell />;
    },
    enableHiding: true,
  },
  {
    accessorKey: 'jobTitle',
    header: 'Cargo',
    cell: ({ row }) => {
      const { jobTitle, enterprise } = row.original;
      if (!jobTitle) return <EmptyCell />;
      return (
        <div className="text-sm">
          <p className="font-medium">{jobTitle}</p>
          {enterprise && <p className="text-muted-foreground">{enterprise}</p>}
        </div>
      );
    },
  },
  {
    accessorKey: 'enterprise',
    header: 'Empresa',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <span className="text-sm">{v}</span> : <EmptyCell />;
    },
    enableHiding: true,
  },
  {
    accessorKey: 'career',
    meta: { className: 'min-w-[200px]' },
    header: 'Carrera',
    cell: ({ row }) => {
      const { career, studyPlace } = row.original;
      if (!career) return <EmptyCell />;
      return (
        <div className="text-sm">
          <p className="font-medium">{career}</p>
          {studyPlace && <p className="text-muted-foreground">{studyPlace}</p>}
        </div>
      );
    },
  },
  {
    accessorKey: 'studyPlace',
    header: 'Lugar de estudio',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <span className="text-sm">{v}</span> : <EmptyCell />;
    },
    enableHiding: true,
  },
  {
    accessorKey: 'slogan',
    header: 'Slogan',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? (
        <span className="max-w-[200px] truncate text-sm italic text-muted-foreground">{v}</span>
      ) : (
        <EmptyCell />
      );
    },
  },
  {
    accessorKey: 'languages',
    header: 'Lenguajes',
    cell: ({ getValue }) => {
      const langs = getValue<UserWithoutPassword['languages']>();
      if (!langs.length) return <EmptyCell />;
      return (
        <div className="flex flex-wrap gap-1">
          {langs.map((l) => (
            <Badge
              key={l.language}
              variant="outline"
              className="text-xs"
              style={{ borderColor: `${l.color}55`, color: l.color }}
            >
              {l.language}
            </Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'socials',
    header: 'Redes',
    cell: ({ row }) => {
      const { linkedinUrl, xAccountUrl, gitHubUrl } = row.original;
      if (!linkedinUrl && !xAccountUrl && !gitHubUrl) return <EmptyCell />;
      return (
        <div className="flex items-center gap-2">
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {xAccountUrl && (
            <a
              href={xAccountUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="X / Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
          )}
          {gitHubUrl && (
            <a
              href={gitHubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'linkedinUrl',
    header: 'LinkedIn',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? (
        <a href={v} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
          {v}
        </a>
      ) : (
        <EmptyCell />
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: 'xAccountUrl',
    header: 'X / Twitter',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? (
        <a href={v} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
          {v}
        </a>
      ) : (
        <EmptyCell />
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: 'gitHubUrl',
    header: 'GitHub',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? (
        <a href={v} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
          {v}
        </a>
      ) : (
        <EmptyCell />
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: 'image',
    header: 'Avatar URL',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? (
        <span className="max-w-[150px] truncate font-mono text-xs text-muted-foreground">{v}</span>
      ) : (
        <EmptyCell />
      );
    },
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <SortableHeader
        label="Miembro desde"
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
    accessorKey: 'updatedAt',
    header: 'Actualizado',
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        <LocalDateTime date={getValue<Date>()} />
      </span>
    ),
    enableHiding: true,
  },
];
