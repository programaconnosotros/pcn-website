import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OsLauncher } from './os-launcher';
import { visiblePrograms, type OsProgram } from './programs';

const programs = visiblePrograms(false);
const byId = (id: string) => programs.find((program) => program.id === id)!;

const renderLauncher = (open = true) => {
  const onOpenProgram = jest.fn<void, [OsProgram]>();
  const onClose = jest.fn();
  const utils = render(
    <OsLauncher open={open} programs={programs} onOpenProgram={onOpenProgram} onClose={onClose} />,
  );
  return { ...utils, onOpenProgram, onClose };
};

describe('OsLauncher', () => {
  it('renders nothing while closed', () => {
    renderLauncher(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('lists every program grouped and focuses the search', async () => {
    renderLauncher();
    expect(screen.getByRole('dialog', { name: 'Todos los programas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Inicio/ })).toBeInTheDocument();
    for (const program of programs)
      expect(screen.getByRole('button', { name: program.name })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByPlaceholderText('buscar programas…')).toHaveFocus());
  });

  it('opens a program on click without closing through the backdrop', async () => {
    const { onOpenProgram, onClose } = renderLauncher();
    await userEvent.click(screen.getByRole('button', { name: 'Feed' }));
    expect(onOpenProgram).toHaveBeenCalledWith(byId('feed'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('filters ignoring accents and case, and Enter opens the first match', async () => {
    const { onOpenProgram } = renderLauncher();
    const input = screen.getByPlaceholderText('buscar programas…');
    await userEvent.type(input, '  FEED');
    expect(screen.getByRole('button', { name: 'Feed' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Inicio' })).not.toBeInTheDocument();
    await userEvent.type(input, '{Enter}');
    expect(onOpenProgram).toHaveBeenCalledWith(byId('feed'));
  });

  it('shows an error when nothing matches and Enter does nothing', async () => {
    const { onOpenProgram } = renderLauncher();
    await userEvent.type(screen.getByPlaceholderText('buscar programas…'), 'zzz{Enter}');
    expect(screen.getByText(/no hay programas que coincidan/)).toHaveTextContent('zzz');
    expect(onOpenProgram).not.toHaveBeenCalled();
  });

  it('closes with Escape, the exit button and the backdrop, but not the search box', async () => {
    const { onClose } = renderLauncher();
    await userEvent.click(screen.getByPlaceholderText('buscar programas…'));
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    // The exit button sits on the backdrop, so the click reaches both (closing twice is harmless).
    onClose.mockClear();
    await userEvent.click(screen.getByRole('button', { name: 'Salir' }));
    expect(onClose).toHaveBeenCalled();

    onClose.mockClear();
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('clears the query when it opens again', async () => {
    const { rerender, onOpenProgram, onClose } = renderLauncher();
    await userEvent.type(screen.getByPlaceholderText('buscar programas…'), 'feed');
    const props = { programs, onOpenProgram, onClose };
    rerender(<OsLauncher open={false} {...props} />);
    rerender(<OsLauncher open {...props} />);
    await waitFor(() => expect(screen.getByPlaceholderText('buscar programas…')).toHaveValue(''));
  });
});
