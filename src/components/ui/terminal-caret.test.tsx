import { act, fireEvent, render, screen } from '@testing-library/react';
import { TerminalCaret } from './terminal-caret';

const originalMatchMedia = window.matchMedia;
const finePointer = (matches: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
};

let frames: FrameRequestCallback[] = [];
const flush = () =>
  act(() => {
    const queue = frames;
    frames = [];
    queue.forEach((cb) => cb(0));
  });

beforeEach(() => {
  frames = [];
  finePointer(true);
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  // jsdom lays nothing out: give every field a real box for the caret to sit in.
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    right: 200,
    bottom: 30,
    width: 200,
    height: 30,
  } as DOMRect);
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  jest.restoreAllMocks();
});

const caretOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.terminal-caret')!;

const setup = (field: React.ReactNode) => {
  const view = render(
    <>
      {field}
      <TerminalCaret />
    </>,
  );
  return { ...view, caret: caretOf(view.container) };
};

const focusAt = (element: HTMLInputElement | HTMLTextAreaElement, position: number) => {
  act(() => element.focus());
  element.setSelectionRange(position, position);
  fireEvent(document, new Event('selectionchange'));
  flush();
};

describe('TerminalCaret', () => {
  it('draws a block over the character under the caret and hides the native caret', () => {
    const { caret } = setup(
      <input
        aria-label="nombre"
        className="field-surface"
        defaultValue="hola"
        aria-invalid="true"
      />,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(caret).toHaveStyle({ display: 'none' });

    focusAt(input, 1);
    expect(input.style.caretColor).toBe('transparent');
    expect(caret).toHaveStyle({ display: 'block' });
    expect(caret).toHaveTextContent('o');
    expect(caret.dataset.invalid).toBe('true');
    expect(caret).toHaveClass('terminal-caret-blink');

    // At the end of the text the block is empty.
    focusAt(input, 4);
    expect(caret.textContent).toBe('\u00a0');
  });

  it('hides while text is selected and when the field loses focus', () => {
    const { caret } = setup(
      <input aria-label="nombre" className="field-surface" defaultValue="hola" />,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    focusAt(input, 0);
    expect(caret).toHaveStyle({ display: 'block' });

    input.setSelectionRange(0, 3);
    fireEvent.keyDown(input, { key: 'ArrowRight', shiftKey: true });
    flush();
    expect(caret).toHaveStyle({ display: 'none' });

    act(() => input.blur());
    expect(caret).toHaveStyle({ display: 'none' });
    expect(input.style.caretColor).toBe('');
  });

  it('masks passwords', () => {
    const { caret } = setup(
      <input aria-label="clave" type="password" className="field-surface" defaultValue="abc" />,
    );
    focusAt(screen.getByLabelText('clave') as HTMLInputElement, 1);
    expect(caret).toHaveTextContent('•');
  });

  it('follows the caret in textareas, showing a space on line breaks', () => {
    const { caret } = setup(
      <textarea aria-label="bio" className="field-surface" defaultValue={'a\nb'} />,
    );
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    focusAt(textarea, 1);
    expect(caret.textContent).toBe('\u00a0');
    fireEvent.input(textarea);
    flush();
    expect(caret).toHaveStyle({ display: 'block' });
  });

  it('hides when the caret is scrolled out of the field', () => {
    const { caret } = setup(
      <input aria-label="nombre" className="field-surface" defaultValue="hola" />,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    Object.defineProperty(input, 'scrollLeft', { configurable: true, value: 50 });
    focusAt(input, 2);
    expect(caret).toHaveStyle({ display: 'none' });
  });

  it('leaves other fields, read-only, disabled and touch devices with the native caret', () => {
    const { caret } = setup(
      <>
        <input aria-label="sin estilo" defaultValue="x" />
        <input aria-label="solo lectura" className="field-surface" readOnly defaultValue="x" />
        <input aria-label="check" type="checkbox" className="field-surface" />
        <input aria-label="tocar" className="field-surface" defaultValue="x" />
      </>,
    );
    for (const name of ['sin estilo', 'solo lectura', 'check']) {
      act(() => (screen.getByLabelText(name) as HTMLInputElement).focus());
      flush();
      expect(caret).toHaveStyle({ display: 'none' });
    }
    finePointer(false);
    act(() => (screen.getByLabelText('tocar') as HTMLInputElement).focus());
    flush();
    expect(caret).toHaveStyle({ display: 'none' });
  });

  it('picks up a field that already had focus, and cleans up on unmount', () => {
    const input = document.createElement('input');
    input.className = 'field-surface';
    input.value = 'abc';
    document.body.appendChild(input);
    input.focus();

    const { caret, unmount } = setup(null);
    expect(input.style.caretColor).toBe('transparent');
    flush();
    expect(caret).toHaveStyle({ display: 'block' });

    // Scroll, resize and pointer events only schedule one redraw at a time.
    fireEvent.scroll(window);
    fireEvent(window, new Event('resize'));
    fireEvent.pointerUp(document);
    expect(frames).toHaveLength(1);

    unmount();
    expect(input.style.caretColor).toBe('');
    input.remove();
  });

  it('ignores focus leaving an element it is not tracking', () => {
    const { caret } = setup(
      <>
        <input aria-label="a" className="field-surface" defaultValue="x" />
        <button type="button">b</button>
      </>,
    );
    focusAt(screen.getByLabelText('a') as HTMLInputElement, 0);
    fireEvent.focusOut(screen.getByRole('button'));
    expect(caret).toHaveStyle({ display: 'block' });
  });
});
