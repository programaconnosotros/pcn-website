import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('shows the command, its output, the title and the description', () => {
    render(
      <EmptyState
        command="ls ~/lugares"
        output="total 0"
        title="Sin lugares"
        description="Sumá el primero"
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('ls ~/lugares')).toBeInTheDocument();
    expect(screen.getByText('total 0')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sin lugares/ })).toBeInTheDocument();
    expect(screen.getByText('Sumá el primero')).toBeInTheDocument();
  });

  it('clears the filters when asked to show the refresh button', async () => {
    const onRefresh = jest.fn();
    render(<EmptyState title="Sin eventos" showRefresh onRefresh={onRefresh} />);

    await userEvent.click(screen.getByRole('button', { name: 'limpiarFiltros();' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('has no buttons by default and renders a custom action', () => {
    render(<EmptyState title="Vacío" action={<button type="button">cd ~/x</button>} />);
    expect(screen.queryByRole('button', { name: 'limpiarFiltros();' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cd ~/x' })).toBeInTheDocument();
  });
});
