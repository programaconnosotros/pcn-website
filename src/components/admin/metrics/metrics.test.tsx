import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@/test/dom';
import {
  Delta,
  EmptyPanel,
  HourHeatmap,
  KpiTile,
  ModuleRanking,
  Panel,
  PanelTitle,
  RankedList,
  SignupFunnel,
  Sparkline,
  TopPages,
} from './metrics-panels';
import { RangeFilter } from './range-filter';
import { TrafficChart, type TrafficPoint } from './traffic-chart';

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

describe('metrics panels', () => {
  it.each([
    [0, 0, 'sin cambios'],
    [5, 0, 'nuevo'],
    [15, 10, '+50%'],
    [5, 10, '-50%'],
    [10, 10, '0%'],
    [10.5, 10, '+5%'],
    [100, 10, '×10'],
  ])('Delta %d vs %d → %s', (current, previous, text) => {
    render(<Delta current={current} previous={previous} />);
    expect(screen.getByText(text, { exact: false })).toBeInTheDocument();
  });

  it('renders a KPI tile with its delta, hint and sparkline', () => {
    const { container } = render(
      <KpiTile
        label="visitas"
        value="1.200"
        current={12}
        previous={10}
        hint="únicas"
        spark={[1, 3, 2]}
      />,
    );

    expect(screen.getByText('visitas')).toBeInTheDocument();
    expect(screen.getByText('+20%')).toBeInTheDocument();
    expect(screen.getByText('únicas')).toBeInTheDocument();
    expect(container.querySelector('polyline')).toHaveAttribute(
      'points',
      expect.stringContaining('100,'),
    );
  });

  it('skips the sparkline with fewer than two values and the delta without a previous', () => {
    const { container } = render(<KpiTile label="x" value="1" current={1} />);
    expect(container.querySelector('svg')).toBeNull();
    expect(render(<Sparkline values={[1]} />).container).toBeEmptyDOMElement();
  });

  it('ranks modules by visits with their share and change', () => {
    render(
      <ModuleRanking
        modules={[
          { section: '/eventos', visits: 30, visitors: 20, members: 5 },
          { section: '/autenticacion', visits: 10, visitors: 8, members: 0 },
          { section: '/zzz-desconocido', visits: 10, visitors: 1, members: 0 },
        ]}
        previous={[{ section: '/eventos', visits: 15 }]}
      />,
    );

    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('01');
    expect(rows[0]).toHaveTextContent('60%');
    expect(rows[0]).toHaveTextContent('+100%');
    expect(rows[1]).toHaveTextContent('Registro y login');
    expect(rows[2]).toHaveTextContent('/zzz-desconocido');
    expect(rows[2]).toHaveTextContent('nuevo');
    expect(rows[0]).toHaveAttribute('title', '20 visitantes únicos · 5 miembros');
  });

  it('shows empty panels without data', () => {
    render(
      <>
        <ModuleRanking modules={[]} previous={[]} />
        <TopPages pages={[]} />
        <RankedList items={[]} empty="sin referrers" />
      </>,
    );

    expect(screen.getAllByText('sin datos en este período')).toHaveLength(2);
    expect(screen.getByText('sin referrers')).toBeInTheDocument();
  });

  it('lists top pages with links', () => {
    render(
      <TopPages
        pages={[
          { path: '/eventos', visits: 1500, visitors: 900 },
          { path: '/cursos', visits: 10, visitors: 3 },
        ]}
      />,
    );

    expect(screen.getByText('/eventos').closest('a')).toHaveAttribute('href', '/eventos');
    // es-AR leaves four-digit numbers ungrouped
    expect(screen.getByText(/^1\.?500$/)).toBeInTheDocument();
  });

  it('draws the signup funnel and calls out the biggest leak', () => {
    render(
      <SignupFunnel
        steps={[
          { id: 'form', label: 'Abrió el formulario', hint: 'a', count: 100 },
          { id: 'account', label: 'Creó la cuenta', hint: 'b', count: 40 },
          { id: 'verified', label: 'Verificó el email', hint: 'c', count: 30 },
          { id: 'profile', label: 'Completó el perfil', hint: 'd', count: 30 },
        ]}
      />,
    );

    expect(screen.getByText(/60 se quedaron acá/)).toHaveTextContent('pasa el 40% · mayor fuga');
    expect(screen.getByText(/10 se quedaron acá/)).not.toHaveTextContent('mayor fuga');
    expect(screen.getAllByText(/se quedaron acá/)).toHaveLength(2);
  });

  it('handles a funnel nobody entered', () => {
    render(
      <SignupFunnel
        steps={[
          { id: 'a', label: 'Paso', hint: '', count: 0 },
          { id: 'b', label: 'Otro', hint: '', count: 0 },
        ]}
      />,
    );

    expect(screen.getAllByText('0%')).toHaveLength(2);
  });

  it('shows the busiest hour on the heatmap', () => {
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
    grid[3][20] = 50;
    grid[1][9] = 10;
    render(<HourHeatmap grid={grid} />);

    expect(screen.getByText('mié 20h')).toBeInTheDocument();
    expect(screen.getByTitle('mié 20h · 50 visitas')).toHaveStyle({
      boxShadow: '0 0 8px rgba(4,244,190,0.6)',
    });
  });

  it('omits the peak on an empty heatmap', () => {
    render(<HourHeatmap grid={Array.from({ length: 7 }, () => Array(24).fill(0))} />);

    expect(screen.queryByText(/pico/)).not.toBeInTheDocument();
  });

  it('renders ranked lists, titles and panels', () => {
    render(
      <Panel aria-label="panel">
        <PanelTitle note="últimos 30 días">referrers</PanelTitle>
        <RankedList
          items={[
            { label: 'google', value: 3 },
            { label: 'twitter', value: 1 },
          ]}
        />
        <EmptyPanel>nada</EmptyPanel>
      </Panel>,
    );

    expect(screen.getByRole('heading', { name: '// referrers' })).toBeInTheDocument();
    expect(screen.getByText('últimos 30 días')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('nada')).toBeInTheDocument();
  });
});

