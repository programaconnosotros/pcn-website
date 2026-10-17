'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Bookmark, BookCheck, ChevronDown, Plus, Upload } from 'lucide-react';
import type { Event } from '@/generated/prisma/browser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  dialogContentClassName,
  dialogDescriptionClassName,
  dialogFooterClassName,
  dialogHeaderClassName,
  dialogTitleClassName,
} from '@/components/ui/dialog-surface';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { checkboxClassName } from '@/components/ui/field-surface';
import { Input } from '@/components/ui/input';
import { LanguageFilter, type LanguageFilterValue } from '@/components/ui/language-filter';
import { MarkToggle } from '@/components/ui/mark-toggle';
import {
  menuContentClassName,
  menuItemClassName,
  menuSeparatorClassName,
} from '@/components/ui/menu-surface';
import { PageTitle } from '@/components/ui/page-title';
import { RuledCell, RuledGrid, ruledCellClassName } from '@/components/ui/ruled-grid';
import { SearchBar } from '@/components/ui/search-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { EventRow } from '@/components/events/event-row';
import { EmptyLine } from '@/components/profile/profile-sections';
import { PageTitleSkeleton, RuledGridSkeleton } from '@/components/skeletons/page-skeletons';
import { cn } from '@/lib/utils';
import { documentedComponents, type DocumentedComponentId } from './component-list';
import type { ForcedState } from './forced-state';

const REPO_BLOB_URL = 'https://github.com/programaconnosotros/pcn-website/blob/main/';

type StateId =
  | 'default'
  | 'hover'
  | 'focus'
  | 'active'
  | 'disabled'
  | 'loading'
  | 'error'
  | 'empty'
  | 'filled'
  | 'checked'
  | 'selected'
  | 'pressed'
  | 'open';

// How each state is labelled, and the pseudo-class it forces (see ForcedStateStyles) when it is
// an interaction state the component can't be put in through props.
const STATES: Record<StateId, { label: string; force?: ForcedState }> = {
  default: { label: 'default' },
  hover: { label: ':hover', force: 'hover' },
  focus: { label: ':focus', force: 'focus' },
  active: { label: ':active', force: 'active' },
  disabled: { label: 'disabled' },
  loading: { label: 'loading' },
  error: { label: 'error' },
  empty: { label: 'vacío' },
  filled: { label: 'con valor' },
  checked: { label: 'checked' },
  selected: { label: 'seleccionado' },
  pressed: { label: 'aria-pressed' },
  open: { label: 'abierto' },
};

type Spec = {
  file: string;
  summary: string;
  rules: string[];
  states: StateId[];
  variants?: { id: string; label: string }[];
  render: (_state: StateId, _variant: string) => ReactNode;
  /** Optional live version to try with the mouse and keyboard. */
  playground?: () => ReactNode;
  /** Grid columns for the state cells when there are no variants. */
  cellsClassName?: string;
  /** The demo forces its interaction states itself (e.g. hovering a single row). */
  selfForced?: boolean;
};

// ---------------------------------------------------------------------------------------------
// Demos that need their own state.

const SearchBarDemo = ({ initial = '' }: { initial?: string }) => {
  const [query, setQuery] = useState(initial);
  return <SearchBar searchQuery={query} setSearchQuery={setQuery} placeholder="título o autor" />;
};

const LanguageFilterDemo = ({ initial }: { initial: LanguageFilterValue }) => {
  const [value, setValue] = useState(initial);
  return <LanguageFilter value={value} onChange={setValue} />;
};

const MarkToggleDemo = ({ initial }: { initial: boolean }) => {
  const [active, setActive] = useState(initial);
  return (
    <MarkToggle
      active={active}
      onToggle={() => setActive((value) => !value)}
      icon={active ? BookCheck : Bookmark}
      label={active ? 'leído' : 'leer'}
      title="Marcar como leído"
    />
  );
};

type HandleForm = { handle: string };
type RowForm = { nombre: string; pais: string };

// Module-level so their identity never changes: useForm re-applies `errors` whenever it does.
const handleErrors = { handle: { type: 'manual', message: 'ese handle ya está en uso' } };
const rowErrors = { pais: { type: 'manual', message: 'elegí un país' } };

