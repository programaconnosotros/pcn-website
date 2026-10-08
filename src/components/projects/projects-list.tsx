'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Edit,
  GripVertical,
  LogOut,
  MoreVertical,
  Plus,
  Terminal,
  Trash2,
} from 'lucide-react';
import { Github } from '@/components/icons/brand-icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageTitle } from '@/components/ui/page-title';
import { StickyHeader } from '@/components/ui/sticky-header';
import { SearchBar } from '@/components/ui/search-bar';
import { CollapsibleFilters } from '@/components/ui/collapsible-filters';
import { RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { WebReaderDialog } from '@/components/web-reader/web-reader-dialog';
import { cn } from '@/lib/utils';
import { ProjectForm } from './project-form';
import { deleteProject } from '@/actions/projects/delete-project';
import { leaveProject } from '@/actions/projects/leave-project';
import { reorderProjects } from '@/actions/projects/reorder-projects';
import { fetchPublicProjects } from '@/actions/projects/fetch-public-projects';
import { actionErrorMessage } from '@/lib/rate-limit-messages';

type ProjectWithMembers = Awaited<ReturnType<typeof fetchPublicProjects>>[number];

type Person = {
  key: string;
  name: string;
  role: string | null;
  user: { id: string; image: string | null } | null;
};

interface Props {
  projects: ProjectWithMembers[];
  currentUser: { id: string; name: string; isAdmin: boolean } | null;
}

const TOP_STACK = 8;
const MAX_AVATARS = 5;

const relativeFormat = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

const timeAgo = (date: Date) => {
  const days = Math.round((new Date(date).getTime() - Date.now()) / 86_400_000);
  if (Math.abs(days) >= 365) return relativeFormat.format(Math.round(days / 365), 'year');
  if (Math.abs(days) >= 30) return relativeFormat.format(Math.round(days / 30), 'month');
  return relativeFormat.format(days, 'day');
};

const hex = (index: number) => `0x${(index + 1).toString(16).padStart(2, '0')}`;

const displayUrl = (url: string) => {
  try {
    const { host, pathname } = new URL(url);
    return `${host.replace(/^www\./, '')}${pathname === '/' ? '' : pathname.replace(/\/$/, '')}`;
  } catch {
    return url;
  }
};

// "2023 → 2025", "2023 → hoy" o solo el año de cierre si no se cargó el de inicio.
const yearsLabel = ({ startYear, endYear }: ProjectWithMembers) => {
  if (startYear) return `${startYear} → ${endYear ?? 'hoy'}`;
  if (endYear) return `→ ${endYear}`;
  return null;
};

const personTitle = (person: Person) =>
  person.role ? `${person.name} · ${person.role}` : person.name;

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

// Author first, then the collaborators, as one list of people.
const peopleOf = (project: ProjectWithMembers): Person[] => [
  ...(project.author
    ? [
        {
          key: project.author.id,
          name: project.author.name,
          role: project.authorRole,
          user: project.author,
        },
      ]
    : []),
  ...project.members.map((member) => ({
    key: member.id,
    name: member.memberName,
    role: member.role,
    user: member.user,
  })),
];

const Stat = ({ label, value, hint }: { label: string; value: string | number; hint: string }) => (
  <div className={cn(ruledCellClassName, 'relative overflow-hidden px-3 py-2.5')}>
    <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{label}</p>
    <p className="font-mono text-2xl font-semibold text-pcnGreen tabular-nums text-glow">{value}</p>
    <p className="truncate font-mono text-[11px] text-muted-foreground/70">{hint}</p>
  </div>
);

const Flag = ({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      'flex h-8 shrink-0 items-center gap-1.5 rounded-sm border px-2.5 font-mono text-xs transition-colors',
      active
        ? 'border-pcnGreen-600 bg-pcnGreen/10 text-pcnGreen'
        : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-400 hover:text-foreground',
    )}
  >
    {children}
    {count !== undefined && <span className="text-[10px] tabular-nums opacity-60">{count}</span>}
  </button>
);

