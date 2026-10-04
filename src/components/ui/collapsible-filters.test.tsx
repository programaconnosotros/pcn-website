import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsibleFilters } from './collapsible-filters';

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
});
