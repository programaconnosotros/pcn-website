'use client';

import Link from 'next/link';
import { ColumnDef, type Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Github, Linkedin, Twitter } from 'lucide-react';

import { UserWithoutPassword } from '@/actions/users/get-users';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LocalDate } from '@/components/ui/local-date-time';
import { TableTag } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { DeleteUserButton } from './delete-user-button';
import { UserFlagToggle } from './user-flag-toggle';
import { findProgrammingLanguage } from '@/types/programming-language';

const relativeFormat = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'short' });

const timeAgo = (date: Date) => {
  const days = Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
  if (Math.abs(days) >= 365) return relativeFormat.format(Math.round(days / 365), 'year');
  if (Math.abs(days) >= 30) return relativeFormat.format(Math.round(days / 30), 'month');
  return relativeFormat.format(days, 'day');
};

// `nombre ↕` — the arrow shows the current direction once sorted.
function SortableHeader<T>({ label, column }: { label: string; column: Column<T> }) {
  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;
  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === 'asc')}
      className={cn(
        'inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-pcnGreen',
        sorted && 'text-pcnGreen',
      )}
    >
      {label}
      <Icon className={cn('size-3', !sorted && 'opacity-40')} />
    </button>
  );
}

function EmptyCell() {
  return <span className="text-muted-foreground/40">—</span>;
}

// One muted line that truncates, with the full text on hover.
function Line({ text, className }: { text: string; className?: string }) {
  return (
    <span title={text} className={cn('block max-w-[220px] truncate', className)}>
      {text}
    </span>
  );
}

const socialLinks = [
  { key: 'gitHubUrl', label: 'GitHub', icon: Github },
  { key: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin },
  { key: 'xAccountUrl', label: 'X / Twitter', icon: Twitter },
] as const;

const urlCell = () =>
  function UrlCell({ getValue }: { getValue: () => unknown }) {
    const value = getValue() as string | null;
    return value ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        title={value}
        className="block max-w-[180px] truncate font-mono text-pcnGreen-700 hover:text-pcnGreen"
      >
        {value.replace(/^https?:\/\/(www\.)?/, '')}
      </a>
    ) : (
      <EmptyCell />
    );
  };

