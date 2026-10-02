import { PrismaClient } from '@prisma/client';

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
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
