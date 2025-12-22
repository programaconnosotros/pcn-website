import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Heading2 } from '@/components/ui/heading-2';
import { Heading3 } from '@/components/ui/heading-3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableOfContents } from '@/components/especialidades/table-of-contents';
import {
  Globe,
  Server,
  Layers,
  Smartphone,
  Smartphone as AndroidIcon,
  Cloud,
  BarChart3,
  Brain,
  Shield,
  Gamepad2,
  TestTube,
  Coins,
  Palette,
  Network,
  ClipboardList,
  UserCog,
  Briefcase,
  Code,
  Building2,
} from 'lucide-react';

const SpecialtiesPage = () => (
  <>
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/home">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Especialidades</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="mt-4">
        <div className="mb-12 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col items-center gap-4">
            <Heading2 className="m-0 text-center">Especialidades en ingeniería de software</Heading2>
            <p className="text-center text-muted-foreground max-w-3xl">
              El mundo del software es vasto y diverso. Acá te presentamos las principales
              especialidades en las que podés enfocar tu carrera profesional.
            </p>
          </div>
        </div>
        <div className="flex gap-8">
          <TableOfContents />
          <div className="flex flex-1 flex-col items-center gap-6">
          <Card
            id="web-frontend"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Web Frontend Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El desarrollo frontend web se enfoca en crear la parte visual e interactiva de las
                aplicaciones web que los usuarios ven y con la que interactúan directamente en navegadores.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>HTML, CSS y JavaScript</li>
                  <li>Frameworks modernos: React, Vue.js, Angular, Svelte</li>
                  <li>TypeScript para desarrollo tipado</li>
                  <li>Herramientas de build: Webpack, Vite, Next.js</li>
                  <li>CSS moderno: Tailwind CSS, Sass, Styled Components</li>
                  <li>Progressive Web Apps (PWA)</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas creativas que disfrutan diseñar interfaces web, trabajar con UX/UI, y ver
                  resultados visuales inmediatos de su trabajo en navegadores.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="backend"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Backend Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El desarrollo backend se encarga de la lógica del servidor, bases de datos, APIs y
                toda la infraestructura que permite que las aplicaciones funcionen correctamente.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Lenguajes: Java, Python, Node.js, Go, Rust, C#</li>
                  <li>Frameworks: Express, Django, Spring Boot, FastAPI, NestJS</li>
                  <li>Bases de datos: PostgreSQL, MySQL, MongoDB, Redis</li>
                  <li>APIs REST y GraphQL</li>
                  <li>Autenticación y seguridad</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas que disfrutan resolver problemas complejos, trabajar con lógica de
                  negocio, optimización de rendimiento y arquitectura de sistemas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="fullstack"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Full Stack Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Los desarrolladores full stack tienen conocimientos tanto de frontend como de backend,
                permitiéndoles trabajar en todas las capas de una aplicación.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Ventajas:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Mayor versatilidad y oportunidades laborales</li>
                  <li>Capacidad de crear aplicaciones completas de principio a fin</li>
                  <li>Mejor comprensión del sistema completo</li>
                  <li>Ideal para startups y proyectos pequeños</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para desarrolladores que disfrutan aprender constantemente y trabajar en diferentes
                  aspectos de una aplicación.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="ios-mobile"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                iOS Mobile Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El desarrollo iOS se enfoca en crear aplicaciones nativas para dispositivos Apple (iPhone,
                iPad) utilizando las herramientas y frameworks específicos de la plataforma.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Swift y Objective-C</li>
                  <li>Frameworks: SwiftUI, UIKit</li>
                  <li>Xcode como IDE principal</li>
                  <li>Core Data para persistencia</li>
                  <li>ARKit para realidad aumentada</li>
                  <li>TestFlight para distribución beta</li>
                  <li>App Store Connect para publicación</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para desarrolladores interesados en crear aplicaciones nativas para el ecosistema Apple,
                  aprovechando las características únicas de iOS y macOS.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="android-mobile"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AndroidIcon className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Android Mobile Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El desarrollo Android se enfoca en crear aplicaciones nativas para dispositivos Android
                utilizando las herramientas y frameworks específicos de la plataforma.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Kotlin y Java</li>
                  <li>Frameworks: Jetpack Compose, Android Views</li>
                  <li>Android Studio como IDE principal</li>
                  <li>Room para persistencia de datos</li>
                  <li>Material Design para UI</li>
                  <li>Google Play Console para publicación</li>
                  <li>Firebase para servicios backend</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para desarrolladores interesados en crear aplicaciones para la plataforma Android más
                  utilizada del mundo, con gran flexibilidad y personalización.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="devops"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                DevOps & Cloud Engineering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                DevOps combina desarrollo y operaciones para automatizar y optimizar el ciclo de vida
                del software, desde el desarrollo hasta el despliegue y mantenimiento.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Contenedores: Docker, Kubernetes</li>
                  <li>CI/CD: GitHub Actions, Jenkins, GitLab CI</li>
                  <li>Cloud: AWS, Azure, Google Cloud Platform</li>
                  <li>Infraestructura como código: Terraform, Ansible</li>
                  <li>Monitoreo: Prometheus, Grafana, ELK Stack</li>
                  <li>Linux y administración de sistemas</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas interesadas en infraestructura, automatización, escalabilidad y
                  optimización de procesos de desarrollo y despliegue.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="data-science"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Data Science & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                La ciencia de datos se enfoca en extraer conocimiento y insights valiosos de grandes
                volúmenes de datos mediante análisis estadístico, machine learning y visualización.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Python: Pandas, NumPy, Scikit-learn</li>
                  <li>R para análisis estadístico</li>
                  <li>SQL y bases de datos analíticas</li>
                  <li>Visualización: Matplotlib, Seaborn, Tableau, Power BI</li>
                  <li>Big Data: Spark, Hadoop</li>
                  <li>Jupyter Notebooks para análisis exploratorio</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas con interés en matemáticas, estadística y encontrar patrones en datos
                  para tomar decisiones basadas en evidencia.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="machine-learning"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Machine Learning & AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El machine learning y la inteligencia artificial se enfocan en crear sistemas que
                pueden aprender y tomar decisiones de forma autónoma.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Frameworks: TensorFlow, PyTorch, Scikit-learn</li>
                  <li>Deep Learning: Redes neuronales, CNNs, RNNs, Transformers</li>
                  <li>NLP: Procesamiento de lenguaje natural</li>
                  <li>Computer Vision: Reconocimiento de imágenes</li>
                  <li>MLOps: Despliegue y mantenimiento de modelos</li>
                  <li>Python como lenguaje principal</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas con fuerte base matemática, interés en algoritmos complejos y crear
                  sistemas inteligentes que resuelvan problemas reales.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="cybersecurity"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Cybersecurity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                La ciberseguridad se enfoca en proteger sistemas, redes y datos de amenazas y ataques
                cibernéticos.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Áreas principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Penetration Testing y Ethical Hacking</li>
                  <li>Seguridad de aplicaciones (AppSec)</li>
                  <li>Análisis de vulnerabilidades</li>
                  <li>Forensics digital</li>
                  <li>Seguridad de redes</li>
                  <li>Compliance y auditorías de seguridad</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas con mentalidad de resolver puzzles, interés en encontrar y prevenir
                  vulnerabilidades, y proteger información sensible.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="game-dev"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Game Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El desarrollo de videojuegos combina programación, diseño, arte y narrativa para crear
                experiencias interactivas y entretenidas.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Motores: Unity (C#), Unreal Engine (C++), Godot</li>
                  <li>Lenguajes: C++, C#, JavaScript</li>
                  <li>Física y matemáticas aplicadas</li>
                  <li>Gráficos 3D y shaders</li>
                  <li>Audio y música</li>
                  <li>Game design y mecánicas de juego</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas creativas que disfrutan combinar programación con arte, diseño y
                  narrativa para crear experiencias inmersivas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="qa"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                QA & Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El Quality Assurance se enfoca en asegurar que el software funcione correctamente,
                encontrando y reportando bugs antes de que lleguen a producción.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tipos de testing:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Testing manual y automatizado</li>
                  <li>Unit testing, integration testing, E2E testing</li>
                  <li>Herramientas: Selenium, Cypress, Jest, Playwright</li>
                  <li>Performance testing</li>
                  <li>Security testing</li>
                  <li>Test-driven development (TDD)</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas detallistas, con ojo crítico para encontrar problemas y asegurar la
                  calidad del software.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="blockchain"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Blockchain & Web3
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El desarrollo blockchain se enfoca en crear aplicaciones descentralizadas (dApps),
                smart contracts y sistemas basados en tecnología blockchain.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Tecnologías principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Blockchains: Ethereum, Solana, Polygon</li>
                  <li>Smart Contracts: Solidity, Rust</li>
                  <li>Web3: Web3.js, Ethers.js</li>
                  <li>DeFi y NFTs</li>
                  <li>Criptografía y seguridad</li>
                  <li>Desarrollo de wallets y DEXs</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para desarrolladores interesados en tecnología descentralizada, criptografía y crear
                  aplicaciones que operen sin intermediarios.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="ui-ux-design"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                UI/UX Design
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El diseño UI/UX se enfoca en crear interfaces de usuario intuitivas, atractivas y
                funcionales que proporcionen una excelente experiencia de usuario.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Áreas principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Diseño de interfaces (UI): Visual, layout, tipografía, color</li>
                  <li>Experiencia de usuario (UX): Research, wireframes, prototipos</li>
                  <li>Herramientas: Figma, Sketch, Adobe XD, Framer</li>
                  <li>Design Systems y componentes reutilizables</li>
                  <li>Prototipado interactivo</li>
                  <li>Testing de usabilidad</li>
                  <li>Accesibilidad y diseño inclusivo</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas creativas con sentido estético, empatía por los usuarios y pasión por
                  crear experiencias digitales intuitivas y agradables.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="networking"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Networking & Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                El networking y la infraestructura se enfocan en diseñar, implementar y mantener redes
                de computadoras y sistemas de comunicación que permiten la conectividad y transferencia
                de datos.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Áreas principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Protocolos de red: TCP/IP, HTTP/HTTPS, DNS</li>
                  <li>Configuración de routers, switches y firewalls</li>
                  <li>Redes inalámbricas: Wi-Fi, Bluetooth, 5G</li>
                  <li>Seguridad de red: VPNs, firewalls, IDS/IPS</li>
                  <li>Cloud networking: VPCs, CDNs, load balancers</li>
                  <li>Monitoreo y troubleshooting de redes</li>
                  <li>Certificaciones: CCNA, CCNP, Network+</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas interesadas en cómo funcionan las comunicaciones digitales, la
                  infraestructura de red y asegurar la conectividad y seguridad de los sistemas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="project-management"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Project Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                La gestión de proyectos se enfoca en planificar, organizar y ejecutar proyectos de
                software de manera eficiente, asegurando que se completen a tiempo, dentro del
                presupuesto y con la calidad esperada.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Metodologías y herramientas:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Metodologías ágiles: Scrum, Kanban, SAFe</li>
                  <li>Herramientas: Jira, Trello, Asana, Monday.com</li>
                  <li>Gestión de recursos y presupuestos</li>
                  <li>Planificación y estimación de tareas</li>
                  <li>Gestión de riesgos y stakeholders</li>
                  <li>Comunicación y coordinación de equipos</li>
                  <li>Certificaciones: PMP, CSM, PMI-ACP</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para personas organizadas, con habilidades de comunicación y liderazgo, que disfrutan
                  coordinar equipos y asegurar que los proyectos se completen exitosamente.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="tech-lead"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Tech Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Un Tech Lead es un desarrollador senior que combina habilidades técnicas profundas con
                liderazgo, guiando al equipo en decisiones técnicas y arquitectónicas mientras sigue
                programando activamente.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Responsabilidades principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Diseño de arquitectura y decisiones técnicas</li>
                  <li>Code reviews y mentoring de desarrolladores</li>
                  <li>Resolución de problemas técnicos complejos</li>
                  <li>Coordinación técnica entre equipos</li>
                  <li>Balance entre desarrollo y liderazgo</li>
                  <li>Establecimiento de estándares y mejores prácticas</li>
                  <li>Comunicación técnica con stakeholders</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para desarrolladores senior que quieren liderar técnicamente sin dejar de programar,
                  combinando expertise técnico con habilidades de mentoría y comunicación.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="engineering-management"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Engineering Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                La gestión de ingeniería se enfoca en liderar equipos de desarrollo, gestionar recursos,
                establecer procesos y estrategias técnicas, y asegurar que los equipos entreguen software
                de calidad.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Responsabilidades principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Gestión de equipos de ingeniería</li>
                  <li>Reclutamiento y desarrollo de talento</li>
                  <li>Planificación estratégica técnica</li>
                  <li>Establecimiento de procesos y cultura de ingeniería</li>
                  <li>Gestión de presupuestos y recursos</li>
                  <li>Comunicación con otros departamentos</li>
                  <li>Métricas y KPIs de ingeniería</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para ingenieros con experiencia que quieren transicionar a roles de gestión, liderando
                  equipos y estrategias técnicas mientras mantienen conexión con el desarrollo.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            id="software-architect"
            className="w-full max-w-4xl scroll-mt-24 transition-colors hover:border-pcnPurple dark:hover:border-pcnGreen"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-pcnPurple dark:text-pcnGreen" />
                Software Architect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                La arquitectura de software se enfoca en diseñar la estructura, organización y patrones
                fundamentales de sistemas de software complejos, asegurando escalabilidad, mantenibilidad y
                calidad técnica.
              </p>
              <div>
                <Heading3 className="mb-2 text-lg">Responsabilidades principales:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Diseño de arquitectura de sistemas complejos</li>
                  <li>Definición de patrones y estándares arquitectónicos</li>
                  <li>Evaluación de tecnologías y frameworks</li>
                  <li>Arquitectura orientada a servicios (SOA, microservicios)</li>
                  <li>Diseño de APIs y contratos entre sistemas</li>
                  <li>Arquitectura de datos y persistencia</li>
                  <li>Documentación técnica y diagramas arquitectónicos</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">Patrones y estilos arquitectónicos:</Heading3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Arquitectura en capas (Layered Architecture)</li>
                  <li>Microservicios y arquitectura distribuida</li>
                  <li>Arquitectura hexagonal (Ports & Adapters)</li>
                  <li>Event-Driven Architecture</li>
                  <li>CQRS (Command Query Responsibility Segregation)</li>
                  <li>Domain-Driven Design (DDD)</li>
                </ul>
              </div>
              <div>
                <Heading3 className="mb-2 text-lg">¿Para quién es ideal?</Heading3>
                <p className="text-muted-foreground">
                  Para desarrolladores senior con experiencia en múltiples proyectos, que disfrutan
                  pensar en el panorama general, diseñar soluciones escalables y tomar decisiones
                  técnicas estratégicas.
                </p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default SpecialtiesPage;

