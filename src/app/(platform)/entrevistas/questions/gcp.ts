import type { InterviewQuestion, Seniority } from './types';

export const gcpQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'google cloud',
      question: '¿Cómo se organizan los recursos en Google Cloud?',
      answer:
        'La jerarquía es organización (ligada a un dominio de Google Workspace o Cloud Identity), folders y projects. El project es la unidad básica: todos los recursos viven en uno, tiene su facturación asociada, sus APIs habilitadas y sus permisos. Los folders agrupan projects, por ejemplo por equipo o entorno, y las políticas de IAM y Org Policies se heredan de arriba hacia abajo. Un patrón común es un project por aplicación y entorno.',
    },
    {
      topic: 'google cloud',
      question: '¿Qué es una service account en Google Cloud?',
      answer:
        'Es una identidad para cargas de trabajo, no para personas: la usa una VM, un servicio de Cloud Run o un pipeline para llamar a APIs de Google Cloud. Le asignás roles de IAM como a cualquier principal, con mínimo privilegio. Lo recomendable es que los servicios usen la service account adjunta sin descargar claves JSON, porque esas claves son de larga duración y se filtran fácil. Desde afuera de Google Cloud se usa Workload Identity Federation en lugar de claves.',
    },
    {
      topic: 'google cloud',
      question: '¿Qué es Cloud Run y cuándo lo usarías?',
      answer:
        'Es una plataforma serverless que corre contenedores: le das una imagen y escala automáticamente según las requests, incluso a cero. Se paga por el uso de CPU y memoria y te da HTTPS, dominios y revisiones con división de tráfico. Lo usaría para APIs, aplicaciones web y workers sin estado, sin administrar clusters. También tiene Cloud Run jobs para tareas batch que corren hasta terminar.',
    },
    {
      topic: 'google cloud',
      question: '¿Qué es Cloud Storage y qué clases de almacenamiento tiene?',
      answer:
        'Es el almacenamiento de objetos de Google Cloud, organizado en buckets con nombre global. Las clases son Standard para datos de acceso frecuente, Nearline (acceso aproximadamente una vez al mes), Coldline (una vez por trimestre) y Archive (menos de una vez al año), con almacenamiento más barato pero costo de recuperación y duración mínima mayores. Con lifecycle rules o Autoclass los objetos pasan de clase automáticamente. Los buckets pueden ser regionales, dual-region o multi-region según la disponibilidad que necesites.',
    },
    {
      topic: 'google cloud',
      question: '¿Qué tipos de roles de IAM hay en Google Cloud?',
      answer:
        'Hay roles básicos (Owner, Editor, Viewer), que son muy amplios y no se recomiendan en producción. Los roles predefinidos, como `roles/storage.objectViewer`, dan permisos acotados a un servicio y son los que deberías usar normalmente. Los roles custom te dejan armar un conjunto de permisos exacto cuando ningún predefinido encaja. Los roles se otorgan a principals (usuarios, grupos, service accounts) en un recurso, y se heredan hacia abajo en la jerarquía.',
    },
    {
      topic: 'google cloud',
      question: '¿Qué es BigQuery?',
      answer:
        'Es el data warehouse serverless de Google Cloud: guardás datos en tablas y los consultás con SQL estándar sobre volúmenes de terabytes o petabytes, sin administrar infraestructura. Separa almacenamiento y cómputo, y se paga por almacenamiento y por los bytes que leen las queries (on-demand) o por capacidad reservada. Particionar y clusterizar las tablas y seleccionar solo las columnas necesarias reduce mucho el costo. Se usa para analítica, reportes y como fuente de herramientas de BI.',
    },
  ],
  'semi-senior': [
    {
      topic: 'google cloud',
      question: '¿Qué tiene de particular la VPC de Google Cloud y qué es una Shared VPC?',
      answer:
        'En Google Cloud una VPC es global: sus subnets son regionales, pero todas comparten la misma red y se comunican entre regiones por la red privada de Google sin peering. Las reglas de firewall se definen a nivel de VPC y se aplican a instancias por network tags o service accounts. Shared VPC permite que un host project tenga la red y que varios service projects usen sus subnets, así el equipo de red centraliza la conectividad y cada equipo administra sus recursos en su project. También hay firewall policies jerárquicas a nivel organización o folder.',
    },
    {
      topic: 'google cloud',
      question: '¿Qué diferencia hay entre GKE Autopilot y GKE Standard?',
      answer:
        'En Standard administrás los node pools: tipos de máquina, cantidad, upgrades y configuración, y pagás por los nodos aunque estén vacíos. En Autopilot Google administra los nodos, aplica buenas prácticas de seguridad por defecto y pagás por los recursos que piden tus pods. Autopilot reduce mucho la operación y es el modo recomendado para la mayoría, pero tiene restricciones, por ejemplo sobre pods privilegiados o ciertas configuraciones de nodo. Standard se elige cuando necesitás control fino del hardware o del nodo.',
    },
    {
      topic: 'google cloud',
      question: '¿Cuándo usarías Cloud Run, Cloud Run functions o GKE?',
      answer:
        'Cloud Run functions (antes Cloud Functions) sirve para código chico disparado por eventos, como un archivo en Cloud Storage o un mensaje de Pub/Sub, escribiendo solo la función. Cloud Run corre cualquier contenedor HTTP o job, escala a cero y es ideal para la mayoría de las APIs y servicios sin estado. GKE se justifica cuando necesitás Kubernetes completo: workloads con estado, sidecars complejos, control de red fino o un equipo de plataforma que ya opera Kubernetes. La regla práctica es empezar lo más administrado posible.',
    },
    {
      topic: 'google cloud',
      question: '¿Qué es Pub/Sub y para qué lo usarías?',
      answer:
        'Es un servicio de mensajería asíncrona administrado: los publishers mandan mensajes a un topic y cada subscription recibe una copia, en modo pull o push. Desacopla servicios, absorbe picos de carga y permite fan-out a varios consumidores. La entrega es al menos una vez, así que los consumidores tienen que ser idempotentes; también ofrece ordering keys, exactly-once delivery en pull y dead letter topics. Se usa para eventos entre microservicios, ingesta de datos y como disparador de Cloud Run o Dataflow.',
    },
    {
      topic: 'google cloud',
      question: '¿Cómo autenticarías un pipeline de GitHub Actions contra Google Cloud sin claves?',
      answer:
        'Con Workload Identity Federation: creás un workload identity pool y un provider OIDC que confía en el emisor de tokens de GitHub, con condiciones sobre el repositorio o la rama. El job pide un token OIDC, lo intercambia en el STS de Google por credenciales de corta duración y, directamente o impersonando una service account, despliega. Así no hay claves JSON guardadas como secretos que puedan filtrarse ni que haya que rotar. La acción `google-github-actions/auth` simplifica la configuración.',
    },
    {
      topic: 'google cloud',
      question: '¿Cómo armarías un pipeline de build y deploy con Cloud Build y Artifact Registry?',
      answer:
        'Cloud Build ejecuta pasos definidos en un `cloudbuild.yaml`, cada uno en un contenedor, disparado por triggers de push o pull request. El build corre tests, construye la imagen y la sube a Artifact Registry, que reemplaza a Container Registry y guarda imágenes y paquetes con escaneo de vulnerabilidades. Después el deploy a Cloud Run o GKE puede hacerse desde el mismo build o con Cloud Deploy para promover entre entornos con approvals. La service account del build tiene que tener solo los permisos necesarios.',
    },
  ],
  senior: [
    {
      topic: 'google cloud',
      question: '¿Cuándo usarías Spanner en lugar de Cloud SQL?',
      answer:
        'Cloud SQL es PostgreSQL, MySQL o SQL Server administrado: escala vertical, réplicas de lectura y alta disponibilidad regional, perfecto para la mayoría de las aplicaciones. Spanner es una base relacional distribuida que escala horizontalmente escrituras y lecturas, con consistencia fuerte y transacciones globales, y disponibilidad de hasta 99,999% en configuraciones multi-región. Se justifica cuando una sola instancia relacional no alcanza o necesitás escrituras consistentes en varias regiones. Es más caro y exige diseñar bien las primary keys para evitar hotspots, por ejemplo no usar IDs secuenciales.',
    },
    {
      topic: 'google cloud',
      question: '¿Qué son las Organization Policies y qué restricciones pondrías de entrada?',
      answer:
        'Son restricciones sobre cómo se pueden configurar los recursos, aplicadas a la organización, a folders o a projects y heredadas hacia abajo, independientes de los permisos de IAM. De entrada pondría: restringir las regiones permitidas, deshabilitar la creación de claves de service accounts, forzar uniform bucket-level access y prevención de acceso público en Cloud Storage, restringir IPs externas en VMs y limitar el dominio de los principals que pueden recibir permisos. Conviene probarlas primero en un folder de prueba con modo dry-run para no romper workloads existentes.',
    },
    {
      topic: 'google cloud',
      question: '¿Cómo expondrías una aplicación global con Cloud Load Balancing?',
      answer:
        'Usaría el Application Load Balancer externo global: una sola IP anycast que recibe el tráfico en el edge de Google más cercano y lo envía al backend sano más cercano, en varias regiones. Los backends pueden ser instance groups, NEGs de GKE o NEGs serverless para Cloud Run. Encima sumaría Cloud CDN para contenido cacheable, Cloud Armor como WAF y protección DDoS, y certificados administrados por Google. Si un backend regional cae, el tráfico se mueve solo a otra región.',
    },
    {
      topic: 'google cloud',
      question: '¿Cómo reducirías el costo de una plataforma en Google Cloud?',
      answer:
        'Empezaría por visibilidad: exportar la facturación a BigQuery, labels por equipo y servicio, y budgets con alertas. Después las recomendaciones del Recommender: right-sizing de VMs, discos y IPs ociosas, y projects sin uso. Para cómputo estable, committed use discounts (por recursos o flexibles por gasto), además de los sustained use discounts automáticos en Compute Engine; para cargas tolerantes a interrupciones, Spot VMs. Y en BigQuery, que suele ser una sorpresa, particionado, clustering, límites de bytes por query o capacidad reservada.',
    },
    {
      topic: 'google cloud',
      question: '¿Cómo protegerías datos sensibles en Google Cloud contra la exfiltración?',
      answer:
        'Con VPC Service Controls: armás un perímetro alrededor de los projects con datos sensibles y las APIs como BigQuery o Cloud Storage solo aceptan requests desde adentro del perímetro, aunque alguien tenga credenciales válidas. Lo combino con IAM de mínimo privilegio, Private Google Access para que las VMs lleguen a las APIs sin IPs públicas, cifrado con CMEK en Cloud KMS si hace falta controlar las claves, y Sensitive Data Protection para descubrir y enmascarar datos. Los audit logs de acceso a datos y Security Command Center completan la detección.',
    },
    {
      topic: 'google cloud',
      question: '¿Cómo implementarías SLOs y alertas para un servicio en Google Cloud?',
      answer:
        'Definiría SLIs a partir de lo que vive el usuario, como el porcentaje de requests exitosas y por debajo de cierta latencia, medidos en el load balancer o en el servicio. Cloud Monitoring permite crear servicios con SLOs y calcular el error budget, y alertar por burn rate en lugar de por umbrales de CPU: una alerta rápida para consumos agresivos y otra lenta para degradaciones sostenidas. Los logs van a Cloud Logging con log-based metrics cuando haga falta, y las trazas a Cloud Trace con OpenTelemetry. Cada alerta tiene que tener dueño y un runbook.',
    },
  ],
};
