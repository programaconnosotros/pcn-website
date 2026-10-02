#!/usr/bin/env node
/**
 * Capture full-page screenshots for specified routes.
 *
 * Usage:
 *   pnpm screenshot /route-a /route-b ...
 *   BASE_URL=http://localhost:3000 pnpm screenshot /cursos /lectura
 *
 * PNGs are saved to .pr-screenshots/<slug>.png
 */

import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { join, resolve } from 'path';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = resolve('.pr-screenshots');
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
console.log(`\n✅  ${routes.length} screenshot(s) saved to .pr-screenshots/`);
