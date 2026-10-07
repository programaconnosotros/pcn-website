import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarProvider } from './sidebar';
import { SidebarToggle } from './sidebar-toggle';

const renderToggle = (defaultOpen: boolean) =>
  render(
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarToggle />
    </SidebarProvider>,
  );

describe('SidebarToggle', () => {
  it('names the action by the sidebar state and flips it on click', async () => {
    renderToggle(false);
    const toggle = screen.getByRole('button', { name: 'Mostrar barra lateral' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveTextContent('sidebar --show');

    await userEvent.click(toggle);
    const open = screen.getByRole('button', { name: 'Ocultar barra lateral' });
    expect(open).toHaveAttribute('aria-expanded', 'true');
    expect(open).toHaveTextContent('sidebar --hide');
    // A short glitch plays on every press.
    expect(open).toHaveClass('sidebar-toggle-glitch');
  });

  it('hints the keyboard shortcut', () => {
    renderToggle(true);
    expect(screen.getByRole('button')).toHaveAttribute(
      'title',
      expect.stringMatching(/\((⌘|Ctrl )B\)$/),
    );
  });
});
