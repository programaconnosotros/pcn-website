import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareDialog } from './share-dialog';

// User-event flows through Radix portals: give them room on a busy machine
jest.setTimeout(20_000);

describe('ShareDialog', () => {
  it('copies the link and confirms for two seconds', async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const timeout = jest.spyOn(window, 'setTimeout');
    render(
      <ShareDialog isOpen onClose={jest.fn()} url="https://pcn.dev/galeria/p1" title="Brindis" />,
    );

    expect(screen.getByRole('dialog')).toHaveTextContent('Link directo a "Brindis"');
    await user.click(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Copiar' }));

    expect(writeText).toHaveBeenCalledWith('https://pcn.dev/galeria/p1');
    expect(await screen.findByText('[ok] link copiado al portapapeles')).toBeInTheDocument();
    // The confirmation goes away after two seconds
    const [hide] = timeout.mock.calls.find(([, ms]) => ms === 2000)!;
    act(() => (hide as () => void)());
    expect(screen.getByRole('button', { name: 'Copiar' })).toBeInTheDocument();
    expect(screen.queryByText(/link copiado/)).not.toBeInTheDocument();
  });

  it('logs when the clipboard is not available, and closes', async () => {
    const user = userEvent.setup();
    jest.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onClose = jest.fn();
    render(<ShareDialog isOpen onClose={onClose} url="u" title="t" />);

    await user.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(error).toHaveBeenCalled();
    expect(screen.queryByText(/link copiado/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'cerrar();' }));
    expect(onClose).toHaveBeenCalled();
  });
});
