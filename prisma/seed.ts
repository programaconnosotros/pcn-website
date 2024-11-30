import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'js.agustin.sz@gmail.com' },
    update: {},
    create: {
      email: 'js.agustin.sz@gmail.com',
      name: 'Agustín Sánchez',
      image: 'https://avatars.githubusercontent.com/u/12345678?v=4',
      accounts: {
        create: {
          type: 'oauth',
          provider: 'github',
          providerAccountId: '12345678', // Replace with actual GitHub user ID
          access_token: 'github_access_token_placeholder',
          token_type: 'bearer',
          scope: 'user,repo',
        },
      },
    },
  });

  // Create 300 advises for the user
  const advises = await Promise.all(
    Array.from({ length: 300 }).map((_, i) =>
      prisma.advise.create({
        data: {
          content: `Este es el contenido del consejo ${i + 1}.`,
          authorId: user.id,
        },
      }),
    ),
  );


  // Create at least 10 mocked events
  const events = await Promise.all(
    Array.from({ length: 10 }).map(async (_, index) => {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 4);

      // Generate only for even events
      const includeImages = index % 2 === 0;
      const imageIds: string[] = [];

      if (includeImages) {
        const images = await Promise.all(
          Array.from({ length: 3 }).map(async (_, i) => {
            const image = await prisma.image.create({
              data: {
                imgSrc: `/events/Lightning talks flyer.jpg`, // 
              },
            });
            imageIds.push(image.id);
            return image;
          })
        );
      }

      const event = await prisma.event.create({
        data: {
          name: `Titulo del evento numero ${index + 1}`,
          flyerSrc: "/events/Lightning talks flyer.jpg",
          description: `Esta es la descripción del contenido del evento numero ${index + 1}`,
          date: startDate,
          endDate: endDate,
          location: "San Miguel de Tucumán",
          images: {
            connect: imageIds.length > 0 ? imageIds.map(id => ({ id })) : [],
          },
        },
      });

      return event;
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
