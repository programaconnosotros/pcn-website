import nextConfig from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';

const config = [
  {
    ignores: [
      '.claude/worktrees/**',
      'src/generated/**',
      '.next-e2e/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  ...nextConfig,
  prettierConfig,
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // New react-hooks v5 React Compiler rules — disabled until pre-existing
      // patterns in the codebase are addressed in follow-up tickets.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/immutability': 'off',
      // SQL injection: a la base solo se le habla con la API de Prisma o con `$queryRaw` /
      // `$executeRaw` como template tag, que mandan cada valor como parámetro. Estas APIs arman el
      // SQL con strings y meten lo que reciben adentro de la query. Ver docs/seguridad-owasp.md.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[property.name=/^\\$(queryRaw|executeRaw)Unsafe$/]',
          message:
            'SQL injection: usá $queryRaw/$executeRaw como template tag (prisma.$queryRaw`... ${valor}`), que parametriza los valores.',
        },
        {
          selector: 'MemberExpression[object.name="Prisma"][property.name="raw"]',
          message:
            'SQL injection: Prisma.raw mete el texto tal cual en la query. Usá Prisma.sql`...` o una allowlist de fragmentos fijos.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'pg',
              message:
                'Hablale a la base con Prisma (@/lib/prisma): un driver directo saltea la parametrización y los chequeos de SQL injection.',
            },
          ],
        },
      ],
    },
  },
  {
    // LISTEN/NOTIFY needs its own connection, which Prisma doesn't give; see DRIVER_EXCEPTIONS in
    // src/lib/sql-safety.test.ts.
    files: ['src/lib/realtime.ts', 'src/lib/realtime.test.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // Los fixtures de Playwright reciben una función `use` que no es un hook de React
    files: ['tests/e2e/**'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
];

export default config;
