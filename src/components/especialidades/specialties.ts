import {
  BarChart3,
  Brain,
  Briefcase,
  Building2,
  ClipboardList,
  Cloud,
  Coins,
  Gamepad2,
  Globe,
  Layers,
  Network,
  Palette,
  Server,
  Shield,
  Smartphone,
  Tablet,
  TestTube,
  UserCog,
  type LucideIcon,
} from 'lucide-react';

export type SpecialtyListItem = string | { label: string; description: string };

export interface Specialty {
  id: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  sections: { heading: string; items: SpecialtyListItem[] }[];
  idealFor: string;
}

export interface SpecialtyGroup {
  id: string;
  title: string;
  description: string;
  specialties: Specialty[];
}

export const specialtyGroups: SpecialtyGroup[] = [
  {
    id: 'desarrollo',
    title: 'Desarrollo',
    description:
      'Construir productos: interfaces, servidores, apps móviles y experiencias interactivas.',
    specialties: [
      {
        id: 'web-frontend',
        title: 'Web Frontend Development',
        icon: Globe,
        summary:
          'El desarrollo frontend web se enfoca en crear la parte visual e interactiva de las aplicaciones web que los usuarios ven y con la que interactúan directamente en navegadores.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'HTML, CSS y JavaScript',
              'Frameworks modernos: React, Vue.js, Angular, Svelte',
              'TypeScript para desarrollo tipado',
              'Herramientas de build: Webpack, Vite, Next.js',
              'CSS moderno: Tailwind CSS, Sass, Styled Components',
              'Progressive Web Apps (PWA)',
            ],
          },
        ],
        idealFor:
          'Para personas creativas que disfrutan diseñar interfaces web, trabajar con UX/UI, y ver resultados visuales inmediatos de su trabajo en navegadores.',
      },
      {
        id: 'backend',
        title: 'Backend Development',
        icon: Server,
        summary:
          'El desarrollo backend se encarga de la lógica del servidor, bases de datos, APIs y toda la infraestructura que permite que las aplicaciones funcionen correctamente.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'Lenguajes: Java, Python, Node.js, Go, Rust, C#',
              'Frameworks: Express, Django, Spring Boot, FastAPI, NestJS',
              'Bases de datos: PostgreSQL, MySQL, MongoDB, Redis',
              'APIs REST y GraphQL',
              'Autenticación y seguridad',
            ],
          },
        ],
        idealFor:
          'Para personas que disfrutan resolver problemas complejos, trabajar con lógica de negocio, optimización de rendimiento y arquitectura de sistemas.',
      },
      {
        id: 'fullstack',
        title: 'Full Stack Development',
        icon: Layers,
        summary:
          'Los desarrolladores full stack tienen conocimientos tanto de frontend como de backend, permitiéndoles trabajar en todas las capas de una aplicación.',
        sections: [
          {
            heading: 'Ventajas',
            items: [
              'Mayor versatilidad y oportunidades laborales',
              'Capacidad de crear aplicaciones completas de principio a fin',
              'Mejor comprensión del sistema completo',
              'Ideal para startups y proyectos pequeños',
            ],
          },
        ],
        idealFor:
          'Para desarrolladores que disfrutan aprender constantemente y trabajar en diferentes aspectos de una aplicación.',
      },
      {
        id: 'ios-mobile',
        title: 'iOS Mobile Development',
        icon: Smartphone,
        summary:
          'El desarrollo iOS se enfoca en crear aplicaciones nativas para dispositivos Apple (iPhone, iPad) utilizando las herramientas y frameworks específicos de la plataforma.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'Swift y Objective-C',
              'Frameworks: SwiftUI, UIKit',
              'Xcode como IDE principal',
              'Core Data para persistencia',
              'ARKit para realidad aumentada',
              'TestFlight para distribución beta',
              'App Store Connect para publicación',
            ],
          },
        ],
        idealFor:
          'Para desarrolladores interesados en crear aplicaciones nativas para el ecosistema Apple, aprovechando las características únicas de iOS y macOS.',
      },
      {
        id: 'android-mobile',
        title: 'Android Mobile Development',
        icon: Smartphone,
        summary:
          'El desarrollo Android se enfoca en crear aplicaciones nativas para dispositivos Android utilizando las herramientas y frameworks específicos de la plataforma.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'Kotlin y Java',
              'Frameworks: Jetpack Compose, Android Views',
              'Android Studio como IDE principal',
              'Room para persistencia de datos',
              'Material Design para UI',
              'Google Play Console para publicación',
              'Firebase para servicios backend',
            ],
          },
        ],
        idealFor:
          'Para desarrolladores interesados en crear aplicaciones para la plataforma Android más utilizada del mundo, con gran flexibilidad y personalización.',
      },
      {
        id: 'mobile-development',
        title: 'Mobile Development (Cross-Platform)',
        icon: Tablet,
        summary:
          'El desarrollo móvil cross-platform permite crear aplicaciones que funcionan en múltiples plataformas (iOS y Android) usando un solo código base, reduciendo tiempo y costos de desarrollo.',
        sections: [
          {
            heading: 'Frameworks principales',
            items: [
              {
                label: 'React Native',
                description:
                  'Framework basado en React, permite desarrollo con JavaScript/TypeScript',
              },
              {
                label: 'Expo',
                description:
                  'Plataforma y herramientas para React Native que simplifica el desarrollo',
              },
              {
                label: 'Flutter',
                description:
                  'Framework de Google usando Dart, con excelente rendimiento y UI nativa',
              },
              {
                label: 'Ionic',
                description: 'Framework basado en web technologies (HTML, CSS, JS)',
              },
              { label: 'Xamarin', description: 'Framework de Microsoft usando C# y .NET' },
            ],
          },
          {
            heading: 'Ventajas del desarrollo cross-platform',
            items: [
              'Un solo código base para múltiples plataformas',
              'Desarrollo más rápido y económico',
              'Mantenimiento simplificado',
              'Acceso a APIs nativas cuando es necesario',
              'Hot reload para desarrollo ágil',
            ],
          },
        ],
        idealFor:
          'Para desarrolladores que quieren crear aplicaciones móviles para múltiples plataformas de manera eficiente, aprovechando frameworks modernos que permiten compartir código entre iOS y Android.',
      },
      {
        id: 'game-dev',
        title: 'Game Development',
        icon: Gamepad2,
        summary:
          'El desarrollo de videojuegos combina programación, diseño, arte y narrativa para crear experiencias interactivas y entretenidas.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'Motores: Unity (C#), Unreal Engine (C++), Godot',
              'Lenguajes: C++, C#, JavaScript',
              'Física y matemáticas aplicadas',
              'Gráficos 3D y shaders',
              'Audio y música',
              'Game design y mecánicas de juego',
            ],
          },
        ],
        idealFor:
          'Para personas creativas que disfrutan combinar programación con arte, diseño y narrativa para crear experiencias inmersivas.',
      },
      {
        id: 'blockchain',
        title: 'Blockchain & Web3',
        icon: Coins,
        summary:
          'El desarrollo blockchain se enfoca en crear aplicaciones descentralizadas (dApps), smart contracts y sistemas basados en tecnología blockchain.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'Blockchains: Ethereum, Solana, Polygon',
              'Smart Contracts: Solidity, Rust',
              'Web3: Web3.js, Ethers.js',
              'DeFi y NFTs',
              'Criptografía y seguridad',
              'Desarrollo de wallets y DEXs',
            ],
          },
        ],
        idealFor:
          'Para desarrolladores interesados en tecnología descentralizada, criptografía y crear aplicaciones que operen sin intermediarios.',
      },
    ],
  },
  {
    id: 'datos-e-ia',
    title: 'Datos e inteligencia artificial',
    description: 'Convertir datos en conocimiento y construir sistemas que aprenden.',
    specialties: [
      {
        id: 'data-science',
        title: 'Data Science & Analytics',
        icon: BarChart3,
        summary:
          'La ciencia de datos se enfoca en extraer conocimiento y insights valiosos de grandes volúmenes de datos mediante análisis estadístico, machine learning y visualización.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'Python: Pandas, NumPy, Scikit-learn',
              'R para análisis estadístico',
              'SQL y bases de datos analíticas',
              'Visualización: Matplotlib, Seaborn, Tableau, Power BI',
              'Big Data: Spark, Hadoop',
              'Jupyter Notebooks para análisis exploratorio',
            ],
          },
        ],
        idealFor:
          'Para personas con interés en matemáticas, estadística y encontrar patrones en datos para tomar decisiones basadas en evidencia.',
      },
      {
        id: 'machine-learning',
        title: 'Machine Learning & AI',
        icon: Brain,
        summary:
          'El machine learning y la inteligencia artificial se enfocan en crear sistemas que pueden aprender y tomar decisiones de forma autónoma.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'Frameworks: TensorFlow, PyTorch, Scikit-learn',
              'Deep Learning: Redes neuronales, CNNs, RNNs, Transformers',
              'NLP: Procesamiento de lenguaje natural',
              'Computer Vision: Reconocimiento de imágenes',
              'MLOps: Despliegue y mantenimiento de modelos',
              'Python como lenguaje principal',
            ],
          },
        ],
        idealFor:
          'Para personas con fuerte base matemática, interés en algoritmos complejos y crear sistemas inteligentes que resuelvan problemas reales.',
      },
    ],
  },
  {
    id: 'infraestructura-y-seguridad',
    title: 'Infraestructura y seguridad',
    description: 'Mantener los sistemas corriendo, escalando y protegidos.',
    specialties: [
      {
        id: 'devops',
        title: 'DevOps & Cloud Engineering',
        icon: Cloud,
        summary:
          'DevOps combina desarrollo y operaciones para automatizar y optimizar el ciclo de vida del software, desde el desarrollo hasta el despliegue y mantenimiento.',
        sections: [
          {
            heading: 'Tecnologías principales',
            items: [
              'Contenedores: Docker, Kubernetes',
              'CI/CD: GitHub Actions, Jenkins, GitLab CI',
              'Cloud: AWS, Azure, Google Cloud Platform',
              'Infraestructura como código: Terraform, Ansible',
              'Monitoreo: Prometheus, Grafana, ELK Stack',
              'Linux y administración de sistemas',
            ],
          },
        ],
        idealFor:
          'Para personas interesadas en infraestructura, automatización, escalabilidad y optimización de procesos de desarrollo y despliegue.',
      },
      {
        id: 'cybersecurity',
        title: 'Cybersecurity',
        icon: Shield,
        summary:
          'La ciberseguridad se enfoca en proteger sistemas, redes y datos de amenazas y ataques cibernéticos.',
        sections: [
          {
            heading: 'Áreas principales',
            items: [
              'Penetration Testing y Ethical Hacking',
              'Seguridad de aplicaciones (AppSec)',
              'Análisis de vulnerabilidades',
              'Forensics digital',
              'Seguridad de redes',
              'Compliance y auditorías de seguridad',
            ],
          },
        ],
        idealFor:
          'Para personas con mentalidad de resolver puzzles, interés en encontrar y prevenir vulnerabilidades, y proteger información sensible.',
      },
      {
        id: 'networking',
        title: 'Networking & Infrastructure',
        icon: Network,
        summary:
          'El networking y la infraestructura se enfocan en diseñar, implementar y mantener redes de computadoras y sistemas de comunicación que permiten la conectividad y transferencia de datos.',
        sections: [
          {
            heading: 'Áreas principales',
            items: [
              'Protocolos de red: TCP/IP, HTTP/HTTPS, DNS',
              'Configuración de routers, switches y firewalls',
              'Redes inalámbricas: Wi-Fi, Bluetooth, 5G',
              'Seguridad de red: VPNs, firewalls, IDS/IPS',
              'Cloud networking: VPCs, CDNs, load balancers',
              'Monitoreo y troubleshooting de redes',
              'Certificaciones: CCNA, CCNP, Network+',
            ],
          },
        ],
        idealFor:
          'Para personas interesadas en cómo funcionan las comunicaciones digitales, la infraestructura de red y asegurar la conectividad y seguridad de los sistemas.',
      },
    ],
  },
  {
    id: 'calidad-y-diseno',
    title: 'Calidad y diseño',
    description: 'Asegurar que el software funcione bien y sea agradable de usar.',
    specialties: [
      {
        id: 'qa',
        title: 'QA & Testing',
        icon: TestTube,
        summary:
          'El Quality Assurance se enfoca en asegurar que el software funcione correctamente, encontrando y reportando bugs antes de que lleguen a producción.',
        sections: [
          {
            heading: 'Tipos de testing',
            items: [
              'Testing manual y automatizado',
              'Unit testing, integration testing, E2E testing',
              'Herramientas: Selenium, Cypress, Jest, Playwright',
              'Performance testing',
              'Security testing',
              'Test-driven development (TDD)',
            ],
          },
        ],
        idealFor:
          'Para personas detallistas, con ojo crítico para encontrar problemas y asegurar la calidad del software.',
      },
      {
        id: 'ui-ux-design',
        title: 'UI/UX Design',
        icon: Palette,
        summary:
          'El diseño UI/UX se enfoca en crear interfaces de usuario intuitivas, atractivas y funcionales que proporcionen una excelente experiencia de usuario.',
        sections: [
          {
            heading: 'Áreas principales',
            items: [
              'Diseño de interfaces (UI): Visual, layout, tipografía, color',
              'Experiencia de usuario (UX): Research, wireframes, prototipos',
              'Herramientas: Figma, Sketch, Adobe XD, Framer',
              'Design Systems y componentes reutilizables',
              'Prototipado interactivo',
              'Testing de usabilidad',
              'Accesibilidad y diseño inclusivo',
            ],
          },
        ],
        idealFor:
          'Para personas creativas con sentido estético, empatía por los usuarios y pasión por crear experiencias digitales intuitivas y agradables.',
      },
    ],
  },
  {
    id: 'liderazgo-y-gestion',
    title: 'Liderazgo y gestión',
    description: 'Guiar equipos, proyectos y decisiones técnicas a gran escala.',
    specialties: [
      {
        id: 'project-management',
        title: 'Project Management',
        icon: ClipboardList,
        summary:
          'La gestión de proyectos se enfoca en planificar, organizar y ejecutar proyectos de software de manera eficiente, asegurando que se completen a tiempo, dentro del presupuesto y con la calidad esperada.',
        sections: [
          {
            heading: 'Metodologías y herramientas',
            items: [
              'Metodologías ágiles: Scrum, Kanban, SAFe',
              'Herramientas: Jira, Trello, Asana, Monday.com',
              'Gestión de recursos y presupuestos',
              'Planificación y estimación de tareas',
              'Gestión de riesgos y stakeholders',
              'Comunicación y coordinación de equipos',
              'Certificaciones: PMP, CSM, PMI-ACP',
            ],
          },
        ],
        idealFor:
          'Para personas organizadas, con habilidades de comunicación y liderazgo, que disfrutan coordinar equipos y asegurar que los proyectos se completen exitosamente.',
      },
      {
        id: 'tech-lead',
        title: 'Tech Lead',
        icon: UserCog,
        summary:
          'Un Tech Lead es un desarrollador senior que combina habilidades técnicas profundas con liderazgo, guiando al equipo en decisiones técnicas y arquitectónicas mientras sigue programando activamente.',
        sections: [
          {
            heading: 'Responsabilidades principales',
            items: [
              'Diseño de arquitectura y decisiones técnicas',
              'Code reviews y mentoring de desarrolladores',
              'Resolución de problemas técnicos complejos',
              'Coordinación técnica entre equipos',
              'Balance entre desarrollo y liderazgo',
              'Establecimiento de estándares y mejores prácticas',
              'Comunicación técnica con stakeholders',
            ],
          },
        ],
        idealFor:
          'Para desarrolladores senior que quieren liderar técnicamente sin dejar de programar, combinando expertise técnico con habilidades de mentoría y comunicación.',
      },
      {
        id: 'engineering-management',
        title: 'Engineering Management',
        icon: Briefcase,
        summary:
          'La gestión de ingeniería se enfoca en liderar equipos de desarrollo, gestionar recursos, establecer procesos y estrategias técnicas, y asegurar que los equipos entreguen software de calidad.',
        sections: [
          {
            heading: 'Responsabilidades principales',
            items: [
              'Gestión de equipos de ingeniería',
              'Reclutamiento y desarrollo de talento',
              'Planificación estratégica técnica',
              'Establecimiento de procesos y cultura de ingeniería',
              'Gestión de presupuestos y recursos',
              'Comunicación con otros departamentos',
              'Métricas y KPIs de ingeniería',
            ],
          },
        ],
        idealFor:
          'Para ingenieros con experiencia que quieren transicionar a roles de gestión, liderando equipos y estrategias técnicas mientras mantienen conexión con el desarrollo.',
      },
      {
        id: 'software-architect',
        title: 'Software Architect',
        icon: Building2,
        summary:
          'La arquitectura de software se enfoca en diseñar la estructura, organización y patrones fundamentales de sistemas de software complejos, asegurando escalabilidad, mantenibilidad y calidad técnica.',
        sections: [
          {
            heading: 'Responsabilidades principales',
            items: [
              'Diseño de arquitectura de sistemas complejos',
              'Definición de patrones y estándares arquitectónicos',
              'Evaluación de tecnologías y frameworks',
              'Arquitectura orientada a servicios (SOA, microservicios)',
              'Diseño de APIs y contratos entre sistemas',
              'Arquitectura de datos y persistencia',
              'Documentación técnica y diagramas arquitectónicos',
            ],
          },
          {
            heading: 'Patrones y estilos arquitectónicos',
            items: [
              'Arquitectura en capas (Layered Architecture)',
              'Microservicios y arquitectura distribuida',
              'Arquitectura hexagonal (Ports & Adapters)',
              'Event-Driven Architecture',
              'CQRS (Command Query Responsibility Segregation)',
              'Domain-Driven Design (DDD)',
            ],
          },
        ],
        idealFor:
          'Para desarrolladores senior con experiencia en múltiples proyectos, que disfrutan pensar en el panorama general, diseñar soluciones escalables y tomar decisiones técnicas estratégicas.',
      },
    ],
  },
];

export const specialties = specialtyGroups.flatMap((group) => group.specialties);

const specialtyIds = new Set(specialties.map((specialty) => specialty.id));
export const isSpecialtyId = (id: string) => specialtyIds.has(id);
