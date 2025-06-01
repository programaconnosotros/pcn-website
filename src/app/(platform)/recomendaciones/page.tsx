import { RecommendationsList } from "@/components/recomendation/recommendations-list"

const softwareRecommendations = [
  {
    name: "Visual Studio Code",
    description:
      "Editor de código fuente ligero pero potente. Incluye soporte para debugging, Git integrado, syntax highlighting y extensiones.",
    logo: "/recomendacion-logo/vsc.webp",
    tags: ["Editor", "JavaScript", "TypeScript", "Python", "Git"],
    category: "Desarrollo",
    website: "https://code.visualstudio.com",
    isFree: true,
    isPopular: true,
  },
  {
    name: "Figma",
    description:
      "Herramienta de diseño colaborativo basada en la web. Perfecta para UI/UX design, prototipado y trabajo en equipo.",
    logo: "/recomendacion-logo/figma.webp",
    tags: ["Diseño", "UI/UX", "Prototipado", "Colaborativo"],
    category: "Diseño",
    website: "https://figma.com",
    isFree: true,
    isPopular: true,
  },
  {
    name: "Docker",
    description:
      "Plataforma de contenedores que permite empaquetar aplicaciones con todas sus dependencias para un despliegue consistente.",
    logo: "/recomendacion-logo/docker.webp",
    tags: ["Contenedores", "DevOps", "Deployment", "Microservicios"],
    category: "DevOps",
    website: "https://docker.com",
    isFree: true,
  },
  {
    name: "Notion",
    description:
      "Espacio de trabajo todo-en-uno que combina notas, tareas, wikis y bases de datos en una sola aplicación.",
    logo: "/placeholder.svg?height=48&width=48",
    tags: ["Productividad", "Notas", "Organización", "Colaboración"],
    category: "Productividad",
    website: "https://notion.so",
    isFree: true,
    isPopular: true,
  },
  {
    name: "Postman",
    description:
      "Plataforma de colaboración para el desarrollo de APIs. Simplifica cada paso del ciclo de vida de las APIs.",
    logo: "/recomendacion-logo/postman.webp",
    tags: ["API", "Testing", "Desarrollo", "HTTP"],
    category: "Desarrollo",
    website: "https://postman.com",
    isFree: true,
  },
  {
    name: "Slack",
    description:
      "Plataforma de comunicación empresarial que organiza conversaciones en canales dedicados por proyecto, tema o equipo.",
    logo: "/recomendacion-logo/slack.webp",
    tags: ["Comunicación", "Equipos", "Chat", "Integraciones"],
    category: "Comunicación",
    website: "https://slack.com",
    isFree: true,
  },
  {
    name: "Adobe Photoshop",
    description:
      "Software profesional de edición de imágenes y diseño gráfico. Estándar de la industria para diseñadores y fotógrafos.",
    logo: "/placeholder.svg?height=48&width=48",
    tags: ["Diseño", "Edición", "Fotografía", "Gráficos"],
    category: "Diseño",
    website: "https://adobe.com/photoshop",
    isFree: false,
    isPopular: true,
  },
]

export default function RecomendacionesPage() {
  return (
    <div className="mt-4 md:px-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recomendaciones de Software</h1>
        </div>
        <p className="text-gray-600">
          Descubre las mejores herramientas recomendadas por nuestra comunidad de desarrolladores
        </p>
      </div>

      <RecommendationsList recommendations={softwareRecommendations} />
    </div>
  )
}
