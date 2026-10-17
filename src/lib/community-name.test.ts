import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// The community is "programaConNosotros", in one word with that casing: never "Programa Con
// Nosotros", "Programa con nosotros" or "ProgramaConNosotros", in the UI, the emails or the data.
// Lowercase "programaconnosotros" is fine where it's a domain, a handle or a repo name, and so is
// whatever another site's URL calls it.

const ROOT = join(__dirname, '..');
const SKIP = new Set(['generated', 'node_modules']);
const EXTENSIONS = /\.(tsx?|json|md|mjs)$/;
// Split in words (any casing), or in one word with a capital P.
const WRONG = [
  /programa[\s_-]+con[\s_-]+nosotros/i,
  /Programa[cC]on[nN]osotros|PROGRAMACONNOSOTROS/,
];

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return EXTENSIONS.test(name) && path !== __filename ? [path] : [];
  });

it('spells the community name as programaConNosotros everywhere', () => {
  const offenders = files(ROOT).flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, index) =>
        // URLs keep whatever slug the other site gave the community (LinkedIn's has hyphens).
        WRONG.some((pattern) => pattern.test(line.replace(/https?:\/\/\S+/g, '')))
          ? [`${relative(ROOT, file)}:${index + 1}`]
          : [],
      ),
  );
  expect(offenders).toEqual([]);
});
