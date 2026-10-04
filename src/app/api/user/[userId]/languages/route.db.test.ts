import prisma from '@/lib/prisma';
import { GET } from '@/app/api/user/[userId]/languages/route';
import { createUser } from '@/test/db/content-fixtures';

// Lenguajes de un usuario, contra Postgres real.

const languagesOf = async (userId: string) => {
  const response = await GET(new Request(`https://pcn.test/api/user/${userId}/languages`), {
    params: Promise.resolve({ userId }),
  });
  return { status: response.status, body: await response.json() };
};

it("returns only that user's languages", async () => {
  const [user, other] = [await createUser(), await createUser()];
  await prisma.userLanguage.createMany({
    data: [
      { userId: user.id, language: 'TypeScript', color: '#3178c6', logo: '/ts.svg' },
      { userId: other.id, language: 'Go', color: '#00add8', logo: '/go.svg' },
    ],
  });

  const { status, body } = await languagesOf(user.id);

  expect(status).toBe(200);
  expect(body.map((l: { language: string }) => l.language)).toEqual(['TypeScript']);
});

it('returns an empty list for unknown users', async () => {
  await expect(languagesOf('no-existe')).resolves.toEqual({ status: 200, body: [] });
});
