import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { documentedComponents } from './component-list';
import { ComponentGallery, HeaderRowDemo } from './component-gallery';

jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), {
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(() => 'toast-id'),
  }),
}));

// PageTitle's sidebar trigger needs the sidebar context.
const renderGallery = () => render(<ComponentGallery />, { wrapper: SidebarProvider });

const block = (id: string) => document.getElementById(`componente-${id}`)!;

describe('ComponentGallery', () => {
  it('documents every component with its file, rules and states', () => {
    renderGallery();

    for (const { id, name } of documentedComponents) {
      expect(within(block(id)).getByRole('heading', { name: `### ${name}` })).toBeInTheDocument();
    }
    expect(
      within(block('button')).getByRole('link', { name: 'src/components/ui/button.tsx ↗' }),
    ).toHaveAttribute(
      'href',
      'https://github.com/programaconnosotros/pcn-website/blob/main/src/components/ui/button.tsx',
    );
    // Forced interaction states wrap the frozen specimens
    expect(block('button').querySelectorAll('[data-force-state="hover"]').length).toBe(6);
    // The ruled grid forces hover on a single row itself
    expect(block('ruled-grid').querySelectorAll('[data-force-state="hover"]')).toHaveLength(1);
    // A component with a single state has no state switcher; the toast only has a playground
    expect(within(block('menu')).queryByRole('group')).not.toBeInTheDocument();
    expect(within(block('toast')).queryByRole('group')).not.toBeInTheDocument();
  });

  it('shows one state at a time from the switcher', async () => {
    renderGallery();
    const buttonBlock = within(block('button'));
    const switcher = within(buttonBlock.getByRole('group', { name: 'Elegir el estado a mostrar' }));

    await userEvent.click(switcher.getByRole('button', { name: 'loading' }));
    expect(switcher.getByRole('button', { name: 'loading' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(block('button').querySelectorAll('[inert]')).toHaveLength(6);

    await userEvent.click(switcher.getByRole('button', { name: 'todos' }));
    expect(block('button').querySelectorAll('[inert]')).toHaveLength(36);

    const searchSwitcher = within(within(block('search-bar')).getByRole('group'));
    await userEvent.click(searchSwitcher.getByRole('button', { name: 'con valor' }));
    expect(block('search-bar').querySelectorAll('[inert]')).toHaveLength(1);
  });

  it('fires every kind of toast from its playground', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderGallery();
    const toasts = within(block('toast'));

    await user.click(toasts.getByRole('button', { name: 'toast.success();' }));
    await user.click(toasts.getByRole('button', { name: 'toast.warning();' }));
    await user.click(toasts.getByRole('button', { name: 'toast.error();' }));
    await user.click(toasts.getByRole('button', { name: 'toast.action();' }));
    await user.click(toasts.getByRole('button', { name: 'toast.loading();' }));

    expect(toast.success).toHaveBeenCalledWith('evento creado', expect.any(Object));
    expect(toast.warning).toHaveBeenCalledWith('quedan 3 lugares', expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith('no se pudo guardar', expect.any(Object));
    expect(toast.loading).toHaveBeenCalledWith('subiendo foto...');
    const action = jest.mocked(toast).mock.calls[0][1] as unknown as {
      action: { onClick: () => void };
    };
    expect(action.action.onClick()).toBeUndefined();

    act(() => jest.advanceTimersByTime(1500));
    expect(toast.success).toHaveBeenLastCalledWith('foto subida', { id: 'toast-id' });
    jest.useRealTimers();
  });

  it('toggles the mark toggle in a live demo', async () => {
    renderGallery();
    const toggles = block('mark-toggle').querySelectorAll('[inert] button');
    expect(toggles.length).toBe(4);
    expect(toggles[3]).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(toggles[0]);
    expect(toggles[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('clears the país error when a country is picked in the form row playground', async () => {
    renderGallery();
    const playground = within(block('form-field'));
    expect(playground.getByText('elegí un país')).toBeInTheDocument();

    const combo = playground.getAllByRole('combobox').at(-1)!;
    await userEvent.click(combo);
    await userEvent.click(await screen.findByRole('option', { name: 'Uruguay' }));

    expect(combo).toHaveTextContent('Uruguay');
    expect(playground.queryByText('elegí un país')).not.toBeInTheDocument();
  });

  it('opens the dialog and the dropdown playgrounds', async () => {
    renderGallery();

    await userEvent.click(within(block('dialog')).getByRole('button', { name: 'abrirDialog();' }));
    expect(await screen.findByRole('dialog', { name: 'subir foto' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(within(block('menu')).getByRole('button', { name: /ordenar\(\);/ }));
    expect(await screen.findByRole('menuitem', { name: 'popularidad' })).toBeInTheDocument();
  });
});

describe('HeaderRowDemo', () => {
  it('lines up a search bar, a language filter, tabs and a button', async () => {
    render(<HeaderRowDemo />);

    await userEvent.type(screen.getByRole('textbox'), 'vim');
    expect(screen.getByRole('textbox')).toHaveValue('vim');
    expect(screen.getByRole('tab', { name: 'libros' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'sumar();' })).toBeInTheDocument();
  });
});
