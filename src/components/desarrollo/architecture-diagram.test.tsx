import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArchitectureDiagram } from './architecture-diagram';
import { loadMermaid } from './mermaid';

jest.mock('./mermaid', () => ({ loadMermaid: jest.fn() }));

const renderMock = jest.fn();
const mockMermaid = () =>
  jest.mocked(loadMermaid).mockResolvedValue({ render: renderMock } as never);

const svgOfWidth = (width: number) => `<svg viewBox="0 0 ${width} 100"><text>nodo</text></svg>`;

const setFrameWidth = (width: number) =>
  jest.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width);

describe('ArchitectureDiagram', () => {
  afterEach(() => jest.restoreAllMocks());

  it('renders the diagram fitted to the frame width and zooms with the buttons', async () => {
    mockMermaid();
    renderMock.mockResolvedValue({ svg: svgOfWidth(1000) });
    setFrameWidth(832); // (832 - 32) / 1000 = 0.8

    render(<ArchitectureDiagram id="deploy" title="Deploy" source="flowchart LR; a-->b" />);

    expect(screen.getByText('deploy')).toBeInTheDocument();
    expect(screen.getByText('dibujando el diagrama…')).toBeInTheDocument();
    expect(await screen.findByText('nodo')).toBeInTheDocument();
    expect(renderMock).toHaveBeenCalledWith(
      expect.stringMatching(/^arch-.*-deploy$/),
      'flowchart LR; a-->b',
    );
    expect(screen.getByText('80%')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Acercar' }));
    expect(screen.getByText('100%')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Alejar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Alejar' }));
    expect(screen.getByText('60%')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ajustar al ancho' }));
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('never fits below 60% and disables the buttons at the zoom limits', async () => {
    mockMermaid();
    renderMock.mockResolvedValue({ svg: svgOfWidth(10000) });
    setFrameWidth(300);

    render(<ArchitectureDiagram id="x" title="X" source="a" />);
    expect(await screen.findByText('60%')).toBeInTheDocument();

    const zoomOut = screen.getByRole('button', { name: 'Alejar' });
    await userEvent.click(zoomOut);
    await userEvent.click(zoomOut);
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(zoomOut).toBeDisabled();

    const zoomIn = screen.getByRole('button', { name: 'Acercar' });
    for (let i = 0; i < 10; i++) await userEvent.click(zoomIn);
    expect(screen.getByText('200%')).toBeInTheDocument();
    expect(zoomIn).toBeDisabled();
  });

  it('keeps 100% when the svg has no viewBox', async () => {
    mockMermaid();
    renderMock.mockResolvedValue({ svg: '<svg><text>sin viewbox</text></svg>' });

    render(<ArchitectureDiagram id="x" title="X" source="a" />);
    expect(await screen.findByText('sin viewbox')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('says so when mermaid fails to draw', async () => {
    mockMermaid();
    renderMock.mockRejectedValue(new Error('parse error'));

    render(<ArchitectureDiagram id="x" title="X" source="nope" />);
    expect(await screen.findByText('no se pudo dibujar el diagrama')).toBeInTheDocument();
  });

  it('ignores a render that finishes after unmounting', async () => {
    mockMermaid();
    let resolve!: (_value: { svg: string }) => void;
    renderMock.mockReturnValue(new Promise((r) => (resolve = r)));

    const { unmount } = render(<ArchitectureDiagram id="x" title="X" source="a" />);
    unmount();
    resolve({ svg: svgOfWidth(100) });
    await Promise.resolve();
    expect(screen.queryByText('nodo')).not.toBeInTheDocument();
  });
});
