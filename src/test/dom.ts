// Helpers for component tests (`*.test.tsx`).

type Navigation = {
  __router: Record<'push' | 'replace' | 'refresh' | 'back' | 'forward' | 'prefetch', jest.Mock>;
  __pathname: string;
  __searchParams: URLSearchParams;
};

const navigation = (): Navigation => jest.requireMock('next/navigation').__navigation;

/** The router every `useRouter()` returns in component tests. */
export const mockRouter = new Proxy({} as Navigation['__router'], {
  get: (_target, key: keyof Navigation['__router']) => navigation().__router[key],
});

/** Sets what `usePathname()` and `useSearchParams()` return for the next render. */
export const setLocation = (pathname: string, search = '') => {
  navigation().__pathname = pathname;
  navigation().__searchParams = new URLSearchParams(search);
};
