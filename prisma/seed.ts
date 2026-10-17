import 'dotenv/config';
import { PrismaClient, TalkProposalStatus } from '../src/generated/prisma/client';
import { pgAdapter } from '../src/lib/database-url';

const prisma = new PrismaClient({ adapter: pgAdapter(process.env.DATABASE_URL) });

type SpeakerSeedData = {
  userId?: string | null;
  speakerName: string;
  speakerPhone: string;
  isProfessional?: boolean;
  jobTitle?: string | null;
  enterprise?: string | null;
  isStudent?: boolean;
  career?: string | null;
  studyPlace?: string | null;
  order?: number;
};

function mapSpeakers(speakers: SpeakerSeedData[]) {
  return speakers.map((s, idx) => ({
    userId: s.userId ?? null,
    speakerName: s.speakerName,
    speakerPhone: s.speakerPhone,
    isProfessional: s.isProfessional ?? false,
    jobTitle: s.jobTitle ?? null,
    enterprise: s.enterprise ?? null,
    isStudent: s.isStudent ?? false,
    career: s.career ?? null,
    studyPlace: s.studyPlace ?? null,
    order: s.order ?? idx,
  }));
}

async function clearSeedData() {
  await prisma.forumPost.deleteMany();
  await prisma.talkSpeaker.deleteMany();
  await prisma.talk.deleteMany();
  await prisma.talkProposalSpeaker.deleteMany();
  await prisma.talkProposal.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.sponsor.deleteMany();
  // Las fotos históricas de la galería las carga una migración: solo se borran las de prueba.
  await prisma.galleryItem.deleteMany({ where: { legacyId: null } });
  await prisma.comment.deleteMany();
  await prisma.userLanguage.deleteMany();
  await prisma.like.deleteMany();
  await prisma.advice.deleteMany();
  await prisma.pageVisit.deleteMany();
  await prisma.errorLog.deleteMany();
  await prisma.appLog.deleteMany();
  await prisma.jobOffers.deleteMany();
  await prisma.event.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
}