const People = ({ people }: { people: Person[] }) => {
  if (people.length === 0) return null;
  const shown = people.slice(0, MAX_AVATARS);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex shrink-0 -space-x-1.5">
        {shown.map((person) => {
          const avatar = (
            <Avatar className="size-6 rounded-sm ring-2 ring-background transition-transform hover:z-10 hover:-translate-y-0.5">
              <AvatarImage src={person.user?.image ?? undefined} alt={person.name} />
              <AvatarFallback className="rounded-sm bg-pcnGreen-100 text-[9px] text-pcnGreen">
                {initials(person.name)}
              </AvatarFallback>
            </Avatar>
          );
          return person.user ? (
            <Link key={person.key} href={`/perfil/${person.user.id}`} title={personTitle(person)}>
              {avatar}
            </Link>
          ) : (
            <span key={person.key} title={personTitle(person)}>
              {avatar}
            </span>
          );
        })}
      </div>
      <p className="min-w-0 font-mono text-[11px] text-muted-foreground">
        {people.map((person, index) => (
          <Fragment key={person.key}>
            {index > 0 && <span className="text-muted-foreground/60">, </span>}
            <span className="whitespace-nowrap">
              <span className="text-pcnGreen-500">@</span>
              {person.user ? (
                <Link href={`/perfil/${person.user.id}`} className="hover:text-pcnGreen">
                  {person.name}
                </Link>
              ) : (
                person.name
              )}
            </span>
          </Fragment>
        ))}
      </p>
    </div>
  );
};

