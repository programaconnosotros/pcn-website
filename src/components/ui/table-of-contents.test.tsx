import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Book } from 'lucide-react';
import { TableOfContents, type TocSection } from './table-of-contents';

jest.mock('motion/react', () => ({
  motion: {
    span: ({ layoutId: _layoutId, transition: _transition, ...props }: Record<string, unknown>) => (
      <span {...props} />
    ),
  },
}));

const sections: TocSection[] = [
  { id: 'inicio', title: 'Inicio', group: '2020', meta: 'mar', icon: Book },
  { id: 'primer-evento', title: 'Primer evento', group: '2020' },
  { id: 'crecimiento', title: 'Crecimiento', group: '2021', meta: '2021' },
];

// Queue animation frames and run them on demand, like a browser between paints.
let frames: FrameRequestCallback[] = [];
const flushFrames = () =>
  act(() => {
    const pending = frames;
    frames = [];
    pending.forEach((callback) => callback(0));
  });

const tops: Record<string, number> = {};
const setScroll = (y: number, sectionTops: Record<string, number>) => {
  Object.assign(tops, sectionTops);
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
  flushFrames();
};

const rect = (top: number, height = 20) =>
  ({ top, bottom: top + height, height, left: 0, right: 0, width: 0, x: 0, y: top }) as DOMRect;

let navRect = rect(0, 600);
const originalRect = Element.prototype.getBoundingClientRect;

beforeEach(() => {
  frames = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    value: 2768,
    configurable: true,
  });
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  Element.prototype.scrollTo = jest.fn();
  // eslint-disable-next-line no-unused-vars -- `this` is only a type annotation
  Element.prototype.getBoundingClientRect = function getRect(this: Element) {
    if (this.tagName === 'NAV') return navRect;
    const tocId = this.getAttribute('data-toc-id');
    if (tocId) return rect(['inicio', 'primer-evento', 'crecimiento'].indexOf(tocId) * 30 + 10);
    if (this.id in tops) return rect(tops[this.id]);
    return originalRect.call(this);
  };
  for (const { id } of sections) {
    const element = document.createElement('section');
    element.id = id;
    document.body.appendChild(element);
    tops[id] = 1000;
  }
});

afterEach(() => {
  jest.restoreAllMocks();
  Element.prototype.getBoundingClientRect = originalRect;
  navRect = rect(0, 600);
  for (const { id } of sections) document.getElementById(id)?.remove();
  window.history.replaceState(null, '', '/');
});

const desktop = () => within(screen.getByRole('navigation', { name: 'Historia' }));
const activeLink = () =>
  screen.getAllByRole('link').find((link) => link.getAttribute('aria-current') === 'location')
    ?.textContent;

const renderToc = () =>
  render(<TableOfContents sections={sections} path="historia" label="Historia" />);

