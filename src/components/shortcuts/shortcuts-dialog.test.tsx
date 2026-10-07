import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalShortcutsDialog, openShortcutsDialog } from './shortcuts-dialog';

describe('GlobalShortcutsDialog', () => {
  it('opens from anywhere and lists the shortcuts by group', () => {
    render(<GlobalShortcutsDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    act(() => openShortcutsDialog());
    expect(screen.getByRole('dialog', { name: 'atajos de teclado' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /PCN OS/ })).toBeInTheDocument();
    expect(screen.getByText('Búsqueda global')).toBeInTheDocument();
  });

  it('filters as you type and says when nothing matches', async () => {
    render(<GlobalShortcutsDialog />);
    act(() => openShortcutsDialog());

    await userEvent.type(screen.getByLabelText('Filtrar atajos'), 'historial');
    expect(screen.getByText('Atrás / adelante en el historial')).toBeInTheDocument();
    expect(screen.queryByText('Búsqueda global')).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Filtrar atajos'), 'zzz');
    expect(screen.getByText(/sin coincidencias/)).toBeInTheDocument();
  });
});