export function ProjectsList({ projects, currentUser }: Props) {
  const isAdmin = !!currentUser?.isAdmin;
  // El autor (o un admin) puede todo; los colaboradores editan la info básica o se van.
  const canManage = (project: ProjectWithMembers) =>
    !!currentUser && (currentUser.isAdmin || project.authorId === currentUser.id);
  const isCollaborator = (project: ProjectWithMembers) =>
    !!currentUser && project.members.some((member) => member.userId === currentUser.id);

  const [items, setItems] = useState(projects);
  const [searchQuery, setSearchQuery] = useState('');
  const [stack, setStack] = useState<string | null>(null);
  const [openSourceOnly, setOpenSourceOnly] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const orderBeforeDrag = useRef<ProjectWithMembers[] | null>(null);

  const [reading, setReading] = useState<ProjectWithMembers | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithMembers | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectWithMembers | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [leavingProject, setLeavingProject] = useState<ProjectWithMembers | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  // Follow the server list after a create, edit or delete, unless an admin is mid-drag.
  useEffect(() => {
    if (!draggingId) setItems(projects);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const stats = useMemo(() => {
    const people = new Set(
      projects.flatMap((project) =>
        peopleOf(project).map((person) => person.user?.id ?? person.name.toLowerCase()),
      ),
    );
    const stackCounts = new Map<string, number>();
    for (const project of projects) {
      for (const tech of project.techStack) {
        stackCounts.set(tech, (stackCounts.get(tech) ?? 0) + 1);
      }
    }
    const newest = projects.reduce<Date | null>(
      (latest, project) =>
        !latest || new Date(project.createdAt) > latest ? new Date(project.createdAt) : latest,
      null,
    );
    return {
      people: people.size,
      openSource: projects.filter((project) => project.isOpenSource).length,
      stack: [...stackCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
      newest,
    };
  }, [projects]);

  const query = searchQuery.trim().toLowerCase();
  const visible = reordering
    ? items
    : items.filter((project) => {
        if (openSourceOnly && !project.isOpenSource) return false;
        if (stack && !project.techStack.includes(stack)) return false;
        if (!query) return true;
        return [
          project.title,
          project.description,
          project.url,
          project.repoUrl ?? '',
          ...(project.isOpenSource ? ['open-source', 'open source', 'oss'] : []),
          ...project.techStack,
          ...peopleOf(project).flatMap((person) => [person.name, person.role ?? '']),
        ].some((text) => text.toLowerCase().includes(query));
      });

  const saveOrder = async (next: ProjectWithMembers[], previous: ProjectWithMembers[]) => {
    if (next.every((project, index) => project.id === previous[index]?.id)) return;
    setSavingOrder(true);
    try {
      await reorderProjects(next.map((project) => project.id));
      toast.success('Orden guardado');
    } catch (error: any) {
      setItems(previous);
      toast.error(actionErrorMessage(error, 'No se pudo guardar el orden', true));
    } finally {
      setSavingOrder(false);
    }
  };

  const moveTo = (id: string, targetIndex: number) =>
    setItems((current) => {
      const from = current.findIndex((project) => project.id === id);
      if (from === -1 || from === targetIndex) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });

  // Keyboard-friendly alternative to dragging: nudge one step up or down and save right away.
  const nudge = (id: string, direction: -1 | 1) => {
    const from = items.findIndex((project) => project.id === id);
    const to = from + direction;
    if (from === -1 || to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    setItems(next);
    void saveOrder(next, items);
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await deleteProject(deletingProject.id);
      toast.success('Proyecto eliminado');
      setDeletingProject(null);
    } catch (error: any) {
      toast.error(actionErrorMessage(error, 'Error al eliminar el proyecto', true));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeave = async () => {
    if (!leavingProject) return;
    setIsLeaving(true);
    try {
      await leaveProject(leavingProject.id);
      toast.success('Saliste del proyecto');
      setLeavingProject(null);
    } catch (error: any) {
      toast.error(actionErrorMessage(error, 'Error al salir del proyecto', true));
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="mt-4">
      <StickyHeader>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <PageTitle
            path="proyectos"
            className="flex-1"
            meta={`${projects.length} proyectos construidos por la comunidad`}
          />

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant={reordering ? 'pcn' : 'outline'}
                size="sm"
                onClick={() => setReordering((value) => !value)}
                disabled={savingOrder}
                className="font-mono"
              >
                {reordering ? (
                  <Check className="mr-1 h-4 w-4" />
                ) : (
                  <GripVertical className="mr-1 h-4 w-4" />
                )}
                {reordering ? 'terminar();' : 'ordenar();'}
              </Button>
            )}
            {currentUser ? (
              <Button variant="pcn" size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="mr-1 h-4 w-4" />
                publicarProyecto();
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/autenticacion/iniciar-sesion">iniciarSesion();</Link>
              </Button>
            )}
          </div>
        </div>

        {reordering ? (
          <p className="mb-4 flex items-center gap-2 border border-dashed border-pcnGreen-600 bg-pcnGreen/5 px-3 py-2 font-mono text-xs text-pcnGreen">
            <GripVertical className="size-3.5 shrink-0" />
            arrastrá los proyectos (o usá las flechas) para cambiar el orden · se guarda solo
            {savingOrder && <span className="cursor-blink ml-auto">guardando</span>}
          </p>
        ) : (
          <CollapsibleFilters
            className="mb-4"
            activeCount={Number(openSourceOnly) + Number(!!stack)}
            search={
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                placeholder="proyecto, stack o persona"
                label="Buscar proyectos"
              />
            }
            // From md up the flags scroll sideways next to the search instead of wrapping.
            panelClassName="gap-1.5 md:min-w-0 md:flex-1 md:flex-nowrap md:overflow-x-auto scrollbar-none"
          >
            {stats.openSource > 0 && (
              <>
                <Flag
                  active={openSourceOnly}
                  onClick={() => setOpenSourceOnly((value) => !value)}
                  count={stats.openSource}
                >
                  <Github className="size-3" />
                  --open-source
                </Flag>
                <span aria-hidden className="my-1.5 w-px shrink-0 self-stretch bg-pcnGreen-200" />
              </>
            )}
            {stats.stack.slice(0, TOP_STACK).map(([tech, count]) => (
              <Flag
                key={tech}
                active={stack === tech}
                onClick={() => setStack(stack === tech ? null : tech)}
                count={count}
              >
                --{tech.toLowerCase()}
              </Flag>
            ))}
          </CollapsibleFilters>
        )}
      </StickyHeader>

      <div className="relative mb-6">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade" />
        <p className="mb-2 font-mono text-xs text-muted-foreground">
          <span className="text-pcnGreen-500">pcn@comunidad</span>:
          <span className="text-foreground/80">~/proyectos</span>$ ls -la --sort=curado
        </p>
        <RuledGrid className="grid-cols-2 lg:grid-cols-4">
          <Stat
            label="proyectos"
            value={projects.length}
            hint={
              stats.openSource > 0 ? `${stats.openSource} open-source` : 'en producción o en camino'
            }
          />
          <Stat label="builders" value={stats.people} hint="personas detrás del código" />
          <Stat
            label="tecnologías"
            value={stats.stack.length}
            hint={
              stats.stack
                .slice(0, 3)
                .map(([tech]) => tech)
                .join(' · ') || '—'
            }
          />
          <Stat
            label="última publicación"
            value={stats.newest ? timeAgo(stats.newest) : '—'}
            hint="proyecto más reciente"
          />
        </RuledGrid>
      </div>

      {projects.length === 0 && (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>todavía no hay proyectos publicados
        </p>
      )}

      {projects.length > 0 && visible.length === 0 && (
        <p className="border border-dashed border-pcnGreen-200 py-10 text-center font-mono text-sm text-muted-foreground">
          <span className="text-pcnGreen-500">$ </span>grep: 0 proyectos
          {query && (
            <>
              {' '}
              para <span className="text-pcnGreen">&quot;{searchQuery}&quot;</span>
            </>
          )}
          {openSourceOnly && <> --open-source</>}
          {stack && <> con --{stack.toLowerCase()}</>}
        </p>
      )}

      <RuledGrid className="mb-14 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        {visible.map((project, index) => {
          const people = peopleOf(project);
          const isDragging = draggingId === project.id;
          return (
            <article
              key={project.id}
              draggable={reordering}
              onDragStart={(event) => {
                if (!reordering) return;
                event.dataTransfer.effectAllowed = 'move';
                orderBeforeDrag.current = items;
                setDraggingId(project.id);
              }}
              onDragOver={(event) => {
                if (!reordering || !draggingId) return;
                event.preventDefault();
                if (draggingId !== project.id) moveTo(draggingId, index);
              }}
              onDrop={(event) => event.preventDefault()}
              onDragEnd={() => {
                const previous = orderBeforeDrag.current;
                setDraggingId(null);
                orderBeforeDrag.current = null;
                if (previous) void saveOrder(items, previous);
              }}
              style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
              className={cn(
                ruledCellClassName,
                'relative flex group project-boot flex-col gap-3 overflow-hidden p-4',
                'hover:shadow-[inset_2px_0_0_#04f4be]',
                reordering && 'cursor-grab select-none active:cursor-grabbing',
                isDragging && 'bg-pcnGreen/10 opacity-60 outline-1 outline-pcnGreen outline-dashed',
              )}
            >
              {/* Scan line sweeping down the row while hovered. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1/4 article-scan bg-linear-to-b from-transparent via-pcnGreen/[0.07] to-transparent opacity-0 group-hover:opacity-100"
              />

              <header className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                {reordering && (
                  <span className="flex items-center gap-0.5 text-pcnGreen">
                    <GripVertical className="size-4" />
                    <button
                      type="button"
                      onClick={() => nudge(project.id, -1)}
                      disabled={index === 0 || savingOrder}
                      aria-label={`Subir ${project.title}`}
                      className="rounded-sm p-0.5 hover:bg-pcnGreen/10 disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => nudge(project.id, 1)}
                      disabled={index === visible.length - 1 || savingOrder}
                      aria-label={`Bajar ${project.title}`}
                      className="rounded-sm p-0.5 hover:bg-pcnGreen/10 disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </span>
                )}
                <span className="text-pcnGreen-600 tabular-nums">{hex(index)}</span>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-pcnGreen opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-pcnGreen" />
                </span>
                <span className="min-w-0 truncate">{displayUrl(project.url)}</span>
                {project.isOpenSource && (
                  <span className="shrink-0 rounded-sm border border-pcnGreen-600 px-1 text-[10px] leading-4 text-pcnGreen">
                    open-source
                  </span>
                )}
                {yearsLabel(project) && (
                  <span className="shrink-0 tabular-nums" title="Años del proyecto">
                    {yearsLabel(project)}
                  </span>
                )}

                {(canManage(project) || isCollaborator(project)) && !reordering && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-auto h-6 w-6 shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">Acciones de {project.title}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingProject(project)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      {isCollaborator(project) && (
                        <DropdownMenuItem onClick={() => setLeavingProject(project)}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Salir del proyecto
                        </DropdownMenuItem>
                      )}
                      {canManage(project) && (
                        <DropdownMenuItem
                          onClick={() => setDeletingProject(project)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </header>

              <div className="flex items-start gap-3">
                {/* App-icon rounding plus a slight zoom clips the square black corners some PNG
                    logos have baked in around their own rounded artwork. */}
                <div
                  className={cn(
                    'relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[22%] transition-shadow group-hover:shadow-[0_0_22px_-4px_rgba(4,244,190,0.75)]',
                    !project.logoUrl && 'bg-white',
                  )}
                >
                  {project.logoUrl ? (
                    <Image
                      src={project.logoUrl}
                      alt={`Logo de ${project.title}`}
                      width={112}
                      height={112}
                      className="h-full w-full scale-[1.06] object-cover"
                    />
                  ) : (
                    <span className="font-mono text-lg font-bold text-black">
                      {initials(project.title)}
                    </span>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h2>
                    <Link
                      href={`/proyectos/${project.id}`}
                      onClick={(event) => reordering && event.preventDefault()}
                      className={cn(
                        'project-glitch text-left font-mono text-base leading-snug font-semibold transition-colors group-hover:text-pcnGreen',
                        reordering && 'pointer-events-none',
                      )}
                      data-text={project.title}
                    >
                      {project.title}
                    </Link>
                  </h2>
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              </div>

              {project.techStack.length > 0 && (
                <ul className="flex flex-wrap gap-1 font-mono text-[10px]">
                  {project.techStack.map((tech) => (
                    <li key={tech}>
                      <button
                        type="button"
                        onClick={() => !reordering && setStack(stack === tech ? null : tech)}
                        className={cn(
                          'rounded-sm border px-1.5 leading-5 transition-colors',
                          stack === tech
                            ? 'border-pcnGreen bg-pcnGreen/15 text-pcnGreen'
                            : 'border-pcnGreen-200 text-muted-foreground hover:border-pcnGreen-600 hover:text-pcnGreen',
                        )}
                      >
                        {tech}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <footer className="mt-auto flex items-center gap-3 border-t border-dashed border-pcnGreen-200 pt-3">
                <People people={people} />
                <div className="ml-auto flex shrink-0 items-center gap-1.5 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => setReading(project)}
                    disabled={reordering}
                    className="flex items-center gap-1 rounded-sm border border-pcnGreen-600 bg-pcnGreen/10 px-2 py-1 text-pcnGreen transition-[box-shadow,background-color] hover:bg-pcnGreen/20 hover:shadow-[0_0_14px_-3px_rgba(4,244,190,0.8)] disabled:opacity-40"
                  >
                    <Terminal className="size-3" />
                    ./run
                  </button>
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={displayUrl(project.repoUrl)}
                      className="flex items-center rounded-sm border border-pcnGreen-200 p-1 text-muted-foreground transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen"
                    >
                      <Github className="size-3.5" />
                      <span className="sr-only">
                        Ver el repositorio de {project.title} en GitHub
                      </span>
                    </a>
                  )}
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir en una pestaña nueva"
                    className="flex items-center rounded-sm border border-pcnGreen-200 p-1 text-muted-foreground transition-colors hover:border-pcnGreen-500 hover:text-pcnGreen"
                  >
                    <ArrowUpRight className="size-3.5" />
                    <span className="sr-only">Abrir {project.title} en una pestaña nueva</span>
                  </a>
                </div>
              </footer>
            </article>
          );
        })}
      </RuledGrid>

      <WebReaderDialog
        open={!!reading}
        onOpenChange={(open) => !open && setReading(null)}
        page={
          reading && {
            url: reading.url,
            title: reading.title,
            subtitle: peopleOf(reading)[0]?.name,
            embedCheckUrl: `/api/proyectos/embed?id=${reading.id}`,
            icon: (
              <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-white p-0.5">
                {reading.logoUrl ? (
                  <Image
                    src={reading.logoUrl}
                    alt=""
                    width={24}
                    height={24}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="font-mono text-[10px] font-bold text-black">
                    {initials(reading.title)}
                  </span>
                )}
              </div>
            ),
          }
        }
      />

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo proyecto</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <ProjectForm
              currentUser={currentUser}
              onSuccess={() => setShowCreate(false)}
              onCancel={() => setShowCreate(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar proyecto</DialogTitle>
          </DialogHeader>
          {editingProject && currentUser && (
            <ProjectForm
              project={editingProject}
              currentUser={currentUser}
              onSuccess={() => setEditingProject(null)}
              onCancel={() => setEditingProject(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingProject}
        onOpenChange={(open) => !open && setDeletingProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente &quot;{deletingProject?.title}&quot;. No se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave confirmation */}
      <AlertDialog
        open={!!leavingProject}
        onOpenChange={(open) => !open && setLeavingProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir del proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a dejar de figurar en el equipo de &quot;{leavingProject?.title}&quot; y ya no vas
              a poder editarlo. Solo el autor puede volver a sumarte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLeaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeave} disabled={isLeaving}>
              {isLeaving ? 'Saliendo...' : 'Salir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
