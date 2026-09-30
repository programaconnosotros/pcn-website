'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Link2, Unlink } from 'lucide-react';
import { setIdentityLink } from '@/actions/identity-links/set-identity-link';
import { UserCombobox } from '@/components/admin/user-combobox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { IdentitySource, LinkedUser } from '@/lib/identity-links';
import { cn } from '@/lib/utils';

export type IdentityRow = {
  externalName: string;
  detail: string;
  weight: number;
  avatarUrl?: string;
  user: LinkedUser | null;
};

type Filter = 'todos' | 'vinculados' | 'pendientes';

interface IdentityLinksTableProps {
  source: IdentitySource;
  title: string;
  command: string;
  rows: IdentityRow[];
  emptyMessage?: string;
}

export function IdentityLinksTable({
  source,
  title,
  command,
  rows: initialRows,
  emptyMessage = 'sin filas',
}: IdentityLinksTableProps) {
  const [rows, setRows] = useState(initialRows);
  const [filter, setFilter] = useState<Filter>('todos');
  const [query, setQuery] = useState('');
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const linkedCount = rows.filter((row) => row.user).length;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === 'vinculados' && !row.user) return false;
      if (filter === 'pendientes' && row.user) return false;
      return (
        !q || [row.externalName, row.user?.name ?? ''].some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [rows, filter, query]);

  const save = (externalName: string, user: LinkedUser | null) => {
    const previous = rows;
    setRows((current) =>
      current.map((row) => (row.externalName === externalName ? { ...row, user } : row)),
    );
    setPendingName(externalName);
    startTransition(async () => {
      try {
        await setIdentityLink({ source, externalName, userId: user?.id ?? null });
        toast.success(user ? `${externalName} → ${user.name}` : `${externalName} desvinculado`);
      } catch (error: any) {
        setRows(previous);
        toast.error(error.message || 'No se pudo guardar el vínculo');
      } finally {
        setPendingName(null);
      }
    });
  };

  return (
    <section className="min-w-0 border border-pcnGreen-200">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-pcnGreen-200 bg-pcnGreen/[0.03] px-3 py-2 font-mono text-xs">
        <h2 className="font-semibold uppercase tracking-widest text-pcnGreen">{title}</h2>
        <span className="text-muted-foreground">
          <span className="text-pcnGreen-600">$ </span>
          {command}
        </span>
        <span className="ml-auto flex items-center gap-2 tabular-nums text-muted-foreground">
          <span aria-hidden className="tracking-[-0.05em]">
            <span className="text-pcnGreen">
              {'█'.repeat(Math.round((linkedCount / Math.max(rows.length, 1)) * 12))}
            </span>
            <span className="text-pcnGreen-200">
              {'░'.repeat(12 - Math.round((linkedCount / Math.max(rows.length, 1)) * 12))}
            </span>
          </span>
          <span className="text-pcnGreen">{linkedCount}</span>/{rows.length}
        </span>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-pcnGreen-200 px-3 py-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="grep -i nombre"
          aria-label={`Filtrar ${title}`}
          spellCheck={false}
          className="h-7 min-w-0 flex-1 rounded-sm border border-pcnGreen-200 bg-black/40 px-2 font-mono text-xs text-pcnGreen outline-none placeholder:text-muted-foreground/60 focus:border-pcnGreen-600"
        />
        <div
          role="group"
          aria-label="Filtrar por estado"
          className="flex border border-pcnGreen-200"
        >
          {(['todos', 'vinculados', 'pendientes'] as Filter[]).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                'h-7 px-2 font-mono text-[11px] transition-colors',
                filter === value
                  ? 'bg-pcnGreen/15 text-pcnGreen'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              --{value}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse font-mono text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="w-8 px-3 py-1.5 font-normal">#</th>
              <th className="px-2 py-1.5 font-normal">
                {source === 'github' ? 'login' : 'nombre'}
              </th>
              <th className="px-2 py-1.5 font-normal">actividad</th>
              <th className="w-64 px-3 py-1.5 font-normal">usuario pcn</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  <span className="text-pcnGreen-500">$ </span>
                  {rows.length === 0 ? emptyMessage : '0 coincidencias'}
                </td>
              </tr>
            )}
            {visible.map((row, index) => (
              <tr
                key={row.externalName}
                className={cn(
                  'group h-9 border-t border-pcnGreen-200/60 transition-colors hover:bg-pcnGreen/[0.05]',
                  pendingName === row.externalName && 'animate-pulse',
                )}
              >
                <td className="px-3 tabular-nums text-muted-foreground/60">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="px-2">
                  <span className="flex items-center gap-2">
                    {row.avatarUrl && (
                      <Image
                        src={row.avatarUrl}
                        alt=""
                        width={16}
                        height={16}
                        className="shrink-0 grayscale group-hover:grayscale-0"
                      />
                    )}
                    <span
                      className={cn(
                        'size-1.5 shrink-0 rounded-full',
                        row.user ? 'bg-pcnGreen shadow-[0_0_6px_#04f4be]' : 'bg-pcnGreen-200',
                      )}
                    />
                    <span className="truncate">{row.externalName}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 tabular-nums text-muted-foreground">
                  {row.detail}
                </td>
                <td className="px-3 py-1">
                  {row.user ? (
                    <span className="flex items-center gap-2">
                      <Link2 className="size-3 shrink-0 text-pcnGreen-600" />
                      <Avatar className="size-5 rounded-sm">
                        <AvatarImage src={row.user.image ?? undefined} alt="" />
                        <AvatarFallback className="rounded-sm text-[9px]">
                          {row.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/perfil/${row.user.id}`}
                        className="min-w-0 truncate text-pcnGreen hover:underline"
                      >
                        {row.user.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => save(row.externalName, null)}
                        disabled={pendingName !== null}
                        title="Desvincular"
                        className="ml-auto shrink-0 rounded-sm p-1 text-muted-foreground opacity-0 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:opacity-100 disabled:opacity-30 group-hover:opacity-100"
                      >
                        <Unlink className="size-3.5" />
                        <span className="sr-only">Desvincular {row.externalName}</span>
                      </button>
                    </span>
                  ) : (
                    <UserCombobox
                      placeholder="vincular a…"
                      disabled={pendingName !== null}
                      onSelect={(user) =>
                        save(row.externalName, { id: user.id, name: user.name, image: user.image })
                      }
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
