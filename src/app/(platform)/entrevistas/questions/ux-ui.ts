import type { InterviewQuestion, Seniority } from './types';

export const uxUiQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'fundamentos',
      question: '¿Qué diferencia hay entre UX y UI?',
      answer:
        'UX (experiencia de usuario) abarca todo lo que la persona vive al intentar lograr un objetivo con el producto: si entiende qué hacer, si llega, cuánto le cuesta y cómo se siente. UI (interfaz de usuario) es la capa concreta con la que interactúa: layout, tipografía, color, componentes y estados. Una UI linda puede tener mala UX si el flujo es confuso, y una buena UX necesita una UI clara para materializarse. En la práctica se solapan y muchos roles cubren ambas.',
    },
    {
      topic: 'fundamentos',
      question: '¿Cuáles son las etapas típicas de un proceso de diseño centrado en el usuario?',
      answer:
        'Un esquema común es el doble diamante: descubrir (investigar el problema con usuarios y datos), definir (sintetizar y formular el problema correcto), desarrollar (idear, prototipar y explorar soluciones) y entregar (testear, iterar y lanzar). Lo importante es que es iterativo: lo que aprendés en un test puede devolverte a redefinir el problema. Mencioná que en equipos reales el proceso se adapta al tiempo y al riesgo, no se sigue como receta.',
    },
    {
      topic: 'research',
      question: '¿Qué diferencia hay entre investigación cualitativa y cuantitativa?',
      answer:
        'La cualitativa responde por qué y cómo: entrevistas, tests de usabilidad o estudios de campo con pocas personas, que revelan motivaciones, problemas y contexto. La cuantitativa responde cuántos y cuánto: encuestas grandes, analytics o A/B tests, que miden la magnitud de un comportamiento. Se combinan: por ejemplo, analytics muestra que el 60% abandona el checkout y unas entrevistas explican que el costo de envío aparece demasiado tarde.',
    },
    {
      topic: 'research',
      question: '¿Cómo prepararías y conducirías una entrevista con usuarios?',
      answer:
        'Primero definís el objetivo y armás una guía con preguntas abiertas sobre comportamientos pasados, como "contame la última vez que pagaste un servicio", en vez de preguntas hipotéticas o que sugieran la respuesta. Durante la entrevista escuchás más de lo que hablás, repreguntás con "¿por qué?" o "¿cómo fue eso?" y tolerás los silencios. Evitás vender tu idea o preguntar "¿usarías esto?", porque la gente es mala prediciendo su comportamiento futuro. Al final tomás notas o grabás con consentimiento para sintetizar después.',
    },
    {
      topic: 'research',
      question: '¿Qué es una persona y cuándo es útil?',
      answer:
        'Es un arquetipo de usuario basado en investigación real que resume objetivos, contexto, frustraciones y comportamientos de un segmento. Sirve para alinear al equipo sobre para quién se diseña y para tomar decisiones del tipo "¿esto le sirve a Laura, la administradora que carga facturas a fin de mes?". Pierde valor cuando se inventa sin datos o se llena de detalles demográficos irrelevantes, como el hobby o la edad exacta, en lugar de necesidades y comportamientos.',
    },
    {
      topic: 'usabilidad',
      question: '¿Qué es un test de usabilidad y cómo lo harías?',
      answer:
        'Es observar a usuarios reales intentando completar tareas concretas con un prototipo o producto para detectar dónde se traban. Definís objetivos, reclutás personas del perfil adecuado, escribís tareas realistas sin dar pistas ("comprá un regalo de menos de $20.000 para tu hermana"), pedís que piensen en voz alta y no las ayudás. Después agrupás los problemas por frecuencia y severidad y proponés cambios. Con cinco usuarios por ronda ya aparecen la mayoría de los problemas grandes.',
    },
    {
      topic: 'interacción',
      question: '¿Qué son las heurísticas de Nielsen? Nombrá algunas.',
      answer:
        'Son diez principios generales de usabilidad de Jakob Nielsen que sirven para evaluar interfaces sin usuarios. Algunas: visibilidad del estado del sistema, coincidencia entre el sistema y el mundo real, control y libertad del usuario (deshacer, cancelar), consistencia y estándares, prevención de errores, reconocer antes que recordar, flexibilidad y eficiencia, diseño estético y minimalista, ayudar a reconocer y recuperarse de errores, y ayuda y documentación. Conviene dar un ejemplo de cada una que menciones, como un spinner con progreso para la visibilidad del estado.',
    },
    {
      topic: 'interacción',
      question: '¿Qué es una affordance y qué es un signifier?',
      answer:
        'Una affordance es la relación entre un objeto y una persona que determina qué acciones son posibles: un botón se puede presionar. Un signifier es la señal que comunica esa posibilidad: la sombra, el borde o el texto que hace que el botón parezca clickeable. En interfaces digitales muchos problemas vienen de signifiers débiles, como texto plano que en realidad es un link o un card entero clickeable sin ninguna pista visual. El término lo popularizó Don Norman en "The Design of Everyday Things".',
    },
    {
      topic: 'interacción',
      question:
        '¿Qué estados tiene que contemplar un componente interactivo como un botón o un input?',
      answer:
        'Como mínimo: default, hover, focus (visible para teclado), active o presionado, disabled y loading cuando dispara algo asíncrono. Un input suma placeholder, lleno, error con mensaje, éxito y read-only. Diseñar solo el estado ideal es un error común de junior: el dev termina inventando los demás y la interfaz queda inconsistente. Documentar los estados en el componente evita esas idas y vueltas en el handoff.',
    },
    {
      topic: 'interacción',
      question: '¿Qué son los empty states y por qué importan?',
      answer:
        'Son las pantallas o secciones sin contenido: primera vez que alguien entra, una búsqueda sin resultados o una lista que se vació. Un buen empty state explica qué va a aparecer ahí, por qué está vacío y cuál es la próxima acción, por ejemplo "Todavía no tenés proyectos. Creá el primero" con un botón. Bien diseñados ayudan al onboarding y evitan que el usuario piense que algo se rompió. También hay que diseñar estados de carga y de error, no solo el caso con datos.',
    },
    {
      topic: 'visual',
      question: '¿Cómo construís jerarquía visual en una pantalla?',
      answer:
        'Usando contraste entre elementos para que el ojo recorra primero lo más importante: tamaño, peso tipográfico, color, espacio en blanco, posición y agrupación. Por ejemplo, un título grande y bold, un subtítulo en gris y una sola acción principal con color de marca, mientras las secundarias van como botones outline o links. Una prueba rápida es entrecerrar los ojos o desenfocar la pantalla y ver qué destaca. Si todo compite por atención, nada destaca.',
    },
    {
      topic: 'visual',
      question: '¿Para qué sirve una grilla en diseño de interfaces?',
      answer:
        'Da una estructura de columnas, márgenes y gutters que ordena el contenido, crea alineaciones consistentes y facilita el diseño responsive. Un esquema común es 12 columnas en desktop, 8 en tablet y 4 en mobile, combinado con un sistema de espaciado en múltiplos de 4 u 8 px. Además de las columnas, una grilla base vertical ayuda a mantener el ritmo entre textos. Se puede romper a propósito para destacar algo, pero partiendo de un orden.',
    },
    {
      topic: 'visual',
      question: '¿Qué tenés en cuenta al elegir tipografía para una interfaz?',
      answer:
        'Legibilidad en pantalla y en tamaños chicos, buena variedad de pesos, soporte de los caracteres que necesitás (acentos, ñ, números tabulares) y performance si es una web font. Se define una escala tipográfica acotada, por ejemplo 12, 14, 16, 20, 24 y 32 px, con alturas de línea de alrededor de 1.4 a 1.6 para texto corrido. En general alcanza con una o dos familias. El texto de cuerpo en mobile no debería bajar de 16 px.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Qué es WCAG y qué niveles tiene?',
      answer:
        'Las Web Content Accessibility Guidelines del W3C son el estándar de accesibilidad digital, organizado en cuatro principios: perceptible, operable, comprensible y robusto. Cada criterio tiene un nivel A (mínimo), AA (el objetivo habitual y el que piden muchas leyes) o AAA (el más exigente). La versión vigente es WCAG 2.2, que sumó criterios como tamaño mínimo de objetivos táctiles y foco no oculto. Como diseñador lo más común es apuntar a AA.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Qué contraste mínimo pide WCAG AA para el texto?',
      answer:
        'Una relación de 4.5:1 entre el texto y su fondo para texto normal, y 3:1 para texto grande (desde 24 px regular o 18.7 px bold, aproximadamente). Los componentes de interfaz y gráficos que transmiten información, como el borde de un input o un ícono, necesitan 3:1 contra lo que los rodea. Se verifica con plugins o herramientas como el contrast checker de WebAIM. Un error común es el gris claro sobre blanco para placeholders o textos secundarios.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Por qué no hay que transmitir información solo con color?',
      answer:
        'Porque alrededor del 8% de los hombres tiene algún tipo de daltonismo, y además hay pantallas con mal contraste o luz solar directa. Si un campo con error solo se pone rojo, o un gráfico distingue series solo por color, parte de los usuarios pierde la información. Se complementa con texto, íconos, patrones o posición: por ejemplo, un ícono de alerta y el mensaje "El email no es válido" debajo del campo. Es un criterio explícito de WCAG (1.4.1).',
    },
    {
      topic: 'ux writing',
      question: '¿Qué es UX writing y qué hace bueno a un microcopy?',
      answer:
        'Es escribir los textos de la interfaz (botones, labels, errores, empty states, confirmaciones) para que ayuden a la persona a completar su tarea. Un buen microcopy es claro, concreto, breve y usa las palabras del usuario, no la jerga interna. Por ejemplo, un botón dice "Guardar cambios" en vez de "OK", y un error dice qué pasó y cómo resolverlo: "La tarjeta venció. Probá con otra" en lugar de "Error 402".',
    },
    {
      topic: 'responsive',
      question: '¿Qué significa diseñar mobile first?',
      answer:
        'Empezar diseñando para la pantalla más chica y después expandir a tablet y desktop. Obliga a priorizar: con poco espacio tenés que decidir qué contenido y qué acción importan de verdad, y eso suele mejorar también la versión desktop. Además contempla restricciones de mobile como interacción táctil, objetivos de toque más grandes, conexión variable y uso con una mano. No implica que mobile sea siempre lo más importante, depende de cómo usan el producto tus usuarios.',
    },
    {
      topic: 'portfolio',
      question: '¿Qué debería tener un caso de estudio en tu portfolio?',
      answer:
        'Contexto y problema (qué producto, para quién, por qué importaba), tu rol concreto y el equipo, el proceso con las decisiones clave y por qué las tomaste, incluidas las alternativas descartadas, la solución final y el resultado medido o lo que aprendiste. Lo que buscan es tu forma de pensar, no solo pantallas lindas. Para junior está bien usar proyectos de curso o personales si mostrás el proceso con honestidad. Dos o tres casos profundos valen más que diez superficiales.',
    },
    {
      topic: 'colaboración',
      question: '¿Cómo trabajás con desarrolladores durante un proyecto?',
      answer:
        'Involucrándolos temprano, no solo al final: mostrar exploraciones para validar la factibilidad técnica, preguntar qué componentes ya existen y acordar qué es imprescindible y qué puede simplificarse. En el handoff entregás specs claras con estados, comportamiento responsive, casos borde y textos finales, y quedás disponible para dudas. Después revisás lo implementado (design QA) antes del release. La relación funciona mejor como colaboración continua que como pasamanos.',
    },
  ],
  'semi-senior': [
    {
      topic: 'research',
      question: '¿Cómo elegís qué método de investigación usar?',
      answer:
        'Según la pregunta que tenés que responder, la etapa del producto y los recursos. Si no entendés el problema, métodos generativos: entrevistas, estudios de contexto o diary studies. Si querés evaluar una solución, métodos evaluativos: tests de usabilidad o tree testing. Si necesitás magnitud o validar a escala, encuestas, analytics o A/B tests. Un buen marco es el de NN/g que cruza actitudinal contra conductual y cualitativo contra cuantitativo: lo que la gente dice no siempre coincide con lo que hace.',
    },
    {
      topic: 'research',
      question: '¿Cómo sintetizás los hallazgos de una ronda de entrevistas?',
      answer:
        'Pasás las notas a observaciones atómicas (una idea por nota), las agrupás por afinidad para encontrar patrones y de esos patrones sacás insights: afirmaciones sobre el comportamiento con su por qué, no simples datos. Por ejemplo, "los contadores exportan a Excel porque no confían en los totales del sistema" es un insight; "usan Excel" es una observación. Después priorizás por frecuencia e impacto y los conectás con oportunidades o preguntas "¿cómo podríamos...?". Hacer la síntesis con el equipo genera más compromiso con los resultados.',
    },
    {
      topic: 'research',
      question: '¿Qué es Jobs to be Done y en qué se diferencia de una persona?',
      answer:
        'JTBD plantea que la gente "contrata" un producto para hacer un trabajo en un contexto: "cuando llego a fin de mes, quiero saber cuánto gasté en cada categoría, para decidir dónde recortar". El foco está en la situación, la motivación y el resultado esperado, no en atributos demográficos. Las personas describen quién es el usuario; JTBD describe qué intenta lograr y en qué circunstancias, lo que también revela competidores no obvios. Se pueden combinar: una persona puede tener varios jobs.',
    },
    {
      topic: 'research',
      question: '¿Cuáles son los errores más comunes al escribir una encuesta?',
      answer:
        'Preguntas que sugieren la respuesta ("¿qué tan útil te pareció la nueva función?"), preguntas dobles que mezclan dos cosas, escalas desbalanceadas, preguntar por comportamientos futuros hipotéticos y encuestas demasiado largas que bajan la tasa de respuesta y la calidad. También es un error encuestar a una muestra sesgada, como solo a los usuarios más activos, y generalizar. Conviene pilotear la encuesta con dos o tres personas antes de enviarla y definir de antemano qué decisión va a informar cada pregunta.',
    },
    {
      topic: 'usabilidad',
      question: '¿Cuándo elegís un test moderado y cuándo uno no moderado?',
      answer:
        'El moderado, presencial o remoto, permite repreguntar y explorar el por qué, por eso conviene para prototipos tempranos, flujos complejos o cuando no sabés bien qué buscar. El no moderado, con herramientas como Maze o UserTesting, es más rápido y barato y escala a más participantes, útil para validar tareas concretas o comparar variantes con métricas. Su riesgo es que las tareas mal escritas no se pueden corregir sobre la marcha y perdés contexto. Muchos equipos combinan ambos.',
    },
    {
      topic: 'usabilidad',
      question: '¿Por qué se dice que con cinco usuarios alcanza para un test de usabilidad?',
      answer:
        'Viene del modelo de Nielsen y Landauer: cinco usuarios encuentran alrededor del 85% de los problemas de usabilidad de un perfil, porque los problemas grandes se repiten rápido. La recomendación real es hacer varias rondas chicas e iterar entre ellas, en vez de una grande. No aplica para estudios cuantitativos (para métricas confiables necesitás 20 o más), ni cuando hay perfiles de usuario muy distintos, donde necesitás varios por segmento. Explicar estos matices es lo que distingue una buena respuesta.',
    },
    {
      topic: 'arquitectura de información',
      question: '¿Qué es un card sorting y en qué se diferencia de un tree testing?',
      answer:
        'El card sorting es generativo: los participantes agrupan tarjetas de contenido en categorías que tengan sentido para ellos (abierto, si inventan las categorías; cerrado, si se las das), y revela su modelo mental. El tree testing es evaluativo: das una jerarquía de navegación en texto, sin diseño visual, y pedís encontrar dónde estaría algo, midiendo tasa de éxito y caminos. Se usan en secuencia: card sorting para proponer la estructura, tree testing para validarla antes de diseñar pantallas.',
    },
    {
      topic: 'interacción',
      question: '¿Qué dicen la ley de Fitts y la ley de Hick y cómo las aplicás?',
      answer:
        'La ley de Fitts dice que el tiempo para alcanzar un objetivo depende de su distancia y su tamaño: botones importantes grandes y cerca de donde está el usuario, como el CTA al alcance del pulgar en mobile. La ley de Hick dice que el tiempo de decisión crece con la cantidad y complejidad de opciones: reducir opciones, agrupar o usar divulgación progresiva. Las dos son guías, no fórmulas: un menú con muchas opciones bien categorizadas puede funcionar mejor que pocas opciones ambiguas.',
    },
    {
      topic: 'interacción',
      question: '¿Cómo diseñarías un formulario largo, por ejemplo un alta de cliente?',
      answer:
        'Primero cuestiono cada campo: si no es necesario ahora, se pide después. Agrupo en secciones lógicas o pasos con indicador de progreso, uso una sola columna, labels siempre visibles (no solo placeholders), tipos de input correctos para el teclado mobile y autocompletado. La validación inline va al salir del campo, con mensajes que expliquen cómo corregir, y se conserva lo cargado si algo falla. También marco claramente qué es opcional y permito guardar el progreso si es muy largo.',
    },
    {
      topic: 'interacción',
      question: '¿Qué son las microinteracciones y cuándo aportan valor?',
      answer:
        'Son interacciones chicas centradas en una sola tarea: dar like, activar un toggle, copiar un link, refrescar una lista. Según Dan Saffer tienen trigger, reglas, feedback y loops o modos. Aportan cuando comunican estado o resultado ("Copiado" con un check), guían o previenen errores, no cuando son decoración que demora la tarea. Las animaciones deberían ser cortas (entre 150 y 300 ms) y respetar la preferencia de reducir movimiento del sistema.',
    },
    {
      topic: 'visual',
      question: '¿Cómo armás una paleta de color para una interfaz?',
      answer:
        'Defino un color primario de marca, neutros (grises para texto, bordes y fondos) y colores semánticos para éxito, error, advertencia e información. Cada uno se escala en pasos, por ejemplo del 50 al 900, para tener variantes de fondo, borde y texto, y valido los contrastes de las combinaciones de uso real. Después los expongo como tokens con nombres por función ("texto secundario", "fondo de error") y no por valor. Si hay modo oscuro, se piensa desde el inicio, no invirtiendo colores.',
    },
    {
      topic: 'accesibilidad',
      question:
        '¿Qué aspectos de accesibilidad tenés que especificar en tus diseños para que se implementen bien?',
      answer:
        'El orden de foco y de lectura, cómo se ve el foco visible, los nombres accesibles de íconos sin texto, textos alternativos de imágenes, la jerarquía de encabezados, qué se anuncia en cambios dinámicos (un toast o un error) y el comportamiento con teclado de componentes como modales o menús. También tamaños de objetivos táctiles (WCAG 2.2 pide mínimo 24 por 24 px; las guías de plataforma recomiendan 44 o 48), y que el diseño funcione con zoom al 200%. Si no lo especificás, se pierde en la implementación.',
    },
    {
      topic: 'design systems',
      question: '¿Qué son los design tokens y por qué son útiles?',
      answer:
        'Son decisiones de diseño con nombre, como colores, tipografías, espaciados, radios o sombras, guardadas de forma agnóstica de plataforma para que las usen diseño y código. Suelen tener niveles: primitivos (`blue-500`), semánticos (`color-action-primary`) y a veces de componente. Permiten cambiar un valor en un lugar y propagarlo, soportar temas como modo oscuro o múltiples marcas, y mantener sincronizados Figma y el código. El valor está en la capa semántica: el nombre dice para qué se usa.',
    },
    {
      topic: 'design systems',
      question: '¿Cuándo crearías un componente nuevo en el design system y cuándo no?',
      answer:
        'Primero reviso si un componente existente cubre el caso, quizás con una variante. Si es una necesidad puntual de un solo flujo, conviene resolverla localmente y observar: si aparece en dos o tres lugares más, se generaliza. Al proponerlo al sistema documento el problema, los casos de uso, estados, accesibilidad y comportamiento, y lo acuerdo con el equipo dueño del sistema y con desarrollo. Agregar componentes por cada pedido infla el sistema y lo vuelve inconsistente.',
    },
    {
      topic: 'ux writing',
      question: '¿Cómo escribís un buen mensaje de error?',
      answer:
        'Tiene que decir qué pasó, por qué si ayuda, y cómo resolverlo, en lenguaje humano y sin culpar a la persona. Por ejemplo: "No pudimos procesar el pago porque la tarjeta no tiene fondos suficientes. Probá con otro medio de pago". Se ubica cerca del problema (junto al campo, no solo arriba de la página), no usa códigos técnicos ni mayúsculas alarmantes, y conserva lo que el usuario ya cargó. Mejor todavía es prevenir el error con validaciones o restricciones claras.',
    },
    {
      topic: 'ux writing',
      question: '¿Qué es voz y tono y cómo se aplica en un producto?',
      answer:
        'La voz es la personalidad constante de la marca al escribir, por ejemplo cercana, clara y sin vueltas. El tono es cómo esa voz se adapta al momento emocional del usuario: puede ser celebratorio al completar un objetivo, pero sobrio y empático en un error de pago o un problema de seguridad. Se documenta en una guía con principios, ejemplos de "así sí y así no", glosario de términos y reglas como tuteo o voseo y uso de mayúsculas. Esto mantiene la coherencia cuando escriben muchas personas.',
    },
    {
      topic: 'métricas',
      question: '¿Qué es el framework HEART de Google?',
      answer:
        'Es un marco para medir la experiencia de usuario con cinco categorías: Happiness (satisfacción, por ejemplo con encuestas), Engagement (intensidad de uso), Adoption (nuevos usuarios de una función), Retention (cuántos vuelven) y Task success (eficacia, eficiencia y errores). Para cada categoría relevante se definen objetivos, señales y métricas concretas (Goals, Signals, Metrics). No hace falta usar las cinco: elegís las que reflejan el objetivo del cambio que diseñaste.',
    },
    {
      topic: 'métricas',
      question: '¿Qué es el SUS y cómo se interpreta?',
      answer:
        'El System Usability Scale es un cuestionario estándar de diez afirmaciones con escala de 1 a 5, alternando positivas y negativas, que se responde después de usar un sistema. Da un puntaje de 0 a 100 que no es un porcentaje: el promedio de la industria ronda 68, y por encima de 80 se considera muy bueno. Es rápido, confiable con muestras chicas y útil para comparar versiones en el tiempo, pero no dice qué está mal: para eso necesitás observación cualitativa.',
    },
    {
      topic: 'challenge',
      question: '¿Cómo encarás un whiteboard o design challenge en una entrevista?',
      answer:
        'No arranco dibujando: primero hago preguntas para entender el problema, los usuarios, el contexto, el objetivo de negocio y las restricciones, y explicito mis supuestos. Después defino una métrica de éxito, mapeo el flujo principal, priorizo un caso y recién ahí bosquejo soluciones, explicando alternativas y por qué elijo una. Cierro con cómo lo validaría y qué haría con más tiempo. Lo que evalúan es el razonamiento en voz alta y la colaboración, no la perfección visual.',
    },
    {
      topic: 'colaboración',
      question:
        '¿Qué hacés cuando el PM quiere lanzar algo que vos considerás mal resuelto desde UX?',
      answer:
        'Primero entiendo sus motivos: puede haber una fecha comprometida o un aprendizaje que vale más que la pulida. Después llevo evidencia concreta en vez de opinión, por ejemplo un test con tres usuarios que se traban en el mismo paso, y propongo opciones: un ajuste mínimo que resuelva lo crítico, lanzar a un porcentaje de usuarios o lanzar con métricas y un compromiso de iterar. Si igual se decide lanzar, dejo registrado el riesgo y las métricas a mirar. El objetivo es la mejor decisión para el producto, no ganar la discusión.',
    },
  ],
  senior: [
    {
      topic: 'research',
      question: '¿Cómo escalás la investigación cuando hay más diseñadores que researchers?',
      answer:
        'Con research democratizado pero con guardas: plantillas de guías de entrevista y de test, capacitaciones, revisión de planes por un researcher y un repositorio de insights donde todo queda accesible y etiquetado. Los estudios evaluativos simples los pueden hacer diseñadores y PMs; los generativos o de alto riesgo, los researchers. También es clave un panel de reclutamiento y procesos de consentimiento y privacidad. El riesgo a gestionar es la mala calidad: preguntas sesgadas o conclusiones sacadas de dos usuarios.',
    },
    {
      topic: 'research',
      question: '¿Cómo convencés a un stakeholder que no ve valor en la investigación?',
      answer:
        'Hablo en sus términos: riesgo y costo. Muestro un caso donde una suposición equivocada costó semanas de desarrollo, y propongo investigación chica y rápida atada a una decisión concreta que le preocupa, no un estudio largo. Lo invito a observar sesiones, porque ver a un usuario trabarse convence más que cualquier reporte. Y comunico los resultados como decisiones y oportunidades, con impacto estimado, no como un documento de 40 páginas.',
    },
    {
      topic: 'usabilidad',
      question: '¿Cómo priorizás los problemas encontrados en una evaluación de usabilidad?',
      answer:
        'Combino severidad (si bloquea la tarea, la demora o es cosmético), frecuencia (cuántos participantes lo sufrieron) e impacto en el negocio (si ocurre en un flujo crítico como pago o registro). Cruzo eso con el esfuerzo de resolverlo para encontrar los quick wins y los problemas grandes que merecen un proyecto. Presento los hallazgos con evidencia, como clips cortos, y con recomendaciones accionables, y hago seguimiento de qué se resolvió. Un hallazgo sin dueño ni decisión no genera cambio.',
    },
    {
      topic: 'arquitectura de información',
      question: '¿Cómo reorganizarías la navegación de un producto que creció sin orden?',
      answer:
        'Empiezo con un inventario de contenido y funcionalidades y con datos de uso: qué se usa, qué se busca y dónde fallan los usuarios. Hago card sorting para entender el modelo mental y propongo una o dos estructuras alternativas, que valido con tree testing midiendo éxito y directness contra la estructura actual. Planifico la migración con redirecciones, comunicación a usuarios avanzados que tienen memoria muscular y métricas de antes y después. Involucro a los equipos dueños de cada área porque la navegación también refleja la organización.',
    },
    {
      topic: 'interacción',
      question:
        '¿Cómo evaluás el trade-off entre simplicidad y potencia en un producto para usuarios expertos?',
      answer:
        'Uso divulgación progresiva: lo frecuente y simple queda visible, lo avanzado accesible pero sin estorbar, y sumo aceleradores para expertos como atajos de teclado, acciones en lote, comandos o vistas configurables. Investigo los distintos niveles de usuarios porque un novato y un power user tienen necesidades opuestas. Los datos de uso muestran qué opciones casi nadie toca. Simplificar quitando funciones que los expertos usan a diario es un error caro; la clave es reducir el costo cognitivo sin reducir capacidad.',
    },
    {
      topic: 'visual',
      question:
        '¿Cómo mantenés la coherencia visual en un producto con muchos equipos diseñando en paralelo?',
      answer:
        'Con un design system con tokens y componentes que hagan fácil lo correcto, guías de patrones para casos frecuentes y rituales de revisión: critiques entre equipos y design reviews antes del desarrollo. También sirven auditorías periódicas de la UI en producción para detectar desviaciones y una persona o equipo responsable del sistema. La coherencia no se logra controlando cada pantalla, sino dando buenos defaults y explicando el porqué de las decisiones para que los equipos puedan decidir solos.',
    },
    {
      topic: 'accesibilidad',
      question: '¿Cómo instalarías la accesibilidad como práctica en una organización?',
      answer:
        'Definiendo un estándar explícito (WCAG 2.2 AA), incorporándolo al design system para que los componentes sean accesibles por defecto, y sumando criterios en la definición de done y checks automáticos en CI, sabiendo que solo detectan una parte. Capacito a diseño, desarrollo y QA, incluyo anotaciones de accesibilidad en los handoffs y hago tests con usuarios que usan tecnologías asistivas. Para conseguir prioridad, uso argumentos de riesgo legal, alcance de mercado y calidad general. Es un proceso continuo, no un proyecto que se termina.',
    },
    {
      topic: 'design systems',
      question: '¿Qué modelo de gobernanza elegirías para un design system?',
      answer:
        'Hay tres modelos clásicos: centralizado, con un equipo dueño que construye todo (consistencia alta pero cuello de botella); federado, con contribuciones de los equipos de producto y un núcleo que cura (más escalable pero requiere procesos claros); y solitario, una persona que lo sostiene, frágil. En organizaciones medianas o grandes suele funcionar un modelo híbrido: equipo central chico con proceso de contribución documentado, criterios de aceptación, versionado y changelog. La elección depende del tamaño, la madurez y cuántos productos lo usan.',
    },
    {
      topic: 'design systems',
      question: '¿Cómo medirías la adopción y el éxito de un design system?',
      answer:
        'Con métricas de adopción, como porcentaje de componentes del sistema en el código en producción, cantidad de equipos que lo usan y detaches o overrides en Figma, y métricas de impacto, como tiempo de desarrollo de pantallas nuevas, bugs de UI, inconsistencias detectadas en auditorías y problemas de accesibilidad. También vale la satisfacción de los equipos que lo consumen con encuestas periódicas. Una adopción baja suele indicar que el sistema no resuelve las necesidades reales, no que los equipos sean indisciplinados.',
    },
    {
      topic: 'ux writing',
      question: '¿Cómo encararías la localización de un producto a otros idiomas desde diseño?',
      answer:
        'Diseñando para la expansión de texto: el alemán puede ser entre 30 y 40% más largo que el inglés, así que nada de anchos fijos ni textos dentro de imágenes. Considero idiomas de derecha a izquierda, formatos de fecha, número y moneda, pluralización, y que los íconos y colores pueden tener otro significado cultural. Trabajo con strings parametrizados, glosarios y contexto para traductores, y testeo con pseudolocalización. Además de traducir, se valida con usuarios locales porque los modelos mentales cambian.',
    },
    {
      topic: 'métricas',
      question: '¿Cómo demostrás el impacto de diseño en el negocio?',
      answer:
        'Conecto el trabajo de diseño con métricas que le importan al negocio antes de empezar: conversión, retención, tickets de soporte, tiempo de tarea o costo operativo. Defino una línea base y una hipótesis medible, y después del lanzamiento comparo, idealmente con un A/B test o con un grupo de control. Por ejemplo: "rediseñamos el onboarding y los tickets de primera semana bajaron 30%". Cuando el impacto no es medible directamente, uso indicadores intermedios y evidencia cualitativa, sin atribuirme más de lo que corresponde.',
    },
    {
      topic: 'métricas',
      question: '¿Qué cuidados tenés al interpretar un A/B test de diseño?',
      answer:
        'Definir de antemano la métrica principal, el tamaño de muestra y la duración, y no cortar el test apenas parece ganar (peeking). Correr al menos ciclos semanales completos, mirar métricas guardrail para no mejorar una cosa rompiendo otra, y desconfiar del efecto novedad en usuarios recurrentes. Un resultado no significativo no prueba que las variantes sean iguales. Y un A/B test dice qué funcionó, no por qué: lo complemento con investigación cualitativa para aprender algo transferible.',
    },
    {
      topic: 'estrategia',
      question: '¿Qué entendés por estrategia de diseño y cómo la construís?',
      answer:
        'Es el puente entre la estrategia de negocio y las decisiones de diseño del día a día: una visión de la experiencia a futuro, principios de diseño que sirvan para decidir y prioridades claras de qué problemas resolver primero. La construyo con investigación, entendimiento de los objetivos de la empresa y de la competencia, y la materializo en artefactos como un North Star o visión prototipada, journey maps del estado actual y deseado, y un roadmap de oportunidades. Tiene que ser lo bastante concreta para que los equipos la usen al tomar decisiones.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo facilitás una buena critique de diseño?',
      answer:
        'Quien presenta aclara el contexto, el objetivo, en qué etapa está y qué tipo de feedback busca. Los participantes evalúan contra el objetivo y los usuarios, no contra gustos personales, y preguntan antes de prescribir: "¿qué pasa si el usuario no tiene tarjeta guardada?" en vez de "poné un botón acá". Hay un facilitador que cuida el tiempo y que todos participen, y al final quien presentó decide qué tomar. La critique no es un espacio de aprobación ni de jerarquía.',
    },
    {
      topic: 'liderazgo',
      question: '¿Cómo ayudás a crecer a diseñadores más junior?',
      answer:
        'Con un marco claro de expectativas por nivel, oportunidades de trabajar en problemas un poco más grandes que su zona de confort y feedback frecuente y específico sobre su trabajo y su forma de comunicar. Hago pairing en momentos clave, como planificar research o presentar a stakeholders, y les doy visibilidad cuando hacen buen trabajo. Les pregunto antes de darles la respuesta para que desarrollen criterio propio. Y acuerdo con ellos objetivos de crecimiento revisados periódicamente.',
    },
    {
      topic: 'liderazgo',
      question: '¿Qué es DesignOps y qué problemas resuelve?',
      answer:
        'Es la disciplina que optimiza cómo trabaja un equipo de diseño a escala: procesos, herramientas, presupuesto, reclutamiento de usuarios, onboarding de diseñadores, gestión de archivos y librerías, y métricas del equipo. Resuelve problemas típicos de crecimiento: diseñadores reinventando lo mismo, archivos imposibles de encontrar, research que no se reutiliza o handoffs inconsistentes. Su objetivo es que los diseñadores pasen más tiempo diseñando y que la calidad sea predecible.',
    },
    {
      topic: 'colaboración',
      question: '¿Cómo hacés que diseño participe en las decisiones de producto y no solo ejecute?',
      answer:
        'Trabajando en el problema antes de que llegue como solución definida: participando del discovery con producto e ingeniería, aportando evidencia de usuarios y proponiendo oportunidades, no solo pantallas. Ayuda hablar el lenguaje del negocio, entender métricas y restricciones técnicas, y mostrar resultados medibles de decisiones anteriores. También conviene formar un trío de PM, diseño y tech lead que decide junto. La influencia se gana entregando valor y siendo un socio confiable, no reclamando un lugar.',
    },
    {
      topic: 'colaboración',
      question: '¿Cómo manejás feedback contradictorio de varios stakeholders?',
      answer:
        'Vuelvo a los objetivos acordados del proyecto y a la evidencia de usuarios para tener un criterio común, en lugar de mediar entre opiniones. Hago visibles las contradicciones y sus trade-offs en una sesión conjunta, en vez de negociar uno por uno. Si sigue sin resolverse, identifico quién tiene la decisión final y le presento las opciones con pros, contras y una recomendación. Documento la decisión para no reabrirla en cada revisión.',
    },
    {
      topic: 'portfolio',
      question: '¿Cómo presentás un proyecto en una entrevista de nivel senior?',
      answer:
        'Elijo uno o dos proyectos con impacto y complejidad, y los cuento como historia: contexto de negocio, el problema y por qué importaba, mi rol y el equipo, las decisiones difíciles y los trade-offs, cómo influí en stakeholders, el resultado medido y qué haría distinto. Muestro el proceso pero sin recorrer cada artefacto, y dejo espacio para preguntas. En senior importa tanto el liderazgo, la estrategia y la colaboración como el craft. Practico con tiempo para no pasarme de 20 a 30 minutos.',
    },
    {
      topic: 'estrategia',
      question:
        '¿Cómo cambia el trabajo de UX al diseñar productos con funciones de IA generativa?',
      answer:
        'El output es probabilístico, así que hay que diseñar para la incertidumbre: comunicar qué puede y qué no puede hacer el sistema, mostrar fuentes o razonamiento cuando corresponde, y permitir revisar, editar, reintentar y deshacer. Hay que pensar estados nuevos como respuestas parciales en streaming, errores o alucinaciones, y mecanismos de feedback. También la confianza calibrada: que la gente no confíe de más ni de menos. Y los criterios de evaluación cambian, porque no alcanza con testear un único camino feliz.',
    },
  ],
};
