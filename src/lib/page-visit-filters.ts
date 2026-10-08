import { Prisma } from '@/generated/prisma/client';

// Admin visits are recorded (with their user) so /metricas can count them when asked, but every
// read of PageVisit leaves them out by default: admins are mostly the people building the site.

/** Prisma filter: visits not made by a logged-in admin (anonymous visits included). */
export const nonAdminVisit = {
  NOT: { user: { role: 'ADMIN' } },
} satisfies Prisma.PageVisitWhereInput;

/** The same filter for raw queries over "PageVisit" (no table alias). */
export const nonAdminVisitSql = Prisma.sql`NOT EXISTS (
  SELECT 1 FROM "User" visitor WHERE visitor.id = "PageVisit"."userId" AND visitor.role = 'ADMIN'
)`;