const FormFieldDemo = ({ state }: { state: StateId }) => {
  const form = useForm<HandleForm>({
    defaultValues: { handle: state === 'error' ? 'agus' : '' },
    errors: state === 'error' ? handleErrors : undefined,
  });
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="handle"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>handle</FormLabel>
            <FormControl>
              <Input placeholder="@usuario" disabled={state === 'disabled'} {...field} />
            </FormControl>
            <FormDescription>se ve en tu perfil</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
};

// Two fields sharing a row: same label row, hints and errors below, inputs at the same height.
const FormRowDemo = () => {
  const form = useForm<RowForm>({
    defaultValues: { nombre: 'Ada', pais: '' },
    errors: rowErrors,
  });
  return (
    <Form {...form}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>como te conoce la comunidad</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>país</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.clearErrors('pais');
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ar">Argentina</SelectItem>
                  <SelectItem value="uy">Uruguay</SelectItem>
                  <SelectItem value="mx">México</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
};

// A fixed date keeps the server and client render identical (a relative one would not hydrate).
const demoEvent = {
  id: 'demo',
  name: 'Meetup de desarrollo',
  description: 'Charlas relámpago, pizza y gente que programa. Traé tu notebook.',
  date: new Date('2026-11-14T22:00:00Z'),
  endDate: null,
  isOnline: false,
  placeName: 'Blackbox Cowork',
  city: null,
  flyerImages: [],
  capacity: null,
  markedAsFull: false,
  _count: { registrations: 12 },
} as unknown as Event & { _count: { registrations: number } };

const TextField = ({ kind, state }: { kind: string; state: StateId }) => {
  const shared = {
    disabled: state === 'disabled',
    'aria-invalid': state === 'error' ? true : undefined,
  };
  const value = state === 'filled' || state === 'error' ? 'ada@lovelace' : undefined;
  if (kind === 'textarea') {
    return (
      <Textarea
        {...shared}
        rows={2}
        defaultValue={value}
        placeholder="contá algo"
        className="min-h-0"
      />
    );
  }
  if (kind === 'select') {
    return (
      <Select disabled={state === 'disabled'} defaultValue={value ? 'ar' : undefined}>
        <SelectTrigger aria-invalid={shared['aria-invalid']}>
          <SelectValue placeholder="seleccionar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ar">Argentina</SelectItem>
          <SelectItem value="uy">Uruguay</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  return <Input {...shared} defaultValue={value} placeholder="usuario" />;
};

const buttonLabels: Record<string, string> = {
  pcn: 'crearEvento();',
  outline: 'cancelar();',
  secondary: 'exportar();',
  ghost: 'ver más',
  destructive: 'eliminar();',
  link: 'leer más →',
};

const ruledItems = [
  { title: 'neovim', detail: 'editor modal, configurable en Lua' },
  { title: 'tmux', detail: 'multiplexor de terminales' },
  { title: 'ripgrep', detail: 'grep, pero rápido' },
];

// `hovered` forces the hover state on one row only, the way a pointer would.
const RuledItems = ({ hovered }: { hovered?: number }) => (
  <RuledGrid className="w-full grid-cols-1">
    {ruledItems.map((item, index) => (
      <div
        key={item.title}
        className="contents"
        data-force-state={index === hovered ? 'hover' : undefined}
      >
        <RuledCell className="px-3 py-2">
          <p className="font-mono text-xs font-semibold">{item.title}</p>
          <p className="text-[11px] text-muted-foreground">{item.detail}</p>
        </RuledCell>
      </div>
    ))}
  </RuledGrid>
);

// ---------------------------------------------------------------------------------------------
// One spec per documented component.

const specs: Record<DocumentedComponentId, Spec> = {
  button: {
    file: 'src/components/ui/button.tsx',
    summary:
      'La acción principal es una losa verde que late; la secundaria, un marco oscuro con brackets en las esquinas que se abren al pasar el mouse.',
    rules: [
      'Con relleno o borde, el texto es una llamada a función en camelCase: crearEvento();',
      'pcn (= default) para la acción principal: una sola por vista. outline para la secundaria.',
      'size="sm" (h-8) en headers; default (h-9) en formularios.',
      'loading reemplaza el ícono por un spinner y el texto por un gerundio: guardando...',
      'destructive solo para borrar; nunca rojo para otra cosa.',
    ],
    states: ['default', 'hover', 'focus', 'active', 'disabled', 'loading'],
    variants: [
      { id: 'pcn', label: 'pcn' },
      { id: 'outline', label: 'outline' },
      { id: 'secondary', label: 'secondary' },
      { id: 'ghost', label: 'ghost' },
      { id: 'destructive', label: 'destructive' },
      { id: 'link', label: 'link' },
    ],
    render: (state, variant) => (
      <Button
        variant={variant as 'pcn'}
        size="sm"
        disabled={state === 'disabled'}
        loading={state === 'loading'}
        loadingText="guardando..."
        className="gap-2"
      >
        {variant === 'pcn' && <Plus className="size-3.5" />}
        {buttonLabels[variant]}
      </Button>
    ),
  },
  'search-bar': {
    file: 'src/components/ui/search-bar.tsx',
    summary:
      'Toda búsqueda de página es un prompt de shell: $ grep -i. La tecla / la enfoca desde cualquier lado y Esc la limpia.',
    rules: [
      'Una sola búsqueda por página, siempre este componente: nada de lupa + Input + botón.',
      'Placeholder corto y en minúscula (título, autor o descripción); el texto completo va en label.',
      'Mide h-8 como el resto de los controles del header.',
      'El <kbd>/</kbd> muestra el atajo; con texto se convierte en el botón para limpiar.',
    ],
    states: ['empty', 'filled', 'focus'],
    render: (state) => <SearchBarDemo initial={state === 'filled' ? 'neovim' : ''} />,
    playground: () => <SearchBarDemo />,
    cellsClassName: 'sm:grid-cols-3',
  },
  campos: {
    file: 'src/components/ui/field-surface.ts',
    summary:
      'Input, Textarea y el trigger del Select comparten .field-surface: texto mono, scanlines, esquinas iluminadas que se encienden con el foco y un haz que recorre el borde.',
    rules: [
      'Usá siempre estos componentes: el look vive en fieldClassName y en .field-surface (globals.css).',
      'Error = aria-invalid: esquinas y borde rojos y un glitch de 350ms al entrar en error.',
      'Deshabilitado o readonly = borde punteado y rayado diagonal, como una terminal bloqueada.',
      'El caret es un bloque verde que deja ver la letra de abajo (TerminalCaret); en touch, el nativo.',
    ],
    states: ['default', 'hover', 'focus', 'filled', 'error', 'disabled'],
    variants: [
      { id: 'input', label: 'Input' },
      { id: 'textarea', label: 'Textarea' },
      { id: 'select', label: 'Select' },
    ],
    render: (state, variant) => <TextField kind={variant} state={state} />,
  },
  'form-field': {
    file: 'src/components/ui/form.tsx',
    summary:
      'Label como prompt (> HANDLE) que se enciende cuando su campo tiene foco, hint con // y error con un tag ERR que entra con un glitch.',
    rules: [
      'Label corto, en una sola línea: si no entra en la columna, se acorta o la grilla se apila.',
      'Nada entre el label y el control: hints (FormDescription) y errores (FormMessage) van debajo.',
      'Los campos que comparten fila arrancan exactamente a la misma altura (probalo abajo).',
      'Mensajes de error en minúscula y accionables: "elegí un país", no "Campo inválido".',
    ],
    states: ['default', 'focus', 'error', 'disabled'],
    render: (state) => <FormFieldDemo state={state} />,
    playground: () => <FormRowDemo />,
    cellsClassName: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  checkbox: {
    file: 'src/components/ui/field-surface.ts',
    summary:
      'Un slot vacío que se llena con un bloque verde brillante al marcarse. Es un <input type="checkbox"> nativo con checkboxClassName.',
    rules: [
      'Nativo + checkboxClassName (.field-check): accesible sin librerías.',
      'El label va a la derecha, en mono y minúscula.',
    ],
    states: ['default', 'hover', 'focus', 'checked', 'disabled'],
    render: (state) => (
      <label className="flex items-center gap-2 font-mono text-xs">
        <input
          type="checkbox"
          className={checkboxClassName}
          defaultChecked={state === 'checked'}
          disabled={state === 'disabled'}
        />
        evento online
      </label>
    ),
    cellsClassName: 'grid-cols-2 sm:grid-cols-5',
  },
  segmentado: {
    file: 'src/components/ui/language-filter.tsx',
    summary:
      'Filtros de pocas opciones: botones pegados que comparten bordes; el activo se invierte (verde con letra negra).',
    rules: [
      'El grupo mide h-8 y los botones se estiran: sin py-*.',
      'Prefijo en gris que nombra el filtro (idioma) y opciones en minúscula.',
      'aria-pressed en cada opción; role="group" con aria-label en el contenedor.',
    ],
    states: ['default', 'hover', 'selected'],
    render: (state) => <LanguageFilterDemo initial={state === 'selected' ? 'es' : 'todos'} />,
    cellsClassName: 'sm:grid-cols-3',
  },
  tabs: {
    file: 'src/components/ui/tab-styles.tsx',
    summary:
      'Tira tipo HUD: barra con scanlines, ticks en las esquinas y la tab activa con subrayado brillante y el label entre [ ].',
    rules: [
      'Labels en UPPERCASE de 10px con tracking amplio; cortos.',
      'Mide h-7; en una fila de header se lleva a h-8 (className="h-8") y comparte la fila con la búsqueda y los filtros.',
      'Las tabs que son links (el perfil) usan tabsTriggerClassName con data-state a mano.',
    ],
    states: ['default', 'hover', 'focus', 'disabled'],
    render: (state) => (
      <Tabs defaultValue="eventos">
        <TabsList>
          <TabsTrigger value="eventos">eventos</TabsTrigger>
          <TabsTrigger value="charlas" disabled={state === 'disabled'}>
            charlas
          </TabsTrigger>
          <TabsTrigger value="fotos">fotos</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
    cellsClassName: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  'mark-toggle': {
    file: 'src/components/ui/mark-toggle.tsx',
    summary:
      'Marcas personales (leído, visto, guardado) que viven arriba de una fila clickeable sin disparar su link.',
    rules: [
      'Label de una palabra en minúscula y title descriptivo para lectores de pantalla.',
      'Activo = borde verde, fondo tenue y glow; el ícono se rellena.',
    ],
    states: ['default', 'hover', 'focus', 'pressed'],
    render: (state) => <MarkToggleDemo initial={state === 'pressed'} />,
    cellsClassName: 'grid-cols-2 sm:grid-cols-4',
  },
  badge: {
    file: 'src/components/ui/badge.tsx',
    summary: 'Etiquetas de 11px en mono con borde fino: estado, conteos y categorías.',
    rules: [
      'Texto corto. Los estados vivos (En curso) pueden tener un punto que late.',
      'destructive solo para estados de error o peligro.',
    ],
    states: ['default', 'hover'],
    variants: [
      { id: 'default', label: 'default' },
      { id: 'secondary', label: 'secondary' },
      { id: 'outline', label: 'outline' },
      { id: 'destructive', label: 'destructive' },
    ],
    render: (_state, variant) => (
      <Badge variant={variant as 'default'}>
        {variant === 'destructive' ? 'rechazada' : 'typescript'}
      </Badge>
    ),
  },
  'page-title': {
    file: 'src/components/ui/page-title.tsx',
    summary:
      'El título de cada página es su ruta: ~/desarrollo/diseno. ~ y cada segmento padre son links, así funciona también como breadcrumb.',
    rules: [
      'Una sola línea de meta al costado, en minúscula y separada por ·',
      'Las acciones de la página (botones size="sm") van a la derecha, en el StickyHeader.',
      'Mientras carga: PageTitleSkeleton, con la misma altura.',
    ],
    states: ['default', 'loading'],
    render: (state) =>
      state === 'loading' ? (
        <div className="w-full">
          <PageTitleSkeleton />
        </div>
      ) : (
        <PageTitle
          path="desarrollo/diseno"
          meta="design system · 15 componentes"
          className="mb-0"
        />
      ),
    cellsClassName: 'lg:grid-cols-2',
  },
  'ruled-grid': {
    file: 'src/components/ui/ruled-grid.tsx',
    summary:
      'La pieza central del sistema: listas y catálogos sin cards. La grilla dibuja el borde de arriba y de la izquierda; cada celda, el de abajo y el de la derecha.',
    rules: [
      'Nunca gap entre celdas: la hairline es el separador.',
      'Toda la fila es el link (ruledCellClassName en el <Link>); hover = fondo verde al 4%.',
      'Cargando: RuledGridSkeleton con la misma cantidad de columnas.',
      'Vacío: una línea punteada que arranca con $, no una ilustración.',
    ],
    states: ['default', 'hover', 'loading', 'empty'],
    selfForced: true,
    render: (state) => {
      if (state === 'loading')
        return <RuledGridSkeleton count={2} className="w-full grid-cols-1" />;
      if (state === 'empty')
        return (
          <div className="w-full">
            <EmptyLine>sin resultados para &quot;cobol&quot;</EmptyLine>
          </div>
        );
      return <RuledItems hovered={state === 'hover' ? 1 : undefined} />;
    },
    cellsClassName: 'sm:grid-cols-2 xl:grid-cols-4',
  },
  'event-row': {
    file: 'src/components/events/event-row.tsx',
    summary:
      'La fila más vista del sitio: flyer chico, fecha en mono, nombre, descripción recortada y lugar, todo dentro de una celda de RuledGrid.',
    rules: [
      'Thumbnail cuadrado de 64px (más alto en teléfonos, porque los flyers son posters).',
      'Descripciones con line-clamp: la fila nunca crece por el contenido.',
      'Al hacer hover el nombre se pone verde y el chevron avanza.',
    ],
    states: ['default', 'hover'],
    render: () => (
      <RuledGrid className="w-full grid-cols-1">
        <EventRow event={demoEvent} />
      </RuledGrid>
    ),
    cellsClassName: 'lg:grid-cols-2',
  },
  menu: {
    file: 'src/components/ui/menu-surface.ts',
    summary:
      'Dropdowns, selects y los menús de PCN OS: un panel de vidrio oscuro con brackets que bootea como un CRT y sus items entrando uno detrás de otro.',
    rules: [
      'El item resaltado prende una barra brillante a la izquierda y una estela verde.',
      'Separadores como líneas que se desvanecen en los extremos.',
      'Items deshabilitados al 50%, sin hover.',
    ],
    states: ['open'],
    render: () => (
      <div className={cn(menuContentClassName, 'z-0 w-52')}>
        <p className="px-2 py-1.5 text-[11px] tracking-widest text-pcnGreen-600 uppercase">
          ordenar por
        </p>
        <div className={menuSeparatorClassName} />
        <div className={menuItemClassName}>fecha</div>
        <div data-force-state="focus">
          <div className={menuItemClassName}>popularidad</div>
        </div>
        <div className={menuItemClassName}>nombre</div>
        <div className={menuItemClassName} data-disabled="">
          distancia
        </div>
      </div>
    ),
    playground: () => (
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              ordenar();
              <ChevronDown className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>fecha</DropdownMenuItem>
            <DropdownMenuItem>popularidad</DropdownMenuItem>
            <DropdownMenuItem disabled>distancia</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-48">
          <TextField kind="select" state="default" />
        </div>
      </div>
    ),
    cellsClassName: 'grid-cols-1',
  },
  dialog: {
    file: 'src/components/ui/dialog-surface.ts',
    summary:
      'Un panel de terminal con cuatro esquinas iluminadas y scanlines que se enciende como un CRT. El título es un prompt (>) y los separadores son punteados.',
    rules: [
      'Título corto en verde con glow; descripción en mono de 12px.',
      'Footer con la acción principal a la derecha: cancelar(); guardar();',
      'En formularios largos, el footer queda pegado abajo (dialogFormActionBarClassName).',
      'Nunca más alto que la pantalla: el panel scrollea, los botones siempre se ven.',
    ],
    states: ['open'],
    render: () => (
      <div
        className={cn(dialogContentClassName, 'static w-full max-w-md translate-x-0 translate-y-0')}
      >
        <div className={dialogHeaderClassName}>
          <p className={dialogTitleClassName}>subir foto</p>
          <p className={dialogDescriptionClassName}>jpg o png, hasta 10 MB</p>
        </div>
        <Input placeholder="título de la foto" />
        <div className={dialogFooterClassName}>
          <Button variant="outline" size="sm">
            cancelar();
          </Button>
          <Button variant="pcn" size="sm" className="gap-2">
            <Upload className="size-3.5" />
            subir();
          </Button>
        </div>
      </div>
    ),
    playground: () => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            abrirDialog();
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>subir foto</DialogTitle>
            <DialogDescription>jpg o png, hasta 10 MB</DialogDescription>
          </DialogHeader>
          <Input placeholder="título de la foto" />
          <DialogFooter>
            <Button variant="pcn" size="sm">
              subir();
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    cellsClassName: 'grid-cols-1',
  },
  toast: {
    file: 'src/components/ui/sonner.tsx',
    summary:
      'Notificaciones de PCN_OS: panel con scanlines, borde izquierdo encendido del color del tipo, un > antes del título y una barra que se consume mientras está en pantalla.',
    rules: [
      'Arriba a la derecha, con botón para cerrar.',
      'Verde para éxito e info, ámbar para advertencias, rojo para errores.',
      'Títulos cortos en minúscula; el detalle va en la descripción.',
      'Los errores de server actions pasan por actionErrorMessage: producción oculta los mensajes.',
    ],
    states: [],
    render: () => null,
    playground: () => (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('evento creado', { description: 'ya está en ~/eventos' })}
        >
          toast.success();
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.warning('quedan 3 lugares', { description: 'inscribite pronto' })}
        >
          toast.warning();
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.error('no se pudo guardar', { description: 'probá de nuevo' })}
        >
          toast.error();
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const id = toast.loading('subiendo foto...');
            setTimeout(() => toast.success('foto subida', { id }), 1500);
          }}
        >
          toast.loading();
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            toast('nueva versión disponible', {
              action: { label: 'recargar', onClick: () => undefined },
            })
          }
        >
          toast.action();
        </Button>
      </div>
    ),
  },
};

