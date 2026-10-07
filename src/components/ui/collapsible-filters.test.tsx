import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useIsMobile } from '@/hooks/use-mobile';
import { CollapsibleFilters } from './collapsible-filters';

jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: jest.fn(() => false) }));

describe('CollapsibleFilters', () => {
  it('folds the filters and aside behind the toggle on phones', async () => {
    render(
      <CollapsibleFilters
        leading={<span>tabs</span>}
        search={<input aria-label="buscar" />}
        aside={<span>3/10 resultados</span>}
        activeCount={2}
      >
        <select aria-label="tipo" />
      </CollapsibleFilters>,
    );
    const toggle = screen.getByRole('button', { name: /filtros/ });
    const panel = screen.getByRole('group', { name: 'filtros' });

    expect(toggle).toHaveTextContent('[2]');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveClass('max-md:hidden');
    expect(screen.getByText('3/10 resultados').parentElement).toHaveClass('max-md:hidden');
    expect(screen.getByText('tabs')).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveClass('max-md:hidden');
    expect(screen.getByText('3/10 resultados').parentElement).not.toHaveClass('max-md:hidden');

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('uses a custom label and no count without search', () => {
    render(
      <CollapsibleFilters label="secciones">
        <span>a</span>
      </CollapsibleFilters>,
    );
    const toggle = screen.getByRole('button', { name: 'secciones' });
    expect(toggle).not.toHaveTextContent('[');
    expect(toggle).toHaveClass('self-start');
    expect(screen.getByRole('group', { name: 'secciones' })).toBeInTheDocument();
  });

  describe('with a sheet', () => {
    const renderWithSheet = () =>
      render(
        <CollapsibleFilters
          search={<input aria-label="buscar" />}
          activeCount={1}
          aside={<span>3/10 resultados</span>}
          sheet={{
            title: 'filtros y estadísticas',
            extras: <p>estadísticas</p>,
            doneLabel: 'ver 3',
          }}
        >
          <button type="button">--grupales</button>
        </CollapsibleFilters>,
      );

    it('opens the filters and extras in a bottom sheet on phones', async () => {
      jest.mocked(useIsMobile).mockReturnValue(true);
      renderWithSheet();
      // Not in the header: only in the sheet, once it opens.
      expect(screen.queryByRole('button', { name: '--grupales' })).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /filtros/ }));
      const sheet = screen.getByRole('dialog', { name: 'filtros y estadísticas' });
      expect(sheet).toHaveTextContent('estadísticas');
      expect(sheet).toHaveTextContent('3/10 resultados');
      expect(screen.getByRole('button', { name: '--grupales' })).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'ver 3' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('keeps the filters in the header on larger screens', () => {
      jest.mocked(useIsMobile).mockReturnValue(false);
      renderWithSheet();
      expect(screen.getByRole('button', { name: '--grupales' })).toBeInTheDocument();
      expect(screen.queryByText('estadísticas')).not.toBeInTheDocument();
    });
  });
});
