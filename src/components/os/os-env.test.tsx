import {
  EMBED_DETECTION_SCRIPT,
  OS_MESSAGE_SOURCE,
  isEmbedded,
  isOsHost,
  isOsMessage,
  notifyOsSessionChange,
  postToOsHost,
  postToOsWindow,
} from './os-env';
import { MODE_ATTR, OS_MODE_SCRIPT } from './os-display-mode-script';

const setLargeScreen = (matches: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
};

const root = document.documentElement;
const originalMatchMedia = window.matchMedia;

afterEach(() => {
  root.removeAttribute('data-embedded');
  root.removeAttribute(MODE_ATTR);
  window.matchMedia = originalMatchMedia;
  jest.restoreAllMocks();
});

describe('isOsMessage', () => {
  it('accepts only objects tagged with the PCN OS source', () => {
    expect(isOsMessage({ source: OS_MESSAGE_SOURCE, type: 'focus' })).toBe(true);
    expect(isOsMessage({ source: 'other', type: 'focus' })).toBe(false);
    expect(isOsMessage(null)).toBe(false);
    expect(isOsMessage('pcn-os')).toBe(false);
  });
});

describe('embedding and host detection', () => {
  it('reads the data-embedded attribute', () => {
    expect(isEmbedded()).toBe(false);
    root.setAttribute('data-embedded', '');
    expect(isEmbedded()).toBe(true);
  });

  it('is the OS host only on a large, non-embedded, non-classic screen', () => {
    setLargeScreen(false);
    expect(isOsHost()).toBe(false);

    setLargeScreen(true);
    expect(isOsHost()).toBe(true);

    root.setAttribute(MODE_ATTR, 'classic');
    expect(isOsHost()).toBe(false);
    root.setAttribute(MODE_ATTR, 'lite');
    expect(isOsHost()).toBe(true);

    root.setAttribute('data-embedded', '');
    expect(isOsHost()).toBe(false);
  });
});

describe('messaging', () => {
  it('posts to the host and to a window with the source tag and own origin', () => {
    const toParent = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
    postToOsHost({ type: 'open', path: '/feed' });
    expect(toParent).toHaveBeenCalledWith(
      { source: OS_MESSAGE_SOURCE, type: 'open', path: '/feed' },
      window.location.origin,
    );

    const target = { postMessage: jest.fn() } as unknown as Window;
    postToOsWindow(target, { type: 'session' });
    expect(target.postMessage).toHaveBeenCalledWith(
      { source: OS_MESSAGE_SOURCE, type: 'session' },
      window.location.origin,
    );
  });

  it('notifies a session change only from inside a window', () => {
    const toParent = jest.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
    notifyOsSessionChange();
    expect(toParent).not.toHaveBeenCalled();

    root.setAttribute('data-embedded', '');
    notifyOsSessionChange();
    expect(toParent).toHaveBeenCalledWith(
      { source: OS_MESSAGE_SOURCE, type: 'session' },
      window.location.origin,
    );
  });
});

describe('inline head scripts', () => {
  afterEach(() => {
    localStorage.clear();
    root.removeAttribute('data-os-mode-auto');
  });

  it('the embed script leaves a top-level document unmarked', () => {
    new Function(EMBED_DETECTION_SCRIPT)();
    expect(isEmbedded()).toBe(false);
  });

  it('the mode script applies a stored choice', () => {
    localStorage.setItem('pcn-os-mode', 'classic');
    new Function(OS_MODE_SCRIPT)();
    expect(root.getAttribute(MODE_ATTR)).toBe('classic');
  });

  it('the mode script falls back to lite after a slow measurement', () => {
    localStorage.setItem('pcn-os-auto-mode', 'lite');
    new Function(OS_MODE_SCRIPT)();
    expect(root.getAttribute(MODE_ATTR)).toBe('lite');
    expect(root.hasAttribute('data-os-mode-auto')).toBe(true);
  });
});
