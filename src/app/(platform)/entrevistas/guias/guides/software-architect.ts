import type { InterviewGuide } from './types';

export const softwareArchitectGuide: InterviewGuide = {
  track: 'software-architect',
  summary:
    'Cómo prepararte para entrevistas de software architect: atributos de calidad, estilos, DDD, datos, integración, system design y gobernanza de decisiones, de junior a senior.',
  sections: [
    {
      id: 'rol-y-entrevista',
      title: 'El rol y cómo es la entrevista',
      body: [
        'Un software architect se hace cargo de las decisiones estructurales de un sistema, las que son caras de cambiar: cómo se divide, cómo se comunican sus partes, dónde viven los datos y qué atributos de calidad se priorizan. No es quien dibuja diagramas y desaparece, sino quien ayuda a los equipos a tomar buenas decisiones, las deja documentadas y se asegura de que el sistema pueda evolucionar. Se diferencia del tech lead, que se enfoca en un equipo y su entrega, y del staff engineer, que resuelve problemas técnicos transversales muchas veces con las manos en el código; en muchas empresas los tres roles se superponen.',
        'La entrevista suele tener cuatro partes: un ejercicio de system design ("diseñá un sistema de reservas"), una revisión de arquitectura de un sistema que construiste vos, donde te repreguntan cada decisión, discusiones de trade-offs ("¿microservicios o monolito para este caso?") y preguntas de comportamiento sobre influencia, conflictos y decisiones que salieron mal. En roles senior puede haber un caso escrito, como redactar un ADR o una RFC, o presentar una arquitectura objetivo a un panel.',
        'En junior (aspirante a arquitecto o senior dev que da el salto) se espera que manejes los fundamentos: atributos de calidad, estilos arquitectónicos, SQL contra NoSQL, caché, sincrónico contra asincrónico, y que razones en trade-offs y no en modas. En semi-senior (arquitecto de un producto o dominio) se espera que diseñes un sistema completo de punta a punta, con DDD, consistencia, resiliencia, migraciones y observabilidad. En senior (arquitecto enterprise o principal) se espera que pienses a nivel organización: estrategia de negocio, gobernanza entre muchos equipos, ley de Conway, costo, seguridad y evolución a varios años.',
        'Los errores más comunes son saltar a la solución sin preguntar requisitos, nombrar tecnologías en vez de explicar por qué, presentar una única opción sin alternativas y no mencionar nunca qué se pierde con cada decisión. El entrevistador no busca la arquitectura correcta, porque no existe: busca ver cómo pensás, cómo comunicás y si sabés cuándo algo es suficiente.',
      ],
      checklist: [
        {
          text: 'Explicar qué hace un arquitecto y en qué se diferencia de un tech lead y un staff engineer',
          explanation:
            'El arquitecto toma y facilita las decisiones estructurales de un sistema o de varios: límites entre componentes, estilos de comunicación, estrategia de datos y atributos de calidad prioritarios. El tech lead es responsable de un equipo: su entrega, la calidad del código y las decisiones técnicas del día a día. El staff engineer es un individual contributor senior que resuelve problemas técnicos que cruzan equipos, muchas veces escribiendo código él mismo. Ejemplo: el tech lead decide cómo estructurar el módulo de facturación; el arquitecto decide si facturación es un servicio aparte y cómo se integra con pagos; el staff engineer puede construir la librería de idempotencia que usan todos. El error común es describir al arquitecto como alguien que decide solo y entrega diagramas; las empresas buscan a alguien que escucha, escribe código o lo revisa y se gana la autoridad con criterio.',
        },
        {
          text: 'Conocer las partes típicas de la entrevista y cómo encarar cada una',
          explanation:
            'El system design evalúa tu método: aclarar requisitos, estimar, proponer un diseño de alto nivel y profundizar donde está el riesgo. La revisión de un sistema propio evalúa si entendiste de verdad lo que construiste: te van a preguntar por qué esa base, qué pasa si se cae tal servicio, qué harías distinto. Las discusiones de trade-offs evalúan si podés defender una postura y también reconocer cuándo depende del contexto. Las preguntas de comportamiento evalúan influencia, manejo de desacuerdos y cómo aprendés de errores. Ejemplo: si te preguntan "¿usarías Kafka?", la mejor respuesta empieza por "depende de si necesito replay y varios consumidores; si solo es una cola de trabajos, algo más simple alcanza". El error común es preparar solo system design y llegar sin historias concretas para la parte de comportamiento.',
        },
        {
          text: 'Saber qué se espera de vos según tu seniority',
          explanation:
            'En junior se espera que domines los fundamentos y los expliques con ejemplos: escalado vertical y horizontal, caché, colas, SQL y NoSQL, monolito contra microservicios, ADRs. En semi-senior se espera que diseñes y defiendas un sistema completo de un dominio, con bounded contexts, consistencia eventual, sagas, outbox, resiliencia y un plan de migración realista. En senior se espera que hables de varios equipos y varios años: gobernanza, plataforma, ley de Conway, costo unitario, seguridad por diseño, build vs buy y cómo alinear arquitectura con estrategia de negocio. Ejemplo: ante "¿cómo migrarías a microservicios?", un junior explica strangler fig, un semi-senior arma el plan por dominios y un senior empieza preguntando si hace falta y cómo cambia la organización de los equipos. El error común es responder a nivel junior en una entrevista senior: solo técnica, sin organización ni negocio.',
        },
        {
          text: 'Tener dos o tres sistemas propios listos para revisar en detalle',
          explanation:
            'Para cada sistema prepará: el problema de negocio y la escala (usuarios, requests por segundo, volumen de datos), un diagrama de contenedores que puedas dibujar en dos minutos, las tres decisiones más importantes con las alternativas descartadas y por qué, los atributos de calidad que priorizaron, algo que salió mal y cómo lo corrigieron, y qué harías distinto hoy. Tené números: latencias, costos, tamaño del equipo, incidentes. Ejemplo: "elegimos Postgres con réplicas de lectura en vez de DynamoDB porque las consultas de reportes eran muy variadas; el costo fue tener que particionar la tabla de eventos al año". El error común es contar el sistema como si todo hubiera sido decisión tuya o como si no tuviera defectos; el entrevistador desconfía de una arquitectura perfecta.',
        },
        {
          text: 'Evitar los errores típicos de una entrevista de arquitectura',
          explanation:
            'El primero es diseñar sin preguntar: arrancar con microservicios y Kafka antes de saber cuántos usuarios hay. El segundo es nombrar tecnologías como si fueran argumentos ("uso Redis porque es rápido") sin decir qué problema resuelven y qué costo agregan. El tercero es no ofrecer alternativas: un arquitecto muestra al menos dos opciones y explica por qué elige una. El cuarto es sobrediseñar para una escala que nadie pidió, que es tan malo como quedarse corto. Ejemplo de buena forma: "con 200 escrituras por segundo una sola Postgres alcanza; si llegamos a 20.000, el primer cambio sería particionar por tenant". El quinto es no gestionar el tiempo y quedarse 30 minutos en un detalle; acordá con el entrevistador dónde profundizar.',
        },
      ],
    },
    {
      id: 'atributos-de-calidad',
      title: 'Atributos de calidad y trade-offs',
      body: [
        'Los atributos de calidad (escalabilidad, disponibilidad, performance, seguridad, mantenibilidad, costo, observabilidad, entre otros) son lo que más condiciona una arquitectura. Dos sistemas con las mismas funcionalidades pueden necesitar diseños opuestos según cuánta carga tengan, cuánto puede estar caído o cuánto puede costar. Por eso, el primer paso de cualquier diseño es preguntar cuáles importan y cuánto.',
        'Un atributo de calidad útil es medible. "Tiene que ser rápido" no sirve; "el p99 del checkout tiene que estar por debajo de 400 ms con 3000 requests por segundo" sí. Los escenarios de calidad (estímulo, entorno, respuesta y medida) son una forma práctica de escribirlos, y los SLOs son su versión operativa.',
        'Casi todos los atributos compiten entre sí: más disponibilidad cuesta más plata, más seguridad suele agregar fricción y latencia, más performance con caché agrega complejidad y datos viejos. El trabajo del arquitecto es hacer explícitos esos trade-offs, priorizar con el negocio y dejar registrado qué se resignó.',
        'En la entrevista, nombrá los dos o tres atributos que más pesan en el problema y usalos para justificar cada decisión. Eso muestra que diseñás por requisitos y no por catálogo de tecnologías.',
      ],
      checklist: [
        {
          text: 'Convertir un atributo de calidad vago en un requisito medible',
          explanation:
            'Un requisito medible tiene una métrica, un umbral y un contexto. En vez de "el sistema tiene que escalar", decís "tiene que soportar 5000 pedidos por minuto en Black Friday con p95 menor a 500 ms y menos de 0,1% de errores". En vez de "tiene que ser seguro", decís "los datos de tarjeta nunca salen del servicio tokenizador y todo acceso a datos personales queda auditado". Una técnica útil son los escenarios de calidad: estímulo (llega un pico de tráfico), entorno (operación normal), respuesta (el sistema escala) y medida (en menos de 2 minutos sin errores). Esto permite verificar el diseño y después monitorearlo. El error común es aceptar requisitos vagos en la entrevista: preguntá números, y si no los hay, proponé supuestos razonables en voz alta.',
        },
        {
          text: 'Explicar escalabilidad vertical, horizontal y por qué la base de datos es lo difícil',
          explanation:
            'Escalar vertical es usar una máquina más grande: es simple y no cambia el código, pero tiene techo y deja un punto único de falla. Escalar horizontal es sumar instancias detrás de un balanceador, lo que exige que la aplicación sea stateless: las sesiones, archivos y estado tienen que vivir afuera, en una base, Redis o almacenamiento de objetos. Los servidores de aplicación stateless escalan fácil; la base de datos no, porque mantener consistencia entre nodos es difícil. Por eso el camino típico es: índices y queries eficientes, escalado vertical de la base, réplicas de lectura, caché, y recién después particionado o sharding. Ejemplo: un e-commerce que pasa de 1 a 10 instancias de API sin problema pero satura la base primaria por escrituras de carritos. El error común es proponer sharding de entrada sin agotar opciones más simples.',
        },
        {
          text: 'Calcular qué implica cada nivel de disponibilidad',
          explanation:
            'La disponibilidad se mide como porcentaje del tiempo en que el sistema funciona: 99% son unas 7 horas caído por mes, 99,9% unos 43 minutos y 99,99% unos 4 minutos. Cada nueve adicional exige mucho más: redundancia en varias zonas, failover automático de la base, deploys sin corte, y procesos de guardia maduros. Además, la disponibilidad compuesta de dependencias en serie se multiplica: tres servicios críticos de 99,9% en cadena dan aproximadamente 99,7%. Por eso conviene reducir dependencias sincrónicas en el camino crítico y degradar elegantemente las que no son esenciales. Ejemplo: si el servicio de recomendaciones cae, la tienda sigue vendiendo sin recomendaciones. El error común es prometer 99,99% sin saber cuánto cuesta ni si el negocio realmente lo necesita.',
        },
        {
          text: 'Discutir un trade-off entre atributos con un ejemplo concreto',
          explanation:
            'La forma de discutir un trade-off es nombrar ambos lados, decir qué priorizás y por qué en este contexto, y cómo mitigarías lo que perdés. Ejemplo: en un sistema de reservas de vuelos, priorizo consistencia sobre disponibilidad en el inventario de asientos, porque vender dos veces el mismo asiento es peor que rechazar una reserva durante una falla; lo mitigo con reintentos y mensajes claros al usuario. En cambio, en el contador de vistas de un video priorizo disponibilidad y performance, aceptando que el número esté desactualizado unos segundos. Otro trade-off clásico es costo contra disponibilidad: duplicar en otra región puede duplicar la factura por un riesgo que el negocio quizás acepta. El error común es presentar una decisión como si no tuviera costo.',
        },
        {
          text: 'Usar SLOs y presupuestos de error para decidir',
          explanation:
            'Un SLI es una medida (porcentaje de requests exitosos en menos de 300 ms), un SLO es el objetivo para esa medida (99,9% en 30 días) y el presupuesto de error es lo que queda (0,1%, unos 43 minutos). Sirven para convertir la confiabilidad en una decisión de negocio: si el presupuesto se está agotando, se frenan lanzamientos riesgosos y se invierte en estabilidad; si sobra, se puede acelerar. Para un arquitecto, los SLOs bajan los atributos de calidad a algo que se opera todos los días. Ejemplo: definir un SLO de checkout más estricto que el del historial de pedidos, y diseñar en consecuencia el camino crítico con menos dependencias. El error común es definir SLOs del 100% o medirlos desde el servidor cuando lo que importa es la experiencia del usuario.',
        },
      ],
    },
    {
      id: 'estilos-arquitectonicos',
      title: 'Estilos arquitectónicos',
      body: [
        'Tenés que poder comparar con soltura monolito, monolito modular, microservicios, arquitecturas orientadas a eventos y serverless, y decir para qué contexto conviene cada uno. No hay un estilo superior: cada uno optimiza ciertos atributos y cobra en otros.',
        'Dentro de una aplicación, conocé la arquitectura en capas, la hexagonal (puertos y adaptadores) y clean architecture. Comparten una idea: el dominio no depende de la infraestructura, y las dependencias apuntan hacia adentro.',
        'La tendencia de los últimos años es más pragmática: muchas empresas que adoptaron microservicios demasiado temprano volvieron a monolitos modulares. Mostrar que conocés esa discusión, y que elegís según tamaño de equipo, madurez operativa y dominio, suma mucho.',
        'En la entrevista, cuando propongas un estilo, decí qué precondiciones necesita (por ejemplo, CI/CD maduro y observabilidad distribuida para microservicios) y cuál sería tu plan si el contexto cambia.',
      ],
      checklist: [
        {
          text: 'Comparar monolito, monolito modular y microservicios',
          explanation:
            'Un monolito es una sola unidad desplegable: simple de desarrollar, testear y operar, con transacciones locales, pero si no tiene límites internos se vuelve difícil de cambiar y todos los equipos pisan el mismo deploy. Un monolito modular mantiene un solo deploy pero con módulos de fronteras explícitas, cada uno con su API interna y, idealmente, sus propias tablas; es el mejor punto de partida para la mayoría. Microservicios dan deploys y escalado independientes y autonomía de equipos, a cambio de latencia de red, fallas parciales, consistencia eventual, más infraestructura y observabilidad distribuida. Una regla práctica: separar un servicio cuando hay una razón concreta, como un equipo distinto, un perfil de escala muy diferente o un requisito de aislamiento. Ejemplo: un SaaS con 8 devs va bien con un monolito modular; separar el procesamiento de video tiene sentido porque escala distinto. El error común es elegir microservicios por moda o por currículum.',
        },
        {
          text: 'Explicar la arquitectura orientada a eventos y sus riesgos',
          explanation:
            'En una arquitectura orientada a eventos, los componentes publican hechos que ocurrieron (`OrderPlaced`) y otros reaccionan sin que el emisor sepa quiénes son. Gana desacoplamiento, extensibilidad (sumar un consumidor no toca al productor) y absorción de picos. Hay que distinguir notificación de evento (solo avisa, el consumidor consulta los datos) de transferencia de estado (el evento trae los datos). Los riesgos son: flujos difíciles de seguir porque la lógica queda repartida, consistencia eventual, orden y duplicados de mensajes, y versionado de esquemas de eventos que se vuelven un contrato público. Ejemplo: al confirmar un pedido, facturación, envíos y analítica reaccionan al mismo evento. El error común es usar eventos para todo, incluso donde el que llama necesita una respuesta inmediata.',
        },
        {
          text: 'Explicar la arquitectura hexagonal y clean architecture',
          explanation:
            'Ambas ponen el dominio y los casos de uso en el centro, sin depender de frameworks, bases de datos ni proveedores. El núcleo define puertos (interfaces como `OrderRepository` o `PaymentGateway`) y la infraestructura los implementa con adaptadores (Prisma, Stripe, un controlador HTTP). Así podés testear la lógica de negocio sin infraestructura y cambiar un proveedor sin tocar el dominio. Clean architecture agrega capas concéntricas con la regla de que las dependencias solo apuntan hacia adentro. El costo es indirección y más archivos, que no se justifica en un CRUD sin reglas de negocio. Ejemplo: cambiar de proveedor de pagos implicó escribir un adaptador nuevo y ningún cambio en el caso de uso de checkout. El error común es aplicarla de forma ceremonial, con interfaces para todo aunque tengan una sola implementación y ninguna razón para cambiar.',
        },
        {
          text: 'Saber cuándo conviene serverless',
          explanation:
            'Serverless (funciones como Lambda, bases y colas gestionadas) conviene con cargas variables o esporádicas, procesamiento disparado por eventos y equipos chicos que no quieren operar servidores: escala solo y pagás por uso. Sus costos son los cold starts que suman latencia, límites de duración y memoria, dificultad para depurar y testear localmente, lock-in con el proveedor y una factura que puede superar a contenedores con tráfico alto y constante. También hay que cuidar las conexiones a bases relacionales, que se agotan con miles de funciones concurrentes, usando un pooler. Ejemplo: generar miniaturas al subir imágenes o un job nocturno son casos ideales; un API con miles de requests por segundo constantes probablemente sea más barato en contenedores. El error común es pensar que serverless significa "sin operaciones": seguís teniendo que monitorear, versionar y asegurar.',
        },
        {
          text: 'Elegir un estilo según el contexto del equipo y la organización',
          explanation:
            'El estilo correcto depende tanto de la organización como de la técnica. Las preguntas clave son: cuántos equipos van a trabajar en el sistema, qué madurez tienen en CI/CD, observabilidad y guardias, cuán claros están los límites del dominio y si hay partes con necesidades de escala o seguridad muy distintas. Con un equipo y un dominio que todavía cambia, un monolito modular deja mover límites barato. Con muchos equipos y dominios estables, microservicios alineados a esos dominios dan autonomía. Ejemplo: una startup que adopta 20 microservicios con 6 personas pasa más tiempo operando que construyendo producto. El error común es decidir el estilo una vez y para siempre; conviene diseñar para que el cambio sea posible, por ejemplo con módulos bien separados que se puedan extraer después.',
        },
      ],
    },
    {
      id: 'ddd-y-modularidad',
      title: 'DDD, límites y modularidad',
      body: [
        'Domain-Driven Design es la herramienta más útil para decidir dónde poner los límites de un sistema. Su parte estratégica (subdominios, bounded contexts, lenguaje ubicuo y context mapping) es la que más se pregunta en entrevistas de arquitectura; la táctica (entidades, value objects, agregados, eventos de dominio) se pregunta más en roles cercanos al código.',
        'La idea central es que el modelo de un dominio tiene sentido dentro de un contexto. Intentar un modelo único para toda la empresa produce entidades gigantes y acopladas; separar contextos con su propio lenguaje permite que cada parte evolucione.',
        'Los límites bien elegidos reducen el acoplamiento y la coordinación entre equipos; los mal elegidos producen servicios que siempre cambian juntos. Por eso conviene descubrir los límites con el negocio, por ejemplo con event storming, antes de partir el código.',
        'En la entrevista, si te dan un dominio (un marketplace, una plataforma de turnos), identificá los contextos en voz alta y mostrá cómo se relacionan. Eso suele impresionar más que elegir la base de datos.',
      ],
      checklist: [
        {
          text: 'Explicar bounded context y lenguaje ubicuo con un ejemplo',
          explanation:
            'Un bounded context es un límite explícito dentro del cual un modelo y sus términos tienen un significado único. El lenguaje ubicuo es ese vocabulario compartido entre negocio y desarrollo, usado igual en conversaciones, código y documentación. Ejemplo: en un e-commerce, "producto" en el catálogo tiene descripción, fotos y categorías; en inventario tiene stock y ubicación en depósito; en envíos tiene peso y dimensiones. Son tres modelos distintos unidos por un ID, no una clase `Product` con 80 campos. Se descubren escuchando dónde cambia el significado de las palabras o las reglas, y quién es dueño de cada decisión. El error común es igualar bounded context con microservicio: un monolito modular puede tener varios contextos, y un contexto puede tener más de un servicio.',
        },
        {
          text: 'Diseñar agregados y elegir su tamaño',
          explanation:
            'Un agregado es un grupo de objetos que se modifica como una unidad para proteger invariantes, con una raíz que es la única puerta de entrada. La regla práctica es modificar un solo agregado por transacción y referenciar a otros agregados por ID. Para elegir el tamaño, preguntá qué reglas tienen que cumplirse siempre de forma inmediata: esas van dentro del mismo agregado; las que pueden cumplirse unos segundos después, se resuelven entre agregados con eventos. Ejemplo: un `Pedido` contiene sus líneas porque "no más de 10 unidades por pedido" tiene que validarse en el momento; la actualización de puntos de fidelidad del `Cliente` puede ocurrir después por un evento. Agregados demasiado grandes generan contención de escritura y cargas lentas. El error común es modelar agregados siguiendo las relaciones de la base de datos en vez de las reglas de negocio.',
        },
        {
          text: 'Usar context mapping para describir relaciones entre contextos',
          explanation:
            'Un context map muestra cómo se relacionan los bounded contexts y, sobre todo, quién se adapta a quién. Los patrones más comunes son: customer-supplier (el proveedor considera las necesidades del cliente), conformist (el cliente acepta el modelo del proveedor tal cual), anti-corruption layer (el cliente traduce el modelo externo para no contaminar el propio), open host service con un lenguaje publicado (una API estable para muchos consumidores) y shared kernel (una parte del modelo compartida, con alto acoplamiento). Ejemplo: al integrar un ERP legacy, ponés un anti-corruption layer que traduce sus códigos y estructuras a tu modelo de facturación. El context map también revela problemas organizacionales: si un equipo depende de otro que no lo prioriza, eso es un riesgo de entrega. El error común es dibujar solo flechas sin indicar la dirección de la dependencia ni el tipo de relación.',
        },
        {
          text: 'Distinguir subdominios core, de soporte y genéricos',
          explanation:
            'El subdominio core es el que diferencia al negocio de la competencia: ahí conviene invertir el mejor talento, modelar con cuidado y construir a medida. Los de soporte son necesarios pero no diferenciales, y pueden resolverse de forma más simple. Los genéricos son problemas resueltos por el mercado, como autenticación, facturación electrónica o envío de mails, y casi siempre conviene comprarlos o usar open source. Ejemplo: para una fintech de préstamos, el scoring de riesgo es core; el backoffice de atención es soporte; el login y el envío de SMS son genéricos. Esta distinción guía decisiones de build vs buy y dónde vale la pena una arquitectura sofisticada. El error común es gastar meses construyendo algo genérico mientras el core se resuelve con atajos.',
        },
        {
          text: 'Descubrir límites con event storming',
          explanation:
            'Event storming es un taller colaborativo donde negocio y tecnología escriben en notas los eventos de dominio en orden cronológico ("pedido realizado", "pago aprobado", "envío despachado"), y después agregan comandos, actores, políticas y sistemas externos. Al ordenar el flujo aparecen naturalmente los límites: grupos de eventos con un mismo lenguaje y responsable, puntos donde cambia la terminología y zonas con dudas o conflicto, que suelen ser los problemas reales. Es útil antes de partir un monolito o al diseñar un dominio nuevo. Ejemplo: en un taller para una plataforma de turnos médicos se descubrió que "confirmar turno" significaba cosas distintas para la clínica y para la obra social, y eso definió dos contextos. El error común es hacerlo solo con desarrolladores, sin las personas que conocen el negocio.',
        },
      ],
    },
    {
      id: 'datos',
      title: 'Datos: modelos, consistencia y escala',
      body: [
        'Las decisiones de datos son las más caras de revertir, por eso pesan tanto en una entrevista de arquitectura. Tenés que poder elegir entre bases relacionales, documentales, clave-valor, columnares y de búsqueda según el patrón de acceso, y justificarlo.',
        'La consistencia es el eje: cuándo hace falta consistencia fuerte, cuándo alcanza la eventual, qué dicen CAP y PACELC, y cómo se maneja la replicación (líder-seguidor, multi-líder, sin líder) con sus retrasos.',
        'Para escalar, el orden razonable es: optimizar consultas e índices, escalar vertical, sumar réplicas de lectura y caché, y recién después particionar o shardear. CQRS y event sourcing son herramientas potentes que se aplican a contextos puntuales, no a todo el sistema.',
        'En la entrevista, siempre decí quién es dueño de cada dato: en arquitecturas distribuidas, un servicio por dato y nada de bases compartidas entre servicios.',
      ],
      checklist: [
        {
          text: 'Elegir el tipo de base de datos según el patrón de acceso',
          explanation:
            'Una base relacional como PostgreSQL es la opción por defecto: transacciones, relaciones, consultas flexibles y madurez operativa. Una documental como MongoDB encaja con agregados que se leen enteros y esquemas variables. Una clave-valor como DynamoDB o Redis sirve cuando el acceso es siempre por clave y se necesita escala y latencia predecible. Una columnar como ClickHouse o BigQuery es para analítica sobre grandes volúmenes, y un motor de búsqueda como Elasticsearch para texto libre y filtros facetados. Muchos sistemas usan varias (persistencia políglota), cada una para lo suyo, sincronizadas por eventos. Ejemplo: pedidos en Postgres, catálogo indexado en Elasticsearch para búsqueda y métricas de uso en ClickHouse. El error común es sumar bases nuevas sin contar el costo de operarlas, cuando Postgres con `jsonb` o extensiones resolvía el caso.',
        },
        {
          text: 'Explicar CAP, PACELC y consistencia eventual',
          explanation:
            'CAP dice que cuando hay una partición de red, un sistema distribuido debe elegir entre consistencia (todos ven el mismo dato) y disponibilidad (todos reciben respuesta). Como las particiones son inevitables, la elección real es qué hacer cuando ocurren. PACELC agrega que, aun sin partición, hay un trade-off permanente entre latencia y consistencia, porque esperar confirmación de réplicas tarda. La consistencia eventual significa que, si no hay nuevas escrituras, las réplicas convergen; mientras tanto se pueden leer datos viejos, y hay que diseñar la experiencia para eso. Ejemplo: un saldo de cuenta prefiere consistencia y rechazar la operación; el carrito o los likes prefieren disponibilidad. Garantías intermedias como "read your writes" resuelven muchos casos de UX. El error común es decir "elijo CA", que en un sistema distribuido no tiene sentido.',
        },
        {
          text: 'Explicar replicación y sharding con sus problemas',
          explanation:
            'La replicación copia los datos en varios nodos para disponibilidad y escalar lecturas. En líder-seguidor, las escrituras van al líder y las réplicas reciben los cambios, normalmente con retraso; eso puede hacer que un usuario no vea lo que acaba de escribir si lee de una réplica. El failover del líder tiene sus riesgos, como perder escrituras no replicadas. El sharding divide los datos entre nodos por una clave para escalar escrituras y volumen. La clave de partición es la decisión crítica: tiene que distribuir la carga y coincidir con las consultas más frecuentes, por ejemplo `tenant_id` en un SaaS B2B. Los problemas son shards calientes, consultas que cruzan shards y rebalanceos. El error común es elegir una clave por fecha, que concentra todas las escrituras en el shard más reciente.',
        },
        {
          text: 'Diseñar una estrategia de caché',
          explanation:
            'Primero medí dónde está la latencia o la carga; después elegí qué cachear y dónde: CDN para contenido estático o público, caché en memoria del proceso para datos casi inmutables, y una caché distribuida como Redis para datos compartidos. El patrón más común es cache-aside: la aplicación lee de la caché y, si no está, lee de la base y la guarda con un TTL. La invalidación se resuelve con TTL cortos, invalidación por evento al escribir o versionado de claves. Hay que prever el thundering herd, cuando una clave popular expira y miles de requests van a la base a la vez, con locks o refresco anticipado. Ejemplo: cachear la página de un producto por 60 segundos e invalidarla cuando cambia el precio. El error común es cachear datos personales o filtrados por permisos con una clave que no incluye al usuario.',
        },
        {
          text: 'Saber cuándo aplicar CQRS y event sourcing',
          explanation:
            'CQRS separa el modelo que procesa comandos y valida reglas del modelo que sirve consultas, que puede ser una vista desnormalizada o hasta otra base. Conviene cuando las lecturas y escrituras tienen formas o escalas muy distintas, por ejemplo un dominio con reglas complejas y un dashboard que necesita agregaciones rápidas. Event sourcing guarda la secuencia de eventos en vez del estado actual, y el estado se reconstruye reproduciéndolos; da auditoría completa, viaje en el tiempo y la posibilidad de crear nuevas proyecciones. Sus costos son altos: versionado de eventos, snapshots, reconstrucción de proyecciones, borrado de datos personales y una curva de aprendizaje fuerte. Ejemplo: un ledger contable es un buen candidato; un ABM de usuarios no. El error común es asumir que CQRS requiere event sourcing o aplicarlos a todo el sistema.',
        },
      ],
    },
    {
      id: 'integracion-y-sistemas-distribuidos',
      title: 'Integración y sistemas distribuidos',
      body: [
        'Cuando un sistema se distribuye, la red se vuelve parte del diseño: las llamadas fallan, tardan, se duplican y llegan desordenadas. Las falacias de la computación distribuida (la red es confiable, la latencia es cero, el ancho de banda es infinito) son un buen recordatorio de lo que no podés asumir.',
        'Tenés que poder elegir entre REST, gRPC, GraphQL y mensajería, y combinar sincrónico y asincrónico en un mismo flujo. Para la mensajería, conocé la diferencia entre colas de trabajo y logs de eventos como Kafka, y las garantías de entrega.',
        'Los patrones que más se preguntan son idempotencia, outbox, sagas, reintentos con backoff, circuit breakers y versionado de APIs. Todos responden a la misma realidad: no hay transacciones distribuidas baratas y los reintentos son inevitables.',
        'En la entrevista, por cada flecha entre servicios de tu diagrama, preparate para responder qué pasa si falla, si tarda o si llega dos veces.',
      ],
      checklist: [
        {
          text: 'Elegir entre REST, gRPC, GraphQL y mensajería',
          explanation:
            'REST sobre HTTP con JSON es el estándar para APIs públicas y entre equipos: simple, cacheable y fácil de depurar. gRPC usa HTTP/2 y Protocol Buffers, con contratos tipados, streaming y mejor performance, y encaja en comunicación interna entre servicios con mucho tráfico. GraphQL deja que el cliente pida exactamente los datos que necesita, útil cuando muchos clientes (web, mobile) consumen datos de varias fuentes, a cambio de complejidad en caché, autorización y control de costo de consultas. La mensajería (colas o eventos) desacopla en el tiempo: el productor no espera al consumidor. Ejemplo: API pública REST, comunicación interna de alta frecuencia en gRPC y eventos de dominio por Kafka. El error común es elegir por gusto sin considerar quién consume la API y qué garantías necesita.',
        },
        {
          text: 'Explicar garantías de entrega e idempotencia',
          explanation:
            'Las garantías de entrega son at-most-once (puede perderse, nunca se duplica), at-least-once (nunca se pierde, puede duplicarse) y exactly-once, que en la práctica se logra combinando at-least-once con procesamiento idempotente. Idempotente significa que procesar el mismo mensaje o request varias veces tiene el mismo efecto que una vez. Se implementa con una clave de idempotencia guardada junto con el resultado bajo una restricción de unicidad, o diseñando operaciones naturalmente idempotentes ("poner el estado en pagado" en vez de "sumar 100 al saldo"). Ejemplo: un consumidor de `PaymentCaptured` guarda el ID del evento en una tabla de procesados dentro de la misma transacción que actualiza el pedido. El error común es confiar en que el broker no duplica: los reintentos, rebalanceos y timeouts generan duplicados siempre.',
        },
        {
          text: 'Resolver la doble escritura con el patrón outbox',
          explanation:
            'La doble escritura ocurre cuando un servicio tiene que guardar en su base y publicar un evento: si guarda y el broker falla, el evento se pierde; si publica y la base falla, el evento miente. El patrón outbox lo resuelve guardando el evento en una tabla `outbox` dentro de la misma transacción local que modifica los datos. Un proceso separado lee esa tabla, por polling o con change data capture como Debezium, publica los eventos y los marca como enviados. Como puede publicar dos veces si falla después de enviar, los consumidores tienen que ser idempotentes. Ejemplo: al registrar un usuario, `UserRegistered` se inserta junto con el usuario, y el mail de bienvenida se manda aunque Kafka haya estado caído. El error común es publicar el evento "después del commit" en el código y asumir que nunca va a fallar entre ambos pasos.',
        },
        {
          text: 'Diseñar una saga con compensaciones',
          explanation:
            'Una saga mantiene la consistencia de un proceso que atraviesa varios servicios como una serie de transacciones locales, cada una con una acción compensatoria si un paso posterior falla. En la coreografía, cada servicio reacciona a eventos del anterior; es descentralizada pero difícil de seguir con muchos pasos. En la orquestación, un coordinador (que puede implementarse con herramientas como Temporal) invoca los pasos y guarda el estado, lo que facilita ver dónde quedó cada instancia. Las compensaciones no siempre son un "deshacer": a veces es una nota de crédito o un mail de disculpas. Ejemplo: reservar hotel, cobrar y emitir voucher; si la emisión falla, se reembolsa el cobro y se libera la reserva. El error común es olvidar los estados intermedios visibles y qué ve el usuario mientras la saga está en curso.',
        },
        {
          text: 'Aplicar patrones de resiliencia sin empeorar las fallas',
          explanation:
            'Toda llamada remota necesita un timeout menor al tiempo que puede esperar quien la hace; sin timeouts, un servicio lento agota los hilos o conexiones de todos sus clientes y la falla se propaga. Los reintentos ayudan con fallas transitorias, pero solo en operaciones idempotentes y con backoff exponencial y jitter, para no sincronizar una avalancha de reintentos. El circuit breaker deja de llamar a un servicio que está fallando y devuelve un fallback, dándole tiempo a recuperarse. Los bulkheads aíslan recursos por dependencia para que una lenta no consuma todo. Ejemplo: tres capas reintentando tres veces cada una convierten un request en 27 llamadas al servicio que ya estaba caído. El error común es configurar reintentos en cada capa sin pensar en el efecto multiplicador ni en el presupuesto total de tiempo del request.',
        },
      ],
    },
    {
      id: 'system-design',
      title: 'Cómo resolver un ejercicio de system design',
      body: [
        'El system design no evalúa si llegás a la arquitectura "correcta", sino tu método: cómo aclarás un problema ambiguo, cómo razonás números, cómo priorizás y cómo comunicás. Un buen método te salva aunque el problema sea nuevo para vos.',
        'Una estructura que funciona en 45 a 60 minutos es: requisitos funcionales y no funcionales (5 a 10 minutos), estimación de capacidad (5 minutos), API y modelo de datos, diseño de alto nivel (10 a 15 minutos), profundización en las partes difíciles (15 a 20 minutos) y cierre con cuellos de botella, fallas y evolución.',
        'Pensá en voz alta, dibujá mientras hablás y chequeá con el entrevistador dónde quiere profundizar. Las mejores entrevistas se sienten como una sesión de diseño entre colegas, no como un examen.',
        'Practicá con problemas clásicos: acortador de URLs, feed de noticias, chat, sistema de reservas, rate limiter, notificaciones, almacenamiento de archivos y búsqueda con autocompletado. Lo importante es reconocer los patrones que se repiten entre ellos.',
      ],
      checklist: [
        {
          text: 'Aclarar requisitos funcionales y no funcionales antes de diseñar',
          explanation:
            'Los requisitos funcionales definen qué hace el sistema: en un chat, enviar mensajes uno a uno, grupos, historial y estado de leído. Los no funcionales definen cómo: cuántos usuarios, latencia de entrega, durabilidad de mensajes, disponibilidad, orden garantizado, regiones. Elegí con el entrevistador un alcance acotado ("me enfoco en mensajes uno a uno y grupos de hasta 100, sin llamadas de video") y escribilo en el pizarrón. Preguntá también por patrones de uso: relación lectura/escritura, picos, tamaño de los objetos. Ejemplo: saber que un sistema de reservas tiene picos extremos cuando se abren las entradas de un recital cambia por completo el diseño. El error común es empezar a dibujar cajas en el primer minuto y descubrir a mitad de entrevista que el requisito central era otro.',
        },
        {
          text: 'Hacer una estimación de capacidad rápida y útil',
          explanation:
            'La estimación sirve para tomar decisiones, no para ser exacta. Partí de usuarios activos diarios y acciones por usuario para obtener requests por segundo: un día tiene unos 86.400 segundos, así que redondeá a 100.000. Ejemplo: 50 millones de usuarios que mandan 20 mensajes por día son mil millones de mensajes, unos 10.000 por segundo promedio y quizás 30.000 en pico; si cada mensaje pesa 1 KB, son 1 TB por día y unos 365 TB por año. Con eso ya sabés que una sola base no alcanza para escrituras y que el almacenamiento necesita particionado y políticas de retención. Conviene saber números de referencia: una lectura en memoria se mide en nanosegundos, una ida y vuelta dentro de un datacenter en menos de un milisegundo y entre continentes en más de 100 ms. El error común es pasar diez minutos haciendo cuentas sin sacar ninguna conclusión de diseño.',
        },
        {
          text: 'Presentar un diseño de alto nivel y su modelo de datos',
          explanation:
            'Empezá con el camino más simple que cumple los requisitos: clientes, balanceador, servicios de aplicación stateless, bases de datos, caché, colas y almacenamiento de objetos. Definí la API principal (por ejemplo, `POST /messages` y `GET /conversations/:id/messages?cursor=`) y el modelo de datos con sus claves de acceso, porque eso condiciona la base que elegís. Recorré un flujo completo de punta a punta sobre el diagrama, como "el usuario A manda un mensaje y B lo recibe". Recién después agregá complejidad donde los números lo exigen. Ejemplo: en un chat, conexiones WebSocket mantenidas por gateways, un servicio de mensajes que persiste en una base particionada por conversación y una cola para notificar a los gateways de los destinatarios. El error común es dibujar 15 cajas con nombres de productos sin poder explicar qué datos fluyen entre ellas.',
        },
        {
          text: 'Profundizar en las partes difíciles y nombrar alternativas',
          explanation:
            'Cada problema tiene una o dos partes donde está el desafío real, y ahí es donde se nota la seniority. En un feed es el fan-out; en un sistema de reservas, evitar la doble venta con concurrencia; en un rate limiter, el algoritmo (token bucket, ventana deslizante) y dónde guardar los contadores; en un chat, la entrega en tiempo real y el orden. Para cada una, presentá al menos dos alternativas con sus trade-offs y elegí una justificando con los requisitos. Ejemplo: para la doble venta, comparar bloqueo pesimista con `SELECT ... FOR UPDATE`, bloqueo optimista con versión, o una reserva temporal con expiración en Redis, y elegir la reserva temporal por la UX de "tenés 10 minutos para pagar". El error común es profundizar en algo fácil que dominás en lugar de en lo que el problema realmente exige.',
        },
        {
          text: 'Cerrar con cuellos de botella, fallas y evolución',
          explanation:
            'En los últimos minutos, revisá tu propio diseño como si fueras el revisor: dónde está el punto único de falla, qué componente se satura primero si el tráfico se multiplica por diez, qué pasa si cae la caché o una región, y cómo lo vas a monitorear. Mencioná qué métricas y alertas tendrías y qué harías en una segunda etapa. Ejemplo: "el cuello de botella va a ser la base de mensajes; con más carga la particionaría por `conversation_id` y movería los mensajes viejos a almacenamiento frío". Esto muestra que pensás en la operación, no solo en el diagrama del día uno. El error común es terminar justo cuando se acaba el tiempo sin haber hablado de fallas, que es justamente lo que más diferencia a un arquitecto.',
        },
      ],
    },
    {
      id: 'cloud-seguridad-observabilidad',
      title: 'Cloud, costo, seguridad y observabilidad',
      body: [
        'Un arquitecto tiene que diseñar pensando en cómo el sistema se va a operar, asegurar y pagar. Estos temas no son "de DevOps" o "de seguridad": son atributos de calidad que se deciden en la arquitectura y son caros de agregar después.',
        'En cloud, conocé los bloques básicos (cómputo, almacenamiento de objetos, bases gestionadas, colas, CDN, redes privadas), el modelo de responsabilidad compartida y cómo diseñar con zonas y regiones para disponibilidad. No hace falta saber todos los servicios de un proveedor, pero sí cuándo conviene un servicio gestionado y qué lock-in implica.',
        'El costo es un atributo de calidad más: un buen diseño puede costar diez veces menos que uno ingenuo. La seguridad se diseña en los límites de confianza con threat modeling, y la observabilidad tiene que permitir responder preguntas que no anticipaste.',
        'En la entrevista, mencionar costo, seguridad y observabilidad sin que te los pregunten es una señal fuerte de seniority.',
      ],
      checklist: [
        {
          text: 'Diseñar para alta disponibilidad en cloud con zonas y regiones',
          explanation:
            'Una zona de disponibilidad es un datacenter (o grupo) aislado dentro de una región; las fallas de una zona son relativamente comunes, las de una región entera, raras. El estándar razonable es desplegar en al menos dos o tres zonas: instancias de aplicación repartidas detrás de un balanceador y una base con réplica sincrónica en otra zona y failover automático. Multi-región se justifica por latencia global, regulación o un RTO muy exigente, y su dificultad principal son los datos. Conviene definir RPO (cuántos datos podés perder) y RTO (cuánto podés tardar en recuperarte) con el negocio antes de elegir. Ejemplo: un SaaS B2B regional con RTO de una hora puede resolverse con backups y una réplica en otra región en modo pasivo. El error común es pagar multi-región activo-activo cuando nadie probó nunca restaurar un backup.',
        },
        {
          text: 'Incorporar el costo como criterio de diseño',
          explanation:
            'Definí una métrica de costo unitario ligada al negocio, como costo por usuario activo o por transacción, y seguila en el tiempo: si crece más rápido que los ingresos, hay un problema de arquitectura. Las palancas típicas son el dimensionamiento correcto, instancias reservadas o savings plans para la carga base y spot para trabajo tolerante a interrupciones, almacenamiento por capas según la frecuencia de acceso, y elegir serverless o contenedores según el perfil de carga. Hay costos ocultos que sorprenden: transferencia de datos entre zonas y regiones, NAT gateways, volumen y retención de logs y métricas de alta cardinalidad. Ejemplo: mover logs de depuración a un muestreo del 10% y bajar la retención redujo a la mitad la factura de observabilidad. El error común es optimizar costo antes de tener producto o, al revés, ignorarlo hasta que la factura obliga a un rediseño urgente.',
        },
        {
          text: 'Aplicar threat modeling y seguridad por diseño',
          explanation:
            'El threat modeling se hace sobre un diagrama de flujo de datos: identificás los límites de confianza (internet, red interna, terceros), los datos sensibles y, con un método como STRIDE (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege), las amenazas en cada flujo. Los principios que guían el diseño son mínimo privilegio, defensa en profundidad y zero trust: no confiar en algo solo porque está en la red interna. En la práctica: autenticación centralizada con OIDC, autorización en cada servicio, mTLS o tokens entre servicios, secretos en un gestor y no en variables del repo, cifrado en tránsito y en reposo, y auditoría de accesos. Ejemplo: tokenizar las tarjetas en un único servicio reduce el alcance de PCI a ese servicio. El error común es dejar la seguridad para una revisión al final, cuando cambiar un límite de confianza ya implica rediseñar.',
        },
        {
          text: 'Diseñar la observabilidad de un sistema distribuido',
          explanation:
            'Observabilidad es poder entender qué pasa adentro del sistema a partir de lo que emite, incluso ante problemas que no anticipaste. Se apoya en logs estructurados, métricas y trazas distribuidas, correlacionados por un trace ID que viaja en cada request y mensaje; OpenTelemetry es hoy el estándar para instrumentar sin atarse a un proveedor. Las métricas base por servicio son las señales doradas: latencia, tráfico, errores y saturación. Las alertas tienen que dispararse por síntomas que afectan al usuario y por consumo del presupuesto de error, no por cada CPU alta. Ejemplo: una traza muestra que el 80% de la latencia del checkout es una llamada secuencial a un servicio de impuestos, que se puede paralelizar o cachear. El error común es loguear todo sin estructura ni muestreo, pagando mucho por datos que no responden ninguna pregunta.',
        },
        {
          text: 'Evaluar servicios gestionados contra autogestionados y el lock-in',
          explanation:
            'Un servicio gestionado (base de datos, cola, búsqueda) te ahorra operación, parches, backups y alta disponibilidad, a cambio de costo por unidad más alto, menos control y dependencia del proveedor. Autogestionar tiene sentido cuando el costo a gran escala lo justifica, hay requisitos que el servicio no cubre o el equipo ya tiene la experiencia operativa. Sobre el lock-in, la pregunta útil no es cómo evitarlo del todo, que suele ser caro, sino cuánto costaría salir y si ese riesgo es aceptable. Ejemplo: usar una base Postgres gestionada tiene bajo lock-in porque el motor es estándar; construir toda la lógica sobre un servicio propietario de un proveedor tiene alto lock-in. El error común es abstraer todo para ser "multi-cloud" por las dudas, pagando complejidad hoy por una migración que quizás nunca ocurra.',
        },
      ],
    },
    {
      id: 'decisiones-y-gobernanza',
      title: 'Decisiones, evolución y gobernanza',
      body: [
        'Una buena arquitectura no se define una vez: evoluciona con el negocio. Por eso el trabajo del arquitecto incluye documentar decisiones para que se entiendan después, verificar que la arquitectura no se degrade y planificar migraciones que no paren el negocio.',
        'Las herramientas principales son los ADRs para decisiones puntuales, las RFCs para propuestas que necesitan discusión entre equipos, el modelo C4 para comunicar la estructura, las fitness functions para verificar características de forma automática y el patrón strangler fig para migrar de a poco.',
        'A nivel organización, la arquitectura se gobierna más con influencia que con autoridad: principios claros, caminos fáciles que llevan a hacer lo correcto, y foros de decisión livianos para lo que de verdad cruza equipos. La ley de Conway recuerda que la estructura de los equipos y la del sistema se terminan pareciendo.',
        'En las preguntas de comportamiento, preparate para contar cómo convenciste a otros, cómo manejaste un desacuerdo con otro arquitecto o un equipo y cómo corregiste una decisión equivocada.',
      ],
      checklist: [
        {
          text: 'Escribir un ADR útil',
          explanation:
            'Un ADR (Architecture Decision Record) es un documento corto, de una página, que registra una decisión: título, estado (propuesto, aceptado, reemplazado), contexto con las fuerzas en juego, la decisión, las alternativas consideradas y las consecuencias positivas y negativas. Vive en el repositorio junto al código, numerado, y es inmutable: si la decisión cambia, se escribe uno nuevo que reemplaza al anterior y lo referencia. Su valor es que dentro de dos años alguien entienda por qué se hizo así y si el contexto que lo justificaba sigue vigente. Ejemplo: "ADR 7: usamos PostgreSQL como cola de trabajos en vez de RabbitMQ, porque el volumen es menor a 50 por segundo y evita operar otro sistema; revisar si superamos 500 por segundo". El error común es escribir ADRs que solo dicen qué se eligió, sin el contexto ni lo que se resignó.',
        },
        {
          text: 'Comunicar arquitectura con el modelo C4 y RFCs',
          explanation:
            'El modelo C4 organiza los diagramas en cuatro niveles de zoom: contexto (el sistema, sus usuarios y sistemas externos), contenedores (aplicaciones, bases y colas que se despliegan), componentes (las partes de un contenedor) y código. Cada nivel tiene una audiencia distinta, y en la práctica los dos primeros cubren casi todo. Un buen diagrama tiene título, leyenda, flechas rotuladas con qué fluye y cómo (HTTPS, eventos), y se mantiene versionado, por ejemplo como diagramas como código. Las RFCs son propuestas escritas para cambios que afectan a varios equipos: problema, propuesta, alternativas, riesgos y plan, con un período de comentarios y alguien que cierra la decisión. Ejemplo: una RFC para adoptar un gateway de APIs común, con un diagrama de contenedores antes y después. El error común es un diagrama de cajas y flechas sin rótulos que cada persona interpreta distinto.',
        },
        {
          text: 'Usar fitness functions para una arquitectura evolutiva',
          explanation:
            'Una fitness function es una verificación objetiva de que la arquitectura mantiene una característica deseada, idealmente automatizada en el pipeline. Pueden ser tests estructurales (con ArchUnit o dependency-cruiser, el módulo de dominio no importa infraestructura y ningún módulo accede a las tablas de otro), tests de performance (el p99 del endpoint de búsqueda no supera 200 ms bajo carga), chequeos de seguridad (ninguna dependencia con vulnerabilidades críticas) o métricas en producción (costo por request por debajo de un umbral). Permiten evolucionar rápido sin que la arquitectura se degrade en silencio y gobernar sin revisiones manuales de cada cambio. Ejemplo: un test que falla si alguien agrega una importación del módulo de facturación desde el de catálogo evita que vuelva el acoplamiento que costó meses romper. El error común es definir muchas fitness functions genéricas que nadie mira; conviene pocas, ligadas a los atributos prioritarios.',
        },
        {
          text: 'Planificar una migración incremental con strangler fig',
          explanation:
            'El patrón strangler fig reemplaza un sistema legacy de a poco: se pone una fachada (proxy, gateway o enrutamiento en el propio monolito) delante, y se migran funcionalidades una por una al sistema nuevo, redirigiendo el tráfico de cada una, hasta que el viejo queda sin uso y se apaga. Conviene empezar por algo con valor de negocio y riesgo acotado, aislar el modelo nuevo con un anti-corruption layer y validar con shadow traffic o comparando resultados en paralelo antes de cambiar el tráfico real. Los datos son la parte más difícil: hace falta sincronizar entre el sistema viejo y el nuevo mientras conviven, con CDC o eventos. Ejemplo: migrar primero el cálculo de envíos de un e-commerce legacy, con feature flags para volver atrás al instante. El error común es una reescritura big bang de dos años o una migración que queda a mitad de camino para siempre, con dos sistemas que mantener.',
        },
        {
          text: 'Gobernar la arquitectura e influir sin autoridad formal',
          explanation:
            'En organizaciones con muchos equipos, aprobar cada decisión convierte al arquitecto en un cuello de botella. Lo que escala es: principios de arquitectura cortos y claros, un camino pavimentado (templates, plataforma, librerías) que hace que lo correcto sea lo más fácil, ADRs que cada equipo escribe por su cuenta y un foro liviano solo para decisiones transversales o difíciles de revertir. Distinguí decisiones de dos vías (reversibles, que el equipo toma solo) de las de una vía (caras de revertir, que merecen más análisis). La influencia se construye escuchando, entendiendo los incentivos de cada equipo, mostrando datos y prototipos, y aceptando objeciones válidas. Ejemplo: en vez de prohibir una nueva base, ofrecer Postgres gestionado con backups y monitoreo listos hizo que los equipos lo eligieran solos. El error común es imponer estándares desde un comité sin explicar el porqué, lo que genera cumplimiento superficial y arquitecturas paralelas en las sombras.',
        },
      ],
    },
  ],
};
