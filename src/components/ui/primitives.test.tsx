import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bookmark } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableTag,
} from './table';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Separator } from './separator';
import { Skeleton } from './skeleton';
import { ScrollArea, ScrollBar } from './scroll-area';
import { Heading1 } from './heading-1';
import { Heading2 } from './heading-2';
import { Heading3 } from './heading-3';
import { GlowingText } from './glowing-text';
import { LeadText } from './lead-text';
import { UnorderedList } from './bullet-point';
import { Paragraph } from './paragraph';
import { RuledCell, RuledGrid } from './ruled-grid';
import { ContentCard } from './content-card';
import { MarkToggle } from './mark-toggle';
import { PageTitle } from './page-title';
import { Toaster } from './sonner';
import { Label } from './label';
import { TabBrackets, tabsListClassName } from './tab-styles';
import { menuContentClassName } from './menu-surface';

jest.mock('./sidebar', () => ({
  SidebarTrigger: () => <button type="button">menú</button>,
}));
jest.mock('next-themes', () => ({ useTheme: jest.fn(() => ({})) }));
jest.mock('sonner', () => ({
  Toaster: ({ theme, icons }: { theme: string; icons: Record<string, unknown> }) => (
    <div data-testid="toaster" data-theme={theme} data-icons={Object.keys(icons).join(',')} />
  ),
}));

