import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { PwaProvider } from './pwa-provider';
import { usePwa } from './pwa-context';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

type PromptEvent = Event & { prompt: jest.Mock; userChoice: Promise<unknown> };

const Consumer = () => {
  const pwa = usePwa();
  return (
    <>
      <output aria-label="state">
        {JSON.stringify({
          isInstallable: pwa.isInstallable,
          isIosInstallable: pwa.isIosInstallable,
          canInstall: pwa.canInstall,
          installGuide: pwa.installGuide,
        })}
      </output>
      <button type="button" onClick={() => void pwa.installApp()}>
        instalar
      </button>
    </>
  );
};

const state = () => JSON.parse(screen.getByLabelText('state').textContent ?? '{}');

const setUserAgent = (ua: string, platform = 'Linux x86_64', maxTouchPoints = 0) => {
  jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua);
  jest.spyOn(navigator, 'platform', 'get').mockReturnValue(platform);
  Object.defineProperty(navigator, 'maxTouchPoints', { value: maxTouchPoints, configurable: true });
};

const setStandalone = (matches: boolean) => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: matches && query === '(display-mode: standalone)',
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

const promptEvent = () => {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as PromptEvent;
  event.prompt = jest.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: 'accepted' });
  return event;
};

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  setUserAgent('Mozilla/5.0 (X11; Linux x86_64) Chrome/120');
  setStandalone(false);
  localStorage.clear();
  delete (window as { __pcnInstallPrompt?: unknown }).__pcnInstallPrompt;
});

afterEach(() => {
  jest.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
  document.documentElement.removeAttribute('data-app-ready');
  document.documentElement.removeAttribute('data-embedded');
  window.history.replaceState(null, '', '/');
});

describe('PwaProvider', () => {
  it('marks the app ready and offers the manual guide for desktop Chromium', () => {
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );

    expect(document.documentElement).toHaveAttribute('data-app-ready');
    expect(state()).toEqual({
      isInstallable: false,
      isIosInstallable: false,
      canInstall: true,
      installGuide: 'desktop-chromium',
    });
  });

  it.each([
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)', 'iPhone', 0, 'ios'],
    ['Mozilla/5.0 (Macintosh) Safari/605', 'MacIntel', 5, 'ios'],
    ['Mozilla/5.0 (Linux; Android 14) SamsungBrowser/24', 'Linux', 0, 'android-samsung'],
    ['Mozilla/5.0 (Android 14; Mobile) Firefox/120', 'Linux', 0, 'android-firefox'],
    ['Mozilla/5.0 (Linux; Android 14) Chrome/120', 'Linux', 0, 'android'],
    ['Mozilla/5.0 (X11; Linux) Firefox/120', 'Linux', 0, 'desktop-firefox'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X) Version/17 Safari/605', 'MacIntel', 0, 'mac-safari'],
    ['Mozilla/5.0 (Macintosh) Chrome/120 Safari/537', 'MacIntel', 0, 'desktop-chromium'],
  ])('detects the install guide for %s', (ua, platform, touch, guide) => {
    setUserAgent(ua, platform, touch);
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    expect(state().installGuide).toBe(guide);
    expect(state().isIosInstallable).toBe(guide === 'ios');
  });

  it('cannot install when already running standalone', () => {
    setStandalone(true);
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    expect(state()).toMatchObject({ canInstall: false, isInstallable: false });
  });

  it('stops suggesting manual steps once the app was installed', () => {
    localStorage.setItem('pcn-app-installed', '1');
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    expect(state().canInstall).toBe(false);
  });

  it('treats a throwing localStorage as not installed', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    expect(state().canInstall).toBe(true);
  });

  it('captures the install prompt and triggers it only once', async () => {
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    const event = promptEvent();
    act(() => {
      window.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(state().isInstallable).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: 'instalar' }));
    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(state().isInstallable).toBe(false);

    // No prompt left: a second click does nothing.
    await userEvent.click(screen.getByRole('button', { name: 'instalar' }));
    expect(event.prompt).toHaveBeenCalledTimes(1);
  });

  it('forgets the prompt and remembers the install on appinstalled', () => {
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    act(() => {
      window.dispatchEvent(promptEvent());
    });
    expect(state().isInstallable).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });
    expect(state()).toMatchObject({ isInstallable: false, canInstall: false });
    expect(localStorage.getItem('pcn-app-installed')).toBe('1');
  });

  it('ignores a localStorage that throws when saving the install', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    expect(() =>
      act(() => {
        window.dispatchEvent(new Event('appinstalled'));
      }),
    ).not.toThrow();
  });

  it('toasts when the connection drops and comes back', () => {
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    act(() => {
      window.dispatchEvent(new Event('offline'));
      window.dispatchEvent(new Event('online'));
    });
    expect(toast.error).toHaveBeenCalledWith('Sin conexión', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Conexión restablecida');
  });

  it('does not register the service worker in development and drops a leftover one', async () => {
    const register = jest.fn().mockResolvedValue(undefined);
    const unregister = jest.fn().mockResolvedValue(true);
    const getRegistrations = jest.fn().mockResolvedValue([{ unregister }]);
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register, getRegistrations },
      configurable: true,
    });
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    await act(async () => {});
    expect(register).not.toHaveBeenCalled();
    expect(unregister).toHaveBeenCalled();
  });

  it('registers the service worker with ?sw and logs a failure', async () => {
    window.history.replaceState(null, '', '/?sw=true');
    const error = new Error('nope');
    const register = jest.fn().mockRejectedValue(error);
    Object.defineProperty(navigator, 'serviceWorker', { value: { register }, configurable: true });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    await act(async () => {});

    expect(register).toHaveBeenCalledWith('/sw.js');
    expect(consoleError).toHaveBeenCalledWith(
      '[PWA] No se pudo registrar el service worker:',
      error,
    );
  });

  it('removes its listeners on unmount', () => {
    const { unmount } = render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    unmount();
    window.dispatchEvent(new Event('offline'));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('reads the host window state inside a PCN OS window', () => {
    document.documentElement.setAttribute('data-embedded', '');
    render(
      <PwaProvider>
        <Consumer />
      </PwaProvider>,
    );
    expect(state().installGuide).toBe('desktop-chromium');
  });
});

describe('usePwa', () => {
  it('throws outside a PwaProvider', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow('usePwa must be used within a PwaProvider');
  });
});
