import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar';

let mockIsMobile = false;
jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mockIsMobile }));

const State = () => {
  const { state, openMobile, isCollapsed } = useSidebar();
  return <output aria-label="estado">{`${state} ${openMobile} ${isCollapsed}`}</output>;
};

const Full = ({
  collapsible,
  variant,
  side,
}: {
  collapsible?: 'offcanvas' | 'icon' | 'none';
  variant?: 'sidebar' | 'floating' | 'inset';
  side?: 'left' | 'right';
}) => (
  <>
    <Sidebar collapsible={collapsible} variant={variant} side={side} data-testid="sidebar">
      <SidebarHeader>
        <SidebarInput aria-label="filtrar" />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Grupo</SidebarGroupLabel>
          <SidebarGroupLabel asChild>
            <h2>Grupo como h2</h2>
          </SidebarGroupLabel>
          <SidebarGroupAction aria-label="acción de grupo" />
          <SidebarGroupAction asChild>
            <a href="https://pcn.dev/x">acción enlace</a>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Inicio">Inicio</SidebarMenuButton>
                <SidebarMenuAction showOnHover aria-label="más" />
                <SidebarMenuAction asChild>
                  <span>acción span</span>
                </SidebarMenuAction>
                <SidebarMenuBadge>3</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  variant="outline"
                  size="lg"
                  isActive
                  tooltip={{ children: 'Eventos', className: 'tip' }}
                >
                  Eventos
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" asChild>
                  <a href="https://pcn.dev/a">Sin tooltip</a>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/s" size="sm" isActive>
                      Sub
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <button type="button">Sub botón</button>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuSkeleton showIcon data-testid="skeleton" />
              <SidebarMenuSkeleton data-testid="skeleton-text" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>pie</SidebarFooter>
      <SidebarRail />
    </Sidebar>
    <SidebarInset>
      <SidebarTrigger />
      <State />
    </SidebarInset>
  </>
);

beforeEach(() => {
  mockIsMobile = false;
  document.cookie = 'sidebar_state=; max-age=0; path=/';
});

describe('Sidebar', () => {
  it('throws when used outside a SidebarProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<State />)).toThrow('useSidebar must be used within a SidebarProvider.');
    jest.restoreAllMocks();
  });

  it('renders the desktop sidebar collapsed by default and toggles it', async () => {
    const onClick = jest.fn();
    render(
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="floating">
          <SidebarContent>contenido</SidebarContent>
        </Sidebar>
        <SidebarTrigger onClick={onClick} />
        <State />
      </SidebarProvider>,
    );
    const wrapper = screen.getByText('contenido').closest('[data-state]');
    expect(wrapper).toHaveAttribute('data-state', 'collapsed');
    expect(wrapper).toHaveAttribute('data-collapsible', 'icon');
    expect(wrapper).toHaveAttribute('data-variant', 'floating');

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
    expect(onClick).toHaveBeenCalled();
    expect(wrapper).toHaveAttribute('data-state', 'expanded');
    expect(wrapper).toHaveAttribute('data-collapsible', '');
    expect(document.cookie).toContain('sidebar_state=true');
  });

  it('toggles with Ctrl/Cmd+B but not with B alone', async () => {
    render(
      <SidebarProvider defaultOpen>
        <State />
      </SidebarProvider>,
    );
    expect(screen.getByLabelText('estado')).toHaveTextContent('expanded false false');

    await userEvent.keyboard('b');
    expect(screen.getByLabelText('estado')).toHaveTextContent('expanded');
    await userEvent.keyboard('{Control>}b{/Control}');
    expect(screen.getByLabelText('estado')).toHaveTextContent('collapsed false true');
    await userEvent.keyboard('{Meta>}b{/Meta}');
    expect(screen.getByLabelText('estado')).toHaveTextContent('expanded');
  });

  it('defers to a controlled open state', async () => {
    const onOpenChange = jest.fn();
    render(
      <SidebarProvider open onOpenChange={onOpenChange}>
        <SidebarTrigger />
        <State />
      </SidebarProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    // Still open: the parent owns the state.
    expect(screen.getByLabelText('estado')).toHaveTextContent('expanded');
  });

  it('renders every building block on desktop, with the rail toggling', async () => {
    render(
      <SidebarProvider defaultOpen className="extra" style={{ color: 'red' }}>
        <Full variant="inset" side="right" />
      </SidebarProvider>,
    );

    expect(screen.getByRole('textbox', { name: 'filtrar' })).toHaveAttribute(
      'data-sidebar',
      'input',
    );
    expect(screen.getByRole('heading', { name: 'Grupo como h2' })).toHaveAttribute(
      'data-sidebar',
      'group-label',
    );
    expect(screen.getByRole('link', { name: 'acción enlace' })).toHaveAttribute(
      'data-sidebar',
      'group-action',
    );
    expect(screen.getByRole('button', { name: 'Eventos' })).toHaveAttribute('data-active', 'true');
    expect(screen.getByRole('link', { name: 'Sub' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Sub botón' })).toHaveAttribute('data-size', 'md');
    expect(screen.getByTestId('skeleton').querySelectorAll('[data-sidebar]')).toHaveLength(2);
    expect(screen.getByTestId('skeleton-text').querySelectorAll('[data-sidebar]')).toHaveLength(1);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveAttribute('data-sidebar', 'menu-badge');
    // Expanded: tooltips are hidden.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await userEvent.click(screen.getByTitle('Toggle Sidebar'));
    expect(screen.getByLabelText('estado')).toHaveTextContent('collapsed');
  });

  it('shows the menu tooltip when collapsed', async () => {
    render(
      <SidebarProvider>
        <Full />
      </SidebarProvider>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'Inicio' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Inicio');
  });

  it('renders a static column when not collapsible', () => {
    render(
      <SidebarProvider>
        <Full collapsible="none" />
      </SidebarProvider>,
    );
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).not.toHaveAttribute('data-state');
    expect(sidebar).toHaveClass('w-[--sidebar-width]');
  });

  it('uses a sheet on mobile, opened by the trigger', async () => {
    mockIsMobile = true;
    render(
      <SidebarProvider>
        <Full />
      </SidebarProvider>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-mobile', 'true');
    expect(screen.getByLabelText('estado', { selector: 'output' })).toHaveTextContent(
      'collapsed true',
    );
  });
});
