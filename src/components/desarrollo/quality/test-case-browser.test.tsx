import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TestCase } from '@/app/(platform)/desarrollo/calidad/quality-areas';
import { TestCaseBrowser } from './test-case-browser';

jest.mock('@/app/(platform)/desarrollo/calidad/quality-cases', () => {
  const manual: TestCase[] = [
    {
      id: 'TC-GAL-001',
      title: 'Subir una foto a la galería',
      area: 'galeria',
      type: 'manual',
      priority: 'alta',
      preconditions: ['Tener sesión iniciada'],
      steps: ['Abrir /galeria', 'Elegir una foto'],
      expected: 'La foto aparece primera',
    },
    {
      id: 'TC-EVT-001',
      title: 'Anotarse a un evento',
      area: 'eventos',
      type: 'manual',
      priority: 'media',
      preconditions: [],
      steps: ['Abrir un evento'],
      expected: 'Queda anotado',
    },
  ];
  // 51 automated auth cases, so the list pages.
  const automated: TestCase[] = Array.from({ length: 51 }, (_, i) => ({
    id: `TC-AUT-A${String(i + 1).padStart(3, '0')}`,
    title: `Login caso ${i + 1}`,
    area: 'auth',
    type: 'automatizado',
    priority: 'baja',
    preconditions: [],
    steps: [`pnpm jest src/lib/auth.test.ts -t "caso ${i + 1}"`],
    expected: 'Pasa',
    automation: { file: 'src/lib/auth.test.ts', name: `auth › caso ${i + 1}`, layer: 'unit' },
  }));
  return {
    testCases: [...manual, ...automated],
    layerLabels: { unit: 'unit', component: 'componente' },
  };
});

const flag = (label: string) =>
  screen.getByRole('button', { name: new RegExp(`^\\[[ x]\\]\\s*${label}$`) });

const count = () => screen.getByText(/\/53 casos/).textContent;

describe('TestCaseBrowser', () => {
  afterEach(() => window.history.replaceState(null, '', '/'));

  it('shows the totals, the coverage per area and the first page of cases', () => {
    render(<TestCaseBrowser updatedAt="2026-10-01" />);

    expect(screen.getByText('casos en total').previousSibling).toHaveTextContent('53');
    expect(screen.getByText('manuales').previousSibling).toHaveTextContent('2');
    expect(screen.getByText('automatizados').previousSibling).toHaveTextContent('51');
    expect(screen.getByText('prioridad alta').previousSibling).toHaveTextContent('1');
    expect(screen.getByText('51 auto · 0 manual ·')).toBeInTheDocument();
    expect(screen.getAllByText('0% automatizado').length).toBeGreaterThan(0);
    expect(count()).toBe('53/53 casos');
    expect(screen.getAllByRole('listitem')).toHaveLength(50);
    expect(screen.getByText(/última actualización: 2026-10-01/)).toBeInTheDocument();
  });

  it('loads more cases in pages of 50', async () => {
    render(<TestCaseBrowser updatedAt="x" />);

    await userEvent.click(screen.getByRole('button', { name: /cargarMás\(\); \+3/ }));

    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(53);
    expect(screen.queryByRole('button', { name: /cargarMás/ })).not.toBeInTheDocument();
  });

  it('searches by any word, ignoring accents and case', async () => {
    render(<TestCaseBrowser updatedAt="x" />);
    const search = screen.getByRole('textbox', { name: 'Buscar casos de prueba' });

    await userEvent.click(search);
    await userEvent.paste('GALERIA foto');
    expect(count()).toBe('1/53 casos');
    expect(screen.getByText('Subir una foto a la galería')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.paste('nada que ver');
    expect(screen.getByText('0 casos con esos filtros')).toBeInTheDocument();
  });

  it('opens a manual case with its preconditions, steps and expected result', async () => {
    render(<TestCaseBrowser updatedAt="x" />);
    const row = screen.getByRole('button', { name: /TC-GAL-001/ });

    await userEvent.click(row);

    expect(row).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById('caso-TC-GAL-001')!;
    expect(within(panel).getByText('# precondiciones')).toBeInTheDocument();
    expect(within(panel).getByText('Tener sesión iniciada')).toBeInTheDocument();
    expect(within(panel).getByText('# pasos')).toBeInTheDocument();
    expect(within(panel).getByText('Elegir una foto')).toBeInTheDocument();
    expect(within(panel).getByText('La foto aparece primera')).toBeInTheDocument();
    expect(within(panel).queryByText(/# archivo/)).not.toBeInTheDocument();

    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('caso-TC-GAL-001')).toBeNull();
  });

  it('opens an automated case with its file and command', async () => {
    render(<TestCaseBrowser updatedAt="x" />);

    await userEvent.click(screen.getByRole('button', { name: /TC-AUT-A001/ }));

    const panel = document.getElementById('caso-TC-AUT-A001')!;
    expect(within(panel).getByText('# archivo · unit')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'src/lib/auth.test.ts ↗' })).toHaveAttribute(
      'href',
      'https://github.com/programaconnosotros/pcn-website/blob/main/src/lib/auth.test.ts',
    );
    expect(within(panel).getByText('# cómo correrlo')).toBeInTheDocument();
    expect(
      within(panel).getByText('$ pnpm jest src/lib/auth.test.ts -t "caso 1"'),
    ).toBeInTheDocument();
    expect(within(panel).queryByText('# precondiciones')).not.toBeInTheDocument();
  });

  it('filters by type and priority flags and toggles them off', async () => {
    render(<TestCaseBrowser updatedAt="x" />);

    const manual = flag('manual');
    await userEvent.click(manual);
    expect(flag('manual')).toHaveAttribute('aria-pressed', 'true');
    expect(count()).toBe('2/53 casos');

    await userEvent.click(flag('alta'));
    expect(count()).toBe('1/53 casos');

    await userEvent.click(flag('manual'));
    await userEvent.click(flag('alta'));
    expect(count()).toBe('53/53 casos');
  });

  it('filters by tapping an area and tapping it again to clear', async () => {
    render(<TestCaseBrowser updatedAt="x" />);
    const eventos = screen.getByRole('button', { name: /EVT Eventos/ });

    await userEvent.click(eventos);
    expect(eventos).toHaveAttribute('aria-pressed', 'true');
    expect(count()).toBe('1/53 casos');

    await userEvent.click(eventos);
    expect(count()).toBe('53/53 casos');
  });

  it('filters by area from the select', async () => {
    render(<TestCaseBrowser updatedAt="x" />);

    await userEvent.click(screen.getByRole('combobox', { name: 'Filtrar por área' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Galería' }));

    expect(count()).toBe('1/53 casos');
    expect(screen.getByRole('button', { name: /GAL Galería/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('opens the case linked from the URL hash', () => {
    window.history.replaceState(null, '', '/desarrollo/calidad#TC-EVT-001');
    render(<TestCaseBrowser updatedAt="x" />);

    expect(count()).toBe('1/53 casos');
    expect(screen.getByRole('button', { name: /TC-EVT-001/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('ignores a hash that is not a case', () => {
    window.history.replaceState(null, '', '/desarrollo/calidad#otra-cosa');
    render(<TestCaseBrowser updatedAt="x" />);
    expect(count()).toBe('53/53 casos');
  });
});
