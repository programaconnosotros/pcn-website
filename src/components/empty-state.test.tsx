import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('shows the title and description and refreshes on click', async () => {
    const onRefresh = jest.fn();
    render(
      <EmptyState title="Sin eventos" description="Probá otro filtro" onRefresh={onRefresh} />,
    );

    expect(screen.getByRole('heading', { name: 'Sin eventos' })).toBeInTheDocument();
    expect(screen.getByText('Probá otro filtro')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'limpiarFiltros();' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('hides the refresh button when asked', () => {
    render(<EmptyState title="Vacío" description="Nada" showRefresh={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
