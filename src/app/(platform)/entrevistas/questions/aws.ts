import type { InterviewQuestion, Seniority } from './types';

export const awsQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'aws',
      question: '¿Qué diferencia hay entre un usuario, un grupo, un rol y una policy en AWS IAM?',
      answer:
        'Un usuario es una identidad con credenciales de larga duración (contraseña o access keys), y un grupo junta usuarios para asignarles permisos en bloque. Un rol es una identidad sin credenciales fijas que se asume temporalmente, por ejemplo desde una instancia EC2, una Lambda o un usuario de otra cuenta. Una policy es un documento JSON que dice qué acciones se permiten o deniegan sobre qué recursos. Hoy lo recomendable es evitar usuarios IAM con access keys y usar roles e IAM Identity Center.',
    },
    {
      topic: 'aws',
      question: '¿Qué diferencia hay entre una subnet pública y una privada en una VPC?',
      answer:
        'Una subnet es pública cuando su route table tiene una ruta `0.0.0.0/0` hacia un Internet Gateway, así sus recursos con IP pública son alcanzables desde internet. Una subnet privada no tiene esa ruta: sus recursos no se pueden alcanzar desde afuera y, si necesitan salir (por ejemplo a descargar paquetes), lo hacen a través de un NAT Gateway ubicado en una subnet pública. El patrón típico es balanceadores en subnets públicas y aplicaciones y bases de datos en privadas.',
    },
    {
      topic: 'aws',
      question: '¿Qué es S3 y qué clases de almacenamiento conocés?',
      answer:
        'S3 es el servicio de almacenamiento de objetos de AWS: guardás archivos en buckets, accedidos por una key, con durabilidad de once nueves. Las clases cambian costo según el patrón de acceso: S3 Standard para datos de uso frecuente, Standard-IA y One Zone-IA para acceso infrecuente, Intelligent-Tiering que mueve objetos automáticamente, y Glacier (Instant Retrieval, Flexible Retrieval, Deep Archive) para archivo a largo plazo. Con lifecycle rules podés pasar objetos de una clase a otra o borrarlos después de cierto tiempo.',
    },
    {
      topic: 'aws',
      question: '¿Qué es EC2 y qué es un Auto Scaling Group?',
      answer:
        'EC2 es el servicio de máquinas virtuales de AWS: elegís un tipo de instancia (CPU, memoria, red), una AMI con el sistema operativo y la lanzás en una subnet. Un Auto Scaling Group mantiene una cantidad deseada de instancias a partir de un launch template, reemplaza las que fallan los health checks y escala según métricas como CPU o requests por target. Combinado con un balanceador, permite alta disponibilidad repartiendo instancias en varias availability zones.',
    },
    {
      topic: 'aws',
      question: '¿Qué es AWS Lambda y para qué casos lo usarías?',
      answer:
        'Lambda es el servicio serverless de funciones: subís código, AWS lo ejecuta en respuesta a eventos y cobra por invocación y por duración, sin administrar servidores. Encaja bien en tareas disparadas por eventos (un archivo subido a S3, un mensaje de SQS, una request de API Gateway), procesos cortos y cargas irregulares. Tiene un límite de 15 minutos por ejecución y puede tener cold starts, así que no es ideal para procesos largos o con latencia muy estricta y tráfico constante alto.',
    },
    {
      topic: 'aws',
      question: '¿Qué es una región y qué es una availability zone?',
      answer:
        'Una región es un área geográfica (por ejemplo `us-east-1` o `sa-east-1`) con varios data centers, independiente de las demás regiones. Cada región tiene varias availability zones, que son uno o más data centers con energía, red y refrigeración separadas, conectados con baja latencia. Distribuir recursos en al menos dos AZ te protege de la caída de un data center; ir a varias regiones protege de la caída de una región entera, pero es más caro y complejo.',
    },
  ],
  'semi-senior': [
    {
      topic: 'aws',
      question: '¿Qué diferencia hay entre un security group y una network ACL?',
      answer:
        'Un security group se aplica a nivel de interfaz de red (instancia, balanceador, base) y es stateful: si permitís el tráfico de entrada, la respuesta sale automáticamente. Solo tiene reglas de allow y puede referenciar otros security groups, por ejemplo "la base acepta tráfico solo del SG de la app". Una network ACL se aplica a nivel de subnet, es stateless (tenés que permitir explícitamente entrada y salida, incluidos los puertos efímeros), tiene reglas de allow y deny evaluadas en orden numérico. En la práctica se usan los security groups como control principal y las NACL para bloqueos gruesos.',
    },
    {
      topic: 'aws',
      question: '¿Cuándo usarías un Application Load Balancer y cuándo un Network Load Balancer?',
      answer:
        'El ALB trabaja en capa 7 (HTTP/HTTPS): puede rutear por path, host o headers, terminar TLS, integrarse con WAF y autenticación, y repartir tráfico entre servicios de microservicios o contenedores. El NLB trabaja en capa 4 (TCP/UDP/TLS), maneja millones de conexiones con latencia muy baja, conserva la IP de origen y ofrece IPs estáticas por AZ. Elegís ALB para la mayoría de las aplicaciones web y APIs, y NLB para protocolos que no son HTTP, tráfico extremo o cuando necesitás IPs fijas.',
    },
    {
      topic: 'aws',
      question: '¿Cómo elegirías entre RDS, Aurora y DynamoDB?',
      answer:
        'RDS es una base relacional administrada (PostgreSQL, MySQL, SQL Server, etc.) con backups, parches y réplicas manejados por AWS. Aurora es la versión de AWS compatible con PostgreSQL y MySQL, con almacenamiento distribuido entre AZs, réplicas de lectura rápidas y failover más corto, a un costo algo mayor; Aurora Serverless v2 escala capacidad automáticamente. DynamoDB es NoSQL key-value y documental, con latencia de milisegundos a cualquier escala, pero exige diseñar el modelo según los patrones de acceso porque no tiene joins. Si tenés relaciones y queries ad hoc, relacional; si tenés accesos por clave muy previsibles y escala enorme, DynamoDB.',
    },
    {
      topic: 'aws',
      question: '¿Qué diferencia hay entre ECS, EKS y Fargate?',
      answer:
        'ECS es el orquestador de contenedores propio de AWS, más simple y muy integrado con IAM, ALB y CloudWatch. EKS es Kubernetes administrado: AWS maneja el control plane y vos ganás el ecosistema y la portabilidad de Kubernetes a cambio de más complejidad. Fargate no es un orquestador sino un modo de cómputo serverless que pueden usar tanto ECS como EKS, donde no administrás instancias EC2 y pagás por vCPU y memoria de cada tarea o pod. Un equipo chico suele empezar con ECS sobre Fargate; EKS se justifica si ya usan Kubernetes o necesitan su ecosistema.',
    },
    {
      topic: 'aws',
      question: '¿Cómo protegerías un bucket de S3 con datos sensibles?',
      answer:
        'Primero, Block Public Access activado a nivel cuenta y bucket, y el bucket sin ACLs (Object Ownership en "bucket owner enforced"). Después, acceso por IAM y bucket policies con mínimo privilegio, incluyendo condiciones como exigir TLS (`aws:SecureTransport`) o acceso solo desde un VPC endpoint. Cifrado en reposo (S3 lo aplica por defecto con SSE-S3, o SSE-KMS si necesitás controlar la clave), versioning y, si hace falta, Object Lock contra borrados. Por último, logs con CloudTrail y alertas de configuración con AWS Config o Security Hub.',
    },
    {
      topic: 'aws',
      question: '¿Qué diferencia hay entre CloudFormation y el AWS CDK?',
      answer:
        'CloudFormation es el servicio de infraestructura como código de AWS: describís recursos en templates YAML o JSON y AWS crea, actualiza y borra el stack, con change sets y rollback automático. El CDK te permite definir esa misma infraestructura en un lenguaje de programación (TypeScript, Python, Java...) con constructs reutilizables de alto nivel, y al final sintetiza templates de CloudFormation. CDK reduce mucho el código repetitivo y permite abstracciones, pero sigue dependiendo de CloudFormation para desplegar, con sus límites y tiempos. Frente a Terraform, ambos son específicos de AWS.',
    },
  ],
  senior: [
    {
      topic: 'aws',
      question: '¿Cómo organizarías una empresa con varios equipos en múltiples cuentas de AWS?',
      answer:
        'Usaría AWS Organizations con una estructura de OUs (por ejemplo security, infrastructure, workloads separados en prod y non-prod, sandbox) y una cuenta por workload y entorno para aislar blast radius, límites y facturación. Control Tower ayuda a montar la landing zone con cuentas de log archive y audit, guardrails y Account Factory para crear cuentas estandarizadas. El acceso humano pasa por IAM Identity Center con SSO y permission sets, y la red se centraliza con Transit Gateway o VPCs compartidas. Encima, Service Control Policies para poner límites que ninguna cuenta puede superar.',
    },
    {
      topic: 'aws',
      question: '¿Qué son las Service Control Policies y cómo interactúan con las policies de IAM?',
      answer:
        'Las SCPs son policies de AWS Organizations que se aplican a OUs o cuentas y definen el máximo de permisos posibles: no otorgan nada, solo limitan. Una acción se permite si la policy de IAM la permite y ninguna SCP (ni permission boundary, ni resource policy) la deniega o deja de permitirla. Se usan para guardrails como impedir desactivar CloudTrail, restringir regiones permitidas o prohibir dejar la organización. Ojo que no afectan a la cuenta management, así que ahí no hay que correr workloads.',
    },
    {
      topic: 'aws',
      question:
        '¿Cómo funciona asumir un rol entre cuentas y por qué es preferible a compartir access keys?',
      answer:
        'La cuenta destino crea un rol con una trust policy que permite a un principal de la cuenta origen llamar a `sts:AssumeRole`, y la cuenta origen le da a ese principal permiso para asumirlo. STS devuelve credenciales temporales que expiran solas, y cada uso queda registrado en CloudTrail con quién asumió qué. Se puede endurecer con condiciones como `sts:ExternalId` para terceros (contra el confused deputy) o exigir MFA. Comparado con access keys de larga duración, elimina secretos que se filtran, rotan mal y no se sabe quién usa.',
    },
    {
      topic: 'aws',
      question: '¿Cómo bajarías la factura de AWS de un sistema que creció sin control?',
      answer:
        'Primero visibilidad: Cost Explorer, etiquetas de costo por equipo y servicio, y budgets con alertas, para saber dónde se va la plata. Después quick wins: borrar recursos huérfanos (volúmenes EBS, snapshots, IPs, load balancers sin uso), right-sizing con Compute Optimizer, lifecycle rules en S3 y revisar el tráfico por NAT Gateway y entre AZs, que suele sorprender. Para cómputo estable, Savings Plans o reservas; para cargas tolerantes a interrupciones (batch, CI, workers), instancias Spot. Por último, que el costo sea parte del diseño y de las revisiones, no una limpieza anual.',
    },
    {
      topic: 'aws',
      question: '¿Qué es el AWS Well-Architected Framework y cómo lo usarías en una revisión?',
      answer:
        'Es el marco de buenas prácticas de AWS organizado en seis pilares: excelencia operacional, seguridad, confiabilidad, eficiencia de performance, optimización de costos y sostenibilidad. Cada pilar tiene preguntas y prácticas concretas, y la Well-Architected Tool permite registrar una revisión y obtener los riesgos altos y medios. En una revisión lo usaría como checklist estructurado con el equipo dueño del workload, priorizando los riesgos altos en un plan de mejoras con dueños y fechas. Lo importante es que no sea una auditoría única sino algo que se repite cuando la arquitectura cambia.',
    },
    {
      topic: 'aws',
      question:
        '¿Cómo diseñarías una arquitectura en AWS para sobrevivir a la caída de una región?',
      answer:
        'Primero definir RTO y RPO con el negocio, porque eso decide la estrategia: backup and restore, pilot light, warm standby o activo-activo, de menor a mayor costo. Los datos se replican a otra región (Aurora Global Database, DynamoDB Global Tables, replicación cross-region de S3) y la infraestructura se define con IaC para poder recrearla. Route 53 con health checks y políticas de failover o latencia mueve el tráfico, y hay que cuidar dependencias ocultas como secretos, imágenes de contenedores y cuotas en la región secundaria. Y sobre todo probarlo con game days, porque un plan de DR que nunca se ejecutó no es un plan.',
    },
  ],
};
