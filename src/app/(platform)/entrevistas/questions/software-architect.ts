import type { InterviewQuestion, Seniority } from './types';

export const softwareArchitectQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'rol',
      question: '¿Qué hace un software architect y en qué se diferencia de un tech lead?',
      answer:
        'El arquitecto toma y facilita las decisiones estructurales que son caras de cambiar: cómo se divide el sistema, cómo se comunican las partes, dónde viven los datos y qué atributos de calidad se priorizan. El tech lead se enfoca en un equipo y su entrega diaria; el arquitecto suele mirar varios equipos o un sistema completo y el horizonte de meses o años. Una buena respuesta aclara que el arquitecto no diseña en una torre de marfil: escribe código o lo revisa, escucha a los equipos y documenta los trade-offs. Ejemplo: el tech lead decide cómo estructurar un módulo; el arquitecto decide si ese módulo debería ser un servicio aparte.',
    },
    {
      topic: 'atributos de calidad',
      question: '¿Qué son los atributos de calidad y por qué importan en arquitectura?',
      answer:
        'Son las propiedades no funcionales que el sistema tiene que cumplir: escalabilidad, disponibilidad, performance, seguridad, mantenibilidad, costo, entre otras. Importan porque son los que más condicionan la arquitectura: dos sistemas con las mismas funcionalidades pueden necesitar diseños muy distintos si uno atiende 100 usuarios y el otro 10 millones. Una respuesta fuerte menciona que se tienen que expresar de forma medible, por ejemplo "p99 menor a 300 ms con 2000 requests por segundo", y que mejorar uno suele empeorar otro, como más disponibilidad a cambio de más costo.',
    },
    {
      topic: 'estilos',
      question: '¿Qué diferencia hay entre un monolito, un monolito modular y microservicios?',
      answer:
        'Un monolito es una sola unidad desplegable; si no tiene límites internos claros termina siendo una "gran bola de barro". Un monolito modular sigue siendo un solo deploy, pero dividido en módulos con fronteras explícitas y dependencias controladas. Microservicios son servicios desplegables por separado, cada uno con sus datos, que se comunican por red. El trade-off es autonomía y escalado independiente contra complejidad operativa: latencia, fallas parciales, consistencia eventual y observabilidad distribuida. Para la mayoría de los productos nuevos, un monolito modular es un punto de partida más sensato.',
    },
    {
      topic: 'escalabilidad',
      question: '¿Qué es escalar vertical y horizontalmente?',
      answer:
        'Escalar verticalmente es darle más CPU, memoria o disco a la misma máquina; es simple pero tiene un techo y un único punto de falla. Escalar horizontalmente es agregar más instancias detrás de un balanceador; permite crecer casi sin límite, pero exige que la aplicación sea stateless o que el estado viva afuera (base de datos, caché, almacenamiento de sesiones). Una buena respuesta dice que muchas veces conviene escalar vertical primero por simplicidad, y que la base de datos suele ser lo más difícil de escalar horizontalmente.',
    },
    {
      topic: 'datos',
      question: '¿Cuándo elegirías una base de datos relacional y cuándo una NoSQL?',
      answer:
        'Una relacional (PostgreSQL, MySQL) es la opción por defecto cuando hay relaciones entre entidades, transacciones y consultas variadas: da consistencia fuerte y un lenguaje de consulta muy potente. NoSQL encaja cuando el modelo de acceso es simple y conocido y se necesita escalar mucho la escritura o la lectura (clave-valor como DynamoDB), o cuando los datos son documentos con esquema flexible. El trade-off es flexibilidad de consulta y transacciones contra escalado horizontal y esquema libre. Ejemplo: un sistema de pedidos va en Postgres; el historial de clicks de millones de usuarios puede ir en un store clave-valor o columnar.',
    },
    {
      topic: 'caché',
      question: '¿Qué es una caché y qué problemas trae?',
      answer:
        'Es una copia de datos en un lugar más rápido (memoria, Redis, CDN) para reducir latencia y carga sobre la fuente. El problema principal es la invalidación: decidir cuándo un dato cacheado deja de ser válido, con TTL, invalidación por evento o write-through. Otros riesgos son servir datos viejos, el "thundering herd" cuando expira una clave muy pedida y la caché como dependencia crítica. Una buena respuesta menciona patrones como cache-aside y que no hay que cachear antes de medir dónde está el cuello de botella.',
    },
    {
      topic: 'integración',
      question: '¿Cuándo usarías comunicación sincrónica (REST) y cuándo asincrónica (mensajes)?',
      answer:
        'Sincrónica cuando el que llama necesita la respuesta para seguir, por ejemplo validar un pago antes de confirmar la compra: es simple de razonar pero acopla la disponibilidad de ambos servicios. Asincrónica con colas o eventos cuando el trabajo puede hacerse después o lo consumen varios, como mandar el mail de confirmación o actualizar analítica: desacopla y absorbe picos, pero agrega consistencia eventual y más difícil depuración. Una buena respuesta muestra que se combinan en el mismo flujo según la necesidad de cada paso.',
    },
    {
      topic: 'decisiones',
      question: '¿Qué es un ADR (Architecture Decision Record)?',
      answer:
        'Un documento corto que registra una decisión de arquitectura: contexto, la decisión tomada, las alternativas consideradas y sus consecuencias, con un estado (propuesta, aceptada, reemplazada). Sirve para que dentro de dos años alguien entienda por qué se eligió Kafka y no RabbitMQ sin depender de la memoria de quien ya se fue. Suelen vivir en el repositorio junto al código, numerados, y no se editan: si la decisión cambia, se escribe un ADR nuevo que reemplaza al anterior.',
    },
    {
      topic: 'diseño',
      question: '¿Cómo diseñarías un acortador de URLs?',
      answer:
        'Empezaría por requisitos: crear un link corto, redirigir rápido, quizás estadísticas y expiración, y una estimación de volumen (muchas más lecturas que escrituras). El diseño base es un servicio que genera un identificador único (contador codificado en base62 o hash con manejo de colisiones), lo guarda en una base clave-valor o relacional, y una ruta de redirección con caché delante porque es muy read-heavy. Los trade-offs a discutir son cómo generar IDs sin coordinación entre instancias, redirección 301 contra 302 (caché del navegador contra poder contar clicks) y cómo registrar estadísticas de forma asincrónica para no frenar la redirección.',
    },
    {
      topic: 'disponibilidad',
      question: '¿Qué significa tener 99,9% de disponibilidad y cómo se logra?',
      answer:
        'Significa que el sistema puede estar caído alrededor de 43 minutos por mes (99,99% son unos 4 minutos). Se logra eliminando puntos únicos de falla: varias instancias detrás de un balanceador, base de datos con réplica y failover, despliegue en varias zonas de disponibilidad, health checks y deploys que no cortan el servicio. Una buena respuesta aclara que cada nueve extra cuesta mucho más en infraestructura y en complejidad, y que la disponibilidad total está limitada por la de las dependencias críticas.',
    },
    {
      topic: 'acoplamiento',
      question: '¿Qué son el acoplamiento y la cohesión y por qué importan?',
      answer:
        'Cohesión es qué tanto las cosas dentro de un módulo pertenecen juntas; acoplamiento es cuánto depende un módulo de los detalles de otro. Se busca alta cohesión y bajo acoplamiento para que un cambio quede contenido en un lugar y los equipos puedan trabajar en paralelo. Ejemplo: si cambiar el cálculo de impuestos obliga a tocar el carrito, el checkout y la facturación, el acoplamiento es alto. Una buena respuesta menciona que el acoplamiento también puede ser temporal (un servicio necesita que otro esté vivo) o de datos (dos servicios comparten tablas).',
    },
    {
      topic: 'hexagonal',
      question: '¿Qué es la arquitectura hexagonal (puertos y adaptadores)?',
      answer:
        'Es un estilo donde el dominio y los casos de uso quedan en el centro, sin depender de frameworks ni infraestructura, y se comunican con el exterior a través de puertos (interfaces) implementados por adaptadores (controlador HTTP, repositorio de Postgres, cliente de un proveedor). La ventaja es que podés testear la lógica sin base de datos y cambiar infraestructura sin reescribir el núcleo. El trade-off es más indirección y código ceremonial, que no se justifica en un CRUD simple. Ejemplo: el caso de uso "confirmar pedido" depende de un puerto `PaymentGateway`, y Stripe es solo un adaptador.',
    },
    {
      topic: 'comportamiento',
      question: 'Contame una decisión técnica que tomaste y que hoy harías distinto.',
      answer:
        'Lo que se evalúa es reflexión y criterio, no haber acertado siempre. Una buena respuesta da contexto, explica por qué la decisión tenía sentido con la información de ese momento, qué consecuencia apareció después y qué aprendiste para decidir mejor. Ejemplo: separar un servicio de notificaciones demasiado temprano, que agregó deploys y fallas de red sin beneficio real, y que hoy dejarías como módulo hasta que hubiera una razón concreta para separarlo. Evitá culpar a otros o elegir un error trivial.',
    },
    {
      topic: 'documentación',
      question: '¿Qué es el modelo C4 para documentar arquitectura?',
      answer:
        'Es una forma de diagramar arquitectura en cuatro niveles de zoom: contexto (el sistema y sus usuarios y sistemas externos), contenedores (aplicaciones, bases de datos, colas), componentes (las partes dentro de un contenedor) y código. Su valor es que cada diagrama tiene una audiencia: el de contexto sirve para negocio, el de contenedores para equipos técnicos. Una buena respuesta dice que casi siempre alcanza con los dos primeros niveles y que un diagrama sin leyenda ni flechas rotuladas es poco útil.',
    },
    {
      topic: 'trade-offs',
      question: '¿Por qué se dice que en arquitectura "todo es un trade-off"?',
      answer:
        'Porque casi ninguna decisión mejora todo a la vez: microservicios dan autonomía pero suman complejidad, una caché baja latencia pero agrega datos viejos, consistencia fuerte simplifica el razonamiento pero limita disponibilidad y escala. Una buena respuesta muestra que el trabajo del arquitecto es hacer explícitos esos costos y elegir según el contexto y los atributos de calidad prioritarios, no según la moda. Ejemplo: para una startup con cinco devs, velocidad de entrega pesa más que escalado independiente, así que un monolito es la mejor elección.',
    },
  ],
  'semi-senior': [
    {
      topic: 'diseño',
      question: '¿Cómo diseñarías el backend de un feed de noticias tipo red social?',
      answer:
        'Primero aclararía requisitos y escala: usuarios activos, cuántos seguidos promedio, latencia esperada del feed y si importa el orden cronológico o un ranking. El punto central es fan-out on write (al publicar se copia el post a los feeds precalculados de cada seguidor, lecturas rápidas pero caro para cuentas con millones de seguidores) contra fan-out on read (se arma el feed al leer, escrituras baratas pero lecturas caras). Una respuesta fuerte propone un híbrido: fan-out on write para la mayoría y merge en lectura para celebridades, con los feeds en Redis y los posts en una base durable, más paginación por cursor.',
    },
    {
      topic: 'ddd',
      question: '¿Qué es un bounded context y cómo lo identificás?',
      answer:
        'Es un límite dentro del cual un modelo y su lenguaje tienen un significado único y consistente. "Cliente" significa cosas distintas para ventas (un lead con oportunidades), facturación (alguien con datos fiscales) y soporte (alguien con tickets); forzar un único modelo de cliente genera un modelo enorme y acoplado. Se identifican escuchando el lenguaje del negocio, buscando dónde cambian las reglas o el significado de las palabras, y con técnicas como event storming. Suelen ser buenos candidatos para módulos o servicios, aunque un bounded context no es automáticamente un microservicio.',
    },
    {
      topic: 'ddd',
      question: '¿Qué es un agregado en DDD y cómo decidís su tamaño?',
      answer:
        'Un agregado es un grupo de entidades que se modifica como una unidad para proteger sus invariantes, con una raíz que es el único punto de entrada; una transacción modifica un solo agregado. Si es muy grande genera contención y cargas pesadas; si es muy chico las reglas quedan repartidas y se rompen. Ejemplo: un `Pedido` con sus líneas es un agregado porque la regla "el total no puede superar el límite de crédito" involucra a todas; el `Cliente` es otro agregado y se referencia por ID. Una buena respuesta menciona que las reglas entre agregados se resuelven con consistencia eventual.',
    },
    {
      topic: 'cap',
      question: '¿Qué dicen CAP y PACELC y cómo se aplican en la práctica?',
      answer:
        'CAP dice que ante una partición de red un sistema distribuido tiene que elegir entre consistencia y disponibilidad. PACELC lo completa: si hay partición, elegís entre A y C; si no hay (else), elegís entre latencia y consistencia, que es el trade-off del día a día. Una buena respuesta lo aplica a casos: un saldo bancario prefiere consistencia y rechazar operaciones; un carrito de compras o un contador de likes prefiere disponibilidad y reconciliar después. También aclara que muchas bases permiten configurar ese nivel por operación, como los quorum de Cassandra.',
    },
    {
      topic: 'integración',
      question: '¿Qué es el patrón outbox y qué problema resuelve?',
      answer:
        'Resuelve el problema de la doble escritura: guardar en la base y publicar un evento en el broker no son atómicos, así que si falla uno quedás inconsistente. Con outbox, en la misma transacción que modifica los datos se inserta el evento en una tabla `outbox`, y un proceso aparte (polling o CDC con Debezium) lo publica y lo marca como enviado. El trade-off es entrega al menos una vez, así que los consumidores tienen que ser idempotentes, y algo más de latencia e infraestructura. Ejemplo: al crear un pedido, el evento `OrderCreated` se publica aunque el broker haya estado caído unos minutos.',
    },
    {
      topic: 'idempotencia',
      question: '¿Cómo hacés idempotente una operación como cobrar un pago?',
      answer:
        'El cliente manda una clave de idempotencia única por intento lógico; el servidor la guarda junto con el resultado y, si llega de nuevo la misma clave, devuelve el resultado guardado en vez de cobrar otra vez. La clave y el efecto se guardan en la misma transacción, con una restricción de unicidad para manejar dos requests concurrentes. Una buena respuesta explica que en sistemas distribuidos los reintentos son inevitables (timeouts, redes, consumidores at-least-once), así que la idempotencia es lo que hace seguros esos reintentos. Así funciona el header `Idempotency-Key` de Stripe.',
    },
    {
      topic: 'sagas',
      question: '¿Qué es una saga y cuándo la usarías?',
      answer:
        'Es una forma de mantener consistencia en una operación que atraviesa varios servicios sin transacción distribuida: una secuencia de transacciones locales donde, si un paso falla, se ejecutan acciones compensatorias para deshacer los anteriores. Puede ser coreografiada (cada servicio reacciona a eventos) u orquestada (un coordinador dirige los pasos); la orquestación es más fácil de seguir cuando hay muchos pasos. Ejemplo: reservar stock, cobrar y agendar el envío; si el cobro falla, se libera el stock. El trade-off es que hay estados intermedios visibles y que las compensaciones hay que diseñarlas, no siempre son un simple "deshacer".',
    },
    {
      topic: 'cqrs',
      question: '¿Qué es CQRS y cuándo vale la pena?',
      answer:
        'Command Query Responsibility Segregation separa el modelo de escritura (que valida reglas) del de lectura (optimizado para consultas), a veces con almacenamientos distintos sincronizados por eventos. Vale la pena cuando las lecturas y escrituras tienen necesidades muy distintas, por ejemplo un dominio con reglas complejas y pantallas que necesitan vistas desnormalizadas o búsquedas en Elasticsearch. El costo es consistencia eventual entre ambos modelos y más piezas. Una buena respuesta aclara que no implica event sourcing y que en la mayoría de los CRUD no se justifica.',
    },
    {
      topic: 'datos',
      question: '¿Qué es el sharding y qué problemas trae?',
      answer:
        'Es particionar horizontalmente los datos entre varias bases según una clave, para repartir carga y volumen que una sola máquina no aguanta. Elegir la clave es la decisión crítica: tiene que repartir bien y coincidir con los patrones de acceso, por ejemplo `tenant_id` en un SaaS. Los problemas son hot spots si la clave está desbalanceada, consultas y transacciones entre shards, y rebalanceos dolorosos al agregar nodos. Una buena respuesta dice que antes de shardear conviene agotar índices, réplicas de lectura, caché y escalado vertical.',
    },
    {
      topic: 'migraciones',
      question: '¿Cómo migrarías un monolito legacy a una nueva arquitectura sin un big bang?',
      answer:
        'Con el patrón strangler fig: se pone una fachada (proxy o API gateway) delante del sistema viejo y se van moviendo funcionalidades una por una al sistema nuevo, redirigiendo el tráfico de esas rutas, hasta que el viejo se puede apagar. Se empieza por algo con valor y riesgo acotado, se usan anti-corruption layers para no contaminar el modelo nuevo, y técnicas como lectura en paralelo o shadow traffic para comparar resultados. El mayor desafío suele ser la migración de datos y la sincronización mientras ambos conviven. Una buena respuesta advierte que muchas migraciones mueren a mitad de camino y hay que planificar el apagado.',
    },
    {
      topic: 'observabilidad',
      question: '¿Cómo diseñarías la observabilidad de un sistema con varios servicios?',
      answer:
        'Con los tres pilares correlacionados: logs estructurados con un trace ID, métricas (las cuatro señales doradas: latencia, tráfico, errores y saturación) y trazas distribuidas con OpenTelemetry para seguir un request entre servicios. Sobre eso, SLOs definidos con el negocio y alertas sobre síntomas que afectan al usuario, no sobre cada CPU alta. Una buena respuesta menciona que la observabilidad es una decisión de arquitectura, no algo que se agrega al final, y que hay que controlar el costo por cardinalidad y volumen de logs.',
    },
    {
      topic: 'resiliencia',
      question: '¿Qué patrones usarías para que una falla en un servicio no tumbe todo el sistema?',
      answer:
        'Timeouts en toda llamada remota, reintentos con backoff exponencial y jitter (solo para operaciones idempotentes), circuit breakers que cortan las llamadas a un servicio que está fallando, bulkheads que aíslan recursos por dependencia y degradación elegante, como mostrar recomendaciones genéricas si el servicio personalizado no responde. Una buena respuesta advierte que los reintentos mal configurados amplifican la caída y que hay que probar las fallas, por ejemplo con chaos engineering. Ejemplo: si el servicio de reseñas cae, la página de producto se muestra igual sin reseñas.',
    },
    {
      topic: 'comportamiento',
      question:
        'Contame una vez que tuviste que convencer a un equipo de cambiar una decisión de arquitectura.',
      answer:
        'Se evalúa influencia sin autoridad y si escuchás antes de imponer. Una buena respuesta muestra que entendiste por qué el equipo pensaba distinto, juntaste datos (un benchmark, un incidente, un costo), propusiste un experimento acotado o una RFC y aceptaste objeciones válidas. Ejemplo: un equipo quería sumar MongoDB para un módulo nuevo; mostraste con una prueba de concepto que Postgres con `jsonb` resolvía el caso sin sumar otra base que operar, y lo dejaste documentado en un ADR. Contá también qué cediste.',
    },
    {
      topic: 'serverless',
      question: '¿Cuándo elegirías serverless y cuándo no?',
      answer:
        'Serverless (funciones como AWS Lambda, colas y bases gestionadas) encaja con cargas variables o esporádicas, procesamiento por eventos y equipos chicos que no quieren operar servidores: pagás por uso y escala solo. No encaja tan bien con tráfico alto y constante (puede salir más caro que contenedores), procesos largos, latencias muy bajas sensibles al cold start, o cuando necesitás mucho control del entorno. Otros costos son el vendor lock-in y la dificultad de depurar y testear localmente. Ejemplo: procesar imágenes subidas a S3 es un caso ideal; un API con 5000 requests por segundo constantes probablemente no.',
    },
    {
      topic: 'estimación',
      question: '¿Cómo hacés una estimación de capacidad en una entrevista de system design?',
      answer:
        'Con números redondos y supuestos explícitos: usuarios activos diarios, acciones por usuario, relación lectura/escritura y tamaño de cada objeto, para llegar a requests por segundo promedio y pico, almacenamiento por año y ancho de banda. Ejemplo: 10 millones de usuarios activos que hacen 10 lecturas por día son 100 millones de lecturas, unas 1200 por segundo promedio y quizás 5000 en pico. El objetivo no es la precisión sino decidir: si da 50 escrituras por segundo, una sola base alcanza; si da 50.000, hay que pensar en particionar. Una buena respuesta usa el resultado para justificar el diseño.',
    },
  ],
  senior: [
    {
      topic: 'diseño',
      question: '¿Cómo diseñarías un sistema de pagos para un marketplace con alta disponibilidad?',
      answer:
        'Empezaría por los requisitos que más pesan: no perder ni duplicar dinero, auditoría, conciliación con proveedores y cumplimiento (PCI). El núcleo es un ledger de doble entrada inmutable, con operaciones idempotentes, estados explícitos del pago como máquina de estados, y la integración con procesadores de pago vía outbox y webhooks verificados, más un proceso de conciliación diario. Prefiero consistencia fuerte en el ledger aunque cueste latencia, y disponibilidad con colas para lo que puede esperar, como las liquidaciones a vendedores. Una respuesta senior también cubre multi-proveedor para no depender de uno, tokenización para sacar datos de tarjeta del alcance y observabilidad del dinero, no solo de los servidores.',
    },
    {
      topic: 'gobernanza',
      question:
        '¿Cómo gobernás la arquitectura en una organización con 30 equipos sin convertirte en un cuello de botella?',
      answer:
        'Pasando de aprobar cada decisión a definir guardarraíles: principios de arquitectura, un "paved road" con plataformas y templates que hacen fácil hacer lo correcto, ADRs locales que los equipos escriben solos y un foro de arquitectura (o RFCs) solo para las decisiones que afectan a varios equipos o son irreversibles. Las fitness functions automatizadas en CI verifican reglas sin revisión humana. Una buena respuesta habla de decisiones de una vía contra decisiones de dos vías, de medir si la gobernanza ayuda (tiempo de aprobación, adopción) y de que el arquitecto se gana la autoridad con influencia, no con un sello.',
    },
    {
      topic: 'evolutiva',
      question: '¿Qué son las fitness functions y cómo las usarías?',
      answer:
        'Son verificaciones objetivas y, en lo posible, automatizadas de que la arquitectura sigue cumpliendo una característica deseada, idea de "Building Evolutionary Architectures". Ejemplos: un test con ArchUnit o dependency-cruiser que impide que el dominio importe infraestructura, un presupuesto de latencia p99 en un test de carga del pipeline, un chequeo de que ningún servicio lee tablas de otro, o alertas de costo por request. Sirven para que la arquitectura evolucione sin degradarse y para gobernar sin revisiones manuales. El error común es definir decenas que nadie mantiene; conviene pocas, ligadas a los atributos de calidad prioritarios.',
    },
    {
      topic: 'event sourcing',
      question: '¿Cuándo recomendarías event sourcing y cuándo lo desaconsejarías?',
      answer:
        'Event sourcing guarda el estado como la secuencia de eventos que lo produjeron, en vez del estado actual. Lo recomendaría cuando la auditoría completa y la capacidad de reconstruir el pasado son requisitos del negocio (contabilidad, sistemas regulados) o cuando hay que derivar muchas proyecciones distintas de los mismos hechos. Lo desaconsejaría para la mayoría de los CRUD: versionar eventos, reconstruir proyecciones, manejar datos personales que hay que borrar (GDPR) y la curva de aprendizaje del equipo son costos altos y permanentes. Una buena respuesta propone aplicarlo solo en el bounded context que lo justifica, no en todo el sistema.',
    },
    {
      topic: 'estrategia',
      question: '¿Cómo alineás la arquitectura con la estrategia del negocio?',
      answer:
        'Empezando por entender hacia dónde va el negocio en los próximos uno a tres años (nuevos mercados, adquisiciones, cambio de modelo de precios, regulación) y traduciendo eso a atributos de calidad y capacidades técnicas necesarias. Con eso armás una arquitectura objetivo y un roadmap de transición por etapas con valor intermedio, no un plan de tres años de refactor. Ejemplo: si el negocio va a vender a grandes empresas, multi-tenancy con aislamiento de datos, SSO y auditoría pasan a ser prioridad. Una buena respuesta muestra que hablás de impacto en negocio (tiempo de salida al mercado, costo, riesgo) y no solo de tecnología.',
    },
    {
      topic: 'conway',
      question: '¿Qué es la ley de Conway y cómo la usás al diseñar?',
      answer:
        'La ley de Conway dice que los sistemas tienden a reflejar la estructura de comunicación de la organización que los construye. Usarla al revés ("inverse Conway maneuver") significa diseñar los equipos según la arquitectura que querés: si querés servicios independientes, necesitás equipos con ownership de punta a punta de cada dominio. Ejemplo: si un equipo de "base de datos" central aprueba todos los cambios de esquema, vas a tener un monolito de datos aunque haya microservicios. Una buena respuesta conecta con Team Topologies (equipos de stream-aligned, plataforma, enabling) y con la carga cognitiva de cada equipo.',
    },
    {
      topic: 'multi-región',
      question: '¿Cómo diseñarías un sistema activo-activo en varias regiones?',
      answer:
        'Primero cuestionaría si hace falta: activo-pasivo con failover cubre muchos casos con mucha menos complejidad. Si se justifica (latencia global o RTO cercano a cero), el problema central son los datos: hay que decidir qué datos se replican de forma asincrónica con resolución de conflictos (last-write-wins, CRDTs), cuáles tienen un "home region" por usuario o tenant, y cuáles requieren consistencia global con una base como Spanner a costa de latencia. Además, ruteo global por DNS o anycast, deploys región por región y pruebas de failover periódicas. Una buena respuesta cuantifica el costo extra y el RPO/RTO que se gana.',
    },
    {
      topic: 'costo',
      question: '¿Cómo incorporás el costo cloud como atributo de arquitectura?',
      answer:
        'Tratándolo como un requisito más: definiendo un costo unitario objetivo (por usuario, por transacción) y midiendo contra eso, con tagging por equipo y servicio para que cada uno vea lo que gasta (FinOps). En las decisiones de diseño, el costo entra en el trade-off: almacenamiento en capas, instancias reservadas o spot, serverless contra contenedores según el perfil de carga, y cuidado con costos ocultos como el tráfico entre zonas o el volumen de logs. Ejemplo: descubrir que la mitad de la factura es transferencia entre zonas por un servicio chatty y resolverlo colocando las llamadas o agrupándolas. Una buena respuesta muestra que el costo es arquitectura, no solo tarea de finanzas.',
    },
    {
      topic: 'seguridad',
      question: '¿Cómo diseñás la seguridad de una arquitectura desde el inicio?',
      answer:
        'Con threat modeling temprano (STRIDE sobre los diagramas de flujo de datos) y principios como defensa en profundidad, mínimo privilegio y zero trust: autenticación y autorización entre servicios (mTLS, tokens con alcance), secretos en un vault, cifrado en tránsito y en reposo, y segmentación de red. También la separación de datos sensibles para reducir el alcance de auditorías, y la trazabilidad de accesos. Una buena respuesta muestra que la seguridad se diseña en los límites de confianza y no se agrega al final, y que se equilibra con la usabilidad y el costo. Ejemplo: tokenizar tarjetas para que solo un servicio quede en alcance PCI.',
    },
    {
      topic: 'comportamiento',
      question:
        'Contame una decisión de arquitectura de alto impacto que salió mal y cómo la manejaste.',
      answer:
        'Se busca madurez: hacerte cargo, cómo detectaste el problema, cómo contuviste el impacto y qué cambiaste en el proceso de decisión. Una buena respuesta incluye el contexto y la razón original, las señales que se ignoraron, la decisión de corregir el rumbo (aunque costara admitirlo frente a la dirección) y el aprendizaje institucional, como un ADR de reemplazo o un nuevo criterio de evaluación. Ejemplo: adoptar una base distribuida por su escalabilidad cuando el equipo no tenía experiencia operándola, con incidentes repetidos, y la vuelta planificada a Postgres con particionado. Evitá historias donde el error fue de otros.',
    },
    {
      topic: 'plataforma',
      question: '¿Cuándo crearías un equipo de plataforma interna y qué le pedirías?',
      answer:
        'Cuando varios equipos resuelven una y otra vez los mismos problemas de infraestructura (deploy, observabilidad, bases de datos, autenticación) y eso consume capacidad o genera inconsistencias. Le pediría que trate la plataforma como un producto: con usuarios internos, roadmap, documentación y adopción voluntaria porque es el camino más fácil, no impuesta. Una buena respuesta advierte sobre dos riesgos: una plataforma que construye abstracciones que nadie pidió, y un equipo que se vuelve ticket-ops. Se mide por métricas como el tiempo hasta el primer deploy de un servicio nuevo o la frecuencia de deploys de los equipos.',
    },
    {
      topic: 'microservicios',
      question:
        '¿Cómo detectás que una arquitectura de microservicios se convirtió en un monolito distribuido?',
      answer:
        'Las señales son servicios que hay que desplegar juntos, cambios que tocan varios servicios a la vez, bases de datos compartidas, cadenas largas de llamadas sincrónicas donde una falla tumba todo y equipos que no pueden avanzar sin coordinar con otros. Se mide con datos: co-cambios en el historial de commits, mapas de dependencias de trazas y frecuencia de deploys coordinados. La corrección suele ser redibujar límites según bounded contexts, fusionar servicios demasiado chicos, pasar a eventos donde corresponda y sacar las bases compartidas. Una buena respuesta admite que a veces la mejor decisión es volver a un monolito modular.',
    },
    {
      topic: 'build vs buy',
      question: '¿Cómo evaluás una decisión de build vs buy para un componente central?',
      answer:
        'Primero preguntaría si el componente es diferencial para el negocio: si lo es, construir puede tener sentido; si es commodity (autenticación, facturación, búsqueda), comprar o usar open source suele ganar. Después comparo costo total en varios años (licencias contra equipo que lo construye y lo mantiene para siempre), tiempo de salida al mercado, lock-in y estrategia de salida, seguridad y cumplimiento del proveedor, y capacidad de integración. Ejemplo: usar un proveedor de identidad gestionado en vez de construir SSO y MFA propios. Una buena respuesta deja la decisión y sus supuestos en un ADR con fecha de revisión.',
    },
    {
      topic: 'documentación',
      question:
        '¿Cómo instaurarías una práctica de RFCs y ADRs en una organización que no documenta decisiones?',
      answer:
        'Empezaría chico y con valor visible: una plantilla corta, los ADRs en el repo de cada servicio y RFCs solo para decisiones transversales o caras de revertir, con un plazo de comentarios y alguien responsable de cerrar la decisión. Daría el ejemplo escribiendo los primeros y usándolos en conversaciones reales ("esto ya lo decidimos en el ADR 12, ¿cambió el contexto?"). Una buena respuesta advierte el riesgo de burocracia: si escribir un RFC frena todo, la gente lo evita. Se mide por adopción y por si las discusiones repetidas bajan.',
    },
    {
      topic: 'deuda técnica',
      question: '¿Cómo priorizás la deuda arquitectónica frente a las funcionalidades del negocio?',
      answer:
        'Traduciendo la deuda a impacto en el negocio: cuánto frena las entregas, cuántos incidentes causa, qué riesgo de seguridad o costo genera. Con eso se puede comparar con funcionalidades y negociar con producto, en vez de pedir "un trimestre para refactor". Suelo proponer reservar una capacidad estable y atar la mejora a iniciativas de negocio que tocan esa zona, por ejemplo migrar el módulo de precios justo antes de lanzar precios dinámicos. Una buena respuesta muestra que no toda deuda se paga: la que vive en código que casi no cambia puede quedarse.',
    },
  ],
};
