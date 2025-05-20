import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash password once since all users will have the same password
  const hashedPassword = await bcrypt.hash('1234', 10);

  // Create multiple users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'js.agustin.sz@gmail.com' },
      update: {},
      create: {
        email: 'js.agustin.sz@gmail.com',
        name: 'Agustín Sánchez',
        image: 'https://avatars.githubusercontent.com/u/12345678?v=4',
        password: hashedPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria.garcia@example.com' },
      update: {},
      create: {
        email: 'maria.garcia@example.com',
        name: 'María García',
        image: 'https://avatars.githubusercontent.com/u/23456789?v=4',
        password: hashedPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: 'juan.perez@example.com' },
      update: {},
      create: {
        email: 'juan.perez@example.com',
        name: 'Juan Pérez',
        image: 'https://avatars.githubusercontent.com/u/34567890?v=4',
        password: hashedPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: 'ana.lopez@example.com' },
      update: {},
      create: {
        email: 'ana.lopez@example.com',
        name: 'Ana López',
        image: 'https://avatars.githubusercontent.com/u/45678901?v=4',
        password: hashedPassword,
      },
    }),
  ]);

  // Create 300 advises distributed among users
  const advises = await Promise.all(
    Array.from({ length: 300 }).map((_, i) =>
      prisma.advise.create({
        data: {
          content: `Este es el contenido del consejo ${i + 1}.`,
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
