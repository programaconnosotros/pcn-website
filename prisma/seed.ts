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

  // Create 10 job offers with different currencies
  const jobOffersData = [
    {
      title: 'Senior Frontend Developer',
      description:
        'Buscamos un desarrollador frontend senior con experiencia en React, TypeScript y Next.js para unirse a nuestro equipo de desarrollo.',
      enterprise: 'TechCorp Argentina',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['React', 'TypeScript', 'Next.js', 'Frontend'],
      location: 'Buenos Aires, Remoto',
      type: 'Full-time',
      salaryAmount: 250000,
      currency: 'ARS',
    },
    {
      title: 'Full Stack Engineer',
      description:
        'Desarrollador full stack con experiencia en Node.js, React y bases de datos para proyectos innovadores.',
      enterprise: 'InnovateLab',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['Node.js', 'React', 'MongoDB', 'Full Stack'],
      location: 'Córdoba',
      type: 'Full-time',
      salaryAmount: 3500,
      currency: 'USD',
    },
    {
      title: 'DevOps Engineer',
      description:
        'Ingeniero DevOps para automatizar procesos de CI/CD y gestionar infraestructura en la nube.',
      enterprise: 'CloudTech Solutions',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      location: 'Mendoza, Híbrido',
      type: 'Full-time',
      salaryAmount: 4000,
      currency: 'USD',
    },
    {
      title: 'Mobile Developer',
      description:
        'Desarrollador móvil especializado en React Native para crear aplicaciones multiplataforma.',
      enterprise: 'MobileFirst',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['React Native', 'JavaScript', 'Mobile', 'iOS', 'Android'],
      location: 'Rosario',
      type: 'Part-time',
      salaryAmount: 180000,
      currency: 'ARS',
    },
    {
      title: 'Data Scientist',
      description:
        'Científico de datos para desarrollar modelos de machine learning y análisis predictivo.',
      enterprise: 'DataInsights',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'],
      location: 'La Plata, Remoto',
      type: 'Full-time',
      salaryAmount: 4500,
      currency: 'USD',
    },
    {
      title: 'UX/UI Designer',
      description:
        'Diseñador UX/UI para crear experiencias de usuario excepcionales y interfaces intuitivas.',
      enterprise: 'DesignStudio',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['Figma', 'Adobe XD', 'UX Design', 'UI Design'],
      location: 'Tucumán',
      type: 'Full-time',
      salaryAmount: 200000,
      currency: 'ARS',
    },
    {
      title: 'Backend Developer',
      description:
        'Desarrollador backend con experiencia en Java y Spring Boot para sistemas empresariales.',
      enterprise: 'EnterpriseSoft',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['Java', 'Spring Boot', 'PostgreSQL', 'Backend'],
      location: 'Salta, Híbrido',
      type: 'Full-time',
      salaryAmount: 3200,
      currency: 'USD',
    },
    {
      title: 'QA Engineer',
      description:
        'Ingeniero de calidad para implementar estrategias de testing automatizado y manual.',
      enterprise: 'QualityAssurance',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['Selenium', 'Jest', 'Testing', 'Automation'],
      location: 'Neuquén',
      type: 'Full-time',
      salaryAmount: 220000,
      currency: 'ARS',
    },
    {
      title: 'Product Manager',
      description:
        'Product Manager para liderar el desarrollo de productos digitales desde la concepción hasta el lanzamiento.',
      enterprise: 'ProductHub',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['Product Management', 'Agile', 'Scrum', 'Strategy'],
      location: 'Mar del Plata, Remoto',
      type: 'Full-time',
      salaryAmount: 5000,
      currency: 'USD',
    },
    {
      title: 'Cybersecurity Analyst',
      description:
        'Analista de ciberseguridad para proteger sistemas y datos de amenazas digitales.',
      enterprise: 'SecureNet',
      available: true,
      logoPath: '/bowery-logo.webp',
      tags: ['Cybersecurity', 'Penetration Testing', 'Security', 'Networking'],
      location: 'Bahía Blanca',
      type: 'Full-time',
      salaryAmount: 280000,
      currency: 'ARS',
    },
  ];

  await Promise.all(
    jobOffersData.map(async (jobOffer) => {
      try {
        await prisma.jobOffers.create({
          data: jobOffer,
        });
      } catch (error) {
        console.error(`Failed to create job offer: ${jobOffer.title}`, error);
      }
    }),
  );

  // Create forum categories
  const categories = await Promise.all([
    prisma.postCategory.upsert({
      where: { slug: 'desarrollo-web' },
      update: {},
      create: {
        name: 'Desarrollo Web',
        description: 'Frontend, Backend, Full Stack',
        color: 'bg-blue-500',
        icon: '💻',
        slug: 'desarrollo-web',
      },
    }),
    prisma.postCategory.upsert({
      where: { slug: 'moviles' },
      update: {},
      create: {
        name: 'Mobile',
        description: 'React Native, Flutter, Swift, Kotlin',
        color: 'bg-green-500',
        icon: '📱',
        slug: 'moviles',
      },
    }),
    prisma.postCategory.upsert({
      where: { slug: 'devops' },
      update: {},
      create: {
        name: 'DevOps',
        description: 'Docker, Kubernetes, CI/CD',
        color: 'bg-purple-500',
        icon: '⚙️',
        slug: 'devops',
      },
    }),
    prisma.postCategory.upsert({
      where: { slug: 'bases-de-datos' },
      update: {},
      create: {
        name: 'Bases de Datos',
        description: 'SQL, NoSQL, ORMs',
        color: 'bg-orange-500',
        icon: '🗄️',
        slug: 'bases-de-datos',
      },
    }),
    prisma.postCategory.upsert({
      where: { slug: 'consejos-carrera' },
      update: {},
      create: {
        name: 'Consejos de Carrera',
        description: 'Entrevistas, CV, primeros trabajos',
        color: 'bg-pink-500',
        icon: '🚀',
        slug: 'consejos-carrera',
      },
    }),
  ]);

  // Create forum posts
  const forumPosts = [
    {
      title: '¿Cuál es la mejor forma de aprender React en 2025?',
      content: `Hola comunidad! 

Soy nuevo en el desarrollo frontend y me gustaría aprender React de la manera más efectiva. He visto muchos recursos online pero no sé por dónde empezar.

¿Qué recomiendan? ¿Cursos, documentación oficial, proyectos prácticos?

¡Gracias por sus consejos!`,
      authorEmail: 'user@example.com',
      categorySlug: 'desarrollo-web',
      isPinned: true,
    },
    {
      title: 'Mi experiencia trabajando remotamente como dev junior',
      content: `Quería compartir mi experiencia trabajando remotamente como desarrollador junior durante estos últimos 6 meses.

**Lo bueno:**
- Flexibilidad de horarios
- Ahorro en transporte y comida
- Mejor balance vida-trabajo

**Los desafíos:**
- Comunicación con el equipo
- Distracciones en casa
- Feeling de aislamiento a veces

¿Qué tal han sido sus experiencias? ¿Algún consejo para mejorar la productividad en casa?`,
      authorEmail: 'maria.garcia@example.com',
      categorySlug: 'consejos-carrera',
      isPinned: false,
    },
    {
      title: 'Docker compose para desarrollo local - Tips y trucos',
      content: `Después de meses trabajando con Docker en desarrollo, quería compartir algunos tips que me han ahorrado mucho tiempo:

## 1. Volúmenes para desarrollo
\`\`\`yaml
volumes:
  - .:/app
  - /app/node_modules
\`\`\`

## 2. Variables de entorno
Usar archivos \`.env\` para diferentes ambientes.

## 3. Hot reload
Configurar correctamente el hot reload para no tener que rebuilder constantemente.

¿Qué otros tips agregarían?`,
      authorEmail: 'juan.perez@example.com',
      categorySlug: 'devops',
      isPinned: false,
    },
    {
      title: '¿PostgreSQL vs MongoDB para un proyecto nuevo?',
      content: `Estoy empezando un nuevo proyecto y tengo que decidir entre PostgreSQL y MongoDB.

**Contexto del proyecto:**
- Aplicación web con usuarios
- Manejo de posts y comentarios
- Necesito búsquedas complejas
- Equipo pequeño (2-3 devs)

¿Qué recomiendan y por qué? ¿Hay algún factor decisivo que debería considerar?`,
      authorEmail: 'ana.lopez@example.com',
      categorySlug: 'bases-de-datos',
      isPinned: false,
    },
  ];

  const createdPosts = await Promise.all(
    forumPosts.map(async (postData) => {
      const author = users.find((u) => u.email === postData.authorEmail)!;
      const category = categories.find((c) => c.slug === postData.categorySlug)!;

      return prisma.post.create({
        data: {
          title: postData.title,
          content: postData.content,
          isPinned: postData.isPinned,
          authorId: author.id,
          categoryId: category.id,
        },
      });
    }),
  );

  // Add some comments to posts
  await Promise.all(
    createdPosts.map(async (post) => {
      // Add 2-5 comments per post
      const numComments = Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < numComments; i++) {
        const randomAuthor = users[Math.floor(Math.random() * users.length)];

        await prisma.postComment.create({
          data: {
            content: `Excelente post! Muy útil la información que compartiste. ${i === 0 ? 'Gracias por tomarte el tiempo de escribir esto.' : `Comentario ${i + 1} sobre este tema.`}`,
            authorId: randomAuthor.id,
            postId: post.id,
          },
        });
      }
    }),
  );

  // Add some likes to posts
  await Promise.all(
    createdPosts.map(async (post) => {
      for (const user of users) {
        // Skip if the user is the author of the post
        if (user.id === post.authorId) continue;
        // 50% chance to like each post
        if (Math.random() < 0.5) {
          await prisma.postLike.create({
            data: {
              userId: user.id,
              postId: post.id,
            },
          });
        }
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
