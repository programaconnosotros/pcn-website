import type { InterviewGuide } from './types';

export const uxUiGuide: InterviewGuide = {
  track: 'ux-ui',
  summary:
    'Qué estudiar y cómo practicar para una entrevista de diseño UX/UI: research, usabilidad, arquitectura de información, interacción, diseño visual, accesibilidad, design systems, UX writing, Figma, portfolio, whiteboard challenge y métricas, de junior a senior.',
  sections: [
    {
      id: 'la-entrevista',
      title: 'Cómo es la entrevista y qué rol buscan',
      body: [
        'Un proceso de diseño típico tiene un screening con recruiting, una revisión de portfolio (vos presentás uno o dos casos de estudio durante 30 a 45 minutos y te repreguntan), una entrevista con el hiring manager sobre proceso y colaboración, un ejercicio práctico (whiteboard challenge en vivo o take-home de unos días) y, en empresas más grandes, entrevistas con producto e ingeniería sobre cómo trabajás con ellos. La presentación de portfolio es casi siempre la etapa que más pesa: ahí se ve cómo pensás, no solo cómo dibujás.',
        'Antes de prepararte, entendé qué rol es. UX designer se enfoca en el problema, la investigación, los flujos y la arquitectura de información. UI designer se enfoca en la capa visual: layout, tipografía, color, componentes y consistencia. Product designer es el perfil más pedido hoy y combina ambos con criterio de producto: entiende métricas y negocio, prioriza con el PM y participa desde el descubrimiento hasta la entrega. También hay roles especializados como UX researcher, content designer o design systems designer, con entrevistas propias.',
        'Para junior se evalúa que tengas fundamentos sólidos (heurísticas, jerarquía visual, accesibilidad básica), un proceso razonable aunque sea en proyectos de curso o personales, buen manejo de Figma y capacidad de recibir feedback. Para semi-senior esperan autonomía: llevar una feature de punta a punta, decidir qué investigación hace falta, justificar decisiones con datos y trabajar fluido con desarrollo. Para senior importa el impacto: elegir los problemas correctos, influir en la estrategia de producto, elevar la calidad del equipo, construir o gobernar un design system y mentorear.',
        'En todas las etapas te van a evaluar comunicación y colaboración tanto como el resultado. Un diseño lindo sin explicación de por qué es así, para quién y qué cambió, pesa poco. Preparate para hablar de restricciones reales (tiempos, tecnología, negocio), de decisiones que defendiste y de las que cediste, y de cómo medís si tu diseño funcionó.',
      ],
      checklist: [
        {
          text: 'Distinguir UX, UI y product designer y saber a cuál aplicás',
          explanation:
            'UX designer responde qué hay que construir y cómo fluye: research, journeys, arquitectura de información, wireframes y validación con usuarios. UI designer responde cómo se ve y se siente: sistema visual, componentes, estados, microinteracciones y detalle de pixel. Product designer cubre todo el recorrido y además comparte responsabilidad por el resultado de negocio junto a producto e ingeniería. Leé la descripción del puesto buscando señales: "discovery", "research" y "flows" apuntan a UX; "visual", "brand" y "design system" a UI; "outcomes", "métricas" y "end to end" a product. Si te presentás como generalista para un rol de UI muy visual, mostrá primero tu trabajo visual más fuerte.',
        },
        {
          text: 'Calibrar las respuestas al nivel junior, semi-senior o senior',
          explanation:
            'Un junior muestra que conoce los fundamentos y que sigue un proceso: "hice entrevistas con cinco usuarios, armé el flujo, testeé el prototipo y corregí dos problemas". Un semi-senior muestra criterio y autonomía: "decidí no hacer research nuevo porque ya teníamos datos de soporte, prioricé el flujo de pago y negocié con desarrollo una versión más simple para llegar al release". Un senior muestra impacto y liderazgo: "detecté que el problema real no era el onboarding sino la propuesta de valor, lo llevé a la estrategia del trimestre y armé el proceso de research del equipo". Si aplicás a senior y solo hablás de pantallas, la respuesta queda corta.',
        },
        {
          text: 'Tener dos casos de estudio listos para presentar en profundidad',
          explanation:
            'Elegí dos proyectos que muestren cosas distintas, por ejemplo uno de research y flujos complejos y otro de UI y sistema visual, o uno con impacto medible y otro con un problema difícil de colaboración. Para cada uno tenés que poder contar contexto, tu rol exacto, el problema, el proceso con sus decisiones y descartes, el resultado y qué harías distinto. Practicalo en voz alta con cronómetro: 15 minutos para la versión corta y 30 para la larga. El error típico es mostrar todo el proyecto en orden cronológico sin decir cuáles fueron las decisiones importantes.',
        },
        {
          text: 'Prepararte para preguntas de colaboración y feedback',
          explanation:
            'Son preguntas como "contame una vez que un desarrollador te dijo que tu diseño no se podía hacer" o "qué hacés si el PM quiere una solución que te parece mala para el usuario". Usá el formato situación, acción y resultado, y mostrá que buscás entender la restricción antes de defender tu idea: preguntás por qué, proponés alternativas, buscás datos y aceptás decisiones de negocio documentando el riesgo. También preparate para "contame un feedback duro que recibiste": la respuesta buena muestra que lo usaste para mejorar, no que convenciste a todos de que tenías razón.',
        },
        {
          text: 'Investigar el producto de la empresa antes de la entrevista',
          explanation:
            'Usá el producto como un usuario nuevo: registrate, completá la tarea principal y anotá fricciones, inconsistencias visuales, problemas de accesibilidad y cosas bien resueltas. Leé su blog de diseño o su design system público si tienen. Llevá dos o tres observaciones concretas con una hipótesis de mejora y cómo la validarías, contadas con respeto: no sabés qué restricciones tuvieron. Esto te sirve para la pregunta "qué cambiarías de nuestro producto", que es muy común y donde un "nada, está todo muy bien" te deja mal parado.',
        },
      ],
    },
    {
      id: 'ux-research',
      title: 'UX research',
      body: [
        'La investigación existe para reducir incertidumbre antes de invertir en construir. La primera decisión es qué querés aprender y con qué método: los métodos cualitativos (entrevistas, observación, tests de usabilidad) responden por qué y cómo, con pocas personas; los cuantitativos (encuestas, analytics, A/B tests) responden cuánto y cuántos, con muestras grandes. También se distingue entre lo que la gente dice (actitudinal) y lo que la gente hace (conductual): lo que hace suele ser más confiable.',
        'El research generativo o de descubrimiento busca entender problemas, contextos y necesidades antes de tener una solución: entrevistas en profundidad, estudios de diario, investigación contextual. El evaluativo valida una solución existente o propuesta: tests de usabilidad, card sorting, tree testing, encuestas post-tarea. En una entrevista te pueden dar un escenario y preguntar qué método usarías; la respuesta buena arranca por la pregunta de investigación y no por el método favorito.',
        'Las entrevistas con usuarios tienen técnica: guion con preguntas abiertas, pedir historias concretas del pasado ("contame la última vez que...") en lugar de opiniones sobre el futuro, no hacer preguntas guiadas, repreguntar con "por qué" y "qué pasó después", y dejar silencios. Para sintetizar se usan affinity maps, se agrupan observaciones en patrones e insights, y se comunican con artefactos como journeys, jobs to be done o, con cuidado, personas basadas en datos reales.',
        'En niveles más altos importa el research como práctica de equipo: decidir cuándo no hace falta investigar, reclutar participantes representativos, incluir a ingeniería y producto en las sesiones, guardar los hallazgos en un repositorio y respetar la privacidad y el consentimiento de los participantes.',
      ],
      checklist: [
        {
          text: 'Elegir el método de research según la pregunta',
          explanation:
            'Si no sabés por qué los usuarios abandonan el onboarding, empezás por analytics para ver dónde abandonan (cuantitativo, conductual) y después entrevistas o tests para entender por qué (cualitativo). Si querés saber cómo organizar el menú, card sorting para descubrir cómo agrupan y tree testing para validar la estructura. Si querés saber si una nueva versión convierte más, A/B test. Si querés entender el contexto de uso de un producto para médicos, observación contextual. El error común es responder "haría una encuesta" para todo: las encuestas sirven para medir actitudes en escala, no para descubrir problemas que todavía no conocés.',
        },
        {
          text: 'Diferenciar research generativo de evaluativo',
          explanation:
            'El generativo se hace antes de tener una solución y busca entender el problema: qué intenta lograr la gente, con qué herramientas, qué le frustra. Sus resultados son oportunidades, journeys e insights. El evaluativo prueba algo concreto, un prototipo o un producto en producción, y sus resultados son problemas de usabilidad, tasas de éxito y mejoras puntuales. Ejemplo: entrevistar a dueños de comercios sobre cómo cobran hoy es generativo; pedirles que cobren con tu prototipo es evaluativo. En la entrevista, mostrá que sabés que ambos tienen su momento y que testear soluciones sin entender el problema lleva a optimizar lo equivocado.',
        },
        {
          text: 'Conducir una entrevista de usuario sin sesgar las respuestas',
          explanation:
            'Usá preguntas abiertas sobre comportamiento pasado: "contame cómo organizaste tu último viaje" en vez de "¿usarías una app que organice tus viajes?", porque la gente es mala prediciendo lo que haría. Evitá preguntas guiadas como "¿no te parece confuso este botón?" y preguntas dobles. Repreguntá para llegar a la causa ("¿qué hiciste entonces?", "¿por qué eso fue un problema?") y tolerá los silencios, porque ahí aparece lo interesante. Con cinco a ocho entrevistas por segmento suelen repetirse los patrones. Error común: convertir la entrevista en una demo de tu idea y escuchar solo lo que la confirma.',
        },
        {
          text: 'Sintetizar hallazgos en insights accionables',
          explanation:
            'Una observación es lo que viste ("tres de seis usuarios exportaron a Excel para comparar planes"); un insight explica el patrón y su causa ("los usuarios no pueden comparar planes dentro del producto, así que salen a una herramienta externa y muchos no vuelven"). Para llegar ahí se transcriben notas, se agrupan en un affinity map y se buscan patrones con su frecuencia y su impacto. Un insight accionable sugiere una oportunidad ("¿cómo podríamos permitir comparar planes sin salir del flujo?"). El error es entregar un informe largo con citas sueltas que nadie usa; lo útil son pocos insights priorizados y conectados a decisiones.',
        },
        {
          text: 'Explicar cuándo una persona o un journey map aporta y cuándo no',
          explanation:
            'Una persona sirve si está basada en research real y ayuda al equipo a tomar decisiones, por ejemplo distinguir entre un administrador que configura una vez y un operador que usa el sistema todo el día. Se vuelve inútil cuando es un personaje inventado con hobbies y foto de stock que nadie consulta. Un journey map muestra etapas, acciones, emociones y puntos de dolor a lo largo del tiempo, y sirve para encontrar dónde intervenir. Jobs to be done se enfoca en el progreso que la persona quiere lograr, independientemente de la solución. En la entrevista, decí qué artefacto usaste y qué decisión permitió tomar.',
        },
      ],
    },
    {
      id: 'testing-de-usabilidad',
      title: 'Testing de usabilidad',
      body: [
        'Un test de usabilidad observa a personas reales intentando completar tareas reales con tu diseño, para encontrar dónde se traban. No es preguntarles si les gusta: es mirar lo que hacen. Se planifica con un objetivo, un perfil de participantes, un guion con tareas basadas en escenarios ("querés mandarle plata a un amigo para pagar la cena") y criterios de éxito definidos antes de empezar.',
        'Puede ser moderado (un facilitador acompaña en vivo y puede repreguntar) o no moderado (la persona lo hace sola con una plataforma que graba), y presencial o remoto. El moderado da más profundidad y el no moderado más escala y velocidad. La técnica más usada es think aloud: pedirle a la persona que piense en voz alta mientras usa el producto, sin ayudarla cuando se traba.',
        'La regla clásica de Nielsen dice que con cinco usuarios por segmento encontrás la mayoría de los problemas de usabilidad graves, siempre que hagas tests iterativos: probar, corregir y volver a probar. Para métricas comparables se necesitan muestras más grandes. Las métricas habituales son tasa de éxito de tarea, tiempo, errores y cuestionarios como SUS o SEQ.',
        'La evaluación heurística complementa el test con usuarios: expertos revisan la interfaz contra principios como las 10 heurísticas de Nielsen. Es barata y rápida, pero no reemplaza ver a usuarios reales, porque los expertos no son el usuario.',
      ],
      checklist: [
        {
          text: 'Planificar un test de usabilidad de punta a punta',
          explanation:
            'Empezás por el objetivo ("saber si los usuarios nuevos pueden crear su primera factura sin ayuda"), definís participantes (cinco usuarios que facturan pero no usaron el producto), escribís tareas como escenarios realistas sin revelar la respuesta ("tenés que cobrarle a un cliente un trabajo de diseño", no "hacé click en Nueva factura"), definís qué es éxito, preparás el prototipo con los caminos necesarios y hacés un piloto con un compañero. Después de cada sesión anotás problemas con su severidad. El error común es escribir tareas que usan las mismas palabras que la interfaz, porque la gente solo busca la palabra y no prueba si entiende.',
        },
        {
          text: 'Facilitar sin influir en el participante',
          explanation:
            'Al empezar aclarás que se prueba el diseño y no a la persona, y que no hay respuestas incorrectas. Durante la tarea pedís que piense en voz alta y, si se traba, devolvés la pregunta: "¿qué esperabas que pasara?" o "¿qué harías si estuvieras solo?". No explicás la interfaz ni defendés tus decisiones. Si pregunta "¿esto está bien?", respondés "¿qué te parece a vos?". Solo intervenís si está completamente bloqueado, y lo registrás como tarea fallida. Error típico: facilitar el diseño propio y ponerse a la defensiva, lo que hace que el participante deje de criticar.',
        },
        {
          text: 'Explicar la regla de los cinco usuarios y sus límites',
          explanation:
            'Nielsen y Landauer mostraron que con cinco usuarios se encuentra aproximadamente el 85% de los problemas de usabilidad, porque los problemas frecuentes aparecen enseguida y los siguientes participantes repiten lo ya visto. Vale para tests cualitativos, iterativos y de un segmento homogéneo: si tenés compradores y vendedores, necesitás cinco de cada uno. No vale para obtener métricas con significancia estadística (para comparar tasas o tiempos se necesitan 20 a 40 o más) ni para problemas raros. La versión correcta de la respuesta es: mejor tres rondas de cinco que una de quince.',
        },
        {
          text: 'Priorizar los hallazgos por severidad',
          explanation:
            'La severidad combina frecuencia (cuántos lo sufrieron), impacto (si impide completar la tarea o solo molesta) y persistencia (si se supera una vez aprendido). Una escala común va de cosmético a catastrófico. Ejemplo: tres de cinco no encontraron cómo agregar un producto al carrito es crítico; uno dudó con un ícono pero lo resolvió es menor. Entregá una lista corta ordenada con evidencia (clips y citas) y una recomendación para cada problema. Error común: reportar 40 hallazgos sin priorizar, que hace que el equipo no arregle ninguno.',
        },
        {
          text: 'Aplicar las heurísticas de Nielsen en una revisión rápida',
          explanation:
            'Las diez son: visibilidad del estado del sistema, coincidencia con el mundo real, control y libertad del usuario, consistencia y estándares, prevención de errores, reconocer antes que recordar, flexibilidad y eficiencia, diseño estético y minimalista, ayudar a reconocer y recuperarse de errores, y ayuda y documentación. Ejemplos: un upload sin barra de progreso viola la primera; un formulario que borra todo al fallar viola la de recuperación de errores; no tener deshacer al borrar viola control y libertad. Saber nombrarlas con un ejemplo concreto es muy común en entrevistas junior y semi-senior.',
        },
      ],
    },
    {
      id: 'arquitectura-de-informacion',
      title: 'Arquitectura de información',
      body: [
        'La arquitectura de información (IA) organiza, estructura y nombra el contenido para que la gente encuentre lo que busca y entienda dónde está. Tiene cuatro sistemas: organización (cómo se agrupa el contenido), etiquetado (cómo se nombra), navegación (cómo se mueve la gente) y búsqueda. Un buen diseño visual no compensa una estructura que no coincide con el modelo mental de los usuarios.',
        'El modelo mental es cómo el usuario cree que funciona algo. Para descubrirlo se usa card sorting: abierto (los participantes agrupan tarjetas y nombran los grupos, sirve para descubrir), cerrado (agrupan en categorías dadas, sirve para validar) o híbrido. Para validar una estructura se usa tree testing: se muestra solo el árbol de navegación sin diseño visual y se pide encontrar cosas, midiendo éxito y camino directo.',
        'Los entregables típicos son el sitemap (la jerarquía de pantallas o páginas), los user flows (los pasos para completar una tarea, con decisiones y errores) y el inventario de contenido. En productos grandes la IA también define la taxonomía y los metadatos que alimentan búsqueda y filtros.',
        'Las decisiones de navegación tienen tradeoffs: una jerarquía amplia y poco profunda muestra más opciones a la vez pero puede saturar, y una profunda reduce opciones por nivel pero obliga a más clicks y aumenta el riesgo de perderse. En mobile, la navegación inferior con tres a cinco destinos principales es el patrón estándar en iOS y Android.',
      ],
      checklist: [
        {
          text: 'Explicar card sorting abierto, cerrado y tree testing',
          explanation:
            'En card sorting abierto le das a los participantes tarjetas con contenidos ("cambiar contraseña", "ver facturas", "métodos de pago") y ellos crean los grupos y los nombres: te dice cómo piensan. En cerrado les das las categorías y ubican las tarjetas: te dice si tus categorías funcionan. Tree testing invierte el proceso: das la estructura y pedís encontrar algo ("¿dónde cambiarías tu tarjeta?"), midiendo tasa de éxito, directness (si fue sin volver atrás) y tiempo. Herramientas comunes: Optimal Workshop, Maze o UXtweak. Un buen proceso combina card sorting abierto para proponer y tree testing para validar antes de diseñar pantallas.',
        },
        {
          text: 'Armar un sitemap y un user flow claros',
          explanation:
            'El sitemap muestra la jerarquía completa del producto: secciones, subsecciones y pantallas, sin entrar en el detalle de cada una. El user flow muestra el camino de una tarea concreta: punto de entrada, pantallas, decisiones (por ejemplo, "¿tiene cuenta?"), estados de error y el final. Un buen flow incluye los caminos alternativos y los errores, no solo el happy path. Ejemplo: el flow de recuperar contraseña tiene que contemplar mail inexistente, link vencido y contraseña nueva inválida. El error común es diseñar pantallas sueltas sin flow y descubrir tarde que faltan estados.',
        },
        {
          text: 'Elegir etiquetas que entienda el usuario y no la empresa',
          explanation:
            'Las etiquetas tienen que usar el vocabulario del usuario, no el organigrama ni la jerga interna. Un banco que llama "Productos pasivos" a la sección de plazos fijos obliga al usuario a traducir. Las etiquetas se validan con card sorting, tree testing, búsquedas internas (qué escribe la gente en el buscador) y tickets de soporte. Evitá etiquetas ambiguas como "Recursos" o "Más" que no dicen qué hay adentro. En la entrevista, si te dan un menú para mejorar, empezá preguntando quiénes son los usuarios y qué buscan, no reordenando los ítems por intuición.',
        },
        {
          text: 'Justificar una estructura de navegación según el contexto',
          explanation:
            'Para una app mobile con cuatro tareas frecuentes, una tab bar inferior las deja siempre a mano; un menú hamburguesa esconde opciones y reduce su uso, por eso se reserva para lo secundario. Para un SaaS complejo, una sidebar con secciones y subsecciones escala mejor que una barra superior. En e-commerce, los filtros facetados y la búsqueda importan más que el menú. Además, la navegación tiene que indicar dónde estás (estado activo, breadcrumbs, títulos) y cómo volver. Mostrá que elegís el patrón por frecuencia de uso, cantidad de destinos y plataforma, no por moda.',
        },
      ],
    },
    {
      id: 'diseno-de-interaccion',
      title: 'Diseño de interacción',
      body: [
        'El diseño de interacción define cómo responde el producto a lo que hace la persona: qué controles usar, qué feedback dar, cómo se pasa de un estado a otro y cómo se recupera de errores. Su base son conceptos como affordances y signifiers (que un elemento comunique qué se puede hacer con él), feedback inmediato, mapping natural entre control y efecto, y restricciones que eviten errores.',
        'Las leyes de UX más preguntadas son: Fitts (el tiempo para alcanzar un objetivo depende de su tamaño y distancia, por eso los botones principales son grandes y cercanos), Hick (más opciones aumentan el tiempo de decisión), Jakob (los usuarios pasan la mayor parte del tiempo en otros productos y esperan que el tuyo funcione igual), la carga cognitiva y el efecto de umbral de Doherty (respuestas por debajo de unos 400 ms mantienen el flujo).',
        'Cada pantalla y componente tiene estados que hay que diseñar: vacío, cargando, parcial, error, éxito, sin conexión y sin permisos, además de hover, foco, presionado y deshabilitado en los controles. Los formularios son el lugar donde más se pierde conversión: validación en el momento justo, mensajes de error específicos, teclados adecuados en mobile y no pedir datos innecesarios.',
        'La animación y las microinteracciones sirven para dar feedback, orientar transiciones y reforzar la relación entre elementos, no para decorar. Duraciones cortas (100 a 300 ms para la mayoría de las transiciones), curvas de easing coherentes y respeto por la preferencia de movimiento reducido son lo esperable.',
      ],
      checklist: [
        {
          text: 'Explicar affordance, signifier, feedback y mapping con ejemplos',
          explanation:
            'Affordance es la relación entre un objeto y lo que una persona puede hacer con él; signifier es la señal que comunica esa posibilidad. En pantallas casi todo depende de signifiers: un texto subrayado y de color dice "link", un botón con relieve o fondo dice "presioname", un ícono de arrastre dice "reordenable". Feedback es la respuesta a una acción: el botón cambia al presionarlo, aparece un spinner, un toast confirma. Mapping es la correspondencia entre control y resultado: un slider horizontal para el volumen. Un error clásico es el diseño flat extremo donde los botones parecen texto y nadie sabe qué es clickeable.',
        },
        {
          text: 'Aplicar las leyes de Fitts, Hick y Jakob a decisiones concretas',
          explanation:
            'Fitts: el botón de compra va grande y en la zona del pulgar en mobile, y acciones destructivas como eliminar van lejos de las frecuentes. Hick: un onboarding con doce opciones paraliza, así que se reducen o se agrupan y se usa divulgación progresiva. Jakob: el carrito va arriba a la derecha y el logo lleva a la home porque así funciona en todos lados, y romper la convención tiene un costo que hay que justificar. En la entrevista citá la ley junto con la decisión que tomaste por ella; nombrarla sin aplicarla no suma.',
        },
        {
          text: 'Diseñar todos los estados de una pantalla, no solo el ideal',
          explanation:
            'Para una lista de pedidos: estado vacío (primera vez, con explicación y acción para crear el primero), cargando (skeleton que respeta el layout en lugar de un spinner en blanco), parcial (pocos elementos), error (qué pasó y cómo reintentar), sin resultados de búsqueda (distinto del vacío inicial), sin conexión y sin permisos. Además cada control interactivo tiene default, hover, foco visible, presionado, deshabilitado y cargando. Mostrar en el portfolio que diseñaste estos estados indica madurez y le ahorra a desarrollo inventarlos. El error típico es entregar solo el happy path con datos perfectos.',
        },
        {
          text: 'Diseñar formularios con buena validación y mensajes de error',
          explanation:
            'Labels visibles arriba del campo (el placeholder no reemplaza al label porque desaparece al escribir), un campo por línea, agrupar lo relacionado, marcar los opcionales en vez de los obligatorios si son minoría, y usar el tipo de input correcto para que mobile muestre el teclado adecuado. Validá al salir del campo (on blur) y no mientras la persona todavía está escribiendo, y al enviar llevá el foco al primer error. Los mensajes dicen qué pasó y cómo arreglarlo junto al campo: "El CUIT tiene 11 números, te faltan 2" en vez de "Campo inválido". Pedí solo lo necesario: cada campo extra baja la conversión.',
        },
        {
          text: 'Usar animación con propósito y accesible',
          explanation:
            'La animación sirve para dar feedback (un botón que confirma), explicar cambios de estado (un ítem que se va al carrito muestra adónde fue), mantener contexto en transiciones entre pantallas y dirigir la atención. Se usan duraciones cortas, en general entre 100 y 300 ms para componentes y algo más para transiciones de pantalla, con easing de salida (ease-out) para lo que entra. Hay que respetar la preferencia de movimiento reducido del sistema operativo y evitar parpadeos o movimientos grandes que pueden causar mareos. Error común: animaciones largas en acciones frecuentes, que se vuelven molestas a la tercera vez.',
        },
      ],
    },
    {
      id: 'diseno-visual',
      title: 'Diseño visual',
      body: [
        'El diseño visual organiza la información para que se entienda de un vistazo. La herramienta principal es la jerarquía: tamaño, peso, color, contraste, espacio y posición indican qué es lo más importante y qué va después. Los principios de Gestalt (proximidad, similitud, continuidad, cierre, figura y fondo, región común) explican por qué percibimos ciertos elementos como grupos.',
        'La tipografía hace la mayor parte del trabajo en una interfaz. Se define una escala tipográfica con pocos tamaños (por ejemplo con una razón como 1.25), interlineado cómodo para lectura (alrededor de 1.4 a 1.6 en texto corrido), largo de línea de 45 a 75 caracteres y pocas familias y pesos. El color se usa con intención: una paleta con primario, neutros y semánticos (éxito, error, advertencia, información), con contraste suficiente y sin depender solo del color para comunicar.',
        'El espaciado consistente se basa en una escala, típicamente múltiplos de 4 u 8 píxeles, y una grilla de columnas con márgenes y gutters que se adapta por breakpoint. El diseño responsive no es achicar el desktop: es repensar prioridades, navegación y densidad para cada tamaño, empezando muchas veces por mobile.',
        'En la entrevista te pueden pedir que critiques una pantalla o expliques decisiones visuales de tu portfolio. Hablá en términos de objetivos ("quería que el monto fuera lo primero que se lea") y principios, no de gustos ("me gusta más así").',
      ],
      checklist: [
        {
          text: 'Explicar cómo construís jerarquía visual en una pantalla',
          explanation:
            'Primero decidís qué tiene que ver o hacer la persona primero, segundo y tercero, y después usás las herramientas visuales para reflejarlo: el título más grande y pesado, la acción principal con color de marca y relleno, las secundarias con borde o como texto, la información de soporte en gris y tamaño menor. El espacio también comunica: más espacio alrededor de algo le da importancia y separa grupos. Una prueba rápida es el test del entrecerrado de ojos (blur test): si al desenfocar la pantalla no se distingue qué es lo principal, la jerarquía falla. Error común: tres botones primarios compitiendo en la misma vista.',
        },
        {
          text: 'Aplicar los principios de Gestalt a un layout',
          explanation:
            'Proximidad: los elementos cercanos se perciben como grupo, por eso el label va más cerca de su campo que del campo anterior. Similitud: lo que se ve igual parece funcionar igual, así que todos los links tienen el mismo estilo y nada que no sea link lo imita. Región común: una card o un fondo agrupa contenido relacionado. Continuidad: los elementos alineados se leen como secuencia. Figura y fondo: un modal con overlay oscuro se percibe adelante del resto. En una crítica, señalar "este botón está más cerca del bloque de abajo, entonces parece pertenecer a él" muestra ojo entrenado y vocabulario preciso.',
        },
        {
          text: 'Definir una escala tipográfica y de espaciado',
          explanation:
            'Una escala tipográfica limita los tamaños a un conjunto coherente, por ejemplo 12, 14, 16, 20, 24, 32 y 40, cada uno con su interlineado y peso, y se nombran por función (body, caption, heading) en vez de por tamaño. El cuerpo de texto en web y mobile suele estar entre 14 y 16 px como mínimo. El espaciado usa una escala de 4 u 8 (4, 8, 12, 16, 24, 32, 48), que se lleva bien con las densidades de pantalla y facilita la comunicación con desarrollo. Esto se formaliza después como tokens en el design system. El error es usar 13, 15 y 17 px o márgenes de 7 y 11 sin criterio, que genera inconsistencia y trabajo extra.',
        },
        {
          text: 'Construir una paleta de color funcional',
          explanation:
            'Una paleta funcional tiene un color primario para acciones e identidad, una escala de neutros para texto, fondos y bordes (muchas veces de 50 a 900), y colores semánticos para estados: rojo para error, verde para éxito, amarillo o naranja para advertencia y azul para información. Cada combinación de texto y fondo tiene que cumplir contraste (4.5:1 para texto normal en WCAG AA). Para modo oscuro no se invierten los colores: se usan fondos grises oscuros en lugar de negro puro, se baja la saturación y se recalcula el contraste. El color nunca puede ser la única señal: un error lleva también ícono y texto.',
        },
        {
          text: 'Diseñar responsive con grillas y breakpoints',
          explanation:
            'Una grilla típica tiene 4 columnas en mobile, 8 en tablet y 12 en desktop, con márgenes y gutters definidos. Los breakpoints se eligen donde el contenido lo pide, no por dispositivos específicos. En cada tamaño se replantea qué mostrar: una tabla de desktop puede convertirse en lista de cards en mobile, la sidebar pasa a tab bar o drawer, y las acciones principales van al alcance del pulgar. Los objetivos táctiles necesitan al menos 24 por 24 px según WCAG 2.2 y lo recomendado por iOS (44 pt) y Material (48 dp). Mostrar en Figma el mismo flujo en dos tamaños con auto layout es una buena señal en el portfolio.',
        },
      ],
    },
    {
      id: 'accesibilidad',
      title: 'Accesibilidad y WCAG 2.2',
      body: [
        'La accesibilidad es diseñar para que personas con discapacidades visuales, auditivas, motrices o cognitivas puedan usar el producto, y también beneficia a todos en situaciones temporales (un brazo enyesado) o de contexto (sol sobre la pantalla). En muchos países es requisito legal: en Europa la European Accessibility Act aplica desde junio de 2025 a muchos productos digitales, y en Argentina la Ley 26.653 obliga a organismos públicos y proveedores del Estado.',
        'La referencia es WCAG 2.2, publicada en 2023, con cuatro principios: perceptible, operable, comprensible y robusto (POUR). Los criterios tienen niveles A, AA y AAA, y el objetivo habitual de empresas y leyes es AA. WCAG 2.2 agregó criterios como foco no oculto, tamaño mínimo de objetivo (24 por 24 px), alternativas a arrastrar, ayuda consistente, no repetir datos ya ingresados y autenticación accesible sin pruebas cognitivas.',
        'Desde diseño se resuelve gran parte: contraste suficiente, no depender solo del color, tamaños de objetivo, foco visible, orden lógico de lectura y de tabulación, labels claros, mensajes de error útiles, textos alternativos definidos y layouts que soporten zoom al 200% y texto agrandado. Lo que no se especifica en el diseño, desarrollo suele no implementarlo.',
        'En la entrevista se espera que no la trates como un checklist al final, sino como parte del proceso: anotaciones de accesibilidad en el handoff, revisión con herramientas, pruebas con lector de pantalla y, idealmente, incluir personas con discapacidad en el research.',
      ],
      checklist: [
        {
          text: 'Explicar los principios POUR y los niveles de conformidad',
          explanation:
            'Perceptible: la información se puede percibir por más de un sentido, por ejemplo imágenes con texto alternativo y videos con subtítulos. Operable: todo se puede usar con teclado y otras tecnologías, sin límites de tiempo injustificados ni contenido que provoque convulsiones. Comprensible: el lenguaje es claro, el comportamiento predecible y los errores se explican. Robusto: el contenido funciona con tecnologías de asistencia, lo que depende de buen HTML semántico y ARIA bien usado. Nivel A es lo mínimo, AA es el estándar que piden las leyes y las empresas, y AAA es deseable pero no se exige en todo un sitio.',
        },
        {
          text: 'Aplicar los requisitos de contraste de WCAG AA',
          explanation:
            'El texto normal necesita una relación de contraste de 4.5:1 con su fondo; el texto grande (24 px regular o 18.66 px bold en adelante) necesita 3:1. Los componentes de interfaz y gráficos importantes, como el borde de un input o un ícono que comunica algo, necesitan 3:1 contra lo que los rodea. Se verifica con plugins de Figma (por ejemplo Stark o los checkers de contraste), con el selector de color de las DevTools o herramientas como WebAIM. Error común: placeholders gris claro sobre blanco y texto blanco sobre el verde o amarillo de marca, que casi nunca llegan al mínimo.',
        },
        {
          text: 'Nombrar los criterios nuevos de WCAG 2.2',
          explanation:
            'Los más relevantes para diseño son: Focus Not Obscured (el elemento con foco no puede quedar tapado por un header fijo o un banner de cookies), Target Size Minimum (objetivos de al menos 24 por 24 px o con suficiente espacio alrededor), Dragging Movements (todo lo que se hace arrastrando tiene una alternativa con clicks, como botones para reordenar), Consistent Help (la ayuda está en el mismo lugar en todas las páginas), Redundant Entry (no pedir otra vez datos ya ingresados en el mismo proceso) y Accessible Authentication (no exigir resolver acertijos o recordar contraseñas sin permitir pegar o usar un gestor). Nombrar dos o tres con ejemplos muestra que estás actualizado.',
        },
        {
          text: 'Especificar accesibilidad en el handoff',
          explanation:
            'Un buen handoff incluye anotaciones de accesibilidad: el orden de foco, el texto alternativo de cada imagen (o si es decorativa), los nombres accesibles de botones con solo ícono ("Cerrar diálogo", no "X"), los landmarks y la jerarquía de encabezados, cómo se anuncian los errores y los cambios dinámicos, y el estado de foco visible de cada componente. En Figma se hace con anotaciones o con kits de anotación de accesibilidad, y en Dev Mode con el feature de anotaciones. Si esto no está en el diseño, cada desarrollador lo resuelve distinto o no lo resuelve.',
        },
        {
          text: 'Probar un diseño con teclado y lector de pantalla',
          explanation:
            'Aunque la implementación es de desarrollo, un diseñador semi-senior debería saber verificarla: navegar con Tab y Shift+Tab y comprobar que el foco se ve y sigue un orden lógico, que los modales atrapan el foco y lo devuelven al cerrarse, y que Escape cierra. Con VoiceOver en Mac o iOS, NVDA en Windows o TalkBack en Android, escuchar si los botones se anuncian con nombre y rol, si los errores se leen y si los encabezados permiten navegar. Combinalo con herramientas automáticas como axe o Lighthouse, sabiendo que detectan solo una parte de los problemas.',
        },
      ],
    },
    {
      id: 'design-systems',
      title: 'Design systems',
      body: [
        'Un design system es el conjunto de decisiones, componentes, patrones, guías y código compartido que permite a varios equipos diseñar y construir productos consistentes con menos esfuerzo. No es solo una librería de componentes en Figma: incluye tokens de diseño, componentes en código, documentación de uso, principios, procesos de contribución y gobierno.',
        'Los design tokens son las decisiones de diseño con nombre: colores, tipografía, espaciado, radios, sombras y duraciones. Suelen organizarse en capas: tokens primitivos o de referencia (blue-500), semánticos o de alias (color-action-primary) y, a veces, de componente (button-primary-background). La capa semántica es la que permite temas como modo oscuro o multimarca sin tocar los componentes.',
        'Atomic design de Brad Frost propone pensar la interfaz en átomos (botón, input), moléculas (campo con label y error), organismos (header, formulario), plantillas y páginas. Es útil como modelo mental aunque pocos sistemas lo siguen al pie de la letra. Ejemplos públicos para estudiar son Material Design 3, Apple Human Interface Guidelines, Carbon de IBM, Polaris de Shopify y Atlassian Design System.',
        'En niveles senior importan la adopción y el gobierno: cómo se decide qué entra al sistema, cómo se versiona y comunica un cambio que rompe, cómo se mide el uso y cómo se equilibra consistencia con la flexibilidad que necesitan los equipos de producto.',
      ],
      checklist: [
        {
          text: 'Explicar qué es un design system más allá de una librería de componentes',
          explanation:
            'Un design system tiene varias capas: fundamentos (color, tipografía, espaciado, iconografía, motion), tokens que codifican esas decisiones, componentes en diseño y en código que se mantienen sincronizados, patrones (cómo se resuelve un formulario largo, un estado vacío, una tabla con filtros), documentación con cuándo usar y cuándo no cada componente, y un proceso de contribución y gobierno. Una librería de Figma sin equivalente en código es solo un kit de UI, y una librería de código sin documentación de uso termina usándose mal. En la entrevista mostrá que entendés que el valor está en la consistencia y en la velocidad del equipo.',
        },
        {
          text: 'Diseñar una arquitectura de tokens primitivos y semánticos',
          explanation:
            'Los primitivos describen valores crudos: `blue-600` es un azul concreto, `space-4` son 16 px. Los semánticos describen intención: `color-background-surface`, `color-text-danger`, `color-border-focus`. Los componentes solo deberían usar tokens semánticos, de modo que para pasar a modo oscuro o a otra marca se cambia a qué primitivo apunta cada semántico y todo se actualiza. En Figma esto se implementa con variables y modos; en código, con variables CSS o con herramientas como Style Dictionary, siguiendo el formato del Design Tokens Community Group, que publicó su primera versión estable en 2025. Error común: componentes que usan primitivos directamente y rompen el tema oscuro.',
        },
        {
          text: 'Explicar atomic design y sus límites',
          explanation:
            'Átomos son las piezas mínimas (botón, input, ícono, label), moléculas combinan átomos con un propósito (un campo de búsqueda con input y botón), organismos son secciones complejas (una barra de navegación), plantillas definen la estructura de una página con contenido de ejemplo y páginas son instancias con contenido real. Sirve para pensar en composición y reutilización. Sus límites: la frontera entre molécula y organismo es discutible y discutirla no aporta, y muchos equipos prefieren hablar de componentes y patrones. Decí que lo usás como modelo mental y no como taxonomía rígida.',
        },
        {
          text: 'Contar cómo se gobierna y se hace adoptar un design system',
          explanation:
            'Hay modelos centralizados (un equipo dueño del sistema), federados (diseñadores de cada equipo contribuyen con un proceso de revisión) y mixtos. Un proceso típico: alguien propone un componente o cambio, se verifica que no exista ya algo que lo resuelva, se diseña y construye con criterios de calidad (accesibilidad, estados, documentación), se versiona con versionado semántico y se comunica con changelog y guía de migración. La adopción se impulsa haciendo que usar el sistema sea más fácil que no usarlo y se mide con datos, por ejemplo con las analíticas de librerías de Figma o el porcentaje de pantallas que usan componentes. Error común: un sistema perfecto que nadie usa porque no resuelve los casos reales.',
        },
        {
          text: 'Decidir cuándo crear un componente nuevo y cuándo extender uno',
          explanation:
            'Antes de crear un componente nuevo preguntate si el caso se repite en varios lugares, si un componente existente lo cubre con una variante o propiedad y si la diferencia es real o es un capricho visual. Crear un componente por cada pequeña diferencia genera un sistema imposible de mantener; forzar todo en un componente con veinte propiedades lo vuelve inusable. Una regla práctica: si aparece en tres lugares, se generaliza; si es único, se arma como composición de componentes existentes. Los componentes muy flexibles se resuelven mejor con slots que con muchas variantes.',
        },
      ],
    },
    {
      id: 'ux-writing',
      title: 'UX writing y content design',
      body: [
        'El texto es parte de la interfaz: muchas veces el problema de una pantalla no es el layout sino que los botones, títulos y mensajes no dicen claramente qué pasa. El UX writing busca que los textos sean claros, concisos y útiles, y que el producto tenga una voz consistente.',
        'Se distingue entre voz (la personalidad estable de la marca, por ejemplo cercana y directa) y tono (cómo se adapta esa voz al contexto: en un error de pago se es más serio y empático que en un mensaje de bienvenida). La voz se documenta en una guía de contenido con ejemplos de qué sí y qué no.',
        'Los casos más preguntados son los botones (verbos que describen la acción y su resultado), los mensajes de error (qué pasó, por qué y cómo seguir, sin culpar al usuario), los estados vacíos (explicar qué va a aparecer ahí y cómo empezar), las confirmaciones de acciones destructivas y el onboarding. El texto también tiene que considerar la localización: en español los textos suelen ser más largos que en inglés.',
        'Diseñar con contenido real, no con lorem ipsum, evita sorpresas: nombres largos, montos grandes y traducciones rompen layouts que se veían bien con texto de ejemplo.',
      ],
      checklist: [
        {
          text: 'Escribir botones y llamados a la acción claros',
          explanation:
            'Un botón debería decir qué va a pasar al tocarlo, con un verbo y, si hace falta, el objeto: "Guardar cambios", "Enviar transferencia", "Crear cuenta". Evitá "Aceptar" u "OK" cuando la acción tiene consecuencias, y en diálogos de confirmación repetí la acción en el botón: "Eliminar proyecto" y "Cancelar" en vez de "Sí" y "No", porque la gente no lee la pregunta. El texto del botón y el título del diálogo deben coincidir. En la entrevista, si te muestran un diálogo "¿Estás seguro? Sí / No", proponer este cambio es una mejora rápida y concreta.',
        },
        {
          text: 'Redactar mensajes de error útiles',
          explanation:
            'Un buen mensaje de error dice qué pasó, en lenguaje humano y sin códigos técnicos, y cómo resolverlo. "Error 422" no sirve; "La tarjeta está vencida. Probá con otra o actualizá la fecha" sí. No culpes al usuario ("Ingresaste mal el mail") y no seas gracioso en momentos de frustración, como un pago rechazado. Ubicá el mensaje junto al lugar del problema y conservá lo que la persona ya escribió. Si el error es del sistema, decilo y ofrecé reintentar o contacto. Mejor todavía es prevenir el error: formatear automáticamente, deshabilitar fechas no válidas o sugerir correcciones.',
        },
        {
          text: 'Diferenciar voz y tono con un ejemplo',
          explanation:
            'La voz es constante: si la marca es cercana, simple y optimista, lo es en toda la app. El tono varía según el momento emocional del usuario: en un mensaje de bienvenida puede ser entusiasta ("¡Listo! Ya podés empezar a cobrar"), en un error de seguridad es serio y claro ("Detectamos un ingreso desde un dispositivo nuevo. Si no fuiste vos, cambiá tu contraseña"). Un producto argentino que usa voseo en un lugar y tuteo en otro rompe la voz. Mostrá que entendés que el tono se adapta al contexto y que la guía de contenido existe para que todo el equipo escriba igual.',
        },
        {
          text: 'Diseñar estados vacíos y onboarding con contenido',
          explanation:
            'Un estado vacío es una oportunidad de explicar y activar: decí qué va a aparecer ahí, por qué conviene y cuál es el siguiente paso, con un botón para darlo. "Todavía no tenés clientes. Agregá el primero para empezar a facturarle" es mejor que "No hay datos". Distinguí el vacío inicial del vacío por filtros ("No encontramos resultados para esa búsqueda" con opción de limpiar filtros) y del vacío por error. En onboarding, menos pantallas de bienvenida y más aprender haciendo: tips en contexto cuando la persona llega a la función. Error típico: tutoriales largos que todos saltean.',
        },
      ],
    },
    {
      id: 'figma',
      title: 'Figma: auto layout, componentes, variables y handoff',
      body: [
        'Figma es la herramienta estándar de la industria y en casi todas las entrevistas te van a preguntar cómo la usás, o te van a pedir que abras un archivo y expliques cómo está construido. No se evalúa que sepas dónde está cada botón, sino que construyas archivos escalables y mantenibles: frames con auto layout que se adaptan al contenido, componentes con variantes y propiedades, estilos y variables conectados al design system, y prototipos que sirven para testear.',
        'Auto layout hace que un frame ordene a sus hijos en fila, columna o en grilla con un gap y padding definidos, y que se ajuste solo cuando cambia el contenido. Cada elemento se configura como fixed, hug contents o fill container, con mínimos y máximos. Los componentes tienen un componente principal y sus instancias; las variantes agrupan versiones de un componente en un set, y las component properties (boolean, texto, instance swap y variant) permiten configurar instancias sin desarmarlas. Los slots, que Figma lanzó en 2025, permiten dejar áreas de un componente abiertas a contenido libre.',
        'Las variables guardan valores reutilizables (color, número, texto y booleano) organizados en colecciones con modos, por ejemplo modo claro y oscuro, marcas o densidades. Pueden apuntar a otras variables (alias), lo que permite la arquitectura de tokens primitivos y semánticos, y se pueden limitar por scope para que un token de espaciado no aparezca en el selector de color. Los estilos siguen existiendo para lo que las variables no cubren bien, como estilos tipográficos completos, sombras, efectos y gradientes, y los estilos pueden usar variables por dentro.',
        'Para trabajar en equipo se usan librerías publicadas (con actualizaciones que los archivos aceptan), branching para cambios grandes en el sistema, comentarios, versiones con nombre y Dev Mode para el handoff, donde desarrollo inspecciona medidas, tokens y propiedades, compara cambios, ve anotaciones y marca qué está listo para desarrollo. Code Connect une los componentes de Figma con los componentes reales del código para que Dev Mode muestre el snippet correcto.',
      ],
      checklist: [
        {
          text: 'Construir layouts responsivos con auto layout',
          explanation:
            'Un botón con auto layout horizontal, padding de 12 por 16 y gap de 8 crece solo cuando cambia el texto; una card con auto layout vertical acomoda título, descripción y acciones sin mover nada a mano. La clave está en el resizing de cada hijo: hug contents se ajusta al contenido, fill container ocupa el espacio disponible y fixed mantiene el tamaño, combinado con min y max width para que un texto no se estire de más. Se anidan auto layouts para armar pantallas completas, y la opción de grilla de auto layout permite layouts en dos dimensiones. Usá absolute position solo para casos como un badge sobre un ícono. Error común: frames sin auto layout con elementos posicionados a mano, que se rompen al cambiar un texto o el tamaño de pantalla.',
        },
        {
          text: 'Armar componentes con variantes y component properties',
          explanation:
            'Un botón se modela como un component set con propiedades de variante como `type` (primary, secondary, ghost), `size` (sm, md, lg) y `state` (default, hover, pressed, disabled, loading). Lo que no cambia la estructura se resuelve con component properties en lugar de multiplicar variantes: una propiedad de texto para el label, un booleano para mostrar u ocultar el ícono y un instance swap para elegir qué ícono. Así el set queda en decenas de variantes y no en cientos. Nombrá propiedades y valores igual que en código para facilitar el handoff, y usá slots cuando un componente necesita contenido libre adentro. Error típico: desacoplar (detach) instancias para cambiar algo, lo que corta la conexión con el componente y hace que los cambios del sistema no lleguen.',
        },
        {
          text: 'Usar variables, colecciones y modos para tokens y temas',
          explanation:
            'Creá una colección de primitivos con la paleta (`blue/600`, `gray/900`) y otra de semánticos (`bg/surface`, `text/primary`, `border/focus`) con modos claro y oscuro, donde cada semántico es un alias a un primitivo distinto por modo. Los componentes usan solo semánticos, y al cambiar el modo de un frame toda la pantalla pasa a oscuro sin duplicar diseños. Lo mismo sirve para espaciado y radios con variables numéricas, para multimarca y para densidad. Configurá el scope de cada variable (por ejemplo, que los colores de texto solo aparezcan para texto) y documentá la equivalencia con código; se pueden exportar a formatos de tokens para que desarrollo los consuma. Error común: usar colores hex sueltos en los componentes en vez de variables.',
        },
        {
          text: 'Saber cuándo usar estilos y cuándo variables',
          explanation:
            'Las variables guardan un valor único (un color, un número, un string, un booleano) y soportan modos; son ideales para tokens de color, espaciado, radios y tamaños. Los estilos guardan combinaciones de propiedades: un estilo de texto incluye familia, tamaño, peso, interlineado y tracking; un estilo de efecto guarda sombras o blur; un estilo de color puede ser un gradiente o una imagen. La combinación habitual es usar estilos tipográficos cuyos valores internos (tamaño, interlineado) están vinculados a variables, y estilos de sombra para elevación. Saber explicar esta diferencia muestra que estás al día con cómo se construye un sistema en Figma.',
        },
        {
          text: 'Prototipar interacciones y flujos para testear',
          explanation:
            'Un prototipo conecta frames con triggers (on click, on drag, while hovering, after delay, key press) y acciones (navigate to, open overlay, swap overlay, scroll to, back), con transiciones como smart animate, que anima las capas con el mismo nombre entre frames. Las interacciones entre variantes permiten prototipar componentes interactivos una sola vez, por ejemplo un toggle o un hover, que funcionan en todas las instancias. Con variables y lógica condicional se pueden hacer prototipos que recuerdan estado, como un carrito que suma productos. Para un test de usabilidad, priorizá que los caminos de las tareas estén completos y que no haya callejones sin salida antes que las animaciones perfectas.',
        },
        {
          text: 'Preparar el handoff en Dev Mode y colaborar con librerías y branching',
          explanation:
            'Antes del handoff organizá el archivo en páginas claras, marcá las secciones como ready for dev, nombrá las capas, agregá anotaciones con comportamiento, estados, reglas responsive y accesibilidad, y asegurate de que todo use componentes y variables para que Dev Mode muestre tokens en lugar de valores sueltos. Desarrollo puede comparar versiones para ver qué cambió desde la última vez y, con Code Connect configurado, ver el código real del componente. Para el design system, la librería se publica y los archivos aceptan actualizaciones; los cambios grandes se hacen en una rama (branching), se revisan y se fusionan, como un pull request. Usá versiones con nombre y comentarios con menciones para decisiones. Error común: entregar un archivo con 40 versiones de la misma pantalla sin indicar cuál es la final.',
        },
      ],
    },
    {
      id: 'portfolio-y-caso-de-estudio',
      title: 'Portfolio y caso de estudio',
      body: [
        'El portfolio es la herramienta más importante de una búsqueda de diseño: decide si pasás el primer filtro y estructura la entrevista más larga del proceso. Los reclutadores le dedican pocos minutos en la primera revisión, así que tiene que mostrar rápido qué tipo de diseñador sos y cuáles son tus mejores proyectos.',
        'Menos es más: tres o cuatro casos de estudio sólidos valen más que diez proyectos superficiales. Cada caso cuenta una historia: contexto y problema, tu rol y el equipo, restricciones, proceso con las decisiones clave y lo que descartaste, solución final y resultados, idealmente medibles. Si el proyecto está bajo confidencialidad, anonimizalo o mostralo solo en la llamada.',
        'En la presentación en vivo (portfolio review) tenés entre 30 y 45 minutos para uno o dos casos, con preguntas en el medio o al final. Se evalúa tu forma de pensar, cómo comunicás, cómo trabajás con otros y si conocés el impacto de tu trabajo. Prepará una versión de presentación específica, distinta del sitio web, con menos texto y más foco en las decisiones.',
        'Si sos junior y no tenés experiencia laboral, valen proyectos personales, rediseños fundamentados de productos reales con research propio, trabajo voluntario para ONGs o proyectos de la comunidad. Lo que importa es que muestren proceso y criterio, no solo pantallas lindas.',
      ],
      checklist: [
        {
          text: 'Estructurar un caso de estudio con problema, proceso y resultado',
          explanation:
            'Una estructura que funciona: resumen de una línea con el resultado ("rediseñamos el checkout y la conversión subió 12%"), contexto (empresa, producto, usuarios), problema y por qué importaba al negocio, tu rol exacto y con quién trabajaste, proceso con dos o tres decisiones clave explicadas (qué opciones había, qué datos usaste, por qué elegiste una), solución con las pantallas importantes, resultados y aprendizajes. El resumen arriba es clave porque muchos reclutadores no pasan de ahí. Error común: mostrar todo el proceso como plantilla (empatizar, definir, idear) sin decisiones reales.',
        },
        {
          text: 'Explicar tu rol con precisión y dar crédito al equipo',
          explanation:
            'En diseño casi todo se hace en equipo, y el entrevistador quiere saber qué hiciste vos. Usá "yo" para lo tuyo y "nosotros" para lo del equipo: "el equipo de research hizo las entrevistas; yo sinteticé los hallazgos y diseñé los tres conceptos que testeamos". Si exagerás tu rol, las repreguntas lo van a dejar en evidencia. También valorá a desarrollo y producto en la historia, porque muestra que colaborás bien. Un senior además cuenta cómo influyó en decisiones fuera de su alcance directo.',
        },
        {
          text: 'Mostrar impacto con métricas o evidencia',
          explanation:
            'Siempre que puedas, conectá el diseño con un resultado: conversión, tasa de éxito de tarea, tickets de soporte, tiempo para completar, retención, NPS o adopción. "Los tickets por problemas de facturación bajaron 30% en dos meses" es mucho más fuerte que "los usuarios quedaron contentos". Si no hay métricas, usá evidencia cualitativa (resultados de tests de usabilidad, citas de usuarios) o explicá cómo lo habrías medido. Sé honesto si el resultado no fue el esperado: contar qué aprendiste de un proyecto que no funcionó también suma puntos.',
        },
        {
          text: 'Presentar en vivo en el tiempo dado y manejar las preguntas',
          explanation:
            'Preguntá antes cuánto tiempo tenés y si prefieren preguntas durante o al final. Ensayá con cronómetro y dejá margen: si te dan 45 minutos, presentá 25 a 30. Arrancá con el contexto y el resultado para que sepan adónde vas, mostrá las decisiones importantes y saltá lo obvio. Cuando te repregunten "¿por qué no hiciste X?", no te pongas a la defensiva: explicá la restricción o reconocé la alternativa válida. Terminá con lo que harías distinto, que muestra autocrítica. Error común: quedarse sin tiempo antes de llegar a la solución y los resultados.',
        },
        {
          text: 'Armar un portfolio sólido si sos junior',
          explanation:
            'Sin experiencia laboral, elegí problemas reales y acotados: por ejemplo rediseñar el flujo de turnos de un hospital público, con entrevistas a cinco personas, un test de usabilidad del flujo actual, prototipo y un segundo test que muestre la mejora. Aclarás que es un proyecto personal, sin críticas gratuitas al producto original. Evitá los proyectos de curso idénticos a los de todos tus compañeros o los conceptos de apps de clima sin research. Mostrá también tu manejo de Figma con archivos ordenados y componentes. Un proyecto real chico, como el sitio de un emprendimiento, vale mucho por las restricciones reales que tuvo.',
        },
      ],
    },
    {
      id: 'whiteboard-challenge',
      title: 'Whiteboard challenge y ejercicios de diseño',
      body: [
        'El whiteboard challenge es un ejercicio en vivo de 45 a 60 minutos donde te dan un problema abierto ("diseñá una app para que vecinos compartan herramientas" o "mejorá la experiencia de reservar un turno médico") y tenés que resolverlo en voz alta, en una pizarra física, FigJam, Miro o Figma. No evalúan el resultado final sino cómo pensás, cómo estructurás un problema ambiguo y cómo colaborás con el entrevistador.',
        'Un buen proceso empieza por preguntas para acotar: quiénes son los usuarios, cuál es el objetivo de negocio, en qué plataforma, qué restricciones hay y cómo se mide el éxito. Después se eligen un usuario y un problema principal, se mapea el flujo, se exploran varias ideas, se elige una y se bocetan las pantallas clave, y se cierra con cómo lo validarías y qué métricas mirarías.',
        'El take-home es una variante: un ejercicio de varios días que se presenta después. Ojo con el tiempo que invertís: si te piden 4 a 6 horas, respetalo y aclaralo en la presentación, y es razonable preguntar si es pago cuando el ejercicio es muy largo. Lo que se evalúa es lo mismo: proceso, decisiones justificadas y comunicación.',
        'Practicar es la única forma de ganar soltura: hacé ejercicios cronometrados con prompts de práctica, en voz alta, y si podés con alguien que haga de entrevistador.',
      ],
      checklist: [
        {
          text: 'Hacer preguntas para acotar el problema antes de diseñar',
          explanation:
            'Dedicá los primeros 5 a 10 minutos a entender: ¿quiénes son los usuarios y qué intentan lograr?, ¿cuál es el objetivo del negocio?, ¿es mobile, web o ambos?, ¿hay restricciones de tiempo o tecnología?, ¿qué existe hoy?, ¿cómo sabríamos que funcionó? Si el entrevistador te devuelve "decidilo vos", hacé supuestos explícitos y anotalos: "asumo que es mobile y que el usuario principal es quien presta la herramienta". Saltar directo a dibujar pantallas es el error más común y el que más descalifica, porque muestra que diseñás soluciones sin entender el problema.',
        },
        {
          text: 'Seguir una estructura clara y administrar el tiempo',
          explanation:
            'Una estructura para 60 minutos: preguntas y supuestos (10 minutos), usuarios y problema principal con un escenario concreto (5), flujo de la tarea principal (10), exploración rápida de dos o tres ideas y elección justificada (10), bocetos de las pantallas clave en baja fidelidad (15) y validación con métricas y próximos pasos (10). Anunciá la estructura al principio para que el entrevistador te siga, y mirá el reloj: es mejor llegar a un flujo completo en baja fidelidad que tener una pantalla perfecta y nada más. Si te quedás sin tiempo, decí qué harías después.',
        },
        {
          text: 'Pensar en voz alta y usar al entrevistador como colaborador',
          explanation:
            'El entrevistador no puede evaluar lo que no dice: narrá lo que pensás, las opciones que estás considerando y por qué descartás algunas ("podría ser un mapa, pero para pocas herramientas cercanas una lista con distancia es más simple"). Tratalo como un compañero de equipo: preguntale su opinión, aceptá pistas y adaptate si te da información nueva. Si te dice que algo no funciona, no te aferres; explorá la alternativa. Lo que evalúan es si les gustaría trabajar con vos todos los días.',
        },
        {
          text: 'Cerrar con validación, métricas y casos borde',
          explanation:
            'Una buena solución termina con cómo sabrías si funciona: qué testearías con usuarios y qué métricas mirarías, por ejemplo tasa de préstamos completados, tiempo hasta el primer préstamo y repetición al mes. Mencioná también casos borde y riesgos: qué pasa si una herramienta no se devuelve, si no hay nadie cerca, cómo se genera confianza entre desconocidos, accesibilidad. Esto diferencia a un semi-senior o senior, que piensa más allá del happy path y en el impacto, de alguien que solo dibuja pantallas.',
        },
      ],
    },
    {
      id: 'metricas',
      title: 'Métricas y cómo conectar diseño con negocio',
      body: [
        'Un diseñador que sabe medir puede justificar decisiones, priorizar y mostrar el valor de su trabajo. Las métricas de UX se dividen en conductuales (lo que la gente hace: tasa de éxito de tarea, tiempo, errores, conversión, retención) y actitudinales (lo que la gente dice o siente: satisfacción, facilidad percibida, SUS, NPS). Las dos se complementan.',
        'El framework HEART de Google organiza las métricas de experiencia en Happiness (satisfacción), Engagement (frecuencia e intensidad de uso), Adoption (nuevos usuarios de una función), Retention (los que vuelven) y Task success (eficiencia, efectividad y errores). Se usa junto con el proceso Goals, Signals, Metrics: primero el objetivo, después la señal observable y recién después la métrica concreta.',
        'Los A/B tests comparan dos versiones con usuarios reales asignados al azar para medir el efecto de un cambio en una métrica, con muestra suficiente y duración adecuada para tener significancia estadística. No sirven para todo: necesitan tráfico, miden el qué pero no el por qué, y optimizan localmente. Por eso se combinan con research cualitativo.',
        'En la entrevista, sobre todo en roles de product designer, te van a preguntar cómo medirías el éxito de una feature o cómo justificarías una inversión en diseño. Conectá siempre la métrica de experiencia con una de negocio: menos fricción en el checkout lleva a más conversión, mejor onboarding lleva a más activación y retención, mejor autoservicio lleva a menos costo de soporte.',
      ],
      checklist: [
        {
          text: 'Aplicar HEART con el proceso Goals, Signals, Metrics',
          explanation:
            'Para una nueva función de pagos recurrentes: en Adoption, el objetivo es que los usuarios la descubran y la usen; la señal es que configuren un pago; la métrica es el porcentaje de usuarios activos que configuran al menos un pago recurrente en 30 días. En Task success, el objetivo es que configurarlo sea fácil; la señal es completar el flujo sin errores; la métrica es la tasa de finalización del flujo y el tiempo medio. No hace falta usar las cinco dimensiones en cada caso; se eligen las que importan para esa feature. Error común: arrancar por las métricas disponibles en lugar de por el objetivo.',
        },
        {
          text: 'Medir usabilidad con tasa de éxito, tiempo y SUS',
          explanation:
            'La tasa de éxito de tarea es el porcentaje de participantes que completan una tarea sin ayuda, y es la métrica de usabilidad más directa. El tiempo en tarea y la cantidad de errores miden eficiencia. SUS (System Usability Scale) es un cuestionario estandarizado de 10 preguntas con escala de 1 a 5 que da un puntaje de 0 a 100; el promedio de la industria ronda 68, así que por encima de eso está por sobre la media. SEQ (Single Ease Question) es una pregunta después de cada tarea: qué tan fácil fue, de 1 a 7. Usar instrumentos estandarizados permite comparar versiones en el tiempo.',
        },
        {
          text: 'Explicar cómo funciona un A/B test y sus límites',
          explanation:
            'Se define una hipótesis ("mostrar el costo de envío antes del checkout reduce el abandono"), una métrica principal (tasa de compra completada) y métricas de control para no romper otras cosas (ticket promedio, devoluciones). Se calcula el tamaño de muestra necesario según el efecto mínimo que querés detectar, se reparte el tráfico al azar y se deja correr al menos un ciclo de negocio completo, típicamente una o dos semanas, sin mirar el resultado todos los días para cortar antes (peeking). Límites: requiere tráfico, no explica por qué ganó una versión y puede llevar a optimizar detalles en vez de resolver problemas de fondo.',
        },
        {
          text: 'Conectar métricas de experiencia con resultados de negocio',
          explanation:
            'Los negocios hablan en ingresos, costos y riesgo, así que traducí tu trabajo a esos términos. Un formulario de registro más corto aumenta la activación; un checkout más claro aumenta la conversión y el ingreso; una mejor sección de ayuda baja tickets y costo de soporte; un diseño accesible amplía el mercado y reduce riesgo legal. Ejemplo concreto: "la tasa de finalización del onboarding pasó de 41% a 58%, y eso aumentó en 9% los usuarios que llegan a la primera transacción". Mostrar este razonamiento es lo que más diferencia a un product designer senior.',
        },
        {
          text: 'Distinguir métricas útiles de métricas de vanidad',
          explanation:
            'Una métrica útil está conectada a un objetivo y cambia una decisión: si sube o baja, sabés qué hacer. Las métricas de vanidad crecen siempre o no tienen relación con el valor: páginas vistas totales, usuarios registrados históricos o tiempo en la app (que puede subir porque la gente se pierde). NPS es útil como tendencia general pero muy pobre para evaluar una feature puntual. Para cada métrica, preguntate qué harías si mejora o empeora, y combiná una métrica principal con métricas de control. En la entrevista, mencionar que el tiempo en pantalla puede ser una mala señal muestra criterio.',
        },
      ],
    },
  ],
};
