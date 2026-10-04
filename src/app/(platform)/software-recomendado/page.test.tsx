import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import SoftwareRecomendadoLayout, { metadata } from './layout';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import SoftwareRecommendationsPage from './page';

jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

// Interaction tests run slowly when the whole suite shares a busy machine
jest.setTimeout(20_000);

const names = () => screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent);
const card = (name: string) => screen.getByRole('heading', { name }).closest('a')!;

describe('/software-recomendado', () => {
  it('sets the title and share cards in its layout', () => {
    expect(metadata.title).toBe('ls ~/software-recomendado');
    expect(metadata.openGraph).toMatchObject({
      title: 'Software recomendado | programaConNosotros',
    });
    render(<SoftwareRecomendadoLayout>lista</SoftwareRecomendadoLayout>);
    expect(screen.getByText('lista')).toBeInTheDocument();
  });

  it('links every app to its site, marking the free and popular ones', async () => {
    await renderPage(<SoftwareRecommendationsPage />);

    expect(screen.getByText('7 apps recomendadas por la comunidad')).toBeInTheDocument();
    expect(names()).toHaveLength(7);
    const vscode = card('Visual Studio Code');
    expect(vscode).toHaveAttribute('href', 'https://code.visualstudio.com');
    expect(vscode).toHaveAttribute('target', '_blank');
    expect(within(vscode).getByText('popular')).toBeInTheDocument();
    expect(within(vscode).getByText('gratis')).toBeInTheDocument();
    expect(
      within(vscode).getByRole('img', { name: 'Visual Studio Code logo' }),
    ).toBeInTheDocument();
    // Paid apps show their category instead
    expect(within(card('Adobe Photoshop')).getByText('diseño')).toBeInTheDocument();
    expect(within(card('Docker')).queryByText('popular')).not.toBeInTheDocument();
  });

  it('searches by name, description, category or tag', async () => {
    const user = userEvent.setup();
    await renderPage(<SoftwareRecommendationsPage />);
    const search = screen.getByRole('textbox', { name: /Buscar software/ });

    await user.type(search, 'devops');
    expect(names()).toEqual(['Docker']);
    await user.clear(search);
    await user.type(search, 'http');
    expect(names()).toEqual(['Postman']);
    await user.clear(search);
    await user.type(search, 'canales');
    expect(names()).toEqual(['Slack']);
    await user.clear(search);
    await user.type(search, 'DISEÑO');
    expect(names()).toEqual(['Figma', 'Adobe Photoshop']);
  });

  it('shows an empty state that clears the search', async () => {
    const user = userEvent.setup();
    await renderPage(<SoftwareRecommendationsPage />);

    await user.type(screen.getByRole('textbox', { name: /Buscar software/ }), 'cobol');
    expect(screen.getByText('No se encontró software útil')).toBeInTheDocument();
    expect(names()).toEqual(['No se encontró software útil']);

    await user.click(screen.getByRole('button', { name: /limpiarFiltros/ }));
    expect(names()).toHaveLength(7);
    expect(screen.getByRole('textbox', { name: /Buscar software/ })).toHaveValue('');
  });

  it('uses the software section card for link previews', async () => {
    expect(alt).toBe('software-recomendado · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'software-recomendado' });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
