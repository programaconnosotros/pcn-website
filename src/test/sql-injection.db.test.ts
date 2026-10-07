import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { signIn } from '@/actions/auth/sign-in';
import { requestPasswordReset } from '@/actions/auth/request-password-reset';
import { createAdvice } from '@/actions/advice/create-advice';
import { createComment } from '@/actions/comments/create-comment';
import { updateProfile } from '@/actions/update-profile';
import { createProject } from '@/actions/projects/create-project';
import { getUserSummary } from '@/actions/users/get-user-summary';
import { GET as search } from '@/app/api/search/route';
import { getProductMetrics } from '@/lib/product-metrics';
import { parseMetricsRange } from '@/lib/metrics-range';
import { actAs, createUser } from '@/test/db/fixtures';

// SQL injection contra Postgres real: cada formulario recibe los payloads clásicos y se comprueba
// que (1) nadie entra ni ve datos que no le tocan, (2) lo que se guarda vuelve idéntico, como texto,
// (3) ninguna query se cortó ni se demoró por el payload y (4) las tablas siguen intactas.
// La mitad estática (que no exista ninguna forma insegura de armar SQL) está en
// src/lib/sql-safety.test.ts.

const PAYLOADS = [
  `' OR '1'='1`,
  `' OR 1=1 --`,
  `admin'--`,
  `'; DROP TABLE "User"; --`,
  `'); DELETE FROM "Session"; --`,
  `" OR ""="`,
  `' UNION SELECT id, email, password FROM "User" --`,
  `1; UPDATE "User" SET role = 'ADMIN'; --`,
  `%' OR name LIKE '%`,
  `\\'; SELECT pg_sleep(3); --`,
  `' OR pg_sleep(3) IS NOT NULL --`,
  `$1 $2 ? ?; --`,
];

// Un payload con pg_sleep(3) que llegara a ejecutarse tardaría 3 s o más
const SLOW_QUERY_MS = 2500;

const timed = async <T>(run: () => Promise<T>) => {
  const start = Date.now();
  const result = await run();
  expect(Date.now() - start).toBeLessThan(SLOW_QUERY_MS);
  return result;
};

let victim: Awaited<ReturnType<typeof createUser>>;
let attacker: Awaited<ReturnType<typeof createUser>>;
let userCount: number;

beforeAll(async () => {
  victim = await createUser({ email: 'victima@test.pcn', password: 'la-clave-de-la-victima' });
  attacker = await createUser({ email: 'atacante@test.pcn' });
  userCount = await prisma.user.count();
});

afterAll(async () => {
  // Las tablas siguen ahí, con las mismas filas y sin nadie ascendido a admin
  const [{ exists }] = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public."User"') IS NOT NULL AS exists`;
  expect(exists).toBe(true);
  expect(await prisma.user.count()).toBe(userCount);
  expect(await prisma.user.count({ where: { role: 'ADMIN' } })).toBe(0);
});

// Control: los mismos payloads contra una query armada concatenando strings sí la rompen. Si esto
// dejara de fallar, los tests de abajo no estarían probando nada.
describe('a query built by concatenating input (the vulnerable baseline)', () => {
  const vulnerableLookup = (email: string) =>
    // eslint-disable-next-line no-restricted-syntax -- a propósito: es la query vulnerable de control
    prisma.$queryRawUnsafe<{ id: string }[]>(`SELECT id FROM "User" WHERE email = '${email}'`);

  it('leaks every user with a tautology', async () => {
    await expect(vulnerableLookup(`' OR '1'='1`)).resolves.toHaveLength(userCount);
  });

  it('runs the injected sleep', async () => {
    const start = Date.now();
    // As a subquery it sleeps once; `OR pg_sleep(3)` alone would sleep once per user row
    await vulnerableLookup(`' OR (SELECT pg_sleep(3)) IS NOT NULL --`);
    expect(Date.now() - start).toBeGreaterThanOrEqual(SLOW_QUERY_MS);
  });

  it('returns nothing for the same tautology when parameterized', async () => {
    await expect(
      prisma.$queryRaw`SELECT id FROM "User" WHERE email = ${`' OR '1'='1`}`,
    ).resolves.toEqual([]);
  });
});

