import { act, render, waitFor } from '@testing-library/react';
import { ForcedStateStyles } from './forced-state-styles';

const STYLE_ID = 'design-system-forced-states';

const addStyle = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  return style;
};

const forcedCss = () => document.getElementById(STYLE_ID)?.textContent ?? '';

describe('ForcedStateStyles', () => {
  // jsdom parses @supports rules but doesn't expose CSSSupportsRule as a global like browsers do.
  beforeAll(() => {
    const probe = addStyle('@supports (display: grid) {}');
    Object.assign(globalThis, { CSSSupportsRule: probe.sheet!.cssRules[0].constructor });
    probe.remove();
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('copies the interaction rules keyed on data-force-state, including nested ones', () => {
    addStyle(`
      .btn:hover { color: red; }
      .plain { color: blue; }
      .a:hover, .b { color: green; }
      @media (min-width: 640px) { .link:focus-visible { outline: 1px solid; } .x { color: red; } }
      @media print { .y { color: red; } }
      @supports (display: grid) { .card:active { opacity: 0.5; } }
    `);

    const { unmount } = render(<ForcedStateStyles />);
    const css = forcedCss();

    expect(css).toContain('[data-force-state="hover"] .btn{color: red;}');
    expect(css).toContain('[data-force-state="hover"] .a{color: green;}');
    expect(css).not.toContain('.plain');
    expect(css).toContain(
      '@media (min-width: 640px){[data-force-state="focus"] .link{outline: 1px solid;}',
    );
    expect(css).not.toContain('@media print');
    expect(css).toContain(
      '@supports (display: grid){[data-force-state="active"] .card{opacity: 0.5;}',
    );
    // Appended last so it wins on equal specificity
    expect(document.head.lastElementChild?.id).toBe(STYLE_ID);

    unmount();
    expect(document.getElementById(STYLE_ID)).toBeNull();
  });

  it('skips rules whose selectors cannot be forced', () => {
    addStyle('.a:hover:focus { color: red; } .b:not(:hover) { color: blue; }');
    render(<ForcedStateStyles />);
    expect(forcedCss()).toBe('');
  });

  it('survives stylesheets it cannot read', () => {
    addStyle('.a:hover { color: red; }');
    const sheet = document.styleSheets[0];
    Object.defineProperty(sheet, 'cssRules', {
      get: () => {
        throw new DOMException('cross-origin', 'SecurityError');
      },
    });

    render(<ForcedStateStyles />);
    expect(forcedCss()).toBe('');
  });

  it('rebuilds when another stylesheet is added later, but not for its own style tag', async () => {
    const raf = jest.spyOn(window, 'requestAnimationFrame');
    render(<ForcedStateStyles />);
    expect(forcedCss()).toBe('');

    // Re-appending its own style must not loop
    act(() => {
      document.head.appendChild(document.getElementById(STYLE_ID)!);
    });
    await Promise.resolve();
    expect(raf).not.toHaveBeenCalled();

    act(() => {
      addStyle('.late:hover { color: red; }');
    });
    await waitFor(() =>
      expect(forcedCss()).toContain('[data-force-state="hover"] .late{color: red;}'),
    );
    raf.mockRestore();
  });

  it('reuses an existing style element', () => {
    const existing = document.createElement('style');
    existing.id = STYLE_ID;
    existing.textContent = '.stale{}';
    document.head.appendChild(existing);
    addStyle('.n:hover { color: red; }');

    render(<ForcedStateStyles />);
    expect(document.querySelectorAll(`#${STYLE_ID}`)).toHaveLength(1);
    expect(forcedCss()).toContain('.n{color: red;}');
  });
});
