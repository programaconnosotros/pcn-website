import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockRouter } from '@/test/dom';
import { AUTO_ATTR, AUTO_KEY, MODE_ATTR, STORAGE_KEY } from './os-display-mode-script';
import {
  consumeOpenSidebarRequest,
  fallBackToLite,
  hasChosenDisplayMode,
  isAutoDisplayMode,
  isLowEndHardware,
  readDisplayMode,
  setDisplayMode,
  useDisplayMode,
  useIsAutoDisplayMode,
} from './os-display-mode';
import { dockReservedHeight, wantsDockLabels } from './os-dock-geometry';
import { OsClassicReturn } from './os-classic-return';
import { OsGate } from './os-gate';
import { useOsMode } from './use-os-mode';

const root = document.documentElement;
const originalMatchMedia = window.matchMedia;

type Listener = () => void;
/** A matchMedia whose result can be flipped, notifying its `change` listeners. */
const controllableMatchMedia = (initial: boolean) => {
  let matches = initial;
  const listeners = new Set<Listener>();
  window.matchMedia = ((query: string) => ({
    get matches() {
      return matches;
    },
    media: query,
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  })) as unknown as typeof window.matchMedia;
  return {
    set(next: boolean) {
      matches = next;
      act(() => listeners.forEach((listener) => listener()));
    },
  };
};

const setNavigator = (values: Record<string, unknown>) => {
  for (const [key, value] of Object.entries(values))
    Object.defineProperty(navigator, key, { value, configurable: true });
};

beforeEach(() => {
  setNavigator({ hardwareConcurrency: 8, deviceMemory: 8, connection: undefined });
});

afterEach(() => {
  root.removeAttribute(MODE_ATTR);
  root.removeAttribute(AUTO_ATTR);
  localStorage.clear();
  sessionStorage.clear();
  window.matchMedia = originalMatchMedia;
  jest.restoreAllMocks();
});

describe('display mode store', () => {
  it('reads the mode from the root attribute, defaulting to full', () => {
    expect(readDisplayMode()).toBe('full');
    root.setAttribute(MODE_ATTR, 'lite');
    expect(readDisplayMode()).toBe('lite');
    root.setAttribute(MODE_ATTR, 'bogus');
    expect(readDisplayMode()).toBe('full');
  });

  it('detects low-end hardware like the inline script', () => {
    expect(isLowEndHardware()).toBe(false);
    setNavigator({ hardwareConcurrency: 4 });
    expect(isLowEndHardware()).toBe(true);
    setNavigator({ hardwareConcurrency: 8, deviceMemory: 2 });
    expect(isLowEndHardware()).toBe(true);
    setNavigator({ deviceMemory: 8, connection: { saveData: true } });
    expect(isLowEndHardware()).toBe(true);
  });

  it('remembers the chosen mode and applies it', () => {
    expect(hasChosenDisplayMode()).toBe(false);
    setDisplayMode('lite');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('lite');
    expect(hasChosenDisplayMode()).toBe(true);
    expect(root.getAttribute(MODE_ATTR)).toBe('lite');
    expect(isAutoDisplayMode()).toBe(false);

    setDisplayMode('full');
    expect(root.hasAttribute(MODE_ATTR)).toBe(false);
  });

  it('asks the classic layout to open its sidebar once after switching to it', () => {
    setDisplayMode('classic');
    expect(consumeOpenSidebarRequest()).toBe(true);
    expect(consumeOpenSidebarRequest()).toBe(false);

    // Already classic: no new request.
    setDisplayMode('classic');
    expect(consumeOpenSidebarRequest()).toBe(false);
  });

  it('falls back to lite automatically', () => {
    fallBackToLite();
    expect(localStorage.getItem(AUTO_KEY)).toBe('lite');
    expect(readDisplayMode()).toBe('lite');
    expect(isAutoDisplayMode()).toBe(true);
  });

  it('survives blocked storage', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(hasChosenDisplayMode()).toBe(false);
    expect(consumeOpenSidebarRequest()).toBe(false);
    expect(() => setDisplayMode('classic')).not.toThrow();
    expect(readDisplayMode()).toBe('classic');
  });
});

describe('display mode hooks', () => {
  it('follow changes made here and in other windows', () => {
    const { result } = renderHook(() => [useDisplayMode(), useIsAutoDisplayMode()] as const);
    expect(result.current).toEqual(['full', false]);

    act(() => setDisplayMode('classic'));
    expect(result.current).toEqual(['classic', false]);

    // A choice made in another document arrives through the storage event.
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'lite' }));
    });
    expect(result.current).toEqual(['lite', false]);

    // Invalid values are ignored.
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'nope' }));
    });
    expect(result.current).toEqual(['lite', false]);
  });

  it('follows an automatic fallback from another window only while in auto mode', () => {
    const { result } = renderHook(() => useDisplayMode());
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: AUTO_KEY, newValue: 'lite' }));
    });
    expect(result.current).toBe('full');

    root.setAttribute(AUTO_ATTR, '');
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: AUTO_KEY, newValue: 'lite' }));
    });
    expect(result.current).toBe('lite');
  });
});

describe('dock geometry', () => {
  it('reserves more room when the dock shows labels (no hover)', () => {
    controllableMatchMedia(false);
    expect(wantsDockLabels()).toBe(false);
    expect(dockReservedHeight()).toBe(64);
    controllableMatchMedia(true);
    expect(wantsDockLabels()).toBe(true);
    expect(dockReservedHeight()).toBe(76);
  });
});

describe('useOsMode and OsGate', () => {
  it('tracks the screen size and the classic mode', () => {
    const media = controllableMatchMedia(true);
    const { result } = renderHook(() => useOsMode());
    expect(result.current).toBe(true);

    media.set(false);
    expect(result.current).toBe(false);

    media.set(true);
    act(() => setDisplayMode('classic'));
    expect(result.current).toBe(false);
  });

  it('hides the classic tree on the desktop and refreshes when going back to it', () => {
    const media = controllableMatchMedia(false);
    render(
      <OsGate>
        <p>sitio clásico</p>
      </OsGate>,
    );
    expect(screen.getByText('sitio clásico')).toBeInTheDocument();
    expect(mockRouter.refresh).not.toHaveBeenCalled();

    media.set(true);
    expect(screen.queryByText('sitio clásico')).not.toBeInTheDocument();

    media.set(false);
    expect(screen.getByText('sitio clásico')).toBeInTheDocument();
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
  });
});

describe('OsClassicReturn', () => {
  it('renders nothing outside the classic layout', () => {
    const { container } = render(<OsClassicReturn />);
    expect(container).toBeEmptyDOMElement();
  });

  it('goes back to the full desktop on capable hardware', async () => {
    root.setAttribute(MODE_ATTR, 'classic');
    render(<OsClassicReturn className="extra" />);
    const button = screen.getByRole('button', { name: 'Volver a PCN OS' });
    expect(button).toHaveClass('extra');

    await userEvent.click(button);
    expect(readDisplayMode()).toBe('full');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('goes back to lite on low-end hardware', async () => {
    setNavigator({ hardwareConcurrency: 2 });
    root.setAttribute(MODE_ATTR, 'classic');
    render(<OsClassicReturn />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver a PCN OS' }));
    expect(readDisplayMode()).toBe('lite');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('lite');
  });
});
