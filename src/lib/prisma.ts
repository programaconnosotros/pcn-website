import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // El hash de la contraseña no sale de la base salvo que una consulta lo pida con
  // `omit: { password: false }` (solo el login). Así un `include: { author: true }` que termina
  // en un componente de cliente no puede filtrarlo.
  return new PrismaClient({ omit: { user: { password: true } } });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