async function main() {
  await clearSeedData();

  // Every seeded account signs in with the password 1234.
  const PASSWORD = '$2b$10$nqtpzM0al9akBrR41JrXu.X977mro1deFPFmH0s.YQd5GrxnEVFyC';
  const people = [
    {
      email: 'user@example.com',
      name: 'Lucas Fernández',
      jobTitle: 'Frontend Developer',
      enterprise: 'Mercado Libre',
      province: 'Tucumán',
      slogan: 'Aprendiendo en público',
    },
    {
      email: 'maria.garcia@example.com',
      name: 'María García',
      jobTitle: 'Backend Developer',
      enterprise: 'Globant',
      province: 'Córdoba',
      slogan: 'Postgres > todo',
    },
    {
      email: 'juan.perez@example.com',
      name: 'Juan Pérez',
      career: 'Ingeniería en Sistemas',
      studyPlace: 'UTN-FRT',
      province: 'Tucumán',
    },
    {
      email: 'ana.lopez@example.com',
      name: 'Ana López',
      jobTitle: 'QA Automation Engineer',
      enterprise: 'Despegar',
      province: 'Buenos Aires',
    },
    {
      email: 'admin@example.com',
      name: 'Valentina Ruiz',
      jobTitle: 'Tech Lead',
      enterprise: 'Ualá',
      province: 'Tucumán',
      role: 'ADMIN' as const,
    },
    {
      email: 'sofia.martinez@example.com',
      name: 'Sofía Martínez',
      jobTitle: 'Data Engineer',
      enterprise: 'Naranja X',
      province: 'Córdoba',
    },
    {
      email: 'tomas.gomez@example.com',
      name: 'Tomás Gómez',
      career: 'Licenciatura en Informática',
      studyPlace: 'UNT',
      province: 'Tucumán',
      slogan: 'Primer año, primer commit',
    },
    {
      email: 'camila.diaz@example.com',
      name: 'Camila Díaz',
      jobTitle: 'UX Engineer',
      enterprise: 'Freelance',
      province: 'Salta',
    },
    {
      email: 'mateo.romero@example.com',
      name: 'Mateo Romero',
      jobTitle: 'DevOps Engineer',
      enterprise: 'Belatrix',
      province: 'Mendoza',
    },
    {
      email: 'lucia.sosa@example.com',
      name: 'Lucía Sosa',
      career: 'Tecnicatura en Programación',
      studyPlace: 'UTN-FRT',
      province: 'Santiago del Estero',
    },
    {
      email: 'nicolas.alvarez@example.com',
      name: 'Nicolás Álvarez',
      jobTitle: 'Mobile Developer',
      enterprise: 'Rappi',
      province: 'Jujuy',
    },
    {
      email: 'florencia.torres@example.com',
      name: 'Florencia Torres',
      jobTitle: 'Engineering Manager',
      enterprise: 'Auth0',
      province: 'Buenos Aires',
      slogan: 'Equipos sanos, software sano',
    },
  ];
  const users = await Promise.all(
    people.map(({ email, role, ...profile }) =>
      prisma.user.upsert({
        where: { email },
        // Re-seeding refreshes the profile, so old seeds pick up the new names.
        update: { ...profile, image: null },
        create: {
          email,
          password: PASSWORD,
          role: role ?? 'REGULAR',
          countryOfOrigin: 'Argentina',
          ...profile,
        },
      }),
    ),
  );

  const john = users.find((u) => u.email === 'user@example.com')!;
  const maria = users.find((u) => u.email === 'maria.garcia@example.com')!;
  const juan = users.find((u) => u.email === 'juan.perez@example.com')!;
  const ana = users.find((u) => u.email === 'ana.lopez@example.com')!;
  const adminUser = users.find((u) => u.email === 'admin@example.com')!;
  const regularUsers = users.filter((u) => u.role !== 'ADMIN');

  // Real consejos from the community (src/data/consejos-extraidos), spread over the last year.
  const adviceExamples = (
    await import('../src/data/consejos-extraidos/consejos.json', { with: { type: 'json' } })
  ).default
    .slice(0, 60)
    .map((consejo: { content: string; tags: string[] }) => consejo);
  const DAY = 86_400_000;
  const advice = await Promise.all(
    adviceExamples.map((consejo: { content: string; tags: string[] }, i: number) =>
      prisma.advice.create({
        data: {
          content: consejo.content,
          tags: i % 3 === 0 ? consejo.tags.slice(0, 1) : [],
          authorId: users[(i * 7) % users.length].id,
          createdAt: new Date(Date.now() - ((i * 37) % 365) * DAY - (i % 24) * 3_600_000),
        },
      }),
    ),
  );

  await Promise.all(
    advice.map(async (advice) => {
      for (const user of users) {
        if (user.id === advice.authorId) continue;

        const likeProbability = Math.random();

        if (user.email === 'user@example.com' && likeProbability < 0.6) {
          await prisma.like.create({
            data: { userId: user.id, adviceId: advice.id },
          });
        } else if (user.email === 'maria.garcia@example.com' && likeProbability < 0.4) {
          await prisma.like.create({
            data: { userId: user.id, adviceId: advice.id },
          });
        } else if (likeProbability < 0.2) {
          await prisma.like.create({
            data: { userId: user.id, adviceId: advice.id },
          });
        }
      }
    }),
  );

  // A year of meetups: past editions with photos, a few coming up, some online.
  const EVENT_SEEDS = [
    {
      name: 'Meetup de desarrollo',
      daysFromNow: -330,
      online: false,
      about: 'Charlas relámpago de la comunidad sobre lo que estamos construyendo.',
    },
    {
      name: 'Taller de Git y GitHub desde cero',
      daysFromNow: -290,
      online: false,
      about: 'Ramas, pull requests y cómo colaborar en un proyecto open source.',
    },
    {
      name: 'Café virtual: primer trabajo en tecnología',
      daysFromNow: -240,
      online: true,
      about: 'Charla abierta sobre CV, entrevistas y cómo conseguir la primera experiencia.',
    },
    {
      name: 'Lightning Talks de otoño',
      daysFromNow: -180,
      online: false,
      about: 'Cinco minutos por charla: testing, IA, bases de datos y más.',
    },
    {
      name: 'Workshop de Docker para principiantes',
      daysFromNow: -120,
      online: false,
      about: 'Contenedores, imágenes y docker compose con un proyecto real.',
    },
    {
      name: 'Café virtual: agentes de IA en el día a día',
      daysFromNow: -60,
      online: true,
      about: 'Cómo usamos Claude Code, Cursor y Codex en proyectos reales.',
    },
    {
      name: 'Hackatón PCN',
      daysFromNow: -21,
      online: false,
      about: 'Un fin de semana para construir algo en equipo y presentarlo.',
    },
    {
      name: 'Meetup de arquitectura de software',
      daysFromNow: 10,
      online: false,
      about: 'Monolitos modulares, colas y cuándo conviene separar servicios.',
    },
    {
      name: 'Café virtual: system design para entrevistas',
      daysFromNow: 24,
      online: true,
      about: 'Practicamos un ejercicio de diseño de sistemas en vivo.',
    },
    {
      name: 'Dev Meetup de fin de año',
      daysFromNow: 70,
      online: false,
      about: 'Cerramos el año con charlas, premios y pizza.',
    },
  ];
  const eventResults = await Promise.all(
    EVENT_SEEDS.map(async ({ name, daysFromNow, online, about }, index) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + daysFromNow);
        startDate.setHours(19, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(startDate.getHours() + 3);

        const includePhotos = daysFromNow < 0 && !online;

        return prisma.event.create({
          data: {
            name,
            flyerImages: ['/events/Lightning talks flyer.webp'],
            description: `${about}\n\nEdición número ${index + 1} de los encuentros de la comunidad.`,
            date: startDate,
            endDate: endDate,
            isOnline: online,
            streamingUrl: online ? 'https://meet.google.com/pcn-cafe' : null,
            city: online ? null : 'San Miguel de Tucumán',
            address: online ? null : 'Bernardino Rivadavia 1050',
            placeName: online ? null : 'UTN-FRT',
            googleMapsUrl: online ? null : 'https://www.google.com/maps?q=-26.844408,-65.22264',
            galleryItems: {
              create: includePhotos
                ? Array.from({ length: 3 }).map(() => ({
                    src: '/events/Lightning talks flyer.webp',
                    thumbSrc: '/events/Lightning talks flyer.webp',
                    takenAt: startDate,
                  }))
                : [],
            },
          },
        });
      } catch (error) {
        console.error(`Failed to create event ${name}`, error);
        return null;
      }
    }),
  );

  const events = eventResults.filter((e): e is NonNullable<typeof e> => e !== null);

  // The latest past edition and the next two, which the rest of the seed hangs data off.
  const byName = (name: string) => events.find((event) => event.name === name)!;
  const [pastEvent, futureEvent, onlineEvent] = await Promise.all([
    prisma.event.update({
      where: { id: byName('Hackatón PCN').id },
      data: { callForSpeakersEnabled: true, capacity: 80 },
    }),
    prisma.event.update({
      where: { id: byName('Meetup de arquitectura de software').id },
      data: { callForSpeakersEnabled: true, capacity: 100 },
    }),
    prisma.event.update({
      where: { id: byName('Café virtual: system design para entrevistas').id },
      data: { capacity: 300 },
    }),
  ]);

  for (const event of [pastEvent, futureEvent, onlineEvent]) {
    await prisma.sponsor.createMany({
      data: [
        { eventId: event.id, name: 'TechCorp Argentina', website: 'https://example.com/techcorp' },
        { eventId: event.id, name: 'UTN-FRT', website: 'https://www.frt.utn.edu.ar' },
      ],
    });
  }

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

  await prisma.jobOffers.createMany({ data: jobOffersData });

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
    '/advice',
    '/advice/[id]',
    '/events',
    '/events/[id]',
    '/job-offers',
    '/profile',
    '/dashboard',
    '/charlas',
    '/testimonios',
    '/api/advice',
    '/api/events',
    '/api/users',
  ];

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
  ];

  const errors = await Promise.all(
    Array.from({ length: 50 }).map(async (_, i) => {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
      const isResolved = Math.random() > 0.6;
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
          stack,
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
          resolvedAt,
          resolvedBy: isResolved && adminUser ? adminUser.id : null,
          createdAt,
        },
      });
    }),
  );

  const logLevels = ['info', 'warn', 'error', 'debug'];
  const logMessages = [
    'User logged in successfully',
    'Page loaded: /advice',
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

  const logs = await Promise.all(
    Array.from({ length: 200 }).map(async () => {
      const daysAgo = Math.floor(Math.random() * 7);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));
      createdAt.setSeconds(Math.floor(Math.random() * 60));

      const user =
        Math.random() > 0.3 ? regularUsers[Math.floor(Math.random() * regularUsers.length)] : null;

      return prisma.appLog.create({
        data: {
          level: logLevels[Math.floor(Math.random() * logLevels.length)],
          message: logMessages[Math.floor(Math.random() * logMessages.length)],
          path: errorPaths[Math.floor(Math.random() * errorPaths.length)],
          userId: user?.id ?? null,
          userAgent: user ? userAgents[Math.floor(Math.random() * userAgents.length)] : null,
          ipAddress: user ? `192.168.1.${Math.floor(Math.random() * 255)}` : null,
          metadata: JSON.stringify({
            timestamp: createdAt.toISOString(),
            sessionId: `session_${Math.random().toString(36).substring(7)}`,
            additionalInfo: Math.random() > 0.5 ? { action: 'click', element: 'button' } : null,
          }),
          createdAt,
        },
      });
    }),
  );

  const defaultSpeaker = (user: (typeof users)[0], phone: string): SpeakerSeedData => ({
    userId: user.id,
    speakerName: user.name,
    speakerPhone: phone,
    isProfessional: true,
    jobTitle: 'Desarrollador',
    enterprise: 'programaConNosotros',
  });

  const acceptedProposal = await prisma.talkProposal.create({
    data: {
      eventId: pastEvent.id,
      userId: maria.id,
      title: 'Introducción a TypeScript en proyectos reales',
      description:
        'Repaso de tipos, generics y patrones útiles para migrar código JavaScript a TypeScript sin fricción.',
      status: TalkProposalStatus.ACCEPTED,
      speakers: {
        create: mapSpeakers([defaultSpeaker(maria, '5493815000001')]),
      },
    },
    include: { speakers: { orderBy: { order: 'asc' } } },
  });

  await prisma.talk.create({
    data: {
      eventId: acceptedProposal.eventId,
      proposalId: acceptedProposal.id,
      title: acceptedProposal.title,
      description: acceptedProposal.description,
      order: 0,
      portraitUrl: '/events/Lightning talks flyer.webp',
      slideImages: ['/events/Lightning talks flyer.webp'],
      speakers: {
        create: mapSpeakers(
          acceptedProposal.speakers.map((s) => ({
            userId: s.userId,
            speakerName: s.speakerName,
            speakerPhone: s.speakerPhone,
            isProfessional: s.isProfessional,
            jobTitle: s.jobTitle,
            enterprise: s.enterprise,
            isStudent: s.isStudent,
            career: s.career,
            studyPlace: s.studyPlace,
            order: s.order,
          })),
        ),
      },
    },
  });

  await prisma.talkProposal.create({
    data: {
      eventId: futureEvent.id,
      userId: juan.id,
      title: 'Testing en frontend con Vitest y Testing Library',
      description:
        'Cómo escribir tests unitarios y de integración para componentes React de forma práctica.',
      status: TalkProposalStatus.PENDING,
      speakers: {
        create: mapSpeakers([defaultSpeaker(juan, '5493815000002')]),
      },
    },
  });

  await prisma.talkProposal.create({
    data: {
      eventId: futureEvent.id,
      userId: ana.id,
      title: 'Microservicios: cuándo sí y cuándo no',
      description:
        'Lecciones aprendidas al escalar una app monolítica y cuándo conviene dividirla.',
      status: TalkProposalStatus.REJECTED,
      speakers: {
        create: mapSpeakers([defaultSpeaker(ana, '5493815000003')]),
      },
    },
  });

  await prisma.talk.create({
    data: {
      eventId: onlineEvent.id,
      title: 'Server Components en Next.js 15',
      description:
        'Diferencias entre client y server components, streaming y patrones de data fetching.',
      order: 0,
      portraitUrl: '/events/Lightning talks flyer.webp',
      slidesUrl: 'https://example.com/slides/nextjs-rsc',
      slideImages: ['/events/Lightning talks flyer.webp'],
      speakers: {
        create: mapSpeakers([defaultSpeaker(adminUser, '5493815000004')]),
      },
    },
  });

  await prisma.talk.create({
    data: {
      eventId: pastEvent.id,
      title: 'Pair programming en equipos remotos',
      description:
        'Herramientas, dinámicas y acuerdos de equipo para programar en pareja a distancia.',
      order: 1,
      speakers: {
        create: mapSpeakers([
          defaultSpeaker(john, '5493815000005'),
          {
            speakerName: 'Carlos Mentor',
            speakerPhone: '5493815000006',
            isProfessional: true,
            jobTitle: 'Tech Lead',
            enterprise: 'RemoteDev',
            order: 1,
          },
        ]),
      },
    },
  });

  await prisma.talk.create({
    data: {
      eventId: null,
      title: 'Carrera en tecnología: primeros pasos',
      description:
        'Charla abierta sobre cómo empezar en programación, comunidades locales y recursos gratuitos.',
      manualEventTitle: 'Charla abierta PCN',
      manualEventDate: new Date('2026-01-15T12:00:00.000Z'),
      manualEventLocation: 'Online',
      order: 0,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      speakers: {
        create: mapSpeakers([
          {
            speakerName: 'Invitado PCN',
            speakerPhone: '5493815000007',
            isStudent: true,
            career: 'Ingeniería en Sistemas',
            studyPlace: 'UTN-FRT',
          },
        ]),
      },
    },
  });

  await prisma.announcement.createMany({
    data: [
      {
        title: 'Bienvenidos a programaConNosotros',
        content:
          'Esta es la plataforma de la comunidad. Explorá eventos, charlas, consejos y sumate a los próximos meetups.',
        category: 'general',
        pinned: true,
        published: true,
        authorId: adminUser.id,
      },
      {
        title: 'Próximo meetup abierto a propuestas',
        content:
          'Ya podés proponer charlas para el próximo evento. Revisá los requisitos en la página del evento.',
        category: 'evento',
        pinned: true,
        published: true,
        authorId: adminUser.id,
        eventId: futureEvent.id,
      },
      {
        title: 'Nueva sección de charlas públicas',
        content: 'Publicamos las charlas de ediciones anteriores y eventos online en /charlas.',
        category: 'noticia',
        pinned: false,
        published: true,
        authorId: adminUser.id,
      },
      {
        title: 'Mantenimiento programado',
        content:
          'El domingo de 02:00 a 04:00 (ART) puede haber interrupciones breves por actualización de infraestructura.',
        category: 'importante',
        pinned: false,
        published: true,
        authorId: adminUser.id,
      },
      {
        title: 'Actualización de políticas de la comunidad',
        content:
          'Actualizamos las normas de convivencia y el código de conducta en eventos presenciales.',
        category: 'actualizacion',
        pinned: false,
        published: true,
        authorId: adminUser.id,
      },
      {
        title: 'Borrador: calendario 2026',
        content:
          'Lista preliminar de fechas tentativas para meetups trimestrales (no publicar aún).',
        category: 'general',
        pinned: false,
        published: false,
        authorId: adminUser.id,
      },
    ],
  });

  await prisma.testimonial.createMany({
    data: [
      {
        body: 'PCN me ayudó a dar mis primeros pasos en programación y conocer gente con la misma pasión.',
        userId: john.id,
        featured: true,
      },
      {
        body: 'Los eventos son muy accesibles y siempre aprendo algo nuevo, sea presencial u online.',
        userId: maria.id,
        featured: true,
      },
      {
        body: 'La comunidad es un espacio seguro para preguntar y compartir experiencias sin miedo.',
        userId: juan.id,
        featured: true,
      },
      {
        body: 'Gracias a los meetups conseguí mi primer trabajo en IT.',
        userId: ana.id,
        featured: false,
      },
    ],
  });

  // A few forum threads with replies; the categories come from their migration.
  const FORUM_THREADS = [
    {
      category: 'forum-cat-ayuda',
      author: juan,
      title: '¿Cómo organizan un monorepo con pnpm?',
      content:
        'Estoy armando un monorepo con **pnpm workspaces** y no sé si sumar Turborepo.\n\n- ¿Qué usan para cachear builds?\n- ¿Cómo comparten el `tsconfig`?',
      replies: [
        { author: maria, content: 'Turborepo con remote cache nos bajó mucho los tiempos de CI.' },
        {
          author: john,
          content:
            'Para el tsconfig: un paquete `config` con un `tsconfig.base.json` y cada app lo extiende.',
        },
      ],
    },
    {
      category: 'forum-cat-carrera',
      author: users[6],
      title: 'Primer trabajo: ¿proyectos propios o open source?',
      content: 'Estoy en primer año y quiero armar un portfolio. ¿Qué pesa más en una entrevista?',
      replies: [
        {
          author: users[11],
          content:
            'Un proyecto propio terminado y deployado, contado bien, vale más que diez a medias.',
        },
      ],
    },
    {
      category: 'forum-cat-proyectos',
      author: users[7],
      title: 'Hice un design system con Tailwind, ¿feedback?',
      content:
        'Lo armé para mis clientes freelance: tokens, componentes y docs. Se aceptan críticas 🙌',
      replies: [],
    },
    {
      category: 'forum-cat-recursos',
      author: ana,
      title: 'Recursos para aprender testing de verdad',
      content:
        '> Si no tiene tests, no está terminado.\n\nComparto lo que me sirvió: Testing JavaScript, la doc de Playwright y practicar TDD con katas.',
      replies: [{ author: users[5], content: 'Sumo el libro de Kent Beck, TDD by Example.' }],
    },
  ];
  for (const [index, thread] of FORUM_THREADS.entries()) {
    const createdAt = new Date(Date.now() - (FORUM_THREADS.length - index) * 3 * 86_400_000);
    await prisma.forumPost.create({
      data: {
        title: thread.title,
        content: thread.content,
        categoryId: thread.category,
        authorId: thread.author.id,
        isPinned: index === 0,
        createdAt,
        activeAt: createdAt,
        comments: {
          create: thread.replies.map((reply) => ({
            authorId: reply.author.id,
            content: reply.content,
          })),
        },
        likes: { create: users.slice(0, index + 2).map((user) => ({ userId: user.id })) },
      },
    });
  }

  await prisma.eventRegistration.createMany({
    data: [
      { eventId: pastEvent.id, userId: john.id },
      { eventId: pastEvent.id, userId: maria.id },
      { eventId: futureEvent.id, userId: juan.id },
      { eventId: futureEvent.id, userId: ana.id },
      { eventId: onlineEvent.id, userId: john.id },
      {
        eventId: futureEvent.id,
        userId: john.id,
        cancelledAt: new Date(),
      },
    ],
  });

  const commentTexts = [
    '¡Totalmente de acuerdo!',
    'Me pasó lo mismo el año pasado.',
    'Gracias por compartir esto.',
    'Muy buen consejo.',
    'Lo voy a aplicar en mi próximo proyecto.',
    '¿Tenés algún recurso para profundizar?',
    'Excelente perspectiva.',
    'Esto debería estar pinned.',
    'Lo comparto con mi equipo.',
    '100% real.',
  ];

  const topAdvice = advice.slice(0, 10);
  const createdComments = await Promise.all(
    topAdvice.map((advice, i) =>
      prisma.comment.create({
        data: {
          content: commentTexts[i],
          authorId: users[i % regularUsers.length].id,
          adviceId: advice.id,
        },
      }),
    ),
  );

  await prisma.comment.create({
    data: {
      content: '¡Gracias! Me alegra que te sirva.',
      authorId: topAdvice[0].authorId,
      adviceId: topAdvice[0].id,
      parentCommentId: createdComments[0].id,
    },
  });

  await prisma.userLanguage.createMany({
    data: [
      {
        userId: john.id,
        language: 'typescript',
        color: '#0D1B2A',
        logo: '/language-logo/typescript-icon-svgrepo-com.webp',
      },
      {
        userId: john.id,
        language: 'javascript',
        color: '#F7DF1E',
        logo: '/language-logo/javascript-svgrepo-com.webp',
      },
      {
        userId: john.id,
        language: 'python',
        color: '#1C3D6B',
        logo: '/language-logo/python-svgrepo-com.webp',
      },
      {
        userId: maria.id,
        language: 'typescript',
        color: '#0D1B2A',
        logo: '/language-logo/typescript-icon-svgrepo-com.webp',
      },
      {
        userId: maria.id,
        language: 'python',
        color: '#1C3D6B',
        logo: '/language-logo/python-svgrepo-com.webp',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        type: 'testimonial_created',
        title: 'Nuevo testimonio',
        message: `${john.name} publicó un testimonio`,
        userId: adminUser.id,
        metadata: JSON.stringify({ userId: john.id, testimonialUserId: john.id }),
      },
      {
        type: 'talk_proposal_created',
        title: 'Nueva propuesta de charla',
        message: `${juan.name} propuso una charla para "${futureEvent.name}"`,
        userId: adminUser.id,
        metadata: JSON.stringify({ eventId: futureEvent.id, eventName: futureEvent.name }),
      },
      {
        type: 'event_registration_created',
        title: 'Nueva inscripción',
        message: `${ana.name} se inscribió a "${futureEvent.name}"`,
        userId: adminUser.id,
        metadata: JSON.stringify({ eventId: futureEvent.id, userId: ana.id }),
      },
      {
        type: 'event_registration_cancelled',
        title: 'Inscripción cancelada',
        message: `${john.name} canceló su inscripción a "${futureEvent.name}"`,
        userId: adminUser.id,
        metadata: JSON.stringify({ eventId: futureEvent.id, userId: john.id }),
      },
      {
        type: 'testimonial_updated',
        title: 'Testimonio actualizado',
        message: `${maria.name} actualizó su testimonio`,
        userId: adminUser.id,
        read: true,
        metadata: JSON.stringify({ userId: maria.id }),
      },
    ],
  });

  // Projects, in the order an admin curated them; the last ones have collaborators without
  // an account.
  const projectsData = [
    {
      title: 'PCN Website',
      description:
        'El sitio de la comunidad: eventos, charlas, cursos, lecturas y PCN OS, un escritorio en el navegador.',
      url: 'https://github.com/programaconnosotros/pcn-website',
      logoUrl: '/software-logos/github.webp',
      techStack: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind'],
      repoUrl: 'https://github.com/programaconnosotros/pcn-website',
      author: adminUser,
      members: [regularUsers[0], regularUsers[1]],
    },
    {
      title: 'Turnos UTN',
      description:
        'Reservá turnos de consulta con docentes sin grupos de WhatsApp: calendario, avisos por mail y lista de espera.',
      url: 'https://example.com',
      logoUrl: '/software-logos/vim.svg',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      author: regularUsers[1],
      members: [regularUsers[2]],
    },
    {
      title: 'Bot de ofertas laborales',
      description:
        'Un bot que junta ofertas de trabajo IT de varias fuentes, las filtra por seniority y las publica en el grupo.',
      url: 'https://github.com/programaconnosotros',
      logoUrl: '',
      techStack: ['Python', 'PostgreSQL'],
      author: regularUsers[2],
      members: [],
    },
  ];

  for (const [order, project] of projectsData.entries()) {
    await prisma.project.create({
      data: {
        title: project.title,
        description: project.description,
        url: project.url,
        logoUrl: project.logoUrl,
        techStack: project.techStack,
        isOpenSource: 'repoUrl' in project,
        repoUrl: 'repoUrl' in project ? project.repoUrl : null,
        order,
        authorId: project.author.id,
        members: {
          create: [
            ...project.members.map((member, index) => ({
              userId: member.id,
              memberName: member.name,
              order: index,
            })),
            { memberName: 'Invitada sin cuenta', order: project.members.length },
          ],
        },
      },
    });
  }

  const visitPaths = ['/charlas', '/eventos', '/testimonios', '/advice', '/job-offers'];
  await prisma.pageVisit.createMany({
    data: Array.from({ length: 30 }).map(() => {
      const user =
        Math.random() > 0.4 ? regularUsers[Math.floor(Math.random() * regularUsers.length)] : null;
      return {
        path: visitPaths[Math.floor(Math.random() * visitPaths.length)],
        userId: user?.id ?? null,
        ipAddress: `10.0.0.${Math.floor(Math.random() * 255)}`,
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        referer: Math.random() > 0.5 ? 'https://google.com' : null,
      };
    }),
  });

  console.log('Seed data created successfully!');
  console.log(`Created ${events.length} events`);
  console.log(`Created ${advice.length} advice`);
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