describe('Dialog', () => {
  it('opens from its trigger and closes with the close key', async () => {
    render(
      <Dialog>
        <DialogTrigger>abrir</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>título</DialogTitle>
            <DialogDescription>detalle</DialogDescription>
          </DialogHeader>
          <DialogFooter>pie</DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'abrir' }));
    const dialog = screen.getByRole('dialog', { name: 'título' });
    expect(dialog).toHaveAccessibleDescription('detalle');
    expect(within(dialog).getByText('pie')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('AlertDialog', () => {
  it('confirms or cancels an action', async () => {
    const onConfirm = jest.fn();
    render(
      <AlertDialog>
        <AlertDialogTrigger>borrar</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Seguro?</AlertDialogTitle>
            <AlertDialogDescription>No se puede deshacer</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'borrar' }));
    expect(screen.getByRole('alertdialog', { name: '¿Seguro?' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'cancelar' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'borrar' }));
    await userEvent.click(screen.getByRole('button', { name: 'confirmar' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});

describe('Select', () => {
  it('picks an option from the list', async () => {
    const onValueChange = jest.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="lenguaje">
          <SelectValue placeholder="elegí" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>populares</SelectLabel>
            <SelectItem value="ts">TypeScript</SelectItem>
            <SelectSeparator />
            <SelectItem value="go">Go</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    const trigger = screen.getByRole('combobox', { name: 'lenguaje' });
    expect(trigger).toHaveTextContent('elegí');
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('option', { name: 'Go' }));
    expect(onValueChange).toHaveBeenCalledWith('go');
    expect(trigger).toHaveTextContent('Go');
  });

  it('supports the item-aligned position', async () => {
    render(
      <Select defaultValue="a">
        <SelectTrigger aria-label="x">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  const Panels = (props: React.ComponentProps<typeof Tabs>) => (
    <Tabs {...props}>
      <TabsList>
        <TabsTrigger value="a">uno</TabsTrigger>
        <TabsTrigger value="b">dos</TabsTrigger>
      </TabsList>
      <TabsContent value="a">panel uno</TabsContent>
      <TabsContent value="b">panel dos</TabsContent>
    </Tabs>
  );

  it('mounts a panel on first visit and keeps it mounted afterwards', async () => {
    const onValueChange = jest.fn();
    render(<Panels defaultValue="a" onValueChange={onValueChange} />);
    expect(screen.getByText('panel uno')).toBeVisible();
    expect(screen.queryByText('panel dos')).toBeNull();

    await userEvent.click(screen.getByRole('tab', { name: 'dos' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('tab', { name: 'dos' })).toHaveAttribute('data-state', 'active');
    expect(screen.getByText('panel dos')).toBeInTheDocument();
    // The first panel stays in the DOM, just hidden.
    expect(screen.getByText('panel uno')).toHaveAttribute('data-state', 'inactive');
  });

  it('follows a controlled value', async () => {
    const onValueChange = jest.fn();
    const { rerender } = render(<Panels value="a" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'dos' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('tab', { name: 'uno' })).toHaveAttribute('data-state', 'active');
    rerender(<Panels value="b" onValueChange={onValueChange} />);
    expect(screen.getByText('panel dos')).toBeInTheDocument();
  });

  it('shares the tab look with link rows', () => {
    render(
      <div className={tabsListClassName}>
        <TabBrackets>perfil</TabBrackets>
      </div>,
    );
    expect(screen.getByText('perfil').parentElement).toHaveTextContent('[perfil]');
  });
});

describe('Accordion', () => {
  it('expands an item', async () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="q">
          <AccordionTrigger>¿Qué es PCN?</AccordionTrigger>
          <AccordionContent>Una comunidad</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: '¿Qué es PCN?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Una comunidad')).toBeInTheDocument();
  });
});

describe('Table', () => {
  it('renders every part and tag tone', () => {
    render(
      <Table>
        <TableCaption>usuarios</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>nombre</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(['green', 'muted', 'warn', 'danger', 'purple'] as const).map((tone) => (
            <TableRow key={tone}>
              <TableCell>
                <TableTag tone={tone}>{tone}</TableTag>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell>
              <TableTag>default</TableTag>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(screen.getByRole('table', { name: 'usuarios' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'nombre' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(8);
    expect(screen.getByText('warn')).toHaveClass('text-amber-400');
    expect(screen.getByText('default')).toHaveClass('text-muted-foreground');
  });
});

describe('Button', () => {
  it('shows a spinner and disables itself while loading', () => {
    render(
      <Button loading loadingText="guardando…">
        guardar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'guardando…' });
    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('keeps its label while loading without loadingText, and renders as its child', () => {
    render(
      <>
        <Button loading variant="outline" size="sm">
          enviar
        </Button>
        <Button asChild variant="link">
          <a href="#x">ir</a>
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'enviar' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'ir' })).toHaveClass('text-pcnGreen');
  });
});

describe('small building blocks', () => {
  it('render their content', () => {
    render(
      <>
        <Card>
          <CardHeader>
            <CardTitle>tarjeta</CardTitle>
            <CardDescription>desc</CardDescription>
          </CardHeader>
          <CardContent>cuerpo</CardContent>
          <CardFooter>pie</CardFooter>
        </Card>
        <Badge variant="destructive">error</Badge>
        <Badge>ok</Badge>
        <Separator />
        <Separator orientation="vertical" decorative={false} />
        <Skeleton data-testid="skeleton" />
        <ScrollArea className="h-10">
          <p>scroll</p>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Heading1 variant="gradient">h1</Heading1>
        <Heading2>h2</Heading2>
        <Heading3 variant="gradient">h3</Heading3>
        <GlowingText>brillo</GlowingText>
        <LeadText>lead</LeadText>
        <UnorderedList items={['a', 'b']} />
        <Paragraph className="x">párrafo</Paragraph>
        <RuledGrid>
          <RuledCell>celda</RuledCell>
        </RuledGrid>
        <Label htmlFor="campo">etiqueta</Label>
        <input id="campo" />
      </>,
    );
    expect(screen.getByText('tarjeta')).toBeInTheDocument();
    expect(screen.getByText('error')).toHaveClass('text-red-400');
    expect(screen.getAllByRole('separator')).toHaveLength(1);
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
    expect(screen.getByText('scroll')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'h1' })).toHaveClass('text-glow');
    expect(screen.getByRole('heading', { level: 2, name: 'h2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'h3' })).toHaveClass('text-glow');
    expect(screen.getAllByText('brillo')).toHaveLength(2);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('párrafo')).toHaveClass('x');
    expect(screen.getByText('celda')).toHaveClass('border-b');
    expect(screen.getByRole('textbox', { name: 'etiqueta' })).toBeInTheDocument();
    expect(menuContentClassName).toContain('menu-surface');
  });

  it('ContentCard shows the author only when given', () => {
    const { rerender } = render(
      <ContentCard
        title="Artículo"
        description="resumen"
        image="/a.png"
        author="Ana"
        timeToRead="5 min"
        authorImage="/ana.png"
      />,
    );
    expect(screen.getByRole('img', { name: 'Avatar de Ana' })).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Artículo' })).toBeInTheDocument();
    rerender(<ContentCard description="solo" image="/a.png" />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
  });
});

describe('MarkToggle', () => {
  it('toggles without triggering the link it sits on', async () => {
    const onToggle = jest.fn();
    const onLinkClick = jest.fn();
    const { rerender } = render(
      <div onClick={onLinkClick}>
        <MarkToggle
          active={false}
          onToggle={onToggle}
          icon={Bookmark}
          label="leído"
          title="Marcar como leído"
        />
      </div>,
    );
    const button = screen.getByRole('button', { name: 'leído' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onLinkClick).not.toHaveBeenCalled();

    rerender(
      <MarkToggle active onToggle={onToggle} icon={Bookmark} label="leído" title="Desmarcar" />,
    );
    expect(screen.getByRole('button', { name: 'leído' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('PageTitle', () => {
  it('turns a path into breadcrumb links', () => {
    render(
      <PageTitle path="eventos/charlas/react" meta="3 eventos" action={<button>nuevo</button>} />,
    );
    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(within(nav).getByRole('link', { name: '~' })).toHaveAttribute('href', '/');
    expect(within(nav).getByRole('link', { name: 'eventos' })).toHaveAttribute('href', '/eventos');
    expect(within(nav).getByRole('link', { name: 'charlas' })).toHaveAttribute(
      'href',
      '/eventos/charlas',
    );
    expect(within(nav).getByText('react')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('3 eventos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'nuevo' })).toBeInTheDocument();
  });

  it('accepts explicit crumbs and no meta', () => {
    const { container } = render(
      <PageTitle path={[{ label: 'perfil', href: '/perfil' }, { label: 'ana' }]} />,
    );
    expect(screen.getByRole('link', { name: 'perfil' })).toHaveAttribute('href', '/perfil');
    expect(screen.getByText('ana')).toHaveAttribute('aria-current', 'page');
    expect(container.firstElementChild!.children).toHaveLength(1);
  });

  it('renders only the action', () => {
    render(<PageTitle path="x" action={<span>acción</span>} />);
    expect(screen.getByText('acción')).toBeInTheDocument();
  });
});

describe('Toaster', () => {
  it('follows the theme and defaults to the system one', () => {
    const { useTheme } = jest.requireMock('next-themes') as { useTheme: jest.Mock };
    const { rerender } = render(<Toaster />);
    expect(screen.getByTestId('toaster')).toHaveAttribute('data-theme', 'system');
    expect(screen.getByTestId('toaster')).toHaveAttribute(
      'data-icons',
      'success,info,warning,error,loading',
    );
    useTheme.mockReturnValue({ theme: 'dark' });
    rerender(<Toaster />);
    expect(screen.getByTestId('toaster')).toHaveAttribute('data-theme', 'dark');
  });
});
