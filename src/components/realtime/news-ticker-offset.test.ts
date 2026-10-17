import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

// The PCN News crawl (news-ticker.tsx) is sticky to the bottom of the viewport in the classic
// layout, so it floats over whatever the page puts there. Its height is published as
// `--news-ticker-height` (globals.css); this test keeps every other bottom-anchored or
// viewport-tall piece of UI from ending up underneath it.

const SRC = join(process.cwd(), 'src');
const VAR = '--news-ticker-height';

const read = (path: string) => readFileSync(join(SRC, path), 'utf8');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'generated' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });

/** Every string literal that looks like a Tailwind class list, with where it is. */
const classLists = () =>
  sourceFiles(SRC).flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/(['"`])((?:(?!\1)[^\n\\])*)\1/g)].map((match) => ({
      file: relative(SRC, file),
      classes: match[2].split(/\s+/).map((c) => c.replace(/["'`]/g, '')),
    })),
  );

// PCN OS (`components/os`) has its own status bar and no crawl.
const outsideOs = ({ file }: { file: string }) => !file.startsWith(join('components', 'os'));
// Hidden from md up (phones only: the crawl isn't there).
const shownOnDesktop = ({ classes }: { classes: string[] }) => !classes.includes('md:hidden');

describe('PCN News crawl offset', () => {
  const css = read('app/globals.css');
  const ticker = read('components/realtime/news-ticker.tsx');

  it('publishes the crawl height from md up, only where the classic layout shows it', () => {
    expect(ticker).toContain('data-news-ticker');
    // 2rem plus the safe-area inset the crawl pads itself with: the same value as the variable.
    expect(ticker).toContain(
      'h-[calc(2rem+env(safe-area-inset-bottom))] items-stretch border-t border-pcnGreen-200 bg-background/95 pb-[env(safe-area-inset-bottom)]',
    );
    expect(css).toContain(`${VAR}: 0px;`);
    expect(css).toMatch(
      /@media \(width >= 48rem\) \{\s*html:not\(\[data-embedded\]\):has\(\[data-news-ticker\]\) \{\s*--news-ticker-height: calc\(2rem \+ env\(safe-area-inset-bottom, 0px\)\);/,
    );
    // Large screens show the PCN OS desktop instead, unless the visitor picked classic.
    expect(css).toMatch(
      /@media \(width >= 1024px\) \{\s*html:not\(\[data-os-mode='classic'\]\):has\(\[data-news-ticker\]\) \{\s*--news-ticker-height: 0px;/,
    );
    expect(css).toContain(`scroll-padding-bottom: var(${VAR})`);
  });

  it('keeps sticky and fixed UI anchored to the bottom above the crawl', () => {
    const offenders = classLists()
      .filter(outsideOs)
      .filter(shownOnDesktop)
      .filter(({ file }) => !file.endsWith('news-ticker.tsx'))
      .filter(
        ({ classes }) =>
          classes.some((c) => /^(lg:|md:|xl:)?(sticky|fixed)$/.test(c)) &&
          classes.some((c) => /^(md:|lg:|xl:)?bottom-/.test(c)),
      )
      .filter(({ classes }) => !classes.join(' ').includes(VAR));
    expect(offenders).toEqual([]);
  });

  it('keeps viewport-tall sticky panels from running under the crawl', () => {
    const offenders = classLists()
      .filter(outsideOs)
      .filter(
        ({ classes }) =>
          classes.some((c) => /^(lg:|md:|xl:)?sticky$/.test(c)) &&
          classes.some((c) => /^(lg:|md:|xl:)?(max-)?h-\[calc\(100(d|s)?vh/.test(c)),
      )
      .filter(({ classes }) => !classes.join(' ').includes(VAR));
    expect(offenders).toEqual([]);
  });
});
