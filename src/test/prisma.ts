import type { DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient } from '@prisma/client';

/**
 * Typed reference to the Prisma deep mock created in jest.setup.ts.
 *
 * Usage in tests:
 *   prismaMock.user.findUnique.mockResolvedValue({ id: 'u-1', ... });
 */
export const prismaMock: DeepMockProxy<PrismaClient> = jest.requireMock('@/lib/prisma').default;
