import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create multiple users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user@example.com' },
      update: {},
      create: {
        email: 'user@example.com',
        name: 'John Doe',
        image: 'https://avatars.githubusercontent.com/u/12345678?v=4',
        // 1234
        password: '$2b$10$nqtpzM0al9akBrR41JrXu.X977mro1deFPFmH0s.YQd5GrxnEVFyC',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria.garcia@example.com' },
      update: {},
      create: {
        email: 'maria.garcia@example.com',
        name: 'María García',
        image: 'https://avatars.githubusercontent.com/u/23456789?v=4',
        password: '$2b$10$nqtpzM0al9akBrR41JrXu.X977mro1deFPFmH0s.YQd5GrxnEVFyC',
      },
    }),
    prisma.user.upsert({
      where: { email: 'juan.perez@example.com' },
      update: {},
      create: {
        email: 'juan.perez@example.com',
        name: 'Juan Pérez',
        image: 'https://avatars.githubusercontent.com/u/34567890?v=4',
        password: '$2b$10$nqtpzM0al9akBrR41JrXu.X977mro1deFPFmH0s.YQd5GrxnEVFyC',
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana.lopez@example.com' },
      update: {},
      create: {
        email: 'ana.lopez@example.com',
        name: 'Ana López',
        image: 'https://avatars.githubusercontent.com/u/45678901?v=4',
        password: '$2b$10$nqtpzM0al9akBrR41JrXu.X977mro1deFPFmH0s.YQd5GrxnEVFyC',
      },
    }),
  ]);

  // Array de consejos variados
  const adviceExamples = [
    'No te rindas si no sale a la primera, vas a terminar aprendiendo más si fallas, luego revisas por qué falló y luego construyes sobre esas nuevas bases. ¡Éxitos!',
    'No hay nada más fructífero que ver tus propios avances día a día, cosechando el conocimiento que fuiste cultivando con el tiempo.',
    'Para llegar lejos en la industria del software se necesita pasión. Te tiene que encantar sentarte a estudiar cosas, conversar con colegas, analizar cómo hacer mejor las cosas.',
    'Es esencial desarrollar un buen dominio del inglés. Este idioma es la base de la mayoría de los lenguajes de programación y de la documentación técnica.',
    'La pasión es la clave, ¿la tenés?',
    'El crecimiento no solo fue del proyecto, también fue mío. Me empujó a mejorar en todos los aspectos y a seguir formándome como programador.',
    'Hay momentos que son bastante complicados también, y si te metiste en la industria del software solo por dinero y sin pasión, probablemente te estanques.',
    'Al mejorar tus habilidades en inglés, ampliarás tus oportunidades laborales y estarás mejor preparado para colaborar en equipos internacionales.',
    'Aprender de los errores es fundamental para crecer en cualquier área, especialmente en tecnología.',
    'Rodéate de personas que te inspiren y te reten a ser mejor cada día.',
    // Puedes agregar más frases aquí...
  ];

  // Create 300 advises distributed among users
  const advises = await Promise.all(
    Array.from({ length: 300 }).map((_, i) =>
      prisma.advise.create({
        data: {
          content: adviceExamples[i % adviceExamples.length], // Usar consejo variado
          authorId: users[i % users.length].id, // Distribute advises among users
        },
      }),
    ),
  );

  // Add likes to advises with different probabilities
  await Promise.all(
    advises.map(async (advise) => {
      // Each advise has a chance to get likes from each user
      for (const user of users) {
        // Skip if the user is the author of the advise
        if (user.id === advise.authorId) continue;

        // Different probabilities for different users
        const likeProbability = Math.random();

        // First user (Agustín) likes more content (60% chance)
        if (user.email === 'js.agustin.sz@gmail.com' && likeProbability < 0.6) {
          await prisma.like.create({
            data: {
              userId: user.id,
              adviseId: advise.id,
            },
          });
        }
        // Second user (María) likes moderately (40% chance)
        else if (user.email === 'maria.garcia@example.com' && likeProbability < 0.4) {
          await prisma.like.create({
            data: {
              userId: user.id,
              adviseId: advise.id,
            },
          });
        }
        // Other users like less frequently (20% chance)
        else if (likeProbability < 0.2) {
          await prisma.like.create({
            data: {
              userId: user.id,
              adviseId: advise.id,
            },
          });
        }
      }
    }),
  );

  // Create at least 10 mocked events
  await Promise.all(
    Array.from({ length: 10 }).map(async (_, index) => {
      try {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 4);

        // Generate only for even events
        const includeImages = index % 2 === 0;
        const imageIds: string[] = [];

        if (includeImages) {
          try {
            await Promise.all(
              Array.from({ length: 3 }).map(async () => {
                const image = await prisma.image.create({
                  data: {
                    imgSrc: `/events/Lightning talks flyer.webp`,
                  },
                });
                imageIds.push(image.id);
                return image;
              }),
            );
          } catch (error) {
            console.error(`Failed to create images for event ${index + 1}:`, error);
          }
        }
        const event = await prisma.event.create({
          data: {
            name: `Titulo del evento numero ${index + 1}`,
            flyerSrc: '/events/Lightning talks flyer.webp',
            description: `Esta es la descripción del contenido del evento numero ${index + 1}`,
            date: startDate,
            endDate: endDate,
            city: 'San Miguel de Tucumán',
            address: 'Bernardino Rivadavia 1050',
            placeName: 'UTN-FRT',
            latitude: -26.844408,
            longitude: -65.22264,
            images: {
              connect: imageIds.length > 0 ? imageIds.map((id) => ({ id })) : [],
            },
          },
        });
        return event;
      } catch (error) {
        console.error(`Failed to create event ${index + 1}`, error);
        return null;
      }
    }),
  );

  console.log(`Seed data created successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