describe.each(PAYLOADS)('SQL injection with %p', (payload) => {
  it('does not sign anyone in, through the email or the password', async () => {
    await actAs();

    for (const credentials of [
      { email: payload, password: payload },
      { email: `${payload}@test.pcn`, password: 'x' },
      { email: victim.email, password: payload },
      { email: `victima@test.pcn${payload}`, password: payload },
    ]) {
      await expect(timed(() => signIn(credentials))).resolves.toEqual({
        success: false,
        error: 'INVALID_CREDENTIALS',
      });
    }
    expect(await prisma.session.count({ where: { userId: victim.id } })).toBe(0);
  });

  it('does not issue a password reset code for an existing account', async () => {
    await actAs();

    await expect(timed(() => requestPasswordReset(payload))).resolves.toMatchObject({
      success: true,
    });
    await expect(
      timed(() => requestPasswordReset(`${victim.email}${payload}`)),
    ).resolves.toMatchObject({
      success: true,
    });
    expect(await prisma.passwordResetToken.count()).toBe(0);
  });

  it('stores an advice and a comment exactly as typed', async () => {
    await actAs(attacker.id);
    const content = `Consejo: ${payload}`;

    await timed(() => createAdvice(content));
    const advice = await prisma.advice.findFirstOrThrow({
      where: { authorId: attacker.id },
      orderBy: { createdAt: 'desc' },
    });
    expect(advice.content).toBe(content);

    await timed(() =>
      createComment({ content: payload, adviceId: advice.id, parentCommentId: null }),
    );
    const comment = await prisma.comment.findFirstOrThrow({
      where: { adviceId: advice.id },
    });
    expect(comment.content).toBe(payload);
  });

  it('stores profile fields as text and only changes the caller', async () => {
    await actAs(attacker.id);

    await timed(() =>
      updateProfile({
        name: `Atacante ${payload}`,
        email: attacker.email,
        slogan: payload,
        career: payload,
        studyPlace: payload,
        countryOfOrigin: payload,
        province: payload,
        positions: [{ jobTitle: payload, enterprise: payload }],
        programmingLanguages: [],
        xAccountUrl: null,
        linkedinUrl: null,
        gitHubUrl: null,
        instagramUrl: null,
        youtubeUrl: null,
        twitchUrl: null,
        kickUrl: null,
      }),
    );

    const saved = await prisma.user.findUniqueOrThrow({ where: { id: attacker.id } });
    expect(saved).toMatchObject({
      name: `Atacante ${payload}`,
      slogan: payload,
      career: payload,
      jobTitle: payload,
      role: 'REGULAR',
    });
    const untouched = await prisma.user.findUniqueOrThrow({ where: { id: victim.id } });
    expect(untouched.slogan).toBeNull();
  });

  it('stores a project with the payload in its text fields and tech stack', async () => {
    await actAs(attacker.id);
    const title = `Proyecto ${payload}`.slice(0, 100);

    const { projectId } = await timed(() =>
      createProject({
        title,
        description: `Descripción con ${payload}`,
        url: 'https://example.com/proyecto',
        techStack: [payload.slice(0, 50)],
        isOpenSource: false,
        members: [],
      } as never),
    );

    const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
    expect(project).toMatchObject({
      title,
      techStack: [payload.slice(0, 50)],
      authorId: attacker.id,
    });
  });

  it('finds nothing extra when the payload is a search or an id', async () => {
    await actAs();

    const response = await timed(() =>
      search(new NextRequest(`https://pcn.test/api/search?q=${encodeURIComponent(payload)}`)),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain(victim.email);

    await expect(timed(() => getUserSummary(payload))).resolves.toBeNull();
  });

  it('runs the raw metrics queries with the payload as a parameter', async () => {
    const range = parseMetricsRange({ rango: payload, desde: payload, hasta: payload });

    const metrics = await timed(() =>
      getProductMetrics(range, [payload, 'programaconnosotros.com']),
    );

    expect(metrics).toBeDefined();
  });
});
