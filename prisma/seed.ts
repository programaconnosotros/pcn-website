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
    prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        image: 'https://avatars.githubusercontent.com/u/56789012?v=4',
        password: '$2b$10$nqtpzM0al9akBrR41JrXu.X977mro1deFPFmH0s.YQd5GrxnEVFyC',
        role: 'ADMIN',
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

  // Create 10 job offers
  const jobOffersData = [
    {
      title: 'Senior Frontend Developer',
      description:
        'Buscamos un desarrollador frontend senior con experiencia en React, TypeScript y Next.js para unirse a nuestro equipo de desarrollo.',
      company: 'TechCorp Argentina',
      available: true,
      tags: ['React', 'TypeScript', 'Next.js', 'Frontend'],
      location: 'Buenos Aires, Remoto',
      type: 'Full-time',
    },
    {
      title: 'Full Stack Engineer',
      description:
        'Desarrollador full stack con experiencia en Node.js, React y bases de datos para proyectos innovadores.',
      company: 'InnovateLab',
      available: true,
      tags: ['Node.js', 'React', 'MongoDB', 'Full Stack'],
      location: 'Córdoba',
      type: 'Full-time',
    },
    {
      title: 'DevOps Engineer',
      description:
        'Ingeniero DevOps para automatizar procesos de CI/CD y gestionar infraestructura en la nube.',
      company: 'CloudTech Solutions',
      available: true,
      tags: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      location: 'Mendoza, Híbrido',
      type: 'Full-time',
    },
    {
      title: 'Mobile Developer',
      description:
        'Desarrollador móvil especializado en React Native para crear aplicaciones multiplataforma.',
      company: 'MobileFirst',
      available: true,
      tags: ['React Native', 'JavaScript', 'Mobile', 'iOS', 'Android'],
      location: 'Rosario',
      type: 'Part-time',
    },
    {
      title: 'Data Scientist',
      description:
        'Científico de datos para desarrollar modelos de machine learning y análisis predictivo.',
      company: 'DataInsights',
      available: true,
      tags: ['Python', 'Machine Learning', 'SQL', 'Data Analysis'],
      location: 'La Plata, Remoto',
      type: 'Full-time',
    },
    {
      title: 'UX/UI Designer',
      description:
        'Diseñador UX/UI para crear experiencias de usuario excepcionales y interfaces intuitivas.',
      company: 'DesignStudio',
      available: true,
      tags: ['Figma', 'Adobe XD', 'UX Design', 'UI Design'],
      location: 'Tucumán',
      type: 'Full-time',
    },
    {
      title: 'Backend Developer',
      description:
        'Desarrollador backend con experiencia en Java y Spring Boot para sistemas empresariales.',
      company: 'EnterpriseSoft',
      available: true,
      tags: ['Java', 'Spring Boot', 'PostgreSQL', 'Backend'],
      location: 'Salta, Híbrido',
      type: 'Full-time',
    },
    {
      title: 'QA Engineer',
      description:
        'Ingeniero de calidad para implementar estrategias de testing automatizado y manual.',
      company: 'QualityAssurance',
      available: true,
      tags: ['Selenium', 'Jest', 'Testing', 'Automation'],
      location: 'Neuquén',
      type: 'Full-time',
    },
    {
      title: 'Product Manager',
      description:
        'Product Manager para liderar el desarrollo de productos digitales desde la concepción hasta el lanzamiento.',
      company: 'ProductHub',
      available: true,
      tags: ['Product Management', 'Agile', 'Scrum', 'Strategy'],
      location: 'Mar del Plata, Remoto',
      type: 'Full-time',
    },
    {
      title: 'Cybersecurity Analyst',
      description:
        'Analista de ciberseguridad para proteger sistemas y datos de amenazas digitales.',
      company: 'SecureNet',
      available: true,
      tags: ['Cybersecurity', 'Penetration Testing', 'Security', 'Networking'],
      location: 'Bahía Blanca',
      type: 'Full-time',
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

  // Obtener usuarios regulares (no admin) para asociar errores y logs
  const regularUsers = users.filter((user) => user.role !== 'ADMIN');
  const adminUser = users.find((user) => user.role === 'ADMIN');

  // Crear errores de ejemplo
  const errorMessages = [
    'Failed to fetch user data',
    'Network request failed',
    'Cannot read property "id" of undefined',
    'TypeError: Cannot read properties of null',
    'Uncaught ReferenceError: variable is not defined',
    'Failed to load resource: the server responded with a status of 404',
    'Maximum update depth exceeded',
    'Invalid token: token expired',
    'Database connection timeout',
    'Validation error: email is required',
    'Unauthorized access attempt',
    'Failed to upload image: file too large',
    'Component render error: missing required prop',
    'API rate limit exceeded',
    'CORS policy blocked request',
  ];

  const errorPaths = [
    '/advises',
    '/advises/[id]',
    '/events',
    '/events/[id]',
    '/job-offers',
    '/profile',
    '/dashboard',
    '/api/advises',
    '/api/events',
    '/api/users',
  ];

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  ];

  // Crear 50 errores distribuidos en los últimos 30 días
  const errors = await Promise.all(
    Array.from({ length: 50 }).map(async (_, i) => {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
      const isResolved = Math.random() > 0.6; // 40% resueltos
      const resolvedAt = isResolved
        ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
        : null;

      const stack = `Error: ${errorMessages[i % errorMessages.length]}
    at Component.render (Component.tsx:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 50) + 1})
    at ReactDOM.render (react-dom.js:${Math.floor(Math.random() * 1000) + 1}:${Math.floor(Math.random() * 50) + 1})
    at App.main (App.tsx:${Math.floor(Math.random() * 100) + 1}:${Math.floor(Math.random() * 50) + 1})`;

      return prisma.errorLog.create({
        data: {
          message: errorMessages[i % errorMessages.length],
          stack: stack,
          path: errorPaths[Math.floor(Math.random() * errorPaths.length)],
          userId: user.id,
          userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          metadata: JSON.stringify({
            browser: Math.random() > 0.5 ? 'Chrome' : 'Firefox',
            os: Math.random() > 0.5 ? 'Windows' : 'macOS',
            timestamp: createdAt.toISOString(),
          }),
          resolved: isResolved,
          resolvedAt: resolvedAt,
          resolvedBy: isResolved && adminUser ? adminUser.id : null,
          createdAt: createdAt,
        },
      });
    }),
  );

  // Crear logs de aplicación de ejemplo
  const logLevels = ['info', 'warn', 'error', 'debug'];
  const logMessages = [
    'User logged in successfully',
    'Page loaded: /advises',
    'API request completed',
    'Form validation passed',
    'Image uploaded successfully',
    'User session expired',
    'Cache cleared',
    'Database query executed',
    'Component mounted',
    'State updated',
    'Navigation occurred',
    'File download started',
    'Search query executed',
    'Filter applied',
    'Sort order changed',
    'Warning: Slow network detected',
    'Warning: Large payload size',
    'Warning: Deprecated API used',
    'Debug: Component re-rendered',
    'Debug: State change detected',
    'Error: Failed to save data',
    'Error: Invalid form input',
    'Error: Network timeout',
  ];

  // Crear 200 logs distribuidos en los últimos 7 días
  const logs = await Promise.all(
    Array.from({ length: 200 }).map(async (_, i) => {
      const daysAgo = Math.floor(Math.random() * 7);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));
      createdAt.setSeconds(Math.floor(Math.random() * 60));

      const user =
        Math.random() > 0.3 ? regularUsers[Math.floor(Math.random() * regularUsers.length)] : null;
      const level = logLevels[Math.floor(Math.random() * logLevels.length)];
      const message = logMessages[Math.floor(Math.random() * logMessages.length)];

      return prisma.appLog.create({
        data: {
          level: level,
          message: message,
          path: errorPaths[Math.floor(Math.random() * errorPaths.length)],
          userId: user?.id || null,
          userAgent: user ? userAgents[Math.floor(Math.random() * userAgents.length)] : null,
          ipAddress: user ? `192.168.1.${Math.floor(Math.random() * 255)}` : null,
          metadata: JSON.stringify({
            timestamp: createdAt.toISOString(),
            sessionId: `session_${Math.random().toString(36).substring(7)}`,
            additionalInfo: Math.random() > 0.5 ? { action: 'click', element: 'button' } : null,
          }),
          createdAt: createdAt,
        },
      });
    }),
  );

  console.log(`Seed data created successfully!`);
  console.log(`Created ${errors.length} error logs`);
  console.log(`Created ${logs.length} application logs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
