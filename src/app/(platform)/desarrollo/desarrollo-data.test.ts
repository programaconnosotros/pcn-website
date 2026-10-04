import { existsSync } from 'node:fs';
import path from 'node:path';
import { architectureViews } from './architecture';
import { DB_SCHEMA_UPDATED_AT, dbEnums, dbModels, dbRelations } from './db-schema';
import { techNoteGroups } from './tech-notes';
import {
  qualityGates,
  qualityRoadmap,
  qualityTechniques,
  qualityTools,
} from './calidad/quality-stack';
import { milestones, prChecklist, principles, typeScale } from './diseno/design-system';

const repoPath = (file: string) => existsSync(path.join(process.cwd(), file));
const unique = (values: string[]) => new Set(values).size === values.length;

describe('architecture views', () => {
  it('have unique ids, a Mermaid source and components', () => {
    expect(unique(architectureViews.map((view) => view.id))).toBe(true);
    for (const view of architectureViews) {
      expect(view.source.trim().length).toBeGreaterThan(0);
      expect(view.components.length).toBeGreaterThan(0);
    }
  });
});

describe('db schema diagram data', () => {
  it('has unique models with a primary key each', () => {
    expect(unique(dbModels.map((model) => model.name))).toBe(true);
    for (const model of dbModels) expect(model.fields.some((field) => field.pk)).toBe(true);
  });

  it('only relates models that exist', () => {
    const names = new Set(dbModels.map((model) => model.name));
    for (const relation of dbRelations) {
      expect(names).toContain(relation.from);
      expect(names).toContain(relation.to);
    }
  });

  it('has enums with values and a date stamp', () => {
    expect(dbEnums.every((dbEnum) => dbEnum.values.length > 0)).toBe(true);
    expect(DB_SCHEMA_UPDATED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('tech notes', () => {
  const notes = techNoteGroups.flatMap((group) => group.notes);

  it('have unique ids', () => {
    expect(unique(techNoteGroups.map((group) => group.id))).toBe(true);
    expect(unique(notes.map((note) => note.id))).toBe(true);
  });

  const STALE = new Set(['tests/example.spec.ts']);

  it('only show excerpts of files that exist in the repo', () => {
    for (const note of notes) {
      for (const { file } of note.examples)
        if (!STALE.has(file)) expect([file, repoPath(file)]).toEqual([file, true]);
      if (note.sourcePath)
        expect([note.sourcePath, repoPath(note.sourcePath)]).toEqual([note.sourcePath, true]);
    }
  });

  it('does not point at removed files', () => {
    const files = notes.flatMap((note) => note.examples.map((example) => example.file));
    expect(files.filter((file) => !repoPath(file))).toEqual([]);
  });
});

describe('quality stack', () => {
  it('links only to files that exist in the repo', () => {
    for (const item of [...qualityTools, ...qualityTechniques, ...qualityRoadmap]) {
      if (item.file) expect([item.file, repoPath(item.file)]).toEqual([item.file, true]);
    }
  });

  it('lists every gate with its command', () => {
    expect(qualityGates.length).toBeGreaterThan(0);
    expect(qualityGates.every((gate) => gate.command.trim().length > 0)).toBe(true);
  });
});

describe('design system', () => {
  it('has dated milestones with commits, in order', () => {
    for (const milestone of milestones) {
      expect(milestone.date).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
      expect(milestone.commits.every((sha) => /^[0-9a-f]{7,40}$/.test(sha))).toBe(true);
    }
  });

  it('has principles, a type scale and a PR checklist', () => {
    expect(unique(principles.map((principle) => principle.title))).toBe(true);
    expect(typeScale.length).toBeGreaterThan(0);
    expect(prChecklist.length).toBeGreaterThan(0);
  });
});
