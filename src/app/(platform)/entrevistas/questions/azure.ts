import type { InterviewQuestion, Seniority } from './types';

export const azureQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'azure',
      question:
        '¿Cómo se organizan los recursos en Azure: management groups, suscripciones y resource groups?',
      answer:
        'La jerarquía es tenant de Entra ID, management groups, suscripciones, resource groups y recursos. La suscripción es la unidad de facturación y de límites, y suele separarse por entorno o por equipo. Un resource group agrupa recursos que comparten ciclo de vida, por ejemplo todo lo de una aplicación en un entorno, y borrarlo borra todo lo que contiene. Los management groups agrupan suscripciones para aplicarles policies y permisos en bloque, que se heredan hacia abajo.',
    },
    {
      topic: 'azure',
      question: '¿Qué es Microsoft Entra ID?',
      answer:
        'Es el servicio de identidad en la nube de Microsoft, antes llamado Azure Active Directory. Administra usuarios, grupos, aplicaciones (app registrations y service principals) y el inicio de sesión con SSO, MFA y acceso condicional. Todo acceso a Azure, Microsoft 365 y muchas aplicaciones pasa por un tenant de Entra ID. No es lo mismo que el Active Directory on-premise, aunque se pueden sincronizar con Entra Connect.',
    },
    {
      topic: 'azure',
      question: '¿Qué es Azure App Service y cuándo lo usarías?',
      answer:
        'Es una plataforma como servicio para hostear aplicaciones web y APIs en .NET, Node.js, Python, Java o contenedores, sin administrar servidores. Te da escalado, certificados TLS, dominios personalizados, deployment slots para staging y swap sin downtime, e integración con CI/CD. Lo usaría para aplicaciones web típicas donde no necesito el control de Kubernetes. El costo depende del App Service Plan, que es la capacidad de cómputo compartida por las apps que corren en él.',
    },
    {
      topic: 'azure',
      question: '¿Qué es una storage account y qué servicios incluye?',
      answer:
        'Es el contenedor de almacenamiento de Azure, con un nombre único global y una configuración de redundancia. Incluye Blob Storage para objetos (archivos, backups, estáticos), Azure Files para file shares SMB/NFS, Queue Storage para mensajes simples y Table Storage para datos clave-valor. La redundancia va de LRS (copias en un data center) a ZRS (entre zonas) y GRS/GZRS (replicado a otra región). Los blobs tienen tiers hot, cool, cold y archive según la frecuencia de acceso.',
    },
    {
      topic: 'azure',
      question: '¿Qué es una VNet y qué es un Network Security Group?',
      answer:
        'Una Virtual Network es la red privada de tus recursos en Azure, con un rango de direcciones dividido en subnets. Un Network Security Group es un conjunto de reglas de allow y deny por prioridad, con origen, destino, puerto y protocolo, que se asocia a una subnet o a una interfaz de red. Es stateful, así que el tráfico de respuesta se permite solo. Se usan para que, por ejemplo, la subnet de base de datos acepte conexiones solo desde la subnet de la aplicación.',
    },
    {
      topic: 'azure',
      question: '¿Qué es Azure Key Vault y para qué sirve?',
      answer:
        'Es el servicio para guardar secretos (connection strings, API keys), claves criptográficas y certificados de forma centralizada y auditada. Las aplicaciones los leen en tiempo de ejecución en vez de tenerlos en el código o en variables de configuración en texto plano. El acceso se controla con Azure RBAC y conviene que las apps entren con managed identities, así no hace falta otro secreto para leer los secretos. También permite rotación y alertas de vencimiento de certificados.',
    },
  ],
  'semi-senior': [
    {
      topic: 'azure',
      question:
        '¿Qué son las managed identities y qué diferencia hay entre system-assigned y user-assigned?',
      answer:
        'Son identidades de Entra ID que Azure le asigna a un recurso (una App Service, una VM, una Function) para que se autentique contra otros servicios sin manejar credenciales. La system-assigned nace y muere con el recurso y es exclusiva de él. La user-assigned es un recurso independiente que podés asignar a varios recursos y sobrevive aunque los borres, útil cuando varios componentes necesitan los mismos permisos o querés pre-crear los permisos. En ambos casos les das roles con RBAC, por ejemplo leer secretos de un Key Vault.',
    },
    {
      topic: 'azure',
      question: '¿Cómo funciona Azure RBAC y en qué se diferencia de Azure Policy?',
      answer:
        'Azure RBAC controla quién puede hacer qué: asignás un rol (Owner, Contributor, Reader o uno custom) a un usuario, grupo o identidad en un scope, y se hereda hacia abajo de management group a recurso. Azure Policy controla cómo deben ser los recursos, sin importar quién los cree: por ejemplo, solo ciertas regiones, tags obligatorios, prohibir IPs públicas o exigir cifrado. Policy puede auditar, denegar o corregir con deployIfNotExists. Se complementan: RBAC limita las acciones y Policy garantiza estándares de configuración.',
    },
    {
      topic: 'azure',
      question: '¿Cuándo elegirías Azure Functions, Container Apps o AKS?',
      answer:
        'Azure Functions sirve para código disparado por eventos (HTTP, colas, timers, blobs) con pago por ejecución en el plan Flex Consumption o Consumption, ideal para tareas cortas. Container Apps corre contenedores serverless sobre Kubernetes administrado sin exponerte la complejidad: escala a cero, usa KEDA para escalar por eventos e incluye Dapr y revisiones para tráfico dividido. AKS es Kubernetes administrado completo, con control total del cluster pero también con la responsabilidad de operarlo. Para microservicios sin un equipo de plataforma, Container Apps suele ser el punto medio justo.',
    },
    {
      topic: 'azure',
      question: '¿Qué diferencia hay entre ARM templates y Bicep?',
      answer:
        'ARM templates son JSON declarativos que Azure Resource Manager usa para desplegar recursos; son verbosos y difíciles de mantener. Bicep es un lenguaje declarativo más legible que compila a ARM, con módulos, tipado, autocompletado y sin necesidad de manejar state, porque el estado es el propio Azure. Tiene soporte desde el primer día para recursos nuevos de Azure y what-if para ver los cambios antes de aplicar. La alternativa multi-cloud es Terraform con el provider azurerm.',
    },
    {
      topic: 'azure',
      question: '¿Qué relación hay entre Azure Monitor, Log Analytics y Application Insights?',
      answer:
        'Azure Monitor es la plataforma general de observabilidad: métricas, logs, alertas y dashboards de los recursos de Azure. Log Analytics es el workspace donde se guardan los logs, que se consultan con KQL (Kusto Query Language). Application Insights es la parte de APM de Azure Monitor para aplicaciones: requests, dependencias, excepciones, trazas distribuidas y disponibilidad, hoy instrumentado preferentemente con OpenTelemetry. En la práctica configurás diagnostic settings para mandar logs al workspace, y armás alertas sobre métricas o queries KQL.',
    },
    {
      topic: 'azure',
      question: '¿Cómo armarías un pipeline de CI/CD en Azure DevOps para una aplicación?',
      answer:
        'Definiría un pipeline YAML versionado en el repo con stages: build y tests, publicación del artefacto o imagen en Azure Container Registry, y deploy a cada entorno. Los deploys usan environments con approvals y checks para producción, y una service connection con workload identity federation (OIDC), sin secretos guardados. Los valores sensibles vienen de variable groups enlazados a Key Vault. Si la app es App Service, conviene desplegar en un slot de staging y hacer swap, así el rollback es otro swap.',
    },
  ],
  senior: [
    {
      topic: 'azure',
      question: '¿Qué es una landing zone en Azure y cómo la diseñarías?',
      answer:
        'Es el entorno base preparado para alojar workloads con identidad, red, seguridad, gobierno y facturación ya resueltos. Siguiendo el Cloud Adoption Framework, armaría una jerarquía de management groups (platform, landing zones corp y online, sandbox, decommissioned), suscripciones de plataforma para identidad, conectividad y management, y una suscripción por workload y entorno. La red suele ser hub-and-spoke o Virtual WAN, con firewall central y DNS privado. Azure Policy en los management groups impone los guardrails y todo se despliega como código, por ejemplo con los módulos de Azure Verified Modules.',
    },
    {
      topic: 'azure',
      question: '¿Cómo diseñarías alta disponibilidad para una aplicación crítica en Azure?',
      answer:
        'Dentro de una región, usaría availability zones: servicios zone-redundant como App Service, AKS con nodos en varias zonas, Azure SQL o Cosmos DB con redundancia de zona y storage ZRS. Para tolerar la caída de una región, una región secundaria, idealmente de su par, con replicación de datos (failover groups de Azure SQL, Cosmos DB multi-región, GZRS) e infraestructura como código para levantar el resto. Front Door o Traffic Manager distribuyen y hacen failover del tráfico global. Todo depende del RTO y RPO acordados, y hay que probar el failover de verdad.',
    },
    {
      topic: 'azure',
      question:
        '¿Cuándo usarías Cosmos DB y cómo elegirías el nivel de consistencia y la partition key?',
      answer:
        'Cosmos DB es una base NoSQL distribuida globalmente, con latencia baja, escrituras multi-región y varias APIs (NoSQL, MongoDB, Cassandra, Gremlin, Table). La partition key es la decisión más importante: tiene que tener alta cardinalidad, repartir bien lecturas y escrituras y coincidir con el filtro de las queries más frecuentes, porque cambiarla implica migrar los datos. Tiene cinco niveles de consistencia, de strong a eventual; session es el default y suele ser el equilibrio razonable. El costo se mide en Request Units, así que conviene modelar según los patrones de acceso.',
    },
    {
      topic: 'azure',
      question: '¿Cómo controlarías el costo de Azure en una organización grande?',
      answer:
        'Visibilidad primero: Cost Management con budgets y alertas por suscripción, tags obligatorios de dueño y centro de costo impuestos con Azure Policy, y reportes por equipo. Después optimización: Azure Advisor para right-sizing y recursos ociosos, autoscaling y apagado fuera de horario en entornos no productivos, tiers de storage adecuados. Para cargas estables, reservations o Azure savings plan for compute, y Azure Hybrid Benefit si hay licencias de Windows Server o SQL Server. Y para cargas tolerantes a interrupciones, spot VMs.',
    },
    {
      topic: 'azure',
      question: '¿Cómo expondrías servicios PaaS de Azure sin pasar por internet?',
      answer:
        'Con Private Endpoints: el servicio (Azure SQL, Storage, Key Vault, etc.) recibe una IP privada dentro de tu VNet y deshabilitás el acceso público. Hay que resolver el DNS con zonas Private DNS (`privatelink.*`) vinculadas a las VNets, que suele ser la parte que falla en la práctica, sobre todo con DNS on-premise. Los service endpoints son una alternativa más simple que restringe el acceso a ciertas subnets, pero el servicio sigue teniendo endpoint público. Para que las App Services o Functions salgan hacia esos endpoints, usás VNet integration.',
    },
    {
      topic: 'azure',
      question:
        '¿Cómo harías deploys sin downtime de una aplicación en Azure y cómo volverías atrás?',
      answer:
        'En App Service, deployment slots: desplegás en staging, se precalienta, validás con smoke tests y hacés swap, que cambia el tráfico sin reiniciar; el rollback es volver a hacer swap. En Container Apps, revisiones con división de tráfico para un canary gradual. En AKS, rolling updates con readiness probes, o canary y blue-green con un ingress o service mesh. Además, los cambios de base de datos tienen que ser compatibles hacia atrás (expand and contract), porque si no el rollback de la app no alcanza.',
    },
  ],
};