// ---------------------------------------------------------------------------------------------
// Gallery UI.

// One specimen: the real component, frozen in a state. Forced interaction states come from the
// `data-force-state` wrapper; `inert` keeps the frozen copies out of the tab order and the
// accessibility tree, so only the playground is interactive.
const StateCell = ({
  state,
  selfForced,
  children,
}: {
  state: StateId;
  selfForced?: boolean;
  children: ReactNode;
}) => (
  <div
    inert
    data-force-state={selfForced ? undefined : STATES[state].force}
    className="flex min-h-14 min-w-0 items-center p-3"
  >
    {children}
  </div>
);

const StateLabel = ({ state }: { state: StateId }) => (
  <span className="font-mono text-[10px] tracking-widest text-pcnGreen-600 uppercase">
    {STATES[state].label}
  </span>
);

const StateSwitcher = ({
  states,
  value,
  onChange,
}: {
  states: StateId[];
  value: StateId | 'todos';
  onChange: (_value: StateId | 'todos') => void;
}) => (
  <div className="flex max-w-full items-center gap-2 font-mono text-[11px]">
    <span className="shrink-0 text-muted-foreground">estado</span>
    <div
      role="group"
      aria-label="Elegir el estado a mostrar"
      className="flex h-8 min-w-0 overflow-x-auto border border-pcnGreen-200"
    >
      {(['todos', ...states] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'shrink-0 border-r border-pcnGreen-200 px-2 transition-colors last:border-r-0',
            value === option
              ? 'bg-pcnGreen text-black'
              : 'text-muted-foreground hover:bg-pcnGreen/[0.06] hover:text-pcnGreen',
          )}
        >
          {option === 'todos' ? 'todos' : STATES[option].label}
        </button>
      ))}
    </div>
  </div>
);

