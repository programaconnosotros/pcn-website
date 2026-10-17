#!/usr/bin/env node
/**
 * Capture full-page screenshots for specified routes.
 *
 * Usage:
 *   pnpm screenshot /route-a /route-b ...
 *   BASE_URL=http://localhost:3000 pnpm screenshot /cursos /lectura
 *
 * PNGs are saved to .pr-screenshots/<slug>.png. The script then prints a Screenshots section and
 * the `--attach` flags that upload them with the GitHub CLI (gh >= 2.99.0), which swaps each local
 * path in the body for the uploaded image.
 */

import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join, resolve } from 'path';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR_NAME = '.pr-screenshots';
const OUT_DIR = resolve(OUT_DIR_NAME);
const routes = process.argv.slice(2);

if (!routes.length) {
  console.error(
    'Usage: pnpm screenshot /route-a /route-b ...\n' +
      '  BASE_URL defaults to http://localhost:3000\n' +
      '  Optionally override: BASE_URL=http://... pnpm screenshot /path',
  );
  process.exit(1);
}

function slugify(route) {
  const clean = route.replace(/^\/+|\/+$/g, '') || 'index';
  return clean.replace(/\//g, '-');
}

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
});

for (const route of routes) {
  const url = `${BASE_URL}${route}`;
  const slug = slugify(route);
  const outPath = join(OUT_DIR, `${slug}.png`);

  console.log(`📸  ${url} → ${outPath}`);
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
}

await browser.close();
console.log(`\n✅  ${routes.length} screenshot(s) saved to ${OUT_DIR_NAME}/`);

// The body and the flags name each file by the same relative path: that's how gh knows which
// reference to replace with the uploaded image.
const shots = routes.map((route) => ({ route, path: `./${OUT_DIR_NAME}/${slugify(route)}.png` }));
const attachFlags = shots.map(({ route, path }) => `--attach '${path}#${route}'`).join(' ');

console.log('\nAdd this to the PR body:\n');
console.log('## Screenshots\n');
for (const { route, path } of shots) {
  console.log(`### ${route}\n\n![${route}](${path})\n`);
}
console.log('Then upload the images with the GitHub CLI (gh >= 2.99.0), from the repo root:\n');
console.log(`  gh pr create --body-file body.md ${attachFlags}`);
console.log(`  gh pr edit --body-file body.md ${attachFlags}   # PR already open`);
