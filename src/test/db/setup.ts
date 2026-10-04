import prisma from '@/lib/prisma';

// Igual que jest.setup.ts pero con Prisma real: las queries llegan a Postgres. Solo se reemplaza lo
// que no existe fuera de un request de Next (cookies, headers, cache, redirect) y lo que sale del
// servidor (emails, S3).

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  updateTag: jest.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  notFound: jest.fn().mockImplementation(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
  headers: jest.fn(),
}));

jest.mock('@/lib/rate-limit', () => ({
  ...jest.requireActual('@/lib/rate-limit'),
  enforceRateLimit: jest.fn(),
  getRateLimitWait: jest.fn().mockResolvedValue(0),
}));

jest.mock('@/lib/email', () => ({
  ...jest.requireActual('@/lib/email'),
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

afterAll(async () => {
  await prisma.$disconnect();
});
