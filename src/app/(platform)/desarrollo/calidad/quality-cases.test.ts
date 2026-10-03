import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { qualityAreas } from './quality-areas';
import { automatedSuites, manualCases, testCases } from './quality-cases';

const testFilesUnder = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return testFilesUnder(path);
    return entry.name.endsWith('.test.ts') ? [path] : [];
  });

describe('test case repository', () => {
  it('gives every case a unique id', () => {
    const ids = testCases.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lists every Jest test file in the repo (run pnpm qa:cases if this fails)', () => {
    const listed = new Set(automatedSuites.map((suite) => suite.file));
    const missing = testFilesUnder('src').filter((file) => !listed.has(file));
    expect(missing).toEqual([]);
  });

  it('only points at test files that exist', () => {
    const gone = automatedSuites.map((s) => s.file).filter((file) => !existsSync(file));
    expect(gone).toEqual([]);
  });

  it('writes every manual case with steps and an expected result', () => {
    for (const c of manualCases) {
      expect(c.steps.length).toBeGreaterThan(0);
      expect(c.expected.length).toBeGreaterThan(10);
    }
  });

  it('has manual cases for every area of the site', () => {
    const covered = new Set(manualCases.map((c) => c.area));
    expect(qualityAreas.filter((a) => !covered.has(a.id)).map((a) => a.id)).toEqual([]);
  });
});
