import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { Prisma } from '@/generated/prisma/client';

// SQL injection, chequeo estático: todos los formularios terminan en server actions, route
// handlers o páginas que le hablan a la base solo con la API de Prisma (que parametriza siempre)
// o con `$queryRaw`/`$executeRaw` como template tag (cada `${valor}` viaja como parámetro). Este
// test recorre todo `src/` y falla si aparece cualquier otra forma de armar SQL. Lee el código como
// AST, así que los textos que hablan de estas APIs (las guías de entrevistas) no cuentan.
// La otra mitad, contra una base real, está en src/test/sql-injection.db.test.ts.

const SRC = join(process.cwd(), 'src');

/** Drivers o query builders que no pasan por Prisma. */
const FORBIDDEN_MODULES = new Set([
  'pg',
  'postgres',
  'pg-promise',
  'mysql',
  'mysql2',
  'knex',
  'kysely',
  'sequelize',
  'typeorm',
  'drizzle-orm',
]);

const RAW_TAGS = new Set(['$queryRaw', '$executeRaw']);
const UNSAFE_METHODS = new Set(['$queryRawUnsafe', '$executeRawUnsafe']);

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'generated' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : [];
  });

const isPrismaSqlTag = (node: ts.Node) =>
  ts.isTaggedTemplateExpression(node) &&
  ts.isPropertyAccessExpression(node.tag) &&
  node.tag.name.text === 'sql' &&
  ts.isIdentifier(node.tag.expression) &&
  node.tag.expression.text === 'Prisma';

type Finding = { file: string; line: number; problem: string };

/** Cada forma insegura de armar SQL que aparece en `code`. */
const findUnsafeSql = (code: string, file = 'snippet.ts') => {
  const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true);
  const findings: Finding[] = [];
  const report = (node: ts.Node, problem: string) =>
    findings.push({
      file,
      line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      problem,
    });
  let rawTags = 0;

  const visit = (node: ts.Node) => {
    if (ts.isPropertyAccessExpression(node)) {
      const name = node.name.text;
      if (UNSAFE_METHODS.has(name)) report(node, `${name} arma el SQL con strings`);
      if (name === 'raw' && ts.isIdentifier(node.expression) && node.expression.text === 'Prisma')
        report(node, 'Prisma.raw mete texto tal cual en la query');

      if (RAW_TAGS.has(name)) {
        const parent = node.parent;
        if (ts.isTaggedTemplateExpression(parent) && parent.tag === node) {
          rawTags++;
        } else if (ts.isCallExpression(parent) && parent.expression === node) {
          // La forma de función solo es segura si recibe un Prisma.sql`...`
          const [arg] = parent.arguments;
          if (!arg || !isPrismaSqlTag(arg)) report(node, `${name}(...) sin un Prisma.sql\`...\``);
        } else {
          report(node, `${name} usado fuera de un template tag`);
        }
      }
    }

    const moduleName =
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
        ? node.moduleSpecifier.text
        : ts.isCallExpression(node) &&
            (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
              (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
            node.arguments[0] &&
            ts.isStringLiteral(node.arguments[0])
          ? node.arguments[0].text
          : null;
    if (moduleName && FORBIDDEN_MODULES.has(moduleName))
      report(node, `importa "${moduleName}" en vez de usar Prisma`);

    ts.forEachChild(node, visit);
  };

  visit(source);
  return { findings, rawTags };
};

describe('SQL injection: static check', () => {
  const files = sourceFiles(SRC);
  const results = files.map((path) =>
    findUnsafeSql(readFileSync(path, 'utf8'), relative(process.cwd(), path)),
  );

  it('scans the whole app', () => {
    expect(files.length).toBeGreaterThan(100);
    // Los $queryRaw de /metricas y /admin: si el detector dejara de verlos, no estaría mirando nada
    expect(results.reduce((total, { rawTags }) => total + rawTags, 0)).toBeGreaterThan(0);
  });

  it('only talks to the database through parameterized queries', () => {
    const findings = results.flatMap(({ findings }) => findings);
    expect(findings.map(({ file, line, problem }) => `${file}:${line} ${problem}`)).toEqual([]);
  });

  describe('the detector', () => {
    it.each([
      [
        '$queryRawUnsafe',
        'prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE email = \'${email}\'`)',
      ],
      ['$executeRawUnsafe', 'await tx.$executeRawUnsafe("DELETE FROM x WHERE id = " + id)'],
      ['Prisma.raw', 'prisma.$queryRaw`SELECT * FROM ${Prisma.raw(table)}`'],
      ['$queryRaw as a function', 'prisma.$queryRaw(query)'],
      ['$queryRaw passed around', 'const run = prisma.$queryRaw; run(query)'],
      ['a direct driver', "import { Pool } from 'pg'"],
      ['a required driver', "const { Client } = require('pg')"],
      ['a dynamic driver import', "await import('knex')"],
    ])('flags %s', (_name, code) => {
      expect(findUnsafeSql(code).findings).not.toEqual([]);
    });

    it.each([
      ['a tagged $queryRaw', 'prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email}`'],
      ['a tagged $executeRaw', 'tx.$executeRaw`UPDATE "User" SET name = ${name} WHERE id = ${id}`'],
      ['$queryRaw with Prisma.sql', 'prisma.$queryRaw(Prisma.sql`SELECT ${value}`)'],
      ['the Prisma query API', 'prisma.user.findMany({ where: { name: { contains: search } } })'],
      ['text that mentions the APIs', "const tip = 'nunca uses $queryRawUnsafe ni Prisma.raw'"],
    ])('accepts %s', (_name, code) => {
      expect(findUnsafeSql(code).findings).toEqual([]);
    });
  });

  // Lo que hace seguro al template tag: el valor nunca entra al texto del SQL.
  it.each(["' OR '1'='1", `'; DROP TABLE "User"; --`, `1 UNION SELECT password FROM "User"`])(
    'sends %p as a parameter, never as SQL text',
    (payload) => {
      const query = Prisma.sql`SELECT * FROM "User" WHERE email = ${payload} AND ${Prisma.sql`name = ${payload}`}`;

      expect(query.sql).toBe('SELECT * FROM "User" WHERE email = ? AND name = ?');
      expect(query.text).toBe('SELECT * FROM "User" WHERE email = $1 AND name = $2');
      expect(query.values).toEqual([payload, payload]);
    },
  );
});
