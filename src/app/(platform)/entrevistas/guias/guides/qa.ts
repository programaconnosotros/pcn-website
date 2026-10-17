import type { InterviewGuide } from './types';

export const qaGuide: InterviewGuide = {
  track: 'qa',
  summary:
    'Guía de quality engineering para entrevistas: fundamentos, diseño de casos, bugs, APIs, estrategia, automatización con Cypress y Playwright y performance con k6.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista',
      body: [
        'Una entrevista de QA suele tener preguntas de fundamentos, un ejercicio de diseño de casos (te dan un formulario, una pantalla o un endpoint y tenés que decir qué probarías), preguntas sobre bugs y proceso, y, si el rol incluye automatización, una parte técnica con la herramienta que usa el equipo: código en vivo, revisión de un test existente o un take-home.',
        'En junior se espera que domines los conceptos (niveles y tipos de testing, regresión, smoke), técnicas básicas como particiones de equivalencia y valores límite, que sepas escribir un caso de prueba y un reporte de bug claros, y que te manejes con Postman y SQL básico. Si es un rol de automatización, que escribas un test simple con buenos selectores y aserciones.',
        'En semi-senior el foco pasa a priorizar con poco tiempo, aplicar técnicas más avanzadas (tablas de decisión, transición de estados, pairwise), escribir criterios de aceptación, trabajar en un equipo ágil y, en automatización, manejar flaky tests, datos de prueba, mocks y CI.',
        'En senior evalúan estrategia: cómo armar calidad en una organización, pirámide de testing, quality gates, métricas, testing en producción, microservicios, testing no funcional y cómo justificar la inversión. También cómo influís en el equipo para que la calidad sea de todos y no solo de QA.',
      ],
      checklist: [
        {
          text: 'Explicar qué evalúan en cada seniority',
          explanation:
            'Junior: que domines conceptos (niveles, tipos de testing, regresión, smoke), que apliques particiones de equivalencia y valores límite, que escribas un caso y un reporte de bug claros y que te manejes con Postman y SQL básico. Semi-senior: que priorices con poco tiempo, uses técnicas avanzadas (tablas de decisión, transición de estados, pairwise), escribas criterios de aceptación y, en automatización, resuelvas flaky tests, datos de prueba y CI sin ayuda. Senior: estrategia de calidad para un equipo u organización, pirámide de testing, quality gates, métricas, testing en producción y no funcional, y cómo lográs que la calidad sea responsabilidad de todos. Para responder bien, ubicate en un nivel y dá un ejemplo tuyo que lo demuestre, por ejemplo "en mi último equipo definí los quality gates del pipeline", en vez de recitar la lista.',
        },
        {
          text: 'Saber si el rol es manual, automatizado o mixto y con qué herramientas',
          explanation:
            'Leé la descripción del puesto buscando señales: "SDET", "automation engineer" o lenguajes de programación indican automatización; "QA analyst" o "funcional" suele ser manual; "quality engineer" casi siempre es mixto. Anotá las herramientas que nombran (Cypress, Playwright, Selenium, Postman, k6, Jira, TestRail) y preguntalo explícitamente al recruiter: qué porcentaje es manual, quién escribe los tests automatizados, en qué lenguaje y si corren en CI. Con eso decidís qué repasar: si usan Playwright con TypeScript, practicá fixtures y `getByRole()`; si es manual, diseño de casos y reportes. El error común es prepararte para todo por igual y llegar flojo justo en la herramienta que usan.',
        },
        {
          text: 'Contar en 2 minutos tu experiencia y un bug importante que encontraste',
          explanation:
            'Armá un pitch con tres partes: quién sos y en qué productos trabajaste (20 segundos), qué hacés hoy con impacto concreto, como "automaticé la regresión y bajamos de 3 días a 40 minutos" (40 segundos), y un bug importante contado como historia (1 minuto). Para el bug usá contexto, cómo lo encontraste (técnica o intuición), por qué importaba (dinero, datos, usuarios afectados) y qué cambió después, por ejemplo "un redondeo en descuentos cobraba de más en pagos en cuotas; lo encontré con valores límite y agregamos tests de montos al pipeline". Escribilo, decilo en voz alta con cronómetro y recortá hasta que entre en 2 minutos. El error típico es enumerar tecnologías sin resultados ni ejemplos.',
        },
        {
          text: 'Tener ejemplos concretos de casos de prueba y reportes que escribiste',
          explanation:
            'Prepará dos o tres casos de prueba y dos reportes de bug reales, anonimizados (sin nombres de clientes ni datos internos), que puedas describir o mostrar. Un buen caso tiene ID, título, precondiciones, datos, pasos numerados y resultado esperado verificable; un buen reporte tiene título que dice qué falla y dónde, pasos mínimos, esperado contra obtenido, entorno y evidencia. Si no tenés material propio, escribilo sobre una app pública (por ejemplo, el carrito de una demo como saucedemo) y guardalo en un repo o documento. Te van a preguntar "mostrame cómo documentás", y tener algo concreto vale más que explicar la teoría.',
        },
        {
          text: 'Conocer el producto de la empresa lo suficiente para opinar qué probarías',
          explanation:
            'Antes de la entrevista usá el producto: creá una cuenta, recorré el flujo principal (registro, compra, pago, lo que sea el core) y anotá qué te parece riesgoso. Pensá en qué rompería el negocio: en una fintech, montos, redondeos, concurrencia y seguridad; en un e-commerce, checkout, stock y precios; en un SaaS, permisos y multi-tenant. Llevá dos o tres observaciones concretas, incluso un bug menor que hayas encontrado, contado con tacto. Así demostrás pensamiento basado en riesgo y que te interesa la empresa, que es exactamente lo que buscan.',
        },
      ],
    },
    {
      id: 'fundamentos',
      title: 'Fundamentos del testing',
      body: [
        'Distinguí bien los conceptos: QA es el proceso para prevenir defectos, QC es verificar el producto y testing es la actividad de ejecutar pruebas. Un error es una equivocación humana, que produce un defecto en el código, que puede manifestarse como una falla al ejecutarse. Verificación es "¿lo construimos bien?" (contra la especificación) y validación es "¿construimos lo correcto?" (contra la necesidad del usuario).',
        'Los niveles de testing son unitario, integración, sistema y aceptación (UAT, que hacen usuarios o negocio). Los tipos se dividen en funcionales (qué hace el sistema) y no funcionales (cómo lo hace: performance, seguridad, usabilidad, accesibilidad, compatibilidad). Caja negra prueba desde afuera sin mirar el código; caja blanca usa el conocimiento de la implementación, por ejemplo para cubrir ramas.',
        'Smoke testing es una verificación rápida y amplia de que lo crítico funciona tras un build; sanity es una verificación acotada y profunda de un cambio puntual; regresión confirma que lo que funcionaba sigue funcionando después de un cambio. El STLC ordena el trabajo: análisis de requisitos, planificación, diseño de casos, preparación del entorno, ejecución y cierre.',
        'Probar todo es imposible: la combinación de entradas, estados y entornos es prácticamente infinita. Por eso el testing se basa en riesgo y técnicas de diseño, y por eso "no encontré bugs" no significa "no hay bugs". Los entrevistadores valoran que expliques los conceptos con ejemplos propios en vez de recitar definiciones de un glosario.',
      ],
      checklist: [
        {
          text: 'Diferenciar QA, QC y testing con un ejemplo',
          explanation:
            'QA (quality assurance) es orientado al proceso y busca prevenir defectos: definir criterios de aceptación, revisar requisitos, acordar una definición de done. QC (quality control) es orientado al producto y busca detectar defectos: inspeccionar lo construido antes de liberarlo. Testing es una actividad dentro de QC: ejecutar el sistema para encontrar fallas. Ejemplo: participar del refinement y detectar que la historia no dice qué pasa con un cupón vencido es QA; revisar el release antes de salir es QC; correr el caso "aplicar cupón vencido" es testing. El error común es usar "QA" como sinónimo de "el que testea", cuando QA abarca todo el proceso.',
        },
        {
          text: 'Explicar error, defecto y falla',
          explanation:
            'Un error (o equivocación) es una acción humana incorrecta, como entender mal un requisito. Ese error produce un defecto (bug o fault) en un artefacto: código, requisito o diseño. Si el código defectuoso se ejecuta en las condiciones justas, se manifiesta como una falla: el sistema se comporta distinto de lo esperado. Ejemplo: el dev interpreta "mayores de 18" como `edad > 18` (error), el código queda así (defecto) y un usuario de exactamente 18 años no puede registrarse (falla). Matiz importante: un defecto puede existir sin causar fallas nunca, si ese camino no se ejecuta, y una falla también puede venir del entorno, no solo del código.',
        },
        {
          text: 'Nombrar los niveles de testing y quién hace cada uno',
          explanation:
            'Unitario: prueba una función o clase aislada, lo escribe el desarrollador y corre en milisegundos. Integración: prueba cómo interactúan componentes (servicio con base de datos, dos módulos, una API externa), lo hacen devs o QA de automatización. Sistema: prueba el sistema completo contra los requisitos funcionales y no funcionales, suele ser responsabilidad de QA, en un entorno parecido a producción. Aceptación (UAT): valida que cumple la necesidad del negocio, la hacen el cliente, el PO o usuarios clave. Hoy en equipos ágiles las fronteras se mezclan: QA colabora en integración y aceptación, y los devs escriben tests E2E también, así que decí "suele hacerlo" en vez de reglas rígidas.',
        },
        {
          text: 'Diferenciar smoke, sanity y regresión',
          explanation:
            'Smoke es una prueba amplia y superficial de que el build es estable para seguir probando: la app levanta, se puede loguear, carga la home; si falla, se rechaza el build. Sanity es una prueba angosta y algo más profunda sobre un cambio puntual: después de arreglar el bug del cupón, verificás que el cupón y lo inmediato funcionen. Regresión es volver a ejecutar pruebas de funcionalidades existentes para confirmar que un cambio no rompió nada, suele ser amplia y es la mejor candidata a automatizar. Ejemplo en un release: smoke al deployar a staging, sanity sobre los fixes, regresión completa antes de producción. Muchos equipos usan smoke y sanity como sinónimos; aclaralo sin corregir de forma pedante.',
        },
        {
          text: 'Explicar verificación contra validación y caja negra contra caja blanca',
          explanation:
            'Verificación responde "¿lo construimos bien?": se compara contra la especificación con revisiones, inspecciones y pruebas. Validación responde "¿construimos lo correcto?": se compara contra la necesidad real del usuario, por ejemplo con UAT o pruebas con usuarios. Un sistema puede pasar la verificación y fallar la validación si la especificación estaba mal. Caja negra diseña pruebas desde el comportamiento, sin mirar el código (particiones, valores límite, tablas de decisión); caja blanca las diseña desde la estructura interna (cobertura de sentencias y ramas, caminos). Caja gris combina ambas, por ejemplo probar la UI sabiendo qué queries ejecuta para verificar en la base.',
        },
        {
          text: 'Describir las fases del STLC',
          explanation:
            'El Software Testing Life Cycle tiene seis fases: análisis de requisitos (entender qué se puede probar y aclarar ambigüedades), planificación (alcance, estrategia, riesgos, recursos, herramientas y criterios de entrada y salida), diseño de casos (escribir casos y preparar datos), preparación del entorno, ejecución (correr los casos, reportar defectos y re-testear) y cierre (métricas, reporte final y lecciones aprendidas). Cada fase tiene criterios de entrada y salida, por ejemplo no se ejecuta sin un build con smoke aprobado. En ágil esto se comprime dentro de cada sprint y se repite por historia, no es una cascada larga. Mencionar los criterios de entrada y salida es lo que diferencia una respuesta memorizada de una que entiende el proceso.',
        },
      ],
    },
    {
      id: 'diseno-de-casos',
      title: 'Diseño de casos de prueba',
      body: [
        'Las particiones de equivalencia dividen las entradas en grupos que el sistema debería tratar igual, y probás un valor por grupo, incluidos los inválidos. El análisis de valores límite prueba los bordes, donde se concentran los errores: para un campo de 1 a 100, probás 0, 1, 2, 99, 100 y 101. Usalas juntas y explicá en voz alta qué grupos encontraste.',
        'Las tablas de decisión sirven cuando el resultado depende de combinaciones de condiciones (descuentos, permisos, reglas de negocio): cada columna es una combinación con su resultado esperado. La transición de estados modela un objeto que cambia de estado (un pedido: creado, pagado, enviado, entregado, cancelado) y prueba transiciones válidas e inválidas. Pairwise reduce combinaciones de muchos parámetros probando todos los pares posibles, porque la mayoría de los bugs aparecen por la interacción de dos factores.',
        'Un buen caso de prueba tiene un identificador, un título claro, precondiciones, datos, pasos, resultado esperado y trazabilidad al requisito. Tiene que poder ejecutarlo otra persona sin preguntarte nada. El testing exploratorio complementa a los casos escritos: aprendés, diseñás y ejecutás a la vez, guiado por un charter con un objetivo y un tiempo acotado, y anotás lo que encontrás.',
        'En la entrevista, ante "¿cómo probarías esto?", no arranques tirando casos al azar. Preguntá por los requisitos, separá funcional de no funcional, aplicá técnicas, cubrí camino feliz, errores, bordes, permisos y estados, y priorizá por riesgo. Esa estructura es lo que diferencia a un candidato fuerte.',
      ],
      checklist: [
        {
          text: 'Aplicar particiones de equivalencia y valores límite a un campo',
          explanation:
            'Particiones de equivalencia divide los datos en grupos que el sistema debería tratar igual y prueba un valor representativo de cada uno, incluyendo los inválidos. Valores límite prueba justo en los bordes de cada partición, donde se concentran los errores de tipo `>` en vez de `>=`. Ejemplo para un campo edad que acepta 18 a 65: particiones menor a 18, 18 a 65 y mayor a 65, más no numérico y vacío; valores límite 17, 18, 65 y 66 (con tres valores por borde sumás 19 y 64). Juntas reducen cientos de valores posibles a unos diez casos con alta probabilidad de encontrar bugs. El error común es olvidar las particiones inválidas de tipo y formato: decimales, negativos, espacios o texto.',
        },
        {
          text: 'Armar una tabla de decisión para una regla de negocio',
          explanation:
            'Una tabla de decisión lista las condiciones como filas, las acciones resultantes abajo y cada columna es una regla: una combinación de condiciones con su resultado esperado. Con n condiciones booleanas hay 2^n combinaciones, que después simplificás uniendo las que dan el mismo resultado sin importar una condición (se marca con un guion). Ejemplo: envío gratis si el usuario es premium o la compra supera $50.000, salvo envíos internacionales; con tres condiciones salen ocho reglas y cada una se vuelve un caso de prueba. Sirve para reglas con condiciones combinadas, donde es fácil olvidar una combinación, y además destapa ambigüedades del requisito, como qué pasa si es premium e internacional.',
        },
        {
          text: 'Modelar los estados de un objeto y sus transiciones inválidas',
          explanation:
            'Transición de estados modela un objeto con estados finitos, eventos que lo hacen cambiar y transiciones válidas entre ellos. Dibujá el diagrama y armá una tabla estado por evento: cada celda dice a qué estado va o si la transición es inválida. Ejemplo de pedido: creado, pagado, enviado, entregado y cancelado; válidos son creado a pagado o pagado a enviado; inválidos son enviado a creado, entregado a cancelado o pagar dos veces. Los casos cubren cada transición válida y, sobre todo, intentos de transiciones inválidas, que es donde aparecen los bugs (por ejemplo, cancelar un pedido ya enviado y que se reintegre el dinero). También sirve probar secuencias largas, como pagar, cancelar y reintentar el pago.',
        },
        {
          text: 'Explicar qué resuelve pairwise',
          explanation:
            'Pairwise (all-pairs) resuelve la explosión combinatoria cuando hay muchos parámetros con varios valores: en vez de probar todas las combinaciones, garantiza que cada par de valores entre dos parámetros aparezca al menos una vez. Se basa en que la mayoría de los defectos los dispara un parámetro solo o la interacción de dos. Ejemplo: 3 navegadores, 3 sistemas operativos, 2 idiomas y 2 tipos de usuario son 36 combinaciones; pairwise las cubre con unas 9 o 10. Se genera con herramientas como PICT de Microsoft o generadores online, no a mano. Limitación: no detecta bugs que requieren tres factores combinados, así que para combinaciones críticas conocidas agregás casos explícitos.',
        },
        {
          text: 'Escribir un caso de prueba completo y ejecutable por otra persona',
          explanation:
            'Un caso completo tiene ID, título que dice qué verifica, precondiciones (usuario existente, datos cargados), datos de prueba concretos, pasos numerados con una acción cada uno, resultado esperado verificable y, opcionalmente, prioridad y trazabilidad al requisito. Ejemplo: "TC-042 Login con contraseña incorrecta bloquea tras 3 intentos; precondición: usuario `qa@test.com` activo; pasos: ingresar mail, ingresar `Wrong123`, enviar, repetir dos veces más; esperado: mensaje `Cuenta bloqueada por 15 minutos` y el cuarto intento con la clave correcta también falla". La prueba de fuego es que alguien sin contexto lo ejecute y llegue al mismo resultado. Errores comunes: esperados vagos como "funciona correctamente", varios objetivos en un caso y pasos que asumen conocimiento.',
        },
        {
          text: 'Planificar una sesión de testing exploratorio con un charter',
          explanation:
            'El testing exploratorio diseña y ejecuta pruebas al mismo tiempo, guiado por lo que vas aprendiendo, pero no es improvisar: se estructura con session-based testing. El charter define la misión con la forma "explorar <área> con <recursos o técnicas> para descubrir <tipo de información>", por ejemplo "explorar el checkout con cupones y medios de pago combinados para descubrir errores de cálculo". La sesión tiene un timebox de 60 a 90 minutos sin interrupciones, durante la que anotás qué probaste, bugs, dudas e ideas para nuevas sesiones. Al final hacés un debrief con el equipo. Usá heurísticas para generar ideas, como valores límite, interrupciones, concurrencia, datos raros o volver atrás en el navegador.',
        },
      ],
    },
    {
      id: 'bugs',
      title: 'Bugs: reportar, priorizar y analizar',
      body: [
        'Un buen reporte de bug tiene un título que describe el problema, entorno (versión, navegador, dispositivo, ambiente), pasos para reproducir, resultado esperado, resultado obtenido, evidencia (capturas, video, logs, request y response), severidad y prioridad. Tiene que permitir que un desarrollador lo reproduzca sin hablar con vos. Un reporte vago cuesta horas de ida y vuelta.',
        'Severidad es el impacto técnico; prioridad es la urgencia de negocio. Sabé dar ejemplos de cada combinación: el checkout que falla para todos es alta y alta; un error tipográfico en el logo de la home es baja severidad y alta prioridad; un crash en una pantalla de administración que nadie usa puede ser alta severidad y baja prioridad. El ciclo de vida típico es nuevo, asignado, en progreso, resuelto, verificado y cerrado, con reabierto, duplicado y rechazado como desvíos.',
        'Con un bug que no podés reproducir de forma consistente, buscá el patrón: datos, timing, concurrencia, caché, entorno, sesión. Revisá logs y métricas, anotá cada intento con sus condiciones y reportalo igual con la frecuencia observada y toda la evidencia. Nunca lo descartes solo porque no lo reproducís en tu máquina.',
        'En senior se espera análisis de causa raíz de los defectos que llegan a producción: por qué se introdujo, por qué no se detectó antes y qué cambio de proceso evita la familia completa de bugs, no solo ese. Herramientas como los cinco porqués sirven si terminan en acciones concretas y sin buscar culpables.',
      ],
      checklist: [
        {
          text: 'Escribir un reporte de bug reproducible con evidencia',
          explanation:
            'Un buen reporte tiene título que dice qué falla, dónde y bajo qué condición ("Checkout: el total ignora el cupón cuando se cambia la cantidad"), pasos mínimos numerados para reproducir, resultado esperado contra obtenido, entorno (versión, navegador, sistema operativo, usuario, ambiente), severidad y evidencia: captura, video, logs de consola, la request y response de la pestaña Network o el request ID. Antes de reportarlo, reproducilo de nuevo, reducí los pasos al mínimo y buscá si ya existe un duplicado. Un reporte, un bug; no mezcles problemas. Es fáctico, sin juicios ni culpas: el objetivo es que el dev lo reproduzca a la primera sin preguntarte nada.',
        },
        {
          text: 'Dar un ejemplo de cada combinación de severidad y prioridad',
          explanation:
            'Severidad es el impacto técnico del defecto en el sistema, la suele definir QA; prioridad es la urgencia de arreglarlo según el negocio, la decide el PO o el equipo. Alta severidad y alta prioridad: el pago falla para todos los usuarios. Alta severidad y baja prioridad: la app crashea al exportar un reporte en un navegador viejo que usa el 0,1% de los usuarios. Baja severidad y alta prioridad: el logo de la empresa o el nombre de un cliente importante está mal escrito en la home el día del lanzamiento. Baja severidad y baja prioridad: un error de alineación en una pantalla de configuración poco usada. El punto es mostrar que son ejes independientes.',
        },
        {
          text: 'Describir el ciclo de vida de un defecto',
          explanation:
            "El ciclo típico es: nuevo (se reporta), asignado (triage y se le da a un dev), abierto o en progreso, corregido, listo para re-test, re-test por QA y cerrado si se verifica, o reabierto si sigue fallando. Hay salidas alternativas: rechazado (no es un bug, funciona según lo especificado), duplicado, no reproducible, diferido (se arregla en otro release) y won't fix. Después de cerrar, se suma un test de regresión para que no vuelva. Los nombres varían según la herramienta (Jira, Azure DevOps); lo importante es explicar quién mueve cada estado y por qué, y que el cierre lo hace quien verifica, no quien corrige.",
        },
        {
          text: 'Explicar cómo encarás un bug intermitente',
          explanation:
            'Primero juntá datos: cuándo ocurre, a quién, con qué frecuencia, en qué entorno, con logs, request IDs y timestamps de cada ocurrencia. Después buscá el patrón variando una cosa por vez: datos (usuarios con cierta configuración), timing (doble click, red lenta con throttling de DevTools), concurrencia (dos pestañas o dos usuarios editando lo mismo), estado (caché, sesión vieja), entorno (un nodo específico detrás del balanceador) o fecha y zona horaria. Las causas típicas son race conditions, caché, dependencias externas, datos compartidos y timeouts. Reportalo igual aunque no lo reproduzcas siempre, indicando la frecuencia ("3 de cada 20 intentos") y toda la evidencia. El error es descartarlo como "no reproducible" sin investigar.',
        },
        {
          text: 'Hacer un análisis de causa raíz de un bug escapado a producción',
          explanation:
            'El objetivo es entender por qué el defecto se introdujo y por qué no lo detectamos, sin buscar culpables (postmortem blameless). Usá los 5 porqués: el total se calculó mal, porque el redondeo se hacía antes del descuento, porque el requisito no lo especificaba, porque no hubo revisión con finanzas, porque el refinement no incluye a ese rol. Separá dos preguntas: causa de introducción (requisito, código, configuración) y causa de escape (no había caso, el entorno no tenía datos reales, el test existía pero estaba deshabilitado). Terminá en acciones concretas con dueño: agregar el test de regresión, cambiar el checklist de refinement, sumar un monitor. Un ishikawa (espina de pescado) ayuda a ordenar causas por categoría.',
        },
      ],
    },
    {
      id: 'apis-y-plataformas',
      title: 'APIs, datos y plataformas',
      body: [
        'Probar APIs es central incluso en roles manuales. Con Postman o similar armás requests, usás variables de entorno, encadenás llamadas (por ejemplo, guardar el token del login) y escribís aserciones sobre status, body y headers. Sabé los códigos: `201` al crear, `400` por datos inválidos, `401` sin autenticación, `403` sin permisos, `404` si no existe, `409` por conflicto y `5xx` cuando falla el servidor. En un `POST /users` probá validaciones, duplicados, campos extra, tipos incorrectos, límites, autorización e idempotencia.',
        'SQL te permite preparar datos de prueba, verificar que una acción en la UI guardó lo correcto y validar migraciones: contar registros antes y después, buscar nulos donde no debería haberlos, huérfanos con `LEFT JOIN` y duplicados con `GROUP BY ... HAVING COUNT(*) > 1`. Con datos sensibles, usá datos sintéticos o anonimizados, nunca copias crudas de producción.',
        'En accesibilidad, una revisión manual incluye navegar solo con teclado (orden de foco, foco visible, sin trampas), probar con un lector de pantalla, revisar contraste, textos alternativos, etiquetas de formularios y zoom al 200%, usando WCAG como referencia. En usabilidad, mirás si el usuario entiende qué hacer, recibe feedback y se recupera de errores.',
        'En mobile sumás interrupciones (llamadas, notificaciones), cambios de red y modo avión, rotación, permisos, distintos tamaños y versiones de sistema operativo, batería y actualizaciones de la app. Para elegir navegadores y dispositivos, usá los datos de analytics de los usuarios reales y el riesgo, no una lista genérica.',
      ],
      checklist: [
        {
          text: 'Probar un endpoint con Postman con variables y aserciones',
          explanation:
            "Creá un environment con variables como `baseUrl` y `token`, y usalas como `{{baseUrl}}/users`, así el mismo request corre en dev o staging cambiando de entorno. Encadená llamadas guardando datos en un post-response script: después del login, `pm.environment.set('token', pm.response.json().token)`, y en los siguientes usás `Bearer {{token}}`. Escribí aserciones en la pestaña de scripts: `pm.test('status 201', () => pm.response.to.have.status(201))` y otras sobre el body, headers y tiempo de respuesta. Agrupá en colecciones y corrélas con el Collection Runner o con Newman en CI. El error común es mirar la respuesta a ojo sin aserciones, que no escala ni sirve para regresión.",
        },
        {
          text: 'Explicar los códigos de estado más comunes con un caso de cada uno',
          explanation:
            '`200 OK` para un GET exitoso; `201 Created` al crear un recurso con POST, idealmente con header `Location`; `204 No Content` para un DELETE exitoso sin body. `400 Bad Request` por datos mal formados o validación fallida, como un mail inválido (algunas APIs usan `422` para validación semántica); `401 Unauthorized` cuando falta el token o es inválido, es decir, no sabemos quién sos; `403 Forbidden` cuando sabemos quién sos pero no tenés permiso, como un usuario común borrando a otro; `404 Not Found` si el recurso no existe; `409 Conflict` por un mail duplicado; `429 Too Many Requests` por rate limit. `500` es un error no controlado del servidor y `502`, `503` o `504` son problemas de gateway, disponibilidad o timeout. Un bug clásico a reportar es un `500` ante input inválido: debería ser un `4xx`.',
        },
        {
          text: 'Listar casos para un `POST /users` más allá del camino feliz',
          explanation:
            "Validaciones: campos obligatorios ausentes, vacíos o `null`, tipos incorrectos (número donde va string), formatos inválidos de mail, largos en los límites y por encima. Unicidad: mail duplicado, incluso variando mayúsculas o con espacios. Campos extra: mandar `role: 'admin'` o `id` para detectar mass assignment. Seguridad: sin token, token vencido, usuario sin permiso, inyección SQL o scripts en los campos, que la respuesta no devuelva el password ni su hash. Contrato: status `201`, header `Content-Type`, body según el schema. Robustez: JSON mal formado, body gigante, caracteres Unicode y emojis en nombres, y dos requests idénticos simultáneos para ver si crea duplicados (idempotencia y concurrencia). Por último, verificar en la base que se guardó bien.",
        },
        {
          text: 'Verificar con SQL la integridad de datos después de una migración',
          explanation:
            'Compará origen y destino con consultas concretas: conteos por tabla (`SELECT COUNT(*)`), sumas de columnas numéricas como montos para detectar redondeos, y muestreos de registros comparando campo por campo. Buscá huérfanos con `LEFT JOIN`, por ejemplo pedidos sin usuario: `SELECT o.id FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE u.id IS NULL`. Buscá duplicados con `GROUP BY email HAVING COUNT(*) > 1`, nulls en columnas que no deberían tenerlos y valores fuera de rango. Revisá conversiones de tipos, encoding (tildes y eñes), zonas horarias en fechas y valores por defecto en columnas nuevas. Dejá las queries guardadas para re-ejecutarlas en cada ensayo de la migración.',
        },
        {
          text: 'Hacer una revisión manual de accesibilidad de una pantalla',
          explanation:
            'Empezá con el teclado: navegá con Tab y Shift+Tab, verificá que todo lo interactivo sea alcanzable, que el orden sea lógico, que el foco sea visible y que Escape cierre modales sin dejar el foco atrapado. Después revisá con un lector de pantalla (NVDA en Windows, VoiceOver en Mac): botones e inputs con nombre accesible, labels asociados, imágenes con `alt`, errores de formulario anunciados. Chequeá contraste (4.5:1 para texto normal según WCAG 2.2 AA), zoom al 200% sin perder contenido y que la información no dependa solo del color. Complementá con herramientas automáticas como axe DevTools o Lighthouse, sabiendo que detectan solo una parte de los problemas; lo manual es imprescindible.',
        },
        {
          text: 'Elegir navegadores y dispositivos a partir de datos reales',
          explanation:
            'Usá datos de uso reales del producto (Google Analytics o la herramienta de analítica que tengan) para ver qué navegadores, versiones, sistemas operativos y resoluciones usan los usuarios, y priorizá por porcentaje de tráfico y, sobre todo, de conversión o ingresos. Si el producto es nuevo, usá datos del mercado objetivo (StatCounter por país). Armá una matriz: cobertura completa en los más usados (típicamente Chrome desktop y Android, Safari en iOS), smoke en el resto y fuera de alcance lo marginal. Recordá que en iOS todos los navegadores usan WebKit, así que Safari real importa. Para cubrir dispositivos sin tenerlos, usá BrowserStack o Sauce Labs, y emuladores solo para lo básico.',
        },
      ],
    },
    {
      id: 'estrategia',
      title: 'Proceso y estrategia de calidad',
      body: [
        'En un equipo ágil, QA participa desde el refinamiento: hace preguntas, detecta ambigüedades y ayuda a escribir criterios de aceptación en Given/When/Then. BDD aporta conversación compartida entre negocio, desarrollo y QA sobre ejemplos concretos; Gherkin es solo la sintaxis. Shift-left es mover la calidad antes (revisar requisitos, tests unitarios, análisis estático) y shift-right es aprender en producción (monitoreo, feature flags, canary releases), y se complementan.',
        'Un plan de pruebas define alcance, fuera de alcance, enfoque, entornos, datos, riesgos, criterios de entrada y salida, y responsables. La matriz de trazabilidad conecta requisitos con casos y defectos para ver qué quedó sin cubrir. Cuando hay poco tiempo, priorizá por riesgo: impacto en el usuario y el negocio por probabilidad de falla, y comunicá qué quedó sin probar.',
        'En senior te van a pedir estrategia: pirámide de testing y cuándo desviarte, quality gates en el pipeline (tests, cobertura de lo nuevo, análisis estático, seguridad), métricas útiles (defectos escapados, tiempo de detección y de corrección, tasa de flaky, change failure rate) y métricas a evitar (cantidad de casos o de bugs reportados por persona). También cómo incorporar performance, seguridad y accesibilidad sin un equipo dedicado.',
        'Los escenarios difíciles también se preguntan: salir a producción con bugs conocidos (informar el riesgo con datos, proponer mitigaciones y dejar la decisión explícita en quien corresponde), calidad con deploys continuos, microservicios con tests de contrato, un sistema legacy sin tests (empezar por tests de caracterización de los flujos críticos) y cómo armar QA en una organización que no lo tiene. La cultura de calidad se construye haciendo que el equipo sea dueño de ella, no siendo el último filtro.',
      ],
      checklist: [
        {
          text: 'Escribir criterios de aceptación en Given/When/Then',
          explanation:
            'El formato Gherkin describe un escenario con Given (contexto o precondición), When (la acción) y Then (el resultado observable), con And para encadenar. Ejemplo: "Given un usuario con un cupón vencido en el carrito, When intenta pagar, Then ve el mensaje `Cupón vencido` And el total no incluye el descuento". Cada escenario prueba un comportamiento, se escribe en lenguaje de negocio, sin detalles de UI como "hace click en el botón azul", y tiene un Then verificable. Se escriben antes de desarrollar, en conjunto entre PO, dev y QA (three amigos), y se vuelven casos de prueba o tests automatizados con Cucumber. Error común: escenarios larguísimos con muchos When y Then, que en realidad son varios escenarios.',
        },
        {
          text: 'Explicar shift-left y shift-right con prácticas concretas',
          explanation:
            'Shift-left es mover la calidad hacia el principio del ciclo, porque un defecto cuesta menos cuanto antes se detecta: QA en refinement, three amigos, criterios de aceptación antes de codear, revisión de requisitos, tests unitarios y de contrato, análisis estático y tests corriendo en cada PR. Shift-right es testear y aprender en producción, porque hay cosas que solo aparecen con usuarios y datos reales: feature flags, canary releases, A/B testing, monitoreo y alertas, synthetic monitoring (un test E2E que corre cada pocos minutos contra producción), observabilidad y chaos engineering. No compiten, se complementan. Al responder, dá una práctica concreta que hayas aplicado de cada uno.',
        },
        {
          text: 'Armar un plan de pruebas y una priorización por riesgo',
          explanation:
            'Un plan de pruebas define alcance (qué entra y qué no), enfoque (niveles, tipos, manual o automatizado), entornos y datos, criterios de entrada y salida, riesgos, roles y calendario; en ágil suele ser un documento corto por release o feature. Para priorizar por riesgo, calculá riesgo como probabilidad de falla por impacto: la probabilidad sube con complejidad, cambios recientes, código nuevo o historial de bugs; el impacto con dinero, datos, cantidad de usuarios o temas legales. Con una matriz de 3 por 3 decidís profundidad: alto riesgo con pruebas exhaustivas y automatizadas, bajo con smoke o nada. Ejemplo: en un e-commerce, checkout y pagos arriba, cambiar el avatar abajo. Así, si recortan tiempo, sabés qué sacrificar y lo comunicás explícitamente.',
        },
        {
          text: 'Definir quality gates para un pipeline',
          explanation:
            'Un quality gate es un criterio automático que bloquea el avance si no se cumple. En cada PR: lint y type-check sin errores, tests unitarios y de integración en verde, cobertura del código nuevo por encima de un umbral (por ejemplo 80% con SonarQube), sin vulnerabilidades críticas en dependencias (Dependabot, Snyk) y code review aprobado. Antes de deployar a producción: smoke E2E en staging, tests de contrato, thresholds de performance de k6 en verde y migraciones probadas. Después del deploy: smoke en producción y monitoreo que dispare rollback automático. Los gates tienen que ser rápidos y confiables: un gate flaky hace que el equipo lo ignore o lo saltee, y pierde todo valor.',
        },
        {
          text: 'Proponer métricas de calidad útiles y explicar cuáles evitar',
          explanation:
            'Útiles: defectos escapados a producción y su severidad, tasa de fallas de cambios y tiempo medio de recuperación (de las métricas DORA, junto con frecuencia de deploy y lead time), tiempo de feedback del pipeline, tasa de flaky tests, y tendencias de incidentes. Sirven porque miden resultados para el usuario y la velocidad del equipo. A evitar: cantidad de bugs reportados por tester o cantidad de casos escritos, porque incentivan reportes inflados y casos inútiles (ley de Goodhart: cuando una métrica se vuelve objetivo, deja de ser buena métrica); y cobertura de código como objetivo absoluto, porque 90% de cobertura con aserciones débiles no garantiza nada. Usá las métricas para mejorar el proceso, nunca para evaluar personas.',
        },
        {
          text: 'Manejar la presión de salir con bugs conocidos',
          explanation:
            'Tu rol no es bloquear ni aprobar sola la salida, sino dar información clara para que el negocio decida con los riesgos a la vista. Listá los bugs conocidos con severidad, impacto concreto (a quién afecta, cuántos usuarios, si hay workaround) y probabilidad, y separá los bloqueantes reales (pérdida de dinero o datos, seguridad, flujo crítico roto) de los tolerables. Proponé mitigaciones: ocultar la funcionalidad con un feature flag, un release parcial, monitoreo extra, comunicar el workaround a soporte y un plan para el fix. Dejá la decisión y el riesgo aceptado documentados por quien corresponda, normalmente el PO. En la entrevista contalo con un ejemplo real en formato STAR.',
        },
        {
          text: 'Diseñar una estrategia de calidad para una organización sin QA',
          explanation:
            'Empezá por diagnosticar: hablá con el equipo, mirá incidentes recientes, de dónde vienen los bugs y qué flujos dan dinero. Después priorizá quick wins: smoke E2E de los dos o tres flujos críticos corriendo en CI, una plantilla de reporte de bugs y criterios de aceptación en las historias. En una segunda etapa, construí la pirámide: tests unitarios como parte de la definición de done, tests de integración y API, quality gates en el pipeline y monitoreo en producción. El objetivo es que la calidad sea responsabilidad del equipo y no de un departamento: QA como coach que enseña, define estándares y construye herramientas, no como cuello de botella. Mostrá métricas antes y después (bugs escapados, tiempo de regresión) para justificar la inversión.',
        },
      ],
    },
    {
      id: 'automatizacion',
      title: 'Automatización de pruebas',
      body: [
        'La pirámide de testing propone muchos tests unitarios (rápidos y baratos), menos de integración y pocos E2E (lentos y frágiles, pero cercanos al usuario). Automatizá lo repetitivo, estable y de alto riesgo: regresión de flujos críticos, smoke, APIs y combinaciones de datos. Lo exploratorio, la usabilidad y lo que cambia todo el tiempo siguen siendo manuales. El ROI se justifica en tiempo de regresión ahorrado, defectos detectados antes y frecuencia de release.',
        'Un buen test automatizado es independiente, determinístico, prueba una cosa y tiene un nombre que describe el comportamiento. Usá selectores estables y orientados al usuario (rol, label, texto o un `data-testid`), no clases CSS ni XPath frágiles. Una buena aserción verifica el resultado que importa al usuario, con un mensaje claro cuando falla. Cada test crea sus propios datos, idealmente por API, y no depende del orden de ejecución.',
        'Un flaky test pasa y falla sin cambios en el código. Las causas típicas son esperas fijas, dependencias entre tests, datos compartidos, animaciones, concurrencia y entornos inestables. Se encara midiendo la tasa de flakiness, poniendo en cuarentena los peores, arreglando la causa y no tapándola con reintentos. Page Object Model encapsula la interacción con cada pantalla para no repetir selectores; su riesgo es crecer hasta ser una capa enorme con lógica escondida.',
        'Mock, stub y fake son dobles de prueba: el stub devuelve respuestas fijas, el mock además verifica cómo se lo llamó y el fake es una implementación simplificada que funciona. En E2E se mockea para simular errores o servicios de terceros, sabiendo que perdés cobertura de la integración real. En CI, corré lo rápido en cada PR y lo pesado de forma programada, paralelizá, publicá reportes con trazas y screenshots. Los tests de contrato (por ejemplo con Pact) verifican que proveedor y consumidor de una API sigan de acuerdo sin levantar todo el sistema.',
      ],
      checklist: [
        {
          text: 'Explicar la pirámide de testing y qué automatizarías primero',
          explanation:
            'La pirámide propone muchos tests unitarios en la base (rápidos, baratos, estables), menos de integración o API en el medio y pocos E2E arriba (lentos, caros, frágiles, pero los que más se parecen al usuario). El anti-patrón es el cono de helado: casi todo E2E o manual, con suites lentas y flaky. Variantes como el testing trophy de Kent C. Dodds ponen más peso en integración, que suele tener el mejor costo-beneficio en frontends. Para decidir qué automatizar primero, elegí lo que se repite mucho, es estable y tiene alto riesgo: smoke de los flujos críticos (login, checkout), regresión de APIs y casos con muchos datos. No automatices funcionalidades que cambian todas las semanas ni pruebas de usabilidad.',
        },
        {
          text: 'Elegir un selector robusto y justificarlo',
          explanation:
            "Un selector robusto depende de lo que el usuario ve o de un contrato explícito, no de la estructura del DOM ni del estilo. En orden de preferencia: rol y nombre accesible (`getByRole('button', { name: 'Comprar' })` en Playwright o Testing Library), label o texto visible, y un atributo dedicado como `data-testid` o `data-cy` cuando no hay algo semántico. A evitar: clases CSS (cambian con el diseño o vienen generadas, como `css-1x2y3z`), XPath largos como `/div[3]/span[2]` e índices. Los selectores por rol además verifican accesibilidad: si no podés encontrar el botón por su nombre, un lector de pantalla tampoco. Justificalo en términos de mantenimiento: un rediseño visual no debería romper los tests.",
        },
        {
          text: 'Diagnosticar y arreglar un flaky test',
          explanation:
            'Un flaky test pasa y falla con el mismo código. Primero reproducilo: correlo muchas veces (`--repeat-each=50` en Playwright, o en loop), en CI y localmente, y juntá evidencia con traces, videos y logs. Las causas más comunes son esperas fijas o ausentes (timing), dependencia entre tests o datos compartidos, orden de ejecución, animaciones, dependencias externas inestables, fechas y zonas horarias, y recursos limitados en CI. Arreglos: reemplazar `sleep` por esperas de condición o aserciones con reintento, aislar datos por test, mockear servicios externos y esperar requests concretas. Mientras lo arreglás, ponelo en cuarentena con un ticket; no lo borres ni subas el número de retries para taparlo, porque a veces el flaky es un bug real de concurrencia del producto.',
        },
        {
          text: 'Manejar datos de prueba para que los tests sean independientes',
          explanation:
            'Cada test tiene que crear lo que necesita, no depender de lo que dejó otro test ni de datos cargados a mano. Lo ideal es crear los datos por API o directamente en la base en el setup (más rápido y estable que por UI), con valores únicos, por ejemplo un mail con timestamp o UUID, para poder correr en paralelo sin colisiones. Limpiá en el teardown o, mejor, diseñá para no necesitar limpieza: datos únicos por ejecución o una base efímera por pipeline (contenedores con Testcontainers o seeds). Para datos estáticos, usá factories o builders en lugar de fixtures JSON gigantes. El síntoma de mal manejo es que los tests pasan solos y fallan juntos, o al revés.',
        },
        {
          text: 'Diferenciar mock, stub y fake',
          explanation:
            'Son tipos de test doubles, objetos que reemplazan a una dependencia real. Un stub devuelve respuestas predefinidas y sirve para controlar entradas: un servicio de clima que siempre devuelve 25 grados. Un mock, además de responder, verifica cómo fue usado: que se llamó a `sendEmail` una vez con cierto destinatario, es decir, verifica comportamiento. Un fake es una implementación funcional pero simplificada: una base en memoria o un servidor de pagos de prueba. También existen spies, que registran llamadas a la implementación real, y dummies, que solo rellenan parámetros. En la práctica se dice "mock" para todo; mostrá que conocés la diferencia y que abusar de mocks hace tests acoplados a la implementación.',
        },
        {
          text: 'Proponer cómo acelerar una suite E2E de 90 minutos',
          explanation:
            'Primero medí: qué tests tardan más, cuánto es setup y cuánto tiempo se va en esperas. Después atacá por capas: paralelizar y shardear entre máquinas (Playwright soporta `--shard=1/4` nativo), hacer el login una sola vez y reutilizar la sesión, crear datos por API en vez de por UI, y eliminar esperas fijas. Revisá la pirámide: muchos E2E pueden bajar a tests de API o componentes, que corren en segundos, y otros son duplicados. Separá la suite: un smoke de 5 a 10 minutos en cada PR y la regresión completa nightly o antes del release, o corré solo los tests afectados por el cambio. Mockeá servicios externos lentos. Con eso, bajar a 10 o 15 minutos es realista.',
        },
        {
          text: 'Explicar qué son los tests de contrato',
          explanation:
            'Un test de contrato verifica que un consumidor (frontend u otro servicio) y un proveedor (una API) coinciden en el formato de las interacciones, sin levantar todo el sistema. En el enfoque consumer-driven, con Pact como herramienta más usada, el consumidor define en sus tests qué requests hace y qué respuesta espera; eso genera un contrato que se publica (por ejemplo en un Pact Broker) y el proveedor lo verifica en su pipeline. Si el proveedor renombra un campo que el consumidor usa, su build falla antes de deployar. Resuelve un problema clave de los microservicios: los E2E entre muchos servicios son lentos y frágiles, y los mocks pueden quedar desactualizados. No reemplaza las pruebas funcionales del proveedor, solo valida la compatibilidad.',
        },
      ],
    },
    {
      id: 'cypress',
      title: 'Cypress',
      body: [
        'Cypress corre los tests dentro del navegador, junto a la aplicación, lo que le da acceso directo al DOM, a la red y a una gran experiencia de debugging con time travel. A diferencia de Selenium, no usa WebDriver. Un test usa `describe` e `it`, visita una página con `cy.visit()`, encuentra elementos con `cy.get()` (por selector) o `cy.contains()` (por texto) y verifica con `.should()`. `cypress open` abre la interfaz interactiva para desarrollar y `cypress run` corre headless para CI.',
        'Los comandos de Cypress no son promesas: se encolan y se ejecutan en orden, por eso no se usa `async/await` y los valores se obtienen con `.then()` o aliases. Las queries como `get`, `find` y `contains` se reintentan junto con la aserción siguiente hasta que pasa o vence el timeout; las acciones como `click` o `type` no se reintentan. Por eso casi nunca hace falta `cy.wait(2000)`: si esperás una request, usá `cy.intercept()` con un alias y `cy.wait("@alias")`.',
        '`cy.intercept()` sirve para esperar, espiar o mockear requests, por ejemplo para simular un error 500. Las fixtures son archivos de datos que usás como respuestas o inputs. Los custom commands encapsulan acciones repetidas como el login, y `cy.session()` cachea cookies y storage de la sesión entre tests para no loguearse por la UI cada vez. `cy.task()` ejecuta código en Node, útil para preparar la base de datos o leer archivos. Los entornos se configuran en `cypress.config` y con variables de entorno.',
        'Sabé sus limitaciones: una sola pestaña, soporte de multi-dominio con `cy.origin()`, WebKit solo experimental y sin múltiples navegadores en el mismo test. Para paralelizar en CI se reparten specs entre máquinas, con Cypress Cloud o con un plugin de split. El component testing monta componentes aislados y es más rápido que E2E para lógica de UI. Malas prácticas comunes: esperas fijas, selectores frágiles, tests que dependen de otros, login por UI en cada test y aserciones sobre detalles de implementación.',
      ],
      checklist: [
        {
          text: 'Escribir un test de login con selectores estables y aserciones',
          explanation:
            "En Cypress: `cy.visit('/login')`, después `cy.get('[data-cy=email]').type('qa@test.com')`, `cy.get('[data-cy=password]').type(password, { log: false })`, `cy.get('[data-cy=submit]').click()` y aserciones sobre el resultado observable: `cy.location('pathname').should('eq', '/dashboard')` y `cy.contains('Hola, Ana').should('be.visible')`. Usá atributos `data-cy` o `cy.contains()` con el texto visible, nunca clases CSS. Las credenciales vienen de variables de entorno (`Cypress.env('password')`), no hardcodeadas. Agregá también los casos negativos: credenciales inválidas muestran un error y no redirigen. Error común: terminar el test sin aserción después del click, que pasa aunque el login falle.",
        },
        {
          text: 'Explicar por qué los comandos no son promesas',
          explanation:
            "Los comandos de Cypress como `cy.get()` o `cy.click()` no ejecutan nada en el momento: se encolan, y Cypress los corre después en orden, de forma asíncrona, reintentando y esperando. Por eso no devuelven el valor y no podés usar `await` ni hacer `const el = cy.get('button')` y usarlo como elemento. Para trabajar con el valor usás `.then()`, que parece de promesas pero es propio de Cypress, o aliases con `.as()`. Error clásico: `let total; cy.get('.total').then($el => { total = $el.text() }); expect(total)...` falla porque el `expect` corre sincrónicamente antes de que se ejecute la cola; la aserción tiene que ir dentro del `.then()` o encadenada con `.should()`. Tampoco se mezclan con `async/await`.",
        },
        {
          text: 'Explicar qué comandos se reintentan y cuáles no',
          explanation:
            "Cypress reintenta las queries (`cy.get()`, `cy.find()`, `cy.contains()`, `.its()` y similares) junto con las aserciones encadenadas, hasta que la aserción pasa o vence el timeout de 4 segundos por defecto. Las acciones (`.click()`, `.type()`) no se reintentan: esperan una vez a que el elemento sea accionable y se ejecutan una sola vez, porque repetirlas tendría efectos secundarios. Comandos como `cy.request()` o `.then()` tampoco se reintentan. Desde Cypress 12, toda la cadena de queries se re-ejecuta, lo que evita los errores de elementos desprendidos del DOM. Consecuencia práctica: preferí `cy.get('.total').should('have.text', '$100')`, que reintenta, a leer el texto en un `.then()` y comparar, que evalúa una sola vez.",
        },
        {
          text: 'Mockear y esperar una request con `cy.intercept()`',
          explanation:
            "Con `cy.intercept()` interceptás requests de red del navegador: podés espiarlas, modificarlas o devolver una respuesta falsa. Ejemplo: `cy.intercept('GET', '/api/products*', { fixture: 'products.json' }).as('getProducts')`, después `cy.visit('/shop')` y `cy.wait('@getProducts')` espera a que ocurra; incluso podés afirmar sobre ella con `.its('response.statusCode').should('eq', 200)`. Sirve para probar estados difíciles de producir: errores `500`, listas vacías o respuestas lentas con `delay`. Definí el intercept antes de la acción que dispara la request, si no, se pierde. Reemplazar `cy.wait(3000)` por `cy.wait('@alias')` es de las mejores formas de eliminar flakiness.",
        },
        {
          text: 'Usar `cy.session()` y custom commands para el login',
          explanation:
            "Un custom command encapsula pasos repetidos: `Cypress.Commands.add('login', (email, password) => { ... })` en `cypress/support/commands`, y en los tests usás `cy.login(email, password)`. Combinado con `cy.session()`, el login se hace una vez y Cypress cachea cookies, `localStorage` y `sessionStorage` bajo una clave: `cy.session([email], () => { cy.request('POST', '/api/login', { email, password }) }, { validate() { cy.request('/api/me').its('status').should('eq', 200) } })`. En los tests siguientes restaura la sesión en vez de repetir el login, lo que acelera mucho la suite. El login por `cy.request()` en vez de por UI es otra mejora: solo un test valida la UI del login. Con `cacheAcrossSpecs: true` la sesión se comparte entre archivos.",
        },
        {
          text: 'Nombrar las limitaciones de Cypress y cómo sortearlas',
          explanation:
            'Cypress corre dentro del navegador, junto con la app, y eso trae límites. No maneja varias pestañas: se sortea quitando el `target=_blank` o verificando el `href`. Multi-dominio: hoy se resuelve con `cy.origin()`. Solo JavaScript o TypeScript, y el soporte de WebKit es experimental, así que Safari queda flojo. No hay paralelización nativa gratis: se usa Cypress Cloud o sharding propio en CI. Tampoco se pueden manejar dos navegadores a la vez para probar, por ejemplo, un chat entre dos usuarios: se simula uno por API. Iframes requieren workarounds. Para eventos nativos como hover real se usan plugins como `cypress-real-events`. Si estos límites pesan en tu caso, Playwright es la alternativa natural.',
        },
      ],
    },
    {
      id: 'playwright',
      title: 'Playwright',
      body: [
        'Playwright controla Chromium, Firefox y WebKit con una sola API, soporta varias pestañas, dominios y contextos, y trae un test runner con paralelismo, fixtures, reportes y trace viewer. Los locators son la forma recomendada de encontrar elementos: `page.getByRole()`, `getByLabel()` y `getByText()` se parecen a cómo el usuario percibe la página y resisten cambios de CSS. Los locators son perezosos: se resuelven al momento de actuar.',
        'El auto-waiting espera a que el elemento esté visible, habilitado y estable antes de cada acción. Las web-first assertions como `await expect(locator).toBeVisible()` se reintentan hasta el timeout, mientras que `expect(await locator.isVisible()).toBe(true)` evalúa una sola vez y genera flakiness. `browser` es la instancia del navegador, `context` es una sesión aislada (cookies, storage) y `page` es una pestaña; cada test recibe un context nuevo.',
        'Para no loguearte por la UI en cada test, usá un setup project que haga login una vez y guarde el `storageState`, y que los demás projects lo reutilicen. Los fixtures inyectan dependencias en los tests (page objects, usuarios, datos) con setup y teardown. Con `page.route()` interceptás y mockeás respuestas, y con el fixture `request` hacés tests de API o preparás datos. Los projects en `playwright.config.ts` permiten correr la suite en varios navegadores, dispositivos o configuraciones.',
        'Para investigar fallas en CI, configurá `trace: "on-first-retry"` y abrí el trace con DOM, red, consola y screenshots de cada paso. Escalá con workers en paralelo y `--shard` entre máquinas, uniendo los reportes con `merge-reports`. Visual regression con `toHaveScreenshot()` necesita un entorno de render fijo (por ejemplo, un contenedor), enmascarar contenido dinámico y un proceso para aprobar cambios. Frente a Cypress, Playwright gana en multi-navegador, multi-pestaña y paralelismo nativo; Cypress tiene una experiencia interactiva muy pulida y un component testing maduro.',
      ],
      checklist: [
        {
          text: 'Escribir un test con `getByRole()` y web-first assertions',
          explanation:
            "Ejemplo: `test('agrega al carrito', async ({ page }) => { await page.goto('/products/1'); await page.getByRole('button', { name: 'Agregar al carrito' }).click(); await expect(page.getByRole('status')).toHaveText('1 producto en el carrito'); })`. `getByRole()` busca por rol ARIA y nombre accesible, como lo percibe un usuario o un lector de pantalla, y es el locator recomendado. Las web-first assertions como `toBeVisible()`, `toHaveText()` o `toHaveURL()` reintentan automáticamente hasta que se cumplen o vence el timeout (5 segundos por defecto). Error común: `expect(await locator.textContent()).toBe('...')`, que lee una sola vez sin reintentar y genera flakiness; usá siempre `await expect(locator).toHaveText()`.",
        },
        {
          text: 'Explicar `browser`, `context` y `page`',
          explanation:
            '`browser` es una instancia del navegador (Chromium, Firefox o WebKit), costosa de levantar, y se comparte entre tests. `context` (BrowserContext) es una sesión aislada dentro del navegador, como un perfil de incógnito: tiene sus propias cookies, storage, permisos, geolocalización y viewport, y se crea en milisegundos. `page` es una pestaña dentro de un context. Playwright Test crea un context nuevo por test, y eso da aislamiento total sin el costo de abrir otro navegador. Con varios contexts en un mismo test podés simular dos usuarios a la vez, por ejemplo un admin y un cliente en un chat, algo que Cypress no puede hacer.',
        },
        {
          text: 'Reutilizar la sesión con `storageState` y un setup project',
          explanation:
            "En `playwright.config` definís un project `setup` que matchea un archivo como `auth.setup.ts`: ese test hace el login una vez y guarda el estado con `await page.context().storageState({ path: 'playwright/.auth/user.json' })`. Los projects de tests declaran `dependencies: ['setup']` y `use: { storageState: 'playwright/.auth/user.json' }`, así cada test arranca ya logueado con esas cookies y ese `localStorage`. Para varios roles guardás un archivo por rol y los usás por project o con `test.use()`. Agregá la carpeta `.auth` al `.gitignore` porque contiene sesiones válidas. Comparado con un `globalSetup`, el setup project aparece en el reporte y el trace, y se puede debuggear como cualquier test.",
        },
        {
          text: 'Crear un fixture propio',
          explanation:
            'Los fixtures son el mecanismo de Playwright para preparar y limpiar lo que necesita cada test, y se piden por nombre en la firma, igual que `page`. Se definen extendiendo `test`: `export const test = base.extend<{ todoPage: TodoPage }>({ todoPage: async ({ page }, use) => { const todoPage = new TodoPage(page); await todoPage.goto(); await use(todoPage); await todoPage.removeAll(); } })`. Lo que va antes de `use()` es el setup, lo de después el teardown, y solo se ejecuta en los tests que lo piden. Pueden tener scope `test` (por defecto) o `worker` para recursos caros compartidos, como una cuenta por worker. Reemplazan con ventaja a los `beforeEach`, porque son componibles, tipados y reutilizables.',
        },
        {
          text: 'Mockear una API con `page.route()` y hacer un test de API con `request`',
          explanation:
            "Con `page.route()` interceptás requests del navegador: `await page.route('**/api/products', route => route.fulfill({ status: 200, json: [{ id: 1, name: 'Mate' }] }))`, antes del `page.goto()`. También podés usar `route.abort()` para simular errores de red o `route.fetch()` para pedir la respuesta real y modificarla. El fixture `request` hace llamadas HTTP sin navegador: `const res = await request.post('/api/users', { data: { email } }); expect(res.status()).toBe(201);`, y `await expect(res).toBeOK()` valida un status `2xx`. Sirve para tests de API puros y para preparar datos rápido antes de un test de UI. Comparte el `baseURL` de la config.",
        },
        {
          text: 'Investigar una falla de CI con el trace viewer',
          explanation:
            "Configurá `trace: 'on-first-retry'` (o `retain-on-failure`) en la config para que CI guarde un zip con el trace de los tests que fallan, y subí la carpeta de resultados como artifact del pipeline. Lo abrís con `npx playwright show-trace trace.zip` o en trace.playwright.dev, sin instalar nada. El trace tiene la línea de tiempo de acciones con snapshots del DOM antes y después de cada una (inspeccionables), los logs de consola, la pestaña de network con cada request y respuesta, el código fuente y el error. Así ves, por ejemplo, que el botón estaba deshabilitado porque una API devolvió `500` solo en CI. Es mucho más útil que un screenshot porque podés reconstruir todo lo que pasó.",
        },
        {
          text: 'Comparar Playwright y Cypress con criterio',
          explanation:
            'Playwright controla el navegador desde afuera vía protocolos, soporta Chromium, Firefox y WebKit de forma nativa, varias pestañas y dominios, varios usuarios simultáneos, varios lenguajes (TypeScript, Python, Java, .NET), paralelización y sharding gratis, y usa `async/await` estándar. Cypress corre dentro del navegador, tiene una experiencia de debugging interactiva excelente con time-travel, una comunidad y ecosistema de plugins grandes, y buen component testing; pero WebKit es experimental y la paralelización con dashboard es paga. Hoy Playwright es la opción por defecto para proyectos nuevos, pero migrar una suite Cypress estable rara vez se justifica. Respondé con criterio: depende del equipo, los navegadores a cubrir, la suite existente y el presupuesto, no de cuál está de moda.',
        },
      ],
    },
    {
      id: 'k6',
      title: 'Performance con k6',
      body: [
        'Antes de la herramienta, sabé los tipos de prueba: smoke (carga mínima para validar el script), carga (tráfico esperado), estrés (más allá de lo esperado, para encontrar el punto de quiebre), spike (subida brusca), soak (carga sostenida por horas para encontrar leaks) y breakpoint. Cada una responde una pregunta distinta, y la estrategia empieza por definir objetivos de negocio: usuarios, transacciones por segundo y SLOs de latencia y errores.',
        'k6 usa scripts en JavaScript (y TypeScript desde la versión 1.0): exportás `options` con la configuración y una función por defecto que ejecuta cada virtual user (VU) en loop; cada pasada es una iteración. `check` verifica una condición sin cortar la prueba, mientras que los `thresholds` definen criterios de éxito sobre métricas agregadas (por ejemplo `http_req_duration: ["p(95)<500"]`) y hacen fallar la ejecución, lo que los vuelve clave para CI. Se usa el p95 en vez del promedio porque el promedio esconde la cola que sufren los usuarios.',
        '`sleep` simula el tiempo de pensamiento del usuario. `setup` corre una vez antes (por ejemplo, obtener un token) y `teardown` una vez al final. Los scenarios definen distintos patrones de carga con executors: `ramping-vus` y `constant-vus` siguen un modelo cerrado (la carga depende de cuánto tarda el sistema), mientras que `constant-arrival-rate` y `ramping-arrival-rate` siguen un modelo abierto (llegan N iteraciones por segundo sin importar la respuesta), que refleja mejor el tráfico real y evita la coordinated omission.',
        'Para datos, usá `SharedArray` para cargar un CSV o JSON una vez y compartirlo entre VUs. La correlación es extraer valores dinámicos de una respuesta (un token, un id) y usarlos en la siguiente request. Para dimensionar VUs con arrival rate, usá la ley de Little: VUs igual a tasa por duración de iteración; 200 iteraciones por segundo de 1,5 segundos piden unos 300 VUs, más margen en `preAllocatedVUs`. Analizá resultados exportando a Prometheus, InfluxDB o Grafana, correlacionando con métricas del servidor, y reportá contra los objetivos en un entorno representativo de producción.',
      ],
      checklist: [
        {
          text: 'Diferenciar pruebas de carga, estrés, spike, soak y smoke',
          explanation:
            'Smoke: carga mínima (1 o 2 VUs, poco tiempo) para validar que el script funciona y el sistema responde. Carga (load): tráfico esperado normal y de pico, para verificar que se cumplen los SLOs. Estrés: subir por encima de lo esperado hasta encontrar el punto de quiebre y ver cómo degrada y se recupera. Spike: un salto súbito y enorme de tráfico en segundos, como el inicio de una venta de entradas, para ver si escala o se cae. Soak (o endurance): carga normal sostenida durante horas para detectar memory leaks, conexiones que no se liberan o discos que se llenan. También existe breakpoint, una rampa continua hasta que falla. Cada uno responde una pregunta distinta, así que primero definí qué querés saber.',
        },
        {
          text: 'Escribir un script de k6 con `options`, checks y thresholds',
          explanation:
            "Un script exporta `options` y una función default que ejecuta cada VU en loop. Ejemplo: `export const options = { stages: [{ duration: '1m', target: 50 }, { duration: '3m', target: 50 }, { duration: '1m', target: 0 }], thresholds: { http_req_duration: ['p(95)<500'], http_req_failed: ['rate<0.01'] } };` y `export default function () { const res = http.get('https://api.test/products'); check(res, { 'status 200': r => r.status === 200 }); sleep(1); }`. Los checks son aserciones que no detienen el test, solo registran el porcentaje de éxito. Los thresholds son los criterios de pass o fail del test completo: si no se cumplen, k6 sale con código distinto de cero. Error común: poner solo checks sin thresholds, y el test siempre pasa.",
        },
        {
          text: 'Explicar por qué se usa p95 y no el promedio',
          explanation:
            'El promedio esconde la experiencia de los usuarios lentos: si 90 requests tardan 100 ms y 10 tardan 5 segundos, el promedio da unos 590 ms, que no describe a nadie. El p95 es el valor por debajo del cual está el 95% de las requests: te dice que 1 de cada 20 requests es más lenta que ese número, y en una sesión con muchas requests casi todos los usuarios van a sufrir alguna. Por eso los SLOs se definen con percentiles, como p95 o p99 menor a 500 ms. Muchas veces se miran p50 (la mediana, el caso típico), p95 y p99 juntos. Los percentiles no se pueden promediar entre servidores o intervalos: hay que calcularlos sobre los datos crudos o histogramas.',
        },
        {
          text: 'Elegir entre modelo abierto y cerrado y su executor',
          explanation:
            'En el modelo cerrado, un número fijo de usuarios virtuales hace iteraciones en loop: cuando el sistema se pone lento, cada VU tarda más y el sistema recibe menos requests, lo que oculta el problema. En k6 son los executors `constant-vus` y `ramping-vus`. En el modelo abierto, las llegadas ocurren a un ritmo definido independientemente de cuánto tarde el sistema, como pasa con usuarios reales en internet: si se pone lento, se acumulan requests. En k6 son `constant-arrival-rate` y `ramping-arrival-rate`, configurados con `rate`, `timeUnit` y `preAllocatedVUs`. Usá el abierto para sistemas públicos donde querés validar un throughput (por ejemplo 200 requests por segundo), y el cerrado para sistemas con usuarios concurrentes acotados, como una herramienta interna.',
        },
        {
          text: 'Dimensionar VUs para un arrival rate dado',
          explanation:
            'Usá la ley de Little: VUs necesarios igual a tasa de llegada por duración de cada iteración. Si querés 100 iteraciones por segundo y cada una tarda 0,5 segundos (incluyendo el `sleep`), necesitás 100 por 0,5, o sea 50 VUs ocupados en promedio. Como en estrés la latencia sube, poné margen: `preAllocatedVUs` en 60 o 70 y `maxVUs` en 2 o 3 veces lo calculado. Si k6 se queda sin VUs, emite el warning de `dropped_iterations`, y eso significa que no generaste la carga que pediste: el resultado no es válido o indica que el sistema ya está saturado. Verificá también que la máquina generadora no sea el cuello de botella mirando su CPU.',
        },
        {
          text: 'Integrar k6 en CI con thresholds que corten el pipeline',
          explanation:
            "Como k6 sale con código distinto de cero cuando falla un threshold, cualquier CI (GitHub Actions con la action oficial `grafana/setup-k6-action` y `run-k6-action`, GitLab, Jenkins) corta el pipeline sin configuración extra. Para que el threshold aborte el test apenas se rompe, usá `{ threshold: 'p(95)<500', abortOnFail: true }`. En cada PR corré un smoke o una carga corta contra un entorno estable de staging, y dejá las pruebas largas de carga y soak nightly o pre-release, porque CI tiene recursos variables. Exportá los resultados (`--out` a Prometheus o InfluxDB, o Grafana Cloud k6) para ver tendencias. Errores comunes: correr contra un entorno compartido con ruido, o con thresholds tan holgados que nunca fallan.",
        },
        {
          text: 'Explicar coordinated omission',
          explanation:
            'Coordinated omission es un sesgo en la medición: el generador de carga espera a que el sistema responda antes de mandar la siguiente request, así que durante un trabo deja de enviar y no registra las requests que tendrían que haber llegado, que habrían tenido latencias altísimas. Ejemplo: si el sistema se congela 10 segundos y tu único VU mide una request de 10 segundos, perdiste las otras 9 o 10 que un usuario real habría mandado en ese lapso, y los percentiles parecen mucho mejores de lo que son. Ocurre con el modelo cerrado. Se mitiga con el modelo abierto, usando executors de arrival rate en k6, que mantienen el ritmo de llegadas aunque el sistema se ponga lento. El término lo popularizó Gil Tene.',
        },
      ],
    },
    {
      id: 'ejercicios',
      title: 'Ejercicios prácticos',
      body: [
        'El ejercicio más común en QA manual es diseñar casos en vivo: un login, un formulario de registro, un carrito, un campo de fecha, un ascensor o una máquina expendedora. Empezá preguntando requisitos y supuestos, después organizá por categorías (funcional, validaciones, bordes, seguridad, usabilidad, accesibilidad, performance, compatibilidad) y aplicá técnicas explícitamente. Cerrá priorizando: si tuvieras diez minutos, ¿qué probarías primero?',
        'Otro ejercicio frecuente es encontrar bugs en una app de demo y reportarlos. Ahí se evalúa tanto lo que encontrás como la calidad del reporte: pasos claros, esperado contra obtenido, evidencia y severidad bien justificada. Practicá con apps de prueba públicas y con los productos que usás todos los días.',
        'En automatización suelen pedirte automatizar un flujo (login y compra, búsqueda y filtro) con la herramienta del equipo, en vivo o como take-home. Mostrá estructura (page objects o helpers simples), selectores robustos, aserciones significativas, datos independientes, sin esperas fijas, y un README con cómo correrlo y qué dejarías para después. También pueden darte un test flaky o mal escrito para que lo revises.',
        'Si el rol incluye performance, el ejercicio típico es escribir un script de k6 para un endpoint con un escenario y thresholds, o interpretar un resultado y decir dónde está el cuello de botella. Practicá cada tipo de ejercicio con tiempo limitado y en voz alta.',
      ],
      checklist: [
        {
          text: 'Diseñar casos para un formulario de registro en 15 minutos con técnicas explícitas',
          explanation:
            'Primero 2 o 3 minutos de preguntas: reglas de cada campo (largo, formato, password), si el mail debe ser único, qué pasa después del registro y en qué plataformas. Después nombrá la técnica mientras diseñás: particiones y valores límite para largo del nombre y edad, particiones de formato para mail (válido, sin arroba, con espacios, mayúsculas), tabla de decisión para la política de password, y transición de estados para la cuenta (pendiente de confirmar, activa, link vencido). Sumá lo transversal: mail duplicado, doble click en enviar, inyección y XSS en campos, accesibilidad con teclado, mensajes de error y navegador mobile. Cerrá priorizando por riesgo cuáles correrías primero si solo tuvieras 10 minutos. Practicalo con cronómetro sobre formularios reales.',
        },
        {
          text: 'Encontrar y reportar tres bugs en una app de demo',
          explanation:
            'Practicá con apps hechas para esto: saucedemo.com (tiene usuarios con bugs a propósito, como `problem_user`), the-internet.herokuapp.com, demoqa.com o automationexercise.com. Usá un timebox de 30 minutos con un charter y heurísticas: campos con valores límite y caracteres raros, volver atrás y refrescar a mitad de un flujo, doble click, pestañas de DevTools Console y Network buscando errores y respuestas `4xx` o `5xx`, viewport mobile. Elegí los tres bugs más relevantes, no los tres primeros, y escribí reportes completos con pasos, esperado contra obtenido, entorno, severidad y evidencia. En la entrevista explicá por qué priorizaste esos, porque evalúan criterio además de capacidad de encontrar.',
        },
        {
          text: 'Automatizar un flujo de login y compra con buenas prácticas',
          explanation:
            'Elegí una app de demo como saucedemo.com y automatizá con Playwright o Cypress el flujo: login, agregar productos, checkout y confirmación. Buenas prácticas visibles: selectores por rol o `data-test`, Page Objects o fixtures para no repetir pasos, sesión reutilizada en vez de loguearse por UI en cada test, datos desde variables de entorno o factories, aserciones sobre resultados de negocio (el total, el mensaje de confirmación) y no solo sobre URLs, cero esperas fijas, y tests independientes que corren en paralelo. Sumá casos negativos (usuario bloqueado, checkout sin datos) y un workflow de GitHub Actions que los corra. Un README corto que explique las decisiones vale tanto como el código.',
        },
        {
          text: 'Revisar un test mal escrito y proponer mejoras',
          explanation:
            'Leelo buscando los olores típicos: esperas fijas (`cy.wait(5000)`, `waitForTimeout`), selectores frágiles por clase CSS, XPath o índice, tests sin aserción o con aserciones débiles (solo que existe un elemento), lectura de valores sin reintento en vez de web-first assertions, credenciales hardcodeadas, dependencia de otro test o de datos existentes, varios comportamientos en un test enorme, lógica condicional (`if` en el test) y `try/catch` que tragan errores. Proponé cada mejora explicando el porqué: "este `wait(5000)` lo reemplazo por esperar la request con un alias, porque es más rápido y no es flaky". Empezá por lo de mayor impacto y cerrá con lo cosmético, como en un code review real. Mostrá tono constructivo: también se evalúa cómo das feedback.',
        },
        {
          text: 'Escribir un script de k6 con escenario y thresholds',
          explanation:
            "Usá `scenarios` en `options` para declarar el modelo de carga explícitamente: `scenarios: { compras: { executor: 'ramping-arrival-rate', startRate: 10, timeUnit: '1s', preAllocatedVUs: 50, maxVUs: 200, stages: [{ target: 100, duration: '2m' }, { target: 100, duration: '5m' }, { target: 0, duration: '1m' }] } }`. Agregá thresholds globales y por tag: `'http_req_duration{name:checkout}': ['p(95)<800']` y `http_req_failed: ['rate<0.01']`, y tageá requests con `{ tags: { name: 'checkout' } }`. Usá `group()` para separar pasos del flujo, `check()` para validar respuestas, datos de usuarios desde un `SharedArray` y `sleep()` para simular el think time. Justificá los números: el arrival rate sale del tráfico de pico real más un margen.",
        },
      ],
    },
    {
      id: 'dia-de-la-entrevista',
      title: 'El día de la entrevista',
      body: [
        'Pensá en voz alta: en QA lo que se evalúa es tu forma de pensar sobre el riesgo. Hacé preguntas de aclaración antes de diseñar casos (quiénes son los usuarios, qué reglas de negocio hay, qué plataformas) y explicitá tus supuestos. Si no conocés una herramienta o un concepto, decilo y contá cómo lo aprenderías o con qué lo resolvés hoy.',
        'Para preguntas de comportamiento usá STAR: situación, tarea, acción y resultado. Prepará historias sobre un bug crítico que encontraste, un desacuerdo con un desarrollador sobre la severidad de un bug, una vez que tuviste que priorizar con poco tiempo, una mejora de proceso que propusiste y un bug que se te escapó a producción y qué aprendiste.',
        'Preguntas para la empresa: cómo es la relación entre QA y desarrollo, cuánto está automatizado y quién mantiene los tests, cómo es el pipeline de CI, qué pasa cuando hay bugs conocidos antes de un release, cómo miden la calidad y qué herramientas usan para gestión de casos y bugs.',
        'Checklist final: repasá las técnicas de diseño con un ejemplo cada una, tené listo un ejemplo de reporte de bug, si hay código en vivo dejá el entorno instalado y probado con la herramienta que usan, y llevá un proyecto de automatización propio en un repo para mostrar.',
      ],
      checklist: [
        {
          text: 'Hacer preguntas de aclaración antes de diseñar casos',
          explanation:
            'Antes de listar casos, preguntá por cuatro ejes: usuarios (quiénes usan esto, roles y permisos, volumen), reglas de negocio (validaciones, límites, qué pasa en los casos borde), contexto técnico (plataformas, navegadores, integraciones, si hay API) y alcance (qué es nuevo, qué cambió, qué riesgo preocupa más, cuánto tiempo hay). Ejemplo para un campo de cupón: "¿puede combinarse con otros descuentos?, ¿tiene vencimiento y límite de usos?, ¿distingue mayúsculas?". Si el entrevistador no responde, explicitá tus supuestos y seguí. Esto demuestra que pensás en el riesgo y en el negocio, que es justo lo que se evalúa; saltar directo a enumerar casos se lee como falta de criterio.',
        },
        {
          text: 'Admitir lo que no sabés y explicar cómo lo aprenderías',
          explanation:
            'Cuando no sabés algo, decilo directo y en una frase ("no trabajé con Pact"), después conectalo con lo que sí sabés ("pero entiendo que verifica contratos entre servicios; hice algo parecido validando schemas JSON con Postman") y explicá cómo lo aprenderías concretamente (documentación oficial, un proyecto chico de prueba, preguntarle al equipo). Si es una pregunta de razonamiento, pensá en voz alta para llegar a una respuesta parcial. Inventar es lo peor que podés hacer: el entrevistador lo nota y pierde confianza en todo lo demás que dijiste. Practicalo pidiéndole a alguien que te haga preguntas de temas que no dominás.',
        },
        {
          text: 'Tener cuatro historias STAR preparadas',
          explanation:
            'STAR es Situación (contexto breve), Tarea (tu responsabilidad), Acción (lo que hiciste vos, en primera persona) y Resultado (con números si podés). Prepará cuatro historias que cubran las preguntas más típicas de QA: un bug crítico que encontraste o que se escapó a producción, un conflicto con un desarrollador o con producto (por ejemplo, un bug que no querían priorizar), una mejora de proceso que impulsaste (automatización, quality gates) y una presión por salir con plazos ajustados. Escribilas en bullets, practicalas en voz alta en 2 minutos cada una, y adaptalas según la pregunta. Error común: hablar en "nosotros" todo el tiempo y no dejar claro qué hiciste vos, o no cerrar con un resultado.',
        },
        {
          text: 'Llevar preguntas sobre proceso, automatización y cultura de calidad',
          explanation:
            'Preparate tres o cuatro preguntas que te ayuden a evaluar el puesto y muestren criterio. Proceso: cómo es el flujo desde la historia hasta producción, en qué momento entra QA, quién define los criterios de aceptación. Automatización: qué porcentaje de la regresión está automatizado, en qué herramienta, si corre en CI y cuánto tarda, cuánto tiempo se dedica a mantener tests. Cultura: quién es responsable de la calidad, qué pasa cuando un bug llega a producción, cuál es la relación QA y devs, cuántos QA hay por equipo. Las respuestas te dicen si vas a ser un cuello de botella o parte del equipo. Evitá preguntas que se responden leyendo la web de la empresa.',
        },
        {
          text: 'Tener el entorno de automatización instalado y un repo propio para mostrar',
          explanation:
            'Antes de la entrevista dejá instalados Node LTS, tu editor, el framework (`npm init playwright@latest` instala Playwright y los navegadores; o `npm install cypress`) y verificá que un test de ejemplo corre, porque perder 10 minutos instalando en un live coding da mala impresión. Tené un repo público en GitHub con un proyecto chico pero prolijo: tests E2E sobre una app de demo con Page Objects o fixtures, tests de API, un script de k6, un workflow de GitHub Actions corriendo en verde y un README que explique la estructura y las decisiones. Si la entrevista es con pantalla compartida, probá antes que compartir pantalla funciona y subí el tamaño de fuente del editor.',
        },
      ],
    },
  ],
};
