import { PrismaClient } from '@prisma/client';
import { checkCachedRead, expireModels } from '@/lib/cache';
import { isDelete, modelsIn } from '@/lib/prisma-models';

const WRITES = new Set([
  'create',
  'createMany',
  'createManyAndReturn',
  'update',
  'updateMany',
  'updateManyAndReturn',
  'upsert',
  'delete',
  'deleteMany',
]);

const prismaClientSingleton = () => {
  // Datos sensibles que no salen de la base salvo que una consulta los pida con
  // `omit: { campo: false }`: el hash de la contraseña (solo el login) y el teléfono de los
  // oradores (solo quienes gestionan el evento). Así un `include` que termina en un componente
  // de cliente o en una página pública no puede filtrarlos.
  return new PrismaClient({
    omit: {
      user: { password: true },
      talkSpeaker: { speakerPhone: true },
      talkProposalSpeaker: { speakerPhone: true },
    },
  }).$extends({
    name: 'data-cache',
    query: {
      $allModels: {
        // Cada escritura vence las lecturas cacheadas de las tablas que tocó (incluidas las
        // escrituras anidadas y lo que se borra en cascada); ver src/lib/cache.ts.
        async $allOperations({ model, operation, args, query }) {
          if (!WRITES.has(operation)) {
            if (process.env.NODE_ENV !== 'production') checkCachedRead(modelsIn(model, args));
            return query(args);
          }
          const result = await query(args);
          expireModels(modelsIn(model, args, isDelete(operation)));
          return result;
        },
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

/** The client inside `prisma.$transaction(async (tx) => …)`, or the client itself. */
export type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