const StateMatrix = ({ spec, visible }: { spec: Spec; visible: StateId[] }) => {
  if (spec.variants) {
    return (
      <div className="overflow-x-auto">
        <div
          className="grid min-w-max border-t border-l border-pcnGreen-200"
          style={{
            gridTemplateColumns: `6rem repeat(${visible.length}, minmax(9.5rem, 1fr))`,
          }}
        >
          <div className={cn(ruledCellClassName, 'p-2 hover:bg-transparent')} />
          {visible.map((state) => (
            <div key={state} className={cn(ruledCellClassName, 'p-2 hover:bg-transparent')}>
              <StateLabel state={state} />
            </div>
          ))}
          {spec.variants.map((variant) => (
            <div key={variant.id} className="contents">
              <div
                className={cn(
                  ruledCellClassName,
                  'flex items-center p-2 font-mono text-[11px] text-muted-foreground hover:bg-transparent',
                )}
              >
                {variant.label}
              </div>
              {visible.map((state) => (
                <div key={state} className={cn(ruledCellClassName, 'hover:bg-transparent')}>
                  <StateCell state={state} selfForced={spec.selfForced}>
                    {spec.render(state, variant.id)}
                  </StateCell>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <RuledGrid className={cn('grid-cols-1', visible.length > 1 && spec.cellsClassName)}>
      {visible.map((state) => (
        <div key={state} className={cn(ruledCellClassName, 'min-w-0 hover:bg-transparent')}>
          <div className="px-3 pt-2">
            <StateLabel state={state} />
          </div>
          <StateCell state={state} selfForced={spec.selfForced}>
            {spec.render(state, '')}
          </StateCell>
        </div>
      ))}
    </RuledGrid>
  );
};

const ComponentBlock = ({ id, name }: { id: DocumentedComponentId; name: string }) => {
  const spec = specs[id];
  const [shown, setShown] = useState<StateId | 'todos'>('todos');
  const visible = shown === 'todos' ? spec.states : [shown];

  return (
    <div
      id={`componente-${id}`}
      className="scroll-mt-32 space-y-3 lg:scroll-mt-[calc(var(--sticky-header-offset,0px)+3rem)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="font-mono text-sm text-pcnGreen">
          <span className="text-pcnGreen-500">### </span>
          {name}
        </h3>
        <a
          href={`${REPO_BLOB_URL}${spec.file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] text-muted-foreground underline-offset-4 hover:text-pcnGreen hover:underline"
        >
          {spec.file} ↗
        </a>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{spec.summary}</p>
      <ul className="space-y-1">
        {spec.rules.map((rule) => (
          <li key={rule} className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <span className="shrink-0 font-mono text-pcnGreen-500">›</span>
            {rule}
          </li>
        ))}
      </ul>
      {spec.states.length > 1 && (
        <StateSwitcher states={spec.states} value={shown} onChange={setShown} />
      )}
      {spec.states.length > 0 && <StateMatrix spec={spec} visible={visible} />}
      {spec.playground && (
        <div className="border border-dashed border-pcnGreen-200 p-3">
          <p className="mb-2 font-mono text-[11px] text-pcnGreen-600">
            <span className="text-pcnGreen-500">$ </span>
            probalo
          </p>
          {spec.playground()}
        </div>
      )}
    </div>
  );
};

/** Every documented component with its rules, its states side by side and a live playground. */
export const ComponentGallery = () => (
  <div className="space-y-8">
    {documentedComponents.map((component) => (
      <ComponentBlock key={component.id} id={component.id} name={component.name} />
    ))}
  </div>
);

/** A page header row: every control is h-8, so they line up whatever their kind. */
export const HeaderRowDemo = () => (
  <div className="flex flex-wrap items-center gap-2">
    <SearchBarDemo />
    <LanguageFilterDemo initial="todos" />
    <Tabs defaultValue="libros">
      <TabsList className="h-8">
        <TabsTrigger value="libros">libros</TabsTrigger>
        <TabsTrigger value="articulos">artículos</TabsTrigger>
      </TabsList>
    </Tabs>
    <Button variant="pcn" size="sm">
      sumar();
    </Button>
  </div>
);
