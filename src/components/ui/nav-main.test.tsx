import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home, Library, Bell, CalendarDays } from 'lucide-react';
import { setLocation } from '@/test/dom';
import { NavMain, type NavItem } from './nav-main';
import { SidebarProvider } from './sidebar';

const items: NavItem[] = [
  { title: 'Inicio', url: '/', icon: Home },
  { title: 'Eventos', url: '/eventos', icon: CalendarDays },
  { title: 'Notificaciones', url: '/notificaciones', icon: Bell, badge: 150 },
  { title: 'Pocas', url: '/pocas', icon: Bell, badge: 4 },
  { title: 'Ninguna', url: '/ninguna', icon: Bell, badge: 0 },
  {
    title: 'Más recursos',
    icon: Library,
    items: [
      { title: 'Música', url: '/music' },
      { title: 'LinkedIn', url: 'https://www.linkedin.com/company/x' },
    ],
  },
  {
    title: 'Con enlace',
    url: '/con-enlace',
    icon: Library,
    items: [{ title: 'Hijo', url: '/con-enlace/hijo' }],
  },
];

// next/link drops the data-active Slot passes down, so check the active marker of the item.
const isMarked = (name: string) =>
  screen.getByRole('link', { name }).closest('li')?.querySelector(':scope > span[aria-hidden]') !==
  null;

const renderNav = (label?: string) =>
  render(
    <SidebarProvider defaultOpen>
      <NavMain items={items} label={label} />
    </SidebarProvider>,
  );

afterEach(() => setLocation('/'));

describe('NavMain', () => {
  it('renders the section label, links and capped badges', () => {
    setLocation('/eventos/123');
    renderNav('Actividades');

    expect(screen.getByText('Actividades')).toHaveAttribute('data-sidebar', 'group-label');
    expect(isMarked('Inicio')).toBe(false);
    expect(isMarked('Eventos')).toBe(true);
    expect(screen.getByRole('link', { name: 'Eventos' })).toHaveClass('flex items-center gap-2.5');
    expect(screen.getByRole('link', { name: /Notificaciones/ })).toHaveTextContent('99+');
    expect(screen.getByRole('link', { name: /Pocas/ })).toHaveTextContent('4');
    expect(screen.getByRole('link', { name: 'Ninguna' })).toHaveTextContent(/^Ninguna$/);
  });

  it('marks Inicio active only on the home page', () => {
    renderNav();
    expect(screen.queryByText('Actividades')).not.toBeInTheDocument();
    expect(isMarked('Inicio')).toBe(true);
  });

  it('expands a toggle-only group and opens external links in a new tab', async () => {
    renderNav();
    expect(screen.queryByRole('link', { name: 'Música' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Más recursos' }));

    expect(screen.getByRole('link', { name: 'Música' })).toHaveAttribute('href', '/music');
    const external = screen.getByRole('link', { name: 'LinkedIn' });
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens the group of the current sub page and highlights it', () => {
    setLocation('/music');
    renderNav();
    expect(screen.getByRole('link', { name: 'Música' })).toHaveClass('text-pcnGreen');
    expect(screen.getByRole('button', { name: 'Más recursos' })).toHaveClass(
      'text-sidebar-foreground',
    );
  });

  it('expands a linked group with its chevron toggle', async () => {
    renderNav();
    const toggles = screen.getAllByRole('button', { name: 'Toggle' });
    await userEvent.click(toggles[toggles.length - 1]);
    expect(screen.getByRole('link', { name: 'Hijo' })).toBeInTheDocument();
  });
});
