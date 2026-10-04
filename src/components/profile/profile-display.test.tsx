import { render, screen } from '@testing-library/react';
import { GitHubContributions } from './github-contributions';
import { LanguageChip } from './language-chip';
import { LanguageCoinsContainer } from './language-coins-container';
import { LanguagePieChart } from './language-pie-chart';
import { ProfileTabSkeleton } from './profile-tab-skeleton';
import { getGitHubTotalContributions } from '@/lib/github-contributions';

jest.mock('@/lib/github-contributions', () => ({
  ...jest.requireActual('@/lib/github-contributions'),
  getGitHubTotalContributions: jest.fn(),
}));

describe('LanguageChip', () => {
  it('shows a known language lit, and toggles when selectable', () => {
    const onToggle = jest.fn();
    const { rerender } = render(<LanguageChip languageId="typescript" />);
    expect(screen.getByText('.ts')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toHaveClass('text-foreground');

    rerender(<LanguageChip languageId="typescript" selectable onToggle={onToggle} />);
    const chip = screen.getByRole('button', { name: /TypeScript/ });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('TypeScript')).toHaveClass('text-muted-foreground');
    chip.click();
    expect(onToggle).toHaveBeenCalled();
  });

  it('falls back to the id for unknown languages', () => {
    render(<LanguageChip languageId="brainfuck" selectable selected />);

    expect(screen.getByText('.bra')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /brainfuck/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});

describe('LanguageCoinsContainer', () => {
  it('lists the languages or says there are none', () => {
    const { rerender } = render(<LanguageCoinsContainer languages={[]} />);
    expect(screen.getByText('No hay lenguajes de programación añadidos')).toBeInTheDocument();

    rerender(
      <LanguageCoinsContainer
        languages={[{ languageId: 'python', color: '#fff', logo: 'py', experienceLevel: 1 }]}
      />,
    );
    expect(screen.getByText('Python')).toBeInTheDocument();
  });
});

describe('LanguagePieChart', () => {
  it('says there is no data', () => {
    render(<LanguagePieChart data={[]} />);

    expect(screen.getByText('No hay datos para mostrar')).toBeInTheDocument();
  });

  it('draws a full circle for a single language', () => {
    const { container } = render(
      <LanguagePieChart data={[{ name: 'TS', value: 100, color: '#00f' }]} />,
    );

    expect(container.querySelector('circle')).toHaveAttribute('fill', '#00f');
    expect(container.querySelector('title')).toHaveTextContent('TS: 100%');
    expect(container.querySelector('text')).toHaveTextContent('TS');
  });

  it('draws a slice per language with its legend, redrawing on change', () => {
    const { container, rerender } = render(
      <LanguagePieChart
        data={[
          { name: 'TS', value: 70, color: '#00f' },
          { name: 'Py', value: 30, color: '#ff0' },
        ]}
      />,
    );
    expect(container.querySelectorAll('path')).toHaveLength(2);
    expect(Array.from(container.querySelectorAll('title')).map((t) => t.textContent)).toEqual([
      'TS: 70%',
      'Py: 30%',
    ]);

    rerender(<LanguagePieChart data={[{ name: 'Go', value: 100, color: '#0ff' }]} />);
    expect(container.querySelectorAll('path')).toHaveLength(0);
    expect(container.querySelectorAll('text')).toHaveLength(1);
  });
});

describe('ProfileTabSkeleton', () => {
  it.each([
    ['resumen', 9],
    ['fotos', 12],
    ['contribuciones', 8],
    ['proyectos', 12],
  ] as const)('shows a placeholder shaped like the %s tab', (tab, skeletons) => {
    const { container } = render(<ProfileTabSkeleton tab={tab} />);

    expect(screen.getByLabelText('Cargando')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(skeletons);
  });
});

describe('GitHubContributions', () => {
  it('links the member total on GitHub', async () => {
    jest.mocked(getGitHubTotalContributions).mockResolvedValue(12345);

    render((await GitHubContributions({ gitHubUrl: 'https://github.com/ada' }))!);

    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://github.com/ada');
    expect(screen.getByText('12.345')).toBeInTheDocument();
  });

  it('renders nothing without GitHub or contributions', async () => {
    jest.mocked(getGitHubTotalContributions).mockResolvedValue(0);

    await expect(GitHubContributions({ gitHubUrl: 'https://github.com/ada' })).resolves.toBeNull();
    await expect(GitHubContributions({ gitHubUrl: null })).resolves.toBeNull();
  });
});
