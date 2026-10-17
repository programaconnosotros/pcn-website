import type { InterviewQuestion, Seniority } from './types';

export const figmaQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'figma',
      question: '¿Qué diferencia hay entre un frame, un group y una section en Figma?',
      answer:
        'Un frame es un contenedor con sus propias dimensiones, fondo, clip de contenido, constraints para los hijos y la posibilidad de usar auto layout: es la base de pantallas y componentes. Un group solo agrupa capas y su tamaño se ajusta a lo que contiene, sin layout ni constraints propios. Una section organiza el canvas a gran escala, por ejemplo para juntar las pantallas de un flujo y marcarlas como listas para desarrollo. Regla práctica: usá frames casi siempre, groups para cosas sueltas como un ícono armado a mano, y sections para ordenar el archivo.',
    },
    {
      topic: 'figma',
      question: '¿Qué es auto layout y qué significan hug, fill y fixed?',
      answer:
        'Auto layout hace que un frame acomode a sus hijos en una dirección (horizontal, vertical o en grilla con wrap) con un espaciado y padding definidos, como flexbox en CSS. Hug contents hace que el frame tome el tamaño de su contenido, fill container hace que un hijo ocupe todo el espacio disponible del padre y fixed mantiene un tamaño fijo. Por ejemplo, un botón suele ser hug en ancho para crecer con el texto, y un input dentro de un formulario suele ser fill para estirarse con el contenedor.',
    },
    {
      topic: 'figma',
      question: '¿Qué es un componente y qué es una instancia?',
      answer:
        'Un componente es el elemento maestro reutilizable, por ejemplo un botón, y cada copia que usás en un diseño es una instancia que hereda sus cambios. Si editás el componente principal, todas las instancias se actualizan, salvo las propiedades que hayas sobrescrito (overrides) en cada una, como el texto. Esto mantiene la consistencia y evita tener que editar a mano cientos de botones cuando cambia el diseño.',
    },
    {
      topic: 'figma',
      question: '¿Qué son los constraints y cuándo los usás?',
      answer:
        'Los constraints definen cómo se comporta una capa cuando cambia el tamaño de su frame padre: fijarla a la izquierda, derecha, centro, a ambos lados (left and right) o escalar. Se usan en frames sin auto layout, por ejemplo para que un botón de cerrar quede pegado arriba a la derecha de un modal al redimensionarlo. Dentro de un frame con auto layout mandan las reglas del layout, salvo para hijos con posición absoluta, que vuelven a usar constraints.',
    },
    {
      topic: 'figma',
      question: '¿Qué son las variantes de un componente?',
      answer:
        'Las variantes agrupan versiones de un mismo componente en un component set, organizadas por propiedades como `size=sm|md|lg`, `type=primary|secondary` o `state=default|hover|disabled`. En la instancia elegís cada propiedad desde el panel derecho en vez de buscar otro componente. Bien nombradas, se parecen a las props del componente en código, lo que facilita el handoff.',
    },
    {
      topic: 'figma',
      question: '¿Qué diferencia hay entre un estilo y una variable en Figma?',
      answer:
        'Un estilo guarda un conjunto de propiedades: un color o gradiente, un estilo de texto completo (fuente, tamaño, interlineado), un efecto como una sombra o una grilla de layout. Una variable guarda un único valor (color, número, string o booleano) que puede tener distintos valores según el modo, por ejemplo light y dark, y puede referenciar a otra variable. Hoy los colores, espaciados y radios suelen ir en variables, y los estilos se siguen usando para tipografía, efectos y gradientes, que pueden usar variables por dentro.',
    },
    {
      topic: 'figma',
      question: '¿Cómo armás un prototipo navegable simple en Figma?',
      answer:
        'En la pestaña Prototype seleccionás un elemento, arrastrás una conexión hacia el frame destino y configurás el trigger (on click, on hover, after delay), la acción (navigate to, open overlay, back) y la animación (instant, dissolve, smart animate). Definís un frame de inicio, que crea un flow, y lo probás con Present. Para un test con usuarios conviene que el flujo principal esté completo y que los elementos que no hacen nada no parezcan clickeables.',
    },
    {
      topic: 'figma',
      question: '¿Cómo organizás las capas y los nombres en un archivo de Figma?',
      answer:
        'Nombrá frames y capas según lo que son, como `Checkout / Pago` o `card-producto`, y no dejes `Frame 482`, porque esos nombres aparecen en Dev Mode y en el panel de capas. Agrupá pantallas por flujo en sections, separá en páginas lo que está en exploración, lo aprobado y lo listo para desarrollo, y usá una página de portada. Un archivo ordenado ahorra tiempo a todo el equipo y es algo que los entrevistadores notan cuando mostrás tu trabajo.',
    },
    {
      topic: 'figma',
      question: '¿Qué es Dev Mode y para qué lo usa un desarrollador?',
      answer:
        'Dev Mode es una vista de Figma pensada para quien implementa: permite inspeccionar medidas, espaciados, colores y tipografías, ver los nombres de variables y estilos en lugar de valores sueltos, copiar snippets de CSS, iOS o Android y exportar assets. Muestra qué está marcado como ready for dev, las anotaciones del diseñador y los cambios respecto de versiones anteriores. Para el diseñador implica dejar el archivo claro, con tokens aplicados y estados documentados.',
    },
    {
      topic: 'figma',
      question: '¿Cómo colaborás con otras personas en un archivo de Figma?',
      answer:
        'Figma es colaborativo en tiempo real: varias personas editan a la vez y ves sus cursores. Para feedback se usan comentarios anclados a un punto del diseño, con menciones y resolución cuando se atienden, y el historial de versiones permite nombrar hitos y volver atrás. Para ideación temprana, workshops o mapas de flujos se suele usar FigJam, que es la pizarra colaborativa de Figma.',
    },
  ],
  'semi-senior': [
    {
      topic: 'figma',
      question: '¿Qué tipos de propiedades de componente existen y cuándo usás cada una?',
      answer:
        'Hay cuatro: variant, para cambios de estructura o apariencia que se combinan (tamaño, tipo, estado); boolean, para mostrar u ocultar una capa, como un ícono opcional; text, para exponer un texto editable desde el panel; e instance swap, para cambiar una instancia anidada, como el ícono de un botón, por otra de una lista de preferidos. Usar booleanos e instance swap en vez de multiplicar variantes evita component sets gigantes: un botón con ícono sí o no a la izquierda no necesita el doble de variantes.',
    },
    {
      topic: 'figma',
      question:
        '¿Cómo diseñás un componente que tenga que aceptar contenido variable, como una card o un modal?',
      answer:
        'Se usa un patrón tipo slot: el componente tiene un área con una instancia de un componente placeholder (por ejemplo `Slot / Contenido`) que se puede reemplazar con instance swap, o se expone con una propiedad para intercambiarla por cualquier componente del equipo. Combinado con auto layout, el contenedor se adapta al contenido que se ponga. Así evitás desanclar (detach) instancias, que es lo que rompe la conexión con el sistema y hace que los cambios futuros no lleguen.',
    },
    {
      topic: 'figma',
      question:
        '¿Cómo estructurás variables con colecciones y modos para soportar light y dark mode?',
      answer:
        'Se arma una colección de primitivas con la paleta cruda (`gray/900`, `green/500`) sin modos, y una colección semántica con modos light y dark cuyos valores son alias a las primitivas: `bg/surface` apunta a `gray/50` en light y a `gray/900` en dark. Los diseños usan solo las semánticas, entonces cambiar el modo de un frame cambia todo el tema sin tocar capas. El mismo mecanismo sirve para marcas, densidad o idiomas.',
    },
    {
      topic: 'figma',
      question: '¿Qué ventajas tienen las variables numéricas para espaciado y radios?',
      answer:
        'Las variables de tipo number se pueden aplicar al gap, el padding, los radios, el tamaño y el grosor del borde, así el espaciado sigue una escala (`space/4`, `space/8`) en vez de valores inventados. Al tener modos permiten, por ejemplo, una densidad compacta y otra cómoda, o un espaciado distinto para mobile y desktop. Además, el desarrollador ve el nombre del token en Dev Mode y lo mapea a la variable correspondiente en código.',
    },
    {
      topic: 'figma',
      question:
        '¿Qué opciones avanzadas de auto layout usás para que un diseño sea realmente responsive?',
      answer:
        'Wrap para que los elementos salten de línea cuando no entran, como una lista de chips; min y max width para que un elemento fill no se estire de más ni se aplaste; spacing "auto" (space between) para empujar elementos a los extremos; y posición absoluta para cosas que no deben ocupar lugar en el flujo, como un badge. Combinando esto con frames anidados, el mismo componente aguanta textos largos y distintos anchos, y se acerca mucho al comportamiento de flexbox en código.',
    },
    {
      topic: 'figma',
      question: '¿Qué hace Smart Animate y cómo lo hacés funcionar bien?',
      answer:
        'Smart Animate interpola entre dos frames las capas que tienen el mismo nombre y jerarquía, animando posición, tamaño, opacidad, rotación y color. Para que funcione, las capas que querés animar tienen que llamarse igual en ambos frames; si no coinciden, aparecen o desaparecen con un dissolve. Combinado con variantes interactivas (cambiar de variante al hacer hover o click), sirve para prototipar microinteracciones como toggles o acordeones sin duplicar pantallas.',
    },
    {
      topic: 'figma',
      question: '¿Cómo usás variables y lógica condicional en un prototipo?',
      answer:
        'Las interacciones pueden ejecutar la acción "set variable" para cambiar un valor, por ejemplo sumar 1 a `cantidadCarrito` o poner `logueado` en true, y las capas pueden tener sus propiedades vinculadas a variables, como un texto o la visibilidad. Con condicionales (if/else) el prototipo decide adónde navegar según el valor, lo que permite un solo prototipo con estados reales en vez de decenas de pantallas duplicadas. Es útil para tests de usabilidad donde el usuario tiene que sentir que la app responde.',
    },
    {
      topic: 'figma',
      question: '¿Cómo preparás un diseño para el handoff en Dev Mode?',
      answer:
        'Marcás las secciones o frames terminados como ready for dev para que el equipo sepa qué está aprobado, agregás anotaciones con medidas y comportamientos que no se ven (validaciones, estados de error, qué pasa con texto largo) y documentás estados: vacío, carga, error y éxito. Usás componentes y variables en vez de valores sueltos para que Dev Mode muestre tokens. Si después cambiás algo, la comparación de cambios permite al desarrollador ver qué se modificó desde la última vez.',
    },
    {
      topic: 'figma',
      question: '¿Qué son las overrides y qué problemas pueden generar?',
      answer:
        'Las overrides son cambios hechos en una instancia sobre el componente principal, como el texto, un color o una capa oculta. Las que se preservan se mantienen cuando el componente se actualiza, pero si renombrás o reestructurás capas internas del componente, Figma puede perder la correspondencia y resetearlas. Por eso conviene exponer lo editable como propiedades del componente, evitar cambiar estilos a mano en instancias y no hacer detach salvo en exploración.',
    },
    {
      topic: 'figma',
      question: '¿Cómo publicás y mantenés una librería compartida de componentes?',
      answer:
        'Se publica el archivo de la librería con sus componentes, estilos y variables, y los demás archivos la habilitan para usar sus elementos. Cuando publicás cambios, cada archivo consumidor recibe una notificación para revisar y aceptar las actualizaciones, así que conviene escribir una descripción clara de qué cambió. Los componentes que no deben usarse directamente, como piezas internas, se ocultan prefijando el nombre con `.` o `_` para que no se publiquen.',
    },
  ],
  senior: [
    {
      topic: 'figma',
      question: '¿Cómo diseñarías la arquitectura de variables de un design system multimarca?',
      answer:
        'Usaría tres capas: primitivas (paletas, escalas numéricas) sin semántica; una capa semántica (`color/bg/primary`, `space/inset/md`) con modos por marca y por tema que aliasa a las primitivas; y, si hace falta, tokens de componente (`button/bg`) para casos puntuales. Los diseños y componentes consumen solo la capa semántica, así agregar una marca es sumar un modo y no tocar componentes. Además mantendría los nombres alineados con los tokens en código, sincronizados con la REST API o un pipeline tipo Style Dictionary, y documentaría qué capa se puede usar en qué contexto.',
    },
    {
      topic: 'figma',
      question: '¿Cuándo conviene crear una variante y cuándo un componente distinto?',
      answer:
        'Si comparten propósito, estructura y API, y solo varían en tamaño, jerarquía o estado, son variantes del mismo componente. Si cambian el comportamiento o el uso semántico, como un botón contra un link o un input contra un select, conviene un componente separado aunque se parezcan. También hay que evitar la explosión combinatoria: si un set pasa de cientos de variantes, suele ser señal de que faltan propiedades booleanas, instance swap o subcomponentes. El criterio final es cómo lo modela el código, para que el diseño y la implementación hablen el mismo idioma.',
    },
    {
      topic: 'figma',
      question: '¿Qué es Code Connect y qué problema resuelve?',
      answer:
        'Code Connect vincula los componentes de Figma con los componentes reales del repositorio, de modo que en Dev Mode el desarrollador ve el snippet de uso del componente de código, con las props mapeadas desde las propiedades de Figma, en vez de CSS generado. Se configura con archivos de mapeo en el repo o desde la interfaz de Figma, y también alimenta a herramientas y agentes que convierten diseño en código. Reduce la brecha entre diseño e implementación y refuerza que se reutilicen componentes existentes en lugar de reescribirlos.',
    },
    {
      topic: 'figma',
      question: '¿Cómo manejarías cambios grandes en una librería usada por muchos equipos?',
      answer:
        'Trabajaría los cambios en un branch del archivo de la librería, con revisión de otro diseñador antes del merge, y comunicaría el cambio con un changelog y fechas. Si un cambio rompe instancias, como renombrar propiedades o capas, evaluaría mantener el componente viejo como deprecado por un tiempo en lugar de reemplazarlo de golpe. Usaría las analytics de la librería para ver qué equipos y archivos usan cada componente, cuántos detach hay y priorizar migraciones. Y coordinaría con el equipo de código para que la versión en Figma y la de producción cambien juntas.',
    },
    {
      topic: 'figma',
      question: '¿Cómo funcionan el branching y el merging en Figma y cuándo los usás?',
      answer:
        'Un branch es una copia del archivo principal donde podés explorar o hacer cambios sin afectar a quienes lo consumen; al terminar, pedís revisión y hacés merge, y Figma muestra los cambios y conflictos para resolver. Es especialmente útil en librerías y archivos de producto compartidos, donde un cambio a medias afectaría a otros. Para exploraciones chicas alcanza con una página aparte; para cambios estructurales o de design system, el branch con revisión da trazabilidad similar a un pull request.',
    },
    {
      topic: 'figma',
      question: '¿Qué hacés cuando un archivo de Figma se vuelve lento?',
      answer:
        'Revisaría el uso de memoria y buscaría las causas típicas: imágenes enormes sin comprimir, muchas capas ocultas, componentes locales duplicados en vez de instancias de librería, efectos pesados como blurs y sombras repetidos, y páginas con cientos de pantallas. Las soluciones son separar el archivo por flujo o por etapa, archivar exploraciones viejas en otro archivo, consumir componentes desde la librería y limpiar capas ocultas. También ayuda separar la librería en varios archivos, por ejemplo foundations, componentes e íconos, para que cada consumidor cargue menos.',
    },
    {
      topic: 'figma',
      question: '¿Cómo medís la adopción y la salud de un design system en Figma?',
      answer:
        'Con las analytics de la librería: cantidad de instancias insertadas por componente, qué equipos las usan, cuántos detach se hacen y uso de estilos y variables. Muchos detach en un componente suelen indicar que no cubre los casos reales y hay que extender su API. Lo cruzaría con métricas del lado del código, como el porcentaje de UI construida con componentes del sistema, y con feedback cualitativo de diseñadores y desarrolladores. El objetivo no es el número en sí sino detectar dónde el sistema no está sirviendo.',
    },
    {
      topic: 'figma',
      question:
        '¿Cómo usarías plugins, la API o la IA de Figma para automatizar trabajo de diseño?',
      answer:
        'Para tareas repetitivas usaría plugins existentes, por ejemplo para revisar contraste, renombrar capas en lote, encontrar valores que no usan variables o generar contenido realista. Si hay necesidades propias, como auditar que los archivos usen tokens o sincronizar variables con el repo, escribiría un plugin con la Plugin API o un script con la REST API. Las funciones de IA y los servidores MCP sirven para generar primeras versiones, renombrar capas o pasar diseños a código, pero sigo revisando el resultado contra el sistema y las decisiones de UX.',
    },
    {
      topic: 'figma',
      question:
        '¿Cómo organizarías el flujo de trabajo de diseño en Figma para un equipo de producto grande?',
      answer:
        'Definiría una estructura estándar de archivos por proyecto o feature (portada, exploración, flujos finales, specs) con naming consistente, y separaría las librerías de foundations y componentes con dueños claros. Acordaría estados de revisión: explorando, en review, ready for dev y en producción, reflejados en sections y en el estado de Dev Mode. Usaría FigJam para discovery y workshops, branches para cambios en librerías y rituales de critique. La meta es que cualquier persona encuentre la versión vigente de un diseño sin preguntar.',
    },
    {
      topic: 'figma',
      question: '¿Cómo mantenés sincronizados los tokens de Figma con el código?',
      answer:
        'La fuente de verdad tiene que estar definida: o Figma exporta los tokens (vía REST API de variables, un plugin o el formato estándar de design tokens) a JSON que un pipeline como Style Dictionary transforma en CSS, Swift o Kotlin, o el repo es la fuente y un script actualiza las variables en Figma. Lo importante es que el proceso esté automatizado y revisado en pull requests, con nombres y estructura idénticos en ambos lados. Si se sincroniza a mano, tarde o temprano divergen y el handoff vuelve a ser por valores sueltos.',
    },
  ],
};
