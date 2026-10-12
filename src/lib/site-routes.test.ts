import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { matchSiteRoute, SITE_ROUTES } from './site-routes';
import { PARAM_TARGETS } from './page-visit-targets';

const APP = join(process.cwd(), 'src/app');

/** Cada page.tsx de src/app como URL: sin route groups, slots ni rutas interceptadas. */
const appRoutes = () =>
  readdirSync(APP, { recursive: true, encoding: 'utf8' })
    .filter((file) => file === 'page.tsx' || file.endsWith(`${sep}page.tsx`))
    .map((file) => relative(APP, join(APP, file)).split(sep).slice(0, -1))
    .filter((segments) => !segments.some((segment) => segment.startsWith('@')))
    .map((segments) => `/${segments.filter((segment) => !/^\(.*\)$/.test(segment)).join('/')}`);

describe('SITE_ROUTES', () => {
  it('lists every page of src/app, so trackPageVisit counts new pages too', () => {
    expect([...new Set(appRoutes())].sort()).toEqual([...SITE_ROUTES].sort());
  });

  it('says what has to exist for every dynamic segment', () => {
    const dynamic = new Set(
      SITE_ROUTES.flatMap(
        (route) => matchSiteRoute(route)?.params.map((param) => param.route) ?? [],
      ),
    );
    expect([...dynamic].sort()).toEqual(Object.keys(PARAM_TARGETS).sort());
  });
});

describe('matchSiteRoute', () => {
  it.each([
    ['/', '/', []],
    ['/eventos', '/eventos', []],
    ['/eventos/nuevo', '/eventos/nuevo', []],
    ['/eventos/abc', '/eventos/[id]', [{ route: '/eventos/[id]', value: 'abc' }]],
    ['/eventos/abc/charlas', '/eventos/[id]/charlas', [{ route: '/eventos/[id]', value: 'abc' }]],
    ['/cowork', '/[shortcut]', [{ route: '/[shortcut]', value: 'cowork' }]],
  ])('matches %s to %s', (path, route, params) => {
    expect(matchSiteRoute(path)).toEqual({ route, params });
  });

  it.each(['/eventos/abc/inventado', '/estafa/reclama-tu-premio', '/eventos/'])(
    'rejects %s',
    (path) => {
      expect(matchSiteRoute(path)).toBeNull();
    },
  );
});
