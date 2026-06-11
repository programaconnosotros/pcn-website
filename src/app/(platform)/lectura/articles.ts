export interface Article {
  id: string;
  title: string;
  author: string;
  source: string;
  category: string;
  description: string;
  url: string;
  avatar: string;
  date: string; // ISO YYYY-MM-DD
}

export const articles: Article[] = [
  {
    id: '1',
    title: 'Loop Engineering',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description:
      'Loop engineering reemplaza los prompts manuales con sistemas autónomos que iteran hasta completar objetivos, cambiando cómo trabajamos con agentes de código.',
    url: 'https://addyosmani.com/blog/loop-engineering/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    date: '2026-06-07',
  },
  {
    id: '2',
    title: 'Agent Harness Engineering',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description:
      'Explora cómo la arquitectura que rodea a un modelo de IA (el "harness") es tan importante como el modelo mismo para construir agentes de código efectivos.',
    url: 'https://addyosmani.com/blog/agent-harness-engineering/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    date: '2026-04-19',
  },
  {
    id: '3',
    title: 'Agentic Infrastructure',
    author: 'Tom Occhino',
    source: 'vercel.com',
    category: 'Arquitectura',
    description:
      'La infraestructura agéntica permite que agentes de IA desplieguen, construyan y ejecuten software de forma autónoma, transformando cómo operan los sistemas modernos.',
    url: 'https://vercel.com/blog/agentic-infrastructure',
    avatar: 'https://github.com/tomocchino.png?size=128',
    date: '2026-04-09',
  },
  {
    id: '4',
    title: "Don't Outsource the Learning",
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description:
      'Delegar tareas a la IA sin aprender activamente genera deuda cognitiva: se gana velocidad a corto plazo pero se erosiona la comprensión profunda necesaria para crecer como ingeniero.',
    url: 'https://addyosmani.com/blog/dont-outsource-learning/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    date: '2026-05-16',
  },
  {
    id: '5',
    title: 'handoff: Move Context Between Agent Sessions',
    author: 'Matt Pocock',
    source: 'aihero.dev',
    category: 'Programación',
    description:
      'Skill que permite trasladar solo el contexto relevante de una sesión de agente a otra, manteniendo cada sesión enfocada y evitando la contaminación de contexto.',
    url: 'https://www.aihero.dev/skills-handoff',
    avatar: 'https://github.com/mattpocock.png?size=128',
    date: '2026-05-13',
  },
  {
    id: '6',
    title: 'Agent Skills',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description:
      'Un conjunto de workflows que cubren las fases del ciclo de vida del software (Define, Plan, Build, Verify, Review, Ship) para que los agentes de código no salteen las prácticas de ingeniería que aseguran calidad.',
    url: 'https://addyosmani.com/blog/agent-skills/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    date: '2026-05-03',
  },
  {
    id: '7',
    title: 'tdd: Red, Green, Refactor for Agentic Coding',
    author: 'Matt Pocock',
    source: 'aihero.dev',
    category: 'Programación',
    description:
      'Skill que guía a un agente de código por el ciclo red-green-refactor del TDD, verificando comportamiento a través de interfaces públicas en lugar de detalles de implementación.',
    url: 'https://www.aihero.dev/skills-tdd',
    avatar: 'https://github.com/mattpocock.png?size=128',
    date: '2026-04-27',
  },
  {
    id: '8',
    title: 'My 7 Phases Of AI Development',
    author: 'Matt Pocock',
    source: 'aihero.dev',
    category: 'Programación',
    description:
      'Un framework de siete fases (idea, investigación, prototipo, PRD, planificación, ejecución y QA) que describe el patrón común en workflows exitosos de desarrollo asistido por IA.',
    url: 'https://www.aihero.dev/my-7-phases-of-ai-development',
    avatar: 'https://github.com/mattpocock.png?size=128',
    date: '2026-03-16',
  },
  {
    id: '9',
    title: 'Comprehension Debt',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description:
      'La IA genera código más rápido de lo que los ingenieros pueden comprenderlo, creando una "deuda de comprensión" que las métricas tradicionales no capturan y que puede tener graves consecuencias.',
    url: 'https://addyosmani.com/blog/comprehension-debt/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    date: '2026-03-14',
  },
  {
    id: '10',
    title: 'The Factory Model',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Arquitectura',
    description:
      'Los agentes de código representan un cambio de abstracción: el desarrollador ya no escribe código directamente sino que orquesta sistemas que lo generan, elevando el pensamiento sistémico y el juicio arquitectónico.',
    url: 'https://addyosmani.com/blog/factory-model/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    date: '2026-02-25',
  },
  {
    id: '11',
    title: 'Agent-native Architectures',
    author: 'Every',
    source: 'every.to',
    category: 'Arquitectura',
    description:
      'Una guía para construir aplicaciones donde los agentes son ciudadanos de primera clase, cubriendo los patrones de diseño que hacen que los sistemas funcionen de forma confiable con IA autónoma.',
    url: 'https://every.to/guides/agent-native',
    avatar: 'https://github.com/everyinc.png?size=128',
    date: '2026-01-17',
  },
  {
    id: '12',
    title: 'The Next Two Years of Software Engineering',
    author: 'Addy Osmani',
    source: 'addyosmani.com',
    category: 'Programación',
    description:
      'Una visión de cómo la IA transformará la ingeniería de software en los próximos dos años: nuevos roles, nuevas habilidades críticas y qué fundamentos seguirán siendo irremplazables.',
    url: 'https://addyosmani.com/blog/next-two-years/',
    avatar: 'https://github.com/addyosmani.png?size=128',
    date: '2026-01-05',
  },
  {
    id: '13',
    title: 'The golden rules of agent-first product engineering',
    author: 'Jina Yoon',
    source: 'posthog.com',
    category: 'Producto',
    description:
      'Cinco principios para construir productos donde los agentes de IA son la interfaz principal y no un agregado, basados en cómo PostHog reconstruyó su arquitectura de IA dos veces.',
    url: 'https://newsletter.posthog.com/p/the-golden-rules-of-agent-first-product',
    avatar: 'https://github.com/jinayoon.png?size=128',
    date: '2026-04-08',
  },
  {
    id: '14',
    title: '24 tips for giving S-tier demos',
    author: 'Jina Yoon',
    source: 'posthog.com',
    category: 'Producto',
    description:
      '24 consejos prácticos para dar demos memorables —estructura, narrativa, preparación y creatividad— que pueden definir si un proyecto o startup despega.',
    url: 'https://newsletter.posthog.com/p/how-to-demo',
    avatar: 'https://github.com/jinayoon.png?size=128',
    date: '2026-05-28',
  },
  {
    id: '15',
    title: 'Great companies are built in hackathons',
    author: 'Ian Vanagas',
    source: 'posthog.com',
    category: 'Producto',
    description:
      'Por qué las hackathons, bien estructuradas, son motores de innovación: separarlas del trabajo diario, incluir a todos, exigir demos y dejar enviar a producción lo que funciona.',
    url: 'https://newsletter.posthog.com/p/great-companies-are-built-in-hackathons',
    avatar: 'https://github.com/ivanagas.png?size=128',
    date: '2026-04-21',
  },
  {
    id: '16',
    title: 'WTF does a product manager do? (and why engineers should care)',
    author: 'Jina Yoon',
    source: 'posthog.com',
    category: 'Producto',
    description:
      'Tres habilidades clave de product management que todo ingeniero debería adoptar: reunir contexto, crear loops de feedback y comunicar decisiones de forma accionable.',
    url: 'https://newsletter.posthog.com/p/an-engineers-guide-to-product-management',
    avatar: 'https://github.com/jinayoon.png?size=128',
    date: '2026-03-11',
  },
  {
    id: '17',
    title: 'Landing Page Hot Tips',
    author: 'Rob Hope',
    source: 'landingpagehottips.com',
    category: 'Diseño',
    description:
      '100 tips digeribles para mejorar tus landing pages: diseño, copywriting, optimización de conversión y experiencia de usuario, con ejemplos prácticos.',
    url: 'https://landingpagehottips.com/',
    avatar: 'https://github.com/robhope.png?size=128',
    date: '2026-06-11',
  },
  {
    id: '18',
    title: 'Micro Frontends',
    author: 'Cam Jackson',
    source: 'martinfowler.com',
    category: 'Arquitectura',
    description:
      'Extiende las ideas de los microservicios al frontend: aplicaciones independientes y desplegables por separado que se componen en una sola interfaz, permitiendo que cada equipo trabaje de forma autónoma sin perder una experiencia de usuario cohesiva.',
    url: 'https://martinfowler.com/articles/micro-frontends.html',
    avatar: '/lectura/cam-jackson.jpg',
    date: '2019-06-19',
  },
  {
    id: '19',
    title: 'Serverless Architectures',
    author: 'Mike Roberts',
    source: 'martinfowler.com',
    category: 'Arquitectura',
    description:
      'Una guía profunda sobre arquitecturas serverless basadas en Backend as a Service (BaaS) y Functions as a Service (FaaS): sus beneficios, como menor costo operativo y escalado automático, y sus desventajas, como el vendor lock-in.',
    url: 'https://martinfowler.com/articles/serverless.html',
    avatar: '/lectura/mike-roberts.jpg',
    date: '2018-05-22',
  },
  {
    id: '20',
    title: 'Feature Toggles (aka Feature Flags)',
    author: 'Pete Hodgson',
    source: 'martinfowler.com',
    category: 'Programación',
    description:
      'Una guía completa sobre feature toggles (feature flags): cómo modificar el comportamiento del sistema sin cambiar código, las distintas categorías de toggles, técnicas de implementación y buenas prácticas para mantenerlos en el tiempo.',
    url: 'https://martinfowler.com/articles/feature-toggles.html',
    avatar: '/lectura/pete-hodgson.png',
    date: '2017-10-09',
  },
].sort((a, b) => b.date.localeCompare(a.date));