describe('TableOfContents', () => {
  it('renders the tree with groups, counters and the first section active', () => {
    renderToc();

    expect(screen.getByText('tree ~/historia')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('[1/3]')).toBeInTheDocument();
    expect(screen.getByText('2020/')).toBeInTheDocument();
    expect(screen.getByText('2021/')).toBeInTheDocument();
    expect(desktop().getAllByRole('link')).toHaveLength(3);
    expect(activeLink()).toContain('Inicio');
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sección anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sección anterior ([)' })).toBeDisabled();
  });

  it('uses the label when there is no path and handles no sections', () => {
    render(<TableOfContents sections={[]} />);
    expect(screen.getByText('tree contenido')).toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('follows the section under the reference point while scrolling', () => {
    renderToc();

    setScroll(1000, { inicio: -500, 'primer-evento': 100, crecimiento: 600 });
    expect(activeLink()).toContain('Primer evento');
    expect(screen.getByText('50%')).toBeInTheDocument();

    setScroll(1500, { inicio: -900, 'primer-evento': -400, crecimiento: 300 });
    expect(activeLink()).toContain('Primer evento');

    // At the very bottom the last section wins even if it never reached the reference point.
    setScroll(2000, { inicio: -900, 'primer-evento': -400, crecimiento: 300 });
    expect(activeLink()).toContain('Crecimiento');
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sección siguiente' })).toBeDisabled();
  });

  it('skips sections that are not in the page', () => {
    document.getElementById('inicio')?.remove();
    renderToc();
    setScroll(500, { 'primer-evento': 50, crecimiento: 600 });
    expect(activeLink()).toContain('Primer evento');
  });

  it('reads a page that cannot scroll as fully read', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 100,
      configurable: true,
    });
    renderToc();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(activeLink()).toContain('Crecimiento');
  });

  it('jumps to a section on click and keeps it while the smooth scroll runs', async () => {
    renderToc();
    await userEvent.click(desktop().getByRole('link', { name: /Crecimiento/ }));

    expect(document.getElementById('crecimiento')?.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
    expect(window.location.hash).toBe('#crecimiento');
    expect(activeLink()).toContain('Crecimiento');
    expect(screen.getAllByText('▾')).toHaveLength(2);

    // Sections passed mid-scroll don't steal the highlight.
    setScroll(100, { inicio: 50, 'primer-evento': 400, crecimiento: 900 });
    expect(activeLink()).toContain('Crecimiento');
  });

  it('moves between sections with ] and [ unless typing or using modifiers', async () => {
    renderToc();
    await userEvent.keyboard(']');
    expect(activeLink()).toContain('Primer evento');
    await userEvent.keyboard(']]]');
    expect(activeLink()).toContain('Crecimiento');
    await userEvent.keyboard('[[');
    expect(activeLink()).toContain('Primer evento');
    await userEvent.keyboard('{Control>}]{/Control}');
    expect(activeLink()).toContain('Primer evento');
    await userEvent.keyboard('x');
    expect(activeLink()).toContain('Primer evento');

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    await userEvent.keyboard(']');
    expect(activeLink()).toContain('Primer evento');
    input.remove();
  });

  it('steps with the prev/next buttons and the segment bar', async () => {
    renderToc();
    await userEvent.click(screen.getByRole('button', { name: 'Sección siguiente' }));
    expect(activeLink()).toContain('Primer evento');
    await userEvent.click(screen.getByRole('button', { name: 'Sección siguiente (])' }));
    expect(activeLink()).toContain('Crecimiento');
    await userEvent.click(screen.getByRole('button', { name: 'Sección anterior ([)' }));
    expect(activeLink()).toContain('Primer evento');
    await userEvent.click(screen.getByRole('button', { name: 'Sección anterior' }));
    expect(activeLink()).toContain('Inicio');
    await userEvent.click(screen.getByRole('button', { name: 'Ir a Crecimiento' }));
    expect(activeLink()).toContain('Crecimiento');
  });

  it('lists every section in the mobile dropdown', async () => {
    renderToc();
    await userEvent.click(screen.getByRole('button', { name: /\[1\/3\]/ }));
    const menu = within(screen.getByRole('menu'));
    expect(menu.getByText('2021/')).toBeInTheDocument();
    await userEvent.click(menu.getByRole('menuitem', { name: /Crecimiento/ }));
    expect(activeLink()).toContain('Crecimiento');
    expect(screen.getByRole('button', { name: /\[3\/3\]/ })).toHaveTextContent('2021');
  });

  it('scrolls to the section in the URL hash on load', () => {
    window.history.replaceState(null, '', '/historia#crecimiento');
    renderToc();
    flushFrames();
    expect(document.getElementById('crecimiento')?.scrollIntoView).toHaveBeenCalled();
    // The smooth scroll lands on it and the scroll tracking agrees.
    setScroll(1800, { inicio: -1500, 'primer-evento': -900, crecimiento: 100 });
    expect(activeLink()).toContain('Crecimiento');
  });

  it('ignores a hash that is not a section', () => {
    window.history.replaceState(null, '', '/historia#otra-cosa');
    renderToc();
    expect(activeLink()).toContain('Inicio');
  });

  it('scrolls the tree to keep the active item in view', async () => {
    navRect = rect(0, 50);
    renderToc();
    await userEvent.keyboard(']]');
    const nav = screen.getByRole('navigation', { name: 'Historia' });
    expect(nav.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });

  it('stops listening once unmounted', () => {
    const { unmount } = renderToc();
    window.dispatchEvent(new Event('scroll'));
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });
});