describe('RangeFilter', () => {
  const from = new Date('2025-03-01T12:00:00Z');
  const to = new Date('2025-03-31T12:00:00Z');

  it('switches presets through the URL', async () => {
    render(<RangeFilter preset="30d" from={from} to={to} />);

    expect(screen.getByRole('button', { name: '30d' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: '7d' }));

    expect(mockRouter.push).toHaveBeenCalledWith('/metricas?rango=7d');
  });

  it('applies a custom range only when it is valid', async () => {
    const user = userEvent.setup();
    render(<RangeFilter preset={null} from={from} to={to} />);
    const desde = screen.getByLabelText('Desde');
    const hasta = screen.getByLabelText('Hasta');
    expect(desde).toHaveValue('2025-03-01');
    expect(hasta).toHaveValue('2025-03-31');

    fireEvent.change(desde, { target: { value: '2025-04-10' } });
    await user.click(screen.getByRole('button', { name: 'aplicar' }));
    expect(mockRouter.push).not.toHaveBeenCalled();

    fireEvent.change(desde, { target: { value: '2025-03-05' } });
    fireEvent.change(hasta, { target: { value: '2025-03-20' } });
    await user.click(screen.getByRole('button', { name: 'aplicar' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/metricas?desde=2025-03-05&hasta=2025-03-20');
  });
});

describe('TrafficChart', () => {
  const points: TrafficPoint[] = [
    { day: '2025-03-01T00:00:00Z', visits: 10, visitors: 5, signups: 1 },
    { day: '2025-03-02T00:00:00Z', visits: 2000, visitors: 7, signups: 0 },
    { day: '2025-03-03T00:00:00Z', visits: 30, visitors: 9, signups: 2 },
  ];

  it('shows the total of the selected series and switches series', async () => {
    render(<TrafficChart points={points} unit="day" />);

    expect(screen.getByRole('img', { name: 'visitas por día: 2040 en total' })).toBeInTheDocument();
    // The axis tops out at a round 2000
    expect(screen.getByText(/^2\.?000$/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'altas' }));
    expect(screen.getByRole('img', { name: 'altas por día: 3 en total' })).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('follows the pointer with a crosshair and tooltip', () => {
    render(<TrafficChart points={points} unit="week" />);
    const chart = screen.getByRole('img');
    jest.spyOn(chart, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 100 } as DOMRect);

    act(() => {
      fireEvent.mouseMove(chart, { clientX: 100 });
    });
    expect(screen.getByText(/semana del/)).toHaveTextContent('semana del 3 mar');

    act(() => {
      fireEvent.mouseLeave(chart);
    });
    expect(screen.getByText(/por semana/)).toBeInTheDocument();
  });

  it('centers a single point and picks a round scale', () => {
    const { container } = render(
      <TrafficChart
        points={[{ day: '2025-03-01T00:00:00Z', visits: 7, visitors: 1, signups: 0 }]}
        unit="day"
      />,
    );

    expect(container.querySelectorAll('path')[1]).toHaveAttribute(
      'd',
      expect.stringMatching(/^M500,/),
    );
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
