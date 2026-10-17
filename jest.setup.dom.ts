import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// Setup for component tests (`*.test.tsx`, jsdom). Server actions and data are mocked per test
// with jest.mock; here only what every component needs and jsdom doesn't have.

// ─── Next.js router ──────────────────────────────────────────────────────────
// `mockRouter` is the object every useRouter() returns, so tests can assert navigation:
//   import { mockRouter } from '@/test/dom';  expect(mockRouter.push).toHaveBeenCalledWith('/x')
jest.mock('next/navigation', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  };
  const navigation = {
    __router: router,
    __pathname: '/',
    __searchParams: new URLSearchParams(),
  };
  return {
    __navigation: navigation,
    useRouter: () => router,
    usePathname: () => navigation.__pathname,
    useSearchParams: () => navigation.__searchParams,
    useParams: () => ({}),
    useSelectedLayoutSegment: () => null,
    useSelectedLayoutSegments: () => [],
    redirect: jest.fn((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    }),
    notFound: jest.fn(() => {
      throw new Error('NEXT_NOT_FOUND');
    }),
  };
});

// ─── Browser APIs jsdom lacks ────────────────────────────────────────────────
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
Object.assign(globalThis, {
  ResizeObserver: globalThis.ResizeObserver ?? ResizeObserverStub,
  IntersectionObserver: globalThis.IntersectionObserver ?? IntersectionObserverStub,
});
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});
window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = jest.fn();
// Radix uses pointer capture for selects and sliders
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};

afterEach(() => {
  cleanup();
});