export const columns: ColumnDef<UserWithoutPassword>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-[11px] text-muted-foreground">{getValue<string>()}</span>
    ),
    enableHiding: true,
  },
  {
    accessorKey: 'name',
    meta: { className: 'min-w-[200px] whitespace-nowrap' },
    header: ({ column }) => <SortableHeader label="Nombre" column={column} />,
    cell: ({ row }) => {
      const { id, name, image } = row.original;
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      return (
        <Link href={`/perfil/${id}`} className="group/name flex items-center gap-2">
          <Avatar className="size-6 rounded-sm ring-1 ring-pcnGreen-200 group-hover/name:ring-pcnGreen-600">
            <AvatarImage src={image ?? undefined} alt="" />
            <AvatarFallback className="rounded-sm text-[9px]">{initials}</AvatarFallback>
          </Avatar>
          <span className="font-medium transition-colors group-hover/name:text-pcnGreen">
            {name}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortableHeader label="Email" column={column} />,
    cell: ({ row }) => {
      const { email, emailVerified } = row.original;
      return (
        <span className="flex items-center gap-2 font-mono text-[11px]">
          <span
            title={emailVerified ? 'Email verificado' : 'Email sin verificar'}
            className={cn(
              'size-1.5 shrink-0 rounded-full',
              emailVerified ? 'bg-pcnGreen shadow-[0_0_6px_#04f4be]' : 'bg-amber-500/70',
            )}
          />
          <a href={`mailto:${email}`} className="truncate hover:text-pcnGreen">
            {email}
          </a>
          <span className="sr-only">{emailVerified ? 'verificado' : 'sin verificar'}</span>
        </span>
      );
    },
  },
  {
    accessorKey: 'emailVerified',
    header: ({ column }) => <SortableHeader label="Verificado" column={column} />,
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <TableTag tone="green">sí</TableTag>
      ) : (
        <TableTag tone="warn">no</TableTag>
      ),
    enableHiding: true,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <SortableHeader label="Rol" column={column} />,
    cell: ({ row }) => (
      <UserFlagToggle
        flag="admin"
        userId={row.original.id}
        userName={row.original.name}
        active={row.original.role === 'ADMIN'}
      />
    ),
  },
  {
    accessorKey: 'isCofounder',
    header: ({ column }) => <SortableHeader label="Co-founder" column={column} />,
    cell: ({ row }) => (
      <UserFlagToggle
        flag="cofounder"
        userId={row.original.id}
        userName={row.original.name}
        active={row.original.isCofounder}
      />
    ),
  },
  {
    accessorKey: 'isAmbassador',
    header: ({ column }) => <SortableHeader label="Ambassador" column={column} />,
    cell: ({ row }) => (
      <UserFlagToggle
        flag="ambassador"
        userId={row.original.id}
        userName={row.original.name}
        active={row.original.isAmbassador}
      />
    ),
  },
  {
    id: 'suspended',
    accessorFn: (user) => user.suspendedAt !== null,
    header: ({ column }) => <SortableHeader label="Suspendida" column={column} />,
    cell: ({ row }) => (
      <UserFlagToggle
        flag="suspended"
        userId={row.original.id}
        userName={row.original.name}
        active={row.original.suspendedAt !== null}
      />
    ),
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Teléfono',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? (
        <a
          href={`tel:${v}`}
          className="whitespace-nowrap font-mono text-[11px] hover:text-pcnGreen"
        >
          {v}
        </a>
      ) : (
        <EmptyCell />
      );
    },
  },
  {
    accessorKey: 'countryOfOrigin',
    header: ({ column }) => <SortableHeader label="Ubicación" column={column} />,
    cell: ({ row }) => {
      const { province, countryOfOrigin } = row.original;
      const location = [province, countryOfOrigin].filter(Boolean).join(', ');
      return location ? <Line text={location} /> : <EmptyCell />;
    },
  },
  {
    accessorKey: 'province',
    header: 'Provincia',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <Line text={v} /> : <EmptyCell />;
    },
    enableHiding: true,
  },
  {
    accessorKey: 'jobTitle',
    header: 'Trabajo',
    cell: ({ row }) => {
      const { jobTitle, enterprise } = row.original;
      if (!jobTitle && !enterprise) return <EmptyCell />;
      return (
        <Line
          text={[jobTitle, enterprise].filter(Boolean).join(' @ ')}
          className="text-muted-foreground"
        />
      );
    },
  },
  {
    accessorKey: 'enterprise',
    header: 'Empresa',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <Line text={v} /> : <EmptyCell />;
    },
    enableHiding: true,
  },
  {
    accessorKey: 'career',
    header: 'Estudios',
    cell: ({ row }) => {
      const { career, studyPlace } = row.original;
      if (!career && !studyPlace) return <EmptyCell />;
      return (
        <Line
          text={[career, studyPlace].filter(Boolean).join(' · ')}
          className="text-muted-foreground"
        />
      );
    },
  },
  {
    accessorKey: 'studyPlace',
    header: 'Lugar de estudio',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <Line text={v} /> : <EmptyCell />;
    },
    enableHiding: true,
  },
  {
    accessorKey: 'slogan',
    header: 'Slogan',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <Line text={v} className="italic text-muted-foreground" /> : <EmptyCell />;
    },
  },
  {
    accessorKey: 'languages',
    header: 'Lenguajes',
    cell: ({ getValue }) => {
      const langs = getValue<UserWithoutPassword['languages']>();
      if (!langs.length) return <EmptyCell />;
      return (
        <span className="flex items-center gap-1" title={langs.map((l) => l.language).join(', ')}>
          {langs.map((l) => (
            <span
              key={l.language}
              className="size-2 rounded-full ring-1 ring-black"
              style={{
                backgroundColor: findProgrammingLanguage(l.language)?.color ?? l.color,
              }}
            />
          ))}
          <span className="ml-1 font-mono text-[10px] text-muted-foreground">{langs.length}</span>
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: 'socials',
    header: 'Redes',
    cell: ({ row }) => {
      const links = socialLinks.filter(({ key }) => row.original[key]);
      if (!links.length) return <EmptyCell />;
      return (
        <span className="flex items-center gap-1.5">
          {links.map(({ key, label, icon: Icon }) => (
            <a
              key={key}
              href={row.original[key]!}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              className="text-muted-foreground transition-colors hover:text-pcnGreen"
            >
              <Icon className="size-3.5" />
              <span className="sr-only">{label}</span>
            </a>
          ))}
        </span>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  { accessorKey: 'linkedinUrl', header: 'LinkedIn', cell: urlCell(), enableHiding: true },
  { accessorKey: 'xAccountUrl', header: 'X / Twitter', cell: urlCell(), enableHiding: true },
  { accessorKey: 'gitHubUrl', header: 'GitHub', cell: urlCell(), enableHiding: true },
  {
    accessorKey: 'image',
    header: 'Avatar URL',
    cell: ({ getValue }) => {
      const v = getValue<string | null>();
      return v ? <Line text={v} className="font-mono text-muted-foreground" /> : <EmptyCell />;
    },
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <SortableHeader label="Alta" column={column} />,
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return (
        <span
          className="whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground"
          suppressHydrationWarning
        >
          {timeAgo(date)} <span className="text-muted-foreground/50">·</span>{' '}
          <LocalDate date={date} />
        </span>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <SortableHeader label="Actualizado" column={column} />,
    cell: ({ getValue }) => (
      <span className="whitespace-nowrap font-mono text-[11px] tabular-nums text-muted-foreground">
        <LocalDate date={getValue<Date>()} />
      </span>
    ),
    enableHiding: true,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <DeleteUserButton userId={row.original.id} userName={row.original.name} />,
    enableSorting: false,
  },
];
