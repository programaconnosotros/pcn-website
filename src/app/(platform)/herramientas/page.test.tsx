import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInPlatform } from '@/test/platform';
import HerramientasLayout, { metadata } from './layout';
import Loading from './loading';
import SoftwareRecommendationsPage from './page';

const cards = () =>
  screen.getAllByRole('link').filter((link) => link.getAttribute('target') === '_blank');
const cardNames = () => cards().map((card) => within(card).getByRole('heading').textContent);

describe('SoftwareRecommendationsPage', () => {
  beforeEach(() => renderInPlatform(<SoftwareRecommendationsPage />));

  it('starts on the apps tab, sorted by name, with pricing and the "usado acá" badge', () => {
    expect(screen.getByText(/herramientas recomendadas por la comunidad/)).toBeInTheDocument();
    const names = cardNames();
    expect(names).toEqual([...names].sort((a, b) => a!.localeCompare(b!)));
    const docker = cards().find((card) => within(card).queryByText('Docker'))!;
    expect(docker).toHaveAttribute('href', expect.stringContaining('docker'));
    expect(within(docker).getByText('usado acá')).toBeInTheDocument();
    expect(within(docker).getByText('freemium')).toBeInTheDocument();
    expect(names).not.toContain('React');
  });

  it('shows libraries and languages on their tabs, languages with typing and paradigms', async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: 'Librerías' }));
    expect(cardNames()).toContain('React');

    await user.click(screen.getByRole('tab', { name: 'Lenguajes' }));
    const rust = cards().find((card) => within(card).queryByText('Rust'))!;
    expect(within(rust).getByText(/tipado estático · Imperativo/)).toBeInTheDocument();
    expect(within(rust).getByText('lenguaje')).toBeInTheDocument();
  });

  it('filters by name, description, category or tag and clears an empty search', async () => {
    const user = userEvent.setup();
    const search = screen.getByRole('textbox', { name: /Buscar por nombre/ });
    await user.type(search, 'docker');
    expect(cardNames()).toContain('Docker');
    expect(cardNames()).not.toContain('Notion');

    await user.clear(search);
    await user.type(search, 'zzz-nada');
    expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /limpiarFiltros/ }));
    expect(search).toHaveValue('');
    expect(cards().length).toBeGreaterThan(1);
  });
});

describe('herramientas route files', () => {
  it('the layout renders its children and describes the page', () => {
    render(<HerramientasLayout>contenido</HerramientasLayout>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
    expect(metadata.openGraph).toMatchObject({ title: 'Herramientas | programaConNosotros' });
  });

  it('renders a loading skeleton', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).not.toBeNull();
  });
});
