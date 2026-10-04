import { act, fireEvent, render, screen } from '@testing-library/react';
import { toast } from 'sonner';
import { VimNavigation } from './vim-navigation';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const press = (
  key: string,
  init: KeyboardEventInit = {},
  target: Element | Window | Document = document.body,
) => fireEvent.keyDown(target, { key, ...init });

describe('VimNavigation', () => {
  let scrollBy: jest.Mock;
  let writeText: jest.Mock;

  beforeEach(() => {
    scrollBy = jest.fn();
    window.scrollBy = scrollBy as unknown as typeof window.scrollBy;
    (window.scrollTo as jest.Mock).mockClear();
    writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
  });

  it('scrolls a line with j and k, instantly while the key repeats', () => {
    render(<VimNavigation />);
    press('j');
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 80, behavior: 'smooth' });
    press('k', { repeat: true });
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -80, behavior: 'instant' });
  });

  it('scrolls half and whole pages with d/u and f/b', () => {
    render(<VimNavigation />);
    press('d');
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 500, behavior: 'smooth' });
    press('u');
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -500, behavior: 'smooth' });
    press('f');
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 900, behavior: 'smooth' });
    press('b');
    expect(scrollBy).toHaveBeenLastCalledWith({ top: -900, behavior: 'smooth' });
  });

  it('jumps to the top with gg and to the bottom with G', () => {
    render(<VimNavigation />);
    press('g');
    expect(window.scrollTo).not.toHaveBeenCalled();
    press('g');
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    press('G');
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  });

  it('forgets a pending g after the sequence timeout', () => {
    jest.useFakeTimers();
    try {
      render(<VimNavigation />);
      press('g');
      act(() => jest.advanceTimersByTime(700));
      press('g');
      expect(window.scrollTo).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('copies the URL with yy and toasts the result', async () => {
    render(<VimNavigation />);
    press('y');
    press('y');
    expect(writeText).toHaveBeenCalledWith(window.location.href);
    await act(async () => {});
    expect(toast.success).toHaveBeenCalledWith('Link copiado');

    writeText.mockRejectedValueOnce(new Error('denied'));
    press('y');
    press('y');
    await act(async () => {});
    expect(toast.error).toHaveBeenCalledWith('No se pudo copiar el link');
  });

  it('walks the history with H and L', () => {
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    const forward = jest.spyOn(window.history, 'forward').mockImplementation(() => {});
    render(<VimNavigation />);
    press('H');
    press('L');
    expect(back).toHaveBeenCalled();
    expect(forward).toHaveBeenCalled();
  });

  it('turns h/l into arrow keys, scrolling sideways when nobody handles them', () => {
    render(<VimNavigation />);
    press('h');
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -80, behavior: 'smooth' });
    press('l', { repeat: true });
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 80, behavior: 'instant' });
  });

  it('lets a focused element take the arrow instead of scrolling', () => {
    render(
      <button
        type="button"
        onKeyDown={(event) => event.key === 'ArrowRight' && event.preventDefault()}
      >
        galería
      </button>,
    );
    render(<VimNavigation />);
    const button = screen.getByRole('button', { name: 'galería' });
    button.focus();
    press('l', {}, button);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('opens the help dialog with ?', () => {
    render(<VimNavigation />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    press('?');
    expect(screen.getByRole('dialog', { name: 'atajos de teclado' })).toBeInTheDocument();
    expect(screen.getByText('Ir al principio')).toBeInTheDocument();
    // Keys pressed inside the dialog are not shortcuts
    press('j', {}, screen.getByRole('dialog'));
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('ignores keys typed in fields, with modifiers, or already handled', () => {
    render(
      <>
        <input aria-label="campo" />
        <div contentEditable suppressContentEditableWarning data-testid="editable" />
      </>,
    );
    render(<VimNavigation />);
    press('j', {}, screen.getByRole('textbox', { name: 'campo' }));
    press('j', { metaKey: true });
    press('j', { ctrlKey: true });
    press('j', { altKey: true });
    const editable = screen.getByTestId('editable');
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    press('j', {}, editable);
    const handled = new KeyboardEvent('keydown', { key: 'j', bubbles: true, cancelable: true });
    handled.preventDefault();
    window.dispatchEvent(handled);
    expect(scrollBy).not.toHaveBeenCalled();
  });

  it('an ignored key cancels a pending sequence and other keys pass through', () => {
    render(<input aria-label="campo" />);
    render(<VimNavigation />);
    press('g');
    press('x', {}, screen.getByRole('textbox'));
    press('g');
    expect(window.scrollTo).not.toHaveBeenCalled();
    const other = new KeyboardEvent('keydown', { key: 'z', bubbles: true, cancelable: true });
    window.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
  });

  it('handles keydown events whose target is not an element', () => {
    render(<VimNavigation />);
    const event = new KeyboardEvent('keydown', { key: 'j', cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(scrollBy).toHaveBeenCalled();
  });

  it('stops listening once unmounted', () => {
    const { unmount } = render(<VimNavigation />);
    unmount();
    press('j');
    expect(scrollBy).not.toHaveBeenCalled();
  });
});
