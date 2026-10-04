import { act, render, screen } from '@testing-library/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { SparklesCore } from './sparkles';
import { Vortex } from './vortex';
import { Button as MovingBorderButton } from './moving-border';
import { PcnLoader } from './pcn-loader';
import { TextGenerateEffect } from './text-generate-effect';
import { Timeline } from './timeline';

jest.mock('@tsparticles/slim', () => ({ loadSlim: jest.fn() }));
jest.mock('@tsparticles/react', () => ({
  __esModule: true,
  initParticlesEngine: jest.fn(),
  default: ({
    id,
    options,
    particlesLoaded,
  }: {
    id: string;
    options: { background: { color: { value: string } }; particles: { number: { value: number } } };
    particlesLoaded: (_container?: unknown) => void;
  }) => (
    <div
      data-testid="particles"
      id={id}
      data-background={options.background.color.value}
      data-count={options.particles.number.value}
      onClick={() => {
        particlesLoaded(undefined);
        particlesLoaded({});
      }}
    />
  ),
}));

describe('SparklesCore', () => {
  it('starts the particle engine and renders the particles with the given options', async () => {
    (initParticlesEngine as jest.Mock).mockImplementation(async (load) => load('engine'));
    jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<SparklesCore id="chispas" background="#000" particleDensity={50} />);
    const particles = await screen.findByTestId('particles');
    expect(loadSlim).toHaveBeenCalledWith('engine');
    expect(particles).toHaveAttribute('id', 'chispas');
    expect(particles).toHaveAttribute('data-background', '#000');
    expect(particles).toHaveAttribute('data-count', '50');

    act(() => particles.click());
    expect(console.log).toHaveBeenCalledTimes(1);
    (console.log as jest.Mock).mockRestore();
  });

  it('uses defaults and a generated id', async () => {
    (initParticlesEngine as jest.Mock).mockResolvedValue(undefined);
    render(<SparklesCore />);
    const particles = await screen.findByTestId('particles');
    expect(particles.id).not.toBe('');
    expect(particles).toHaveAttribute('data-background', '#0d47a1');
    expect(particles).toHaveAttribute('data-count', '120');
  });
});

describe('Vortex', () => {
  it('animates particles on a canvas and follows the window size', () => {
    const ctx = new Proxy(
      {},
      {
        get: (target: Record<string, unknown>, key: string) => (target[key] ??= jest.fn()),
        set: () => true,
      },
    );
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never);
    const frames: FrameRequestCallback[] = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => frames.push(cb));
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 400 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 300 });

    const { container, unmount } = render(
      <Vortex particleCount={20} baseHue={100} backgroundColor="#111" className="contenido">
        <p>hola</p>
      </Vortex>,
    );
    expect(screen.getByText('hola')).toBeInTheDocument();
    const canvas = container.querySelector('canvas')!;
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(300);
    // Run enough frames for particles to leave the screen or end their life and respawn.
    for (let i = 0; i < 260 && frames.length; i++) frames.shift()!(i);
    expect((ctx as unknown as { stroke: jest.Mock }).stroke).toHaveBeenCalled();

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(canvas.width).toBe(800);
    unmount();
    jest.restoreAllMocks();
  });

  it('renders without a 2D context', () => {
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<Vortex>texto</Vortex>);
    expect(screen.getByText('texto')).toBeInTheDocument();
    jest.restoreAllMocks();
  });
});

describe('MovingBorder button', () => {
  it('renders its content with a moving glow along the border', () => {
    const frames: FrameRequestCallback[] = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => frames.push(cb));
    const rect = SVGElement.prototype as unknown as {
      getTotalLength?: () => number;
      getPointAtLength?: (_n: number) => { x: number; y: number };
    };
    rect.getTotalLength = () => 100;
    rect.getPointAtLength = (n: number) => ({ x: n, y: n / 2 });

    render(
      <MovingBorderButton as="a" href="/x" duration={1000} borderRadius="1rem">
        entrar
      </MovingBorderButton>,
    );
    expect(screen.getByRole('link', { name: 'entrar' })).toHaveStyle({ borderRadius: '1rem' });
    act(() => {
      for (let i = 0; i < 3 && frames.length; i++) frames.shift()!(500);
    });
    delete rect.getTotalLength;
    delete rect.getPointAtLength;
    jest.restoreAllMocks();
  });

  it('defaults to a button', () => {
    render(<MovingBorderButton>ok</MovingBorderButton>);
    expect(screen.getByRole('button', { name: 'ok' })).toBeInTheDocument();
  });
});

describe('PcnLoader', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('counts up a boot log that never reaches 100%', () => {
    render(<PcnLoader label="eventos" />);
    const status = screen.getByRole('status', { name: 'Cargando eventos' });
    expect(status).toHaveTextContent('$ open eventos');
    expect(status).toHaveTextContent('00%');
    expect(status).toHaveTextContent('resolviendo ruta');

    act(() => jest.advanceTimersByTime(70 * 300));
    expect(status).toHaveTextContent('99%');
    expect(status).toHaveTextContent('montando interfaz');
    expect(status.textContent).toMatch(/0x[0-9a-f]{8}/);
  });

  it('has a generic label', () => {
    render(<PcnLoader />);
    expect(screen.getByRole('status', { name: 'Cargando' })).toHaveTextContent('$ boot pcn');
  });
});

describe('TextGenerateEffect', () => {
  it('renders every word', () => {
    render(<TextGenerateEffect words="hola mundo cruel" filter={false} duration={0} />);
    expect(screen.getByText('hola')).toBeInTheDocument();
    expect(screen.getByText('cruel')).toHaveStyle({ filter: 'none' });
  });

  it('blurs words in by default', () => {
    render(<TextGenerateEffect words="hola" className="x" />);
    expect(screen.getByText('hola').closest('.x')).toBeInTheDocument();
  });
});

describe('Timeline', () => {
  it('renders each entry with its title and content', () => {
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ height: 500 } as DOMRect);
    const { container } = render(
      <Timeline
        data={[
          { title: '2024', content: <p>inicio</p> },
          { title: '2025', content: <p>crecimiento</p> },
        ]}
      />,
    );
    expect(screen.getAllByText('2024')).toHaveLength(2);
    expect(screen.getByText('crecimiento')).toBeInTheDocument();
    expect(container.querySelector('[style*="height: 500px"]')).toBeInTheDocument();
    jest.restoreAllMocks();
  });
});
