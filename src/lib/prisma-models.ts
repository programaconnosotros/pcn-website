import type { Prisma } from '@/generated/prisma/client';
import datamodel from '@/generated/datamodel/datamodel.json';

// Which tables a Prisma call reads or writes, worked out from its arguments and the schema's
// relations. The data cache (src/lib/cache.ts) tags every cached read with the tables it
// depends on, and the Prisma client (src/lib/prisma.ts) expires those tags on every write, so
// a write can't forget to invalidate what it changed.

export type ModelName = Prisma.ModelName;

type Field = {
  name: string;
  kind: string;
  type: string;
  isList: boolean;
  relationName?: string | null;
  relationFromFields?: readonly string[];
};

// El datamodel lo escribe el generator `datamodel` del schema (prisma/datamodel-generator.mjs).
const models: { name: string; fields: Field[] }[] = datamodel.models;

/** model → relation field → related model. */
const relations = new Map<string, Map<string, string>>(
  models.map((model) => [
    model.name,
    new Map(model.fields.filter((f) => f.kind === 'object').map((f) => [f.name, f.type])),
  ]),
);

/**
 * model → the models whose rows go away or change when one of its rows is deleted: the ones
 * holding a foreign key to it (cascade or set null) and the other side of its many-to-many
 * relations, transitively (deleting a user deletes their consejos, which delete their likes).
 */
const dependents = (() => {
  const direct = new Map<string, Set<string>>();
  for (const model of models) {
    for (const field of model.fields) {
      if (field.kind !== 'object') continue;
      const holdsForeignKey = (field.relationFromFields?.length ?? 0) > 0;
      const back = models
        .find(({ name }) => name === field.type)
        ?.fields.find((f) => f.relationName === field.relationName && f !== field);
      const manyToMany = field.isList && back?.isList;
      if (holdsForeignKey || manyToMany) {
        if (!direct.has(field.type)) direct.set(field.type, new Set());
        direct.get(field.type)!.add(model.name);
      }
    }
  }
  const closure = new Map<string, Set<string>>();
  for (const model of models) {
    const seen = new Set<string>([model.name]);
    const queue = [model.name];
    while (queue.length) {
      for (const next of direct.get(queue.pop()!) ?? []) {
        if (!seen.has(next)) (seen.add(next), queue.push(next));
      }
    }
    closure.set(model.name, seen);
  }
  return closure;
})();

const DELETES = new Set(['delete', 'deleteMany']);

/**
 * Every model an argument object reaches through relation fields: includes, selects, `_count`,
 * relation filters and nested writes alike. Deleting (top level or nested) adds the dependents.
 */
export const modelsIn = (model: string, args: unknown, deleting = false) => {
  const found = new Set<string>();
  const visit = (current: string, value: unknown, deletes: boolean) => {
    if (deletes) dependents.get(current)?.forEach((name) => found.add(name));
    else found.add(current);
    if (!value || typeof value !== 'object' || value instanceof Date) return;
    if (Array.isArray(value)) return value.forEach((item) => visit(current, item, false));
    for (const [key, child] of Object.entries(value)) {
      const related = relations.get(current)?.get(key);
      if (related) visit(related, child, false);
      else if (DELETES.has(key)) visit(current, child, true);
      else visit(current, child, false);
    }
  };
  visit(model, args, deleting);
  return found as Set<ModelName>;
};

export const isDelete = (operation: string) => DELETES.has(operation);
