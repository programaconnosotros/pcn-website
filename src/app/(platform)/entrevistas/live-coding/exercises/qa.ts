import type { TrackPractice } from './types';

export const qaPractice: TrackPractice = {
  track: 'qa',
  exercises: {
    junior: [
      {
        id: 'casos-de-prueba-formulario-registro',
        title: 'Casos de prueba para un formulario de registro',
        duration: '30 min',
        statement: [
          'Un formulario de registro tiene estos campos: nombre (obligatorio, entre 2 y 50 caracteres, solo letras y espacios), email (obligatorio, formato válido, único en el sistema), edad (obligatoria, entero entre 18 y 99) y contraseña (entre 8 y 64 caracteres, al menos una mayúscula y un número). El botón "Crear cuenta" se habilita solo si todos los campos son válidos.',
          'Diseñá los casos de prueba usando partición de equivalencia y análisis de valores límite. Presentalos en una tabla con id, campo, técnica aplicada, dato de entrada, resultado esperado y prioridad.',
        ],
        requirements: [
          'Identificar las clases válidas e inválidas de cada campo.',
          'Cubrir los valores límite de edad (17, 18, 99, 100) y de longitud de nombre y contraseña.',
          'Incluir al menos un caso de email duplicado y uno de formato inválido.',
          'Incluir casos del botón: deshabilitado con un campo inválido y habilitado con todos válidos.',
          'Asignar prioridad a cada caso y justificar cuáles correrías primero si tuvieras poco tiempo.',
        ],
        followUps: [
          '¿Qué casos agregarías pensando en seguridad, por ejemplo inyección o espacios al principio y al final?',
          '¿Cuáles de estos casos automatizarías primero y en qué nivel (unitario, API o UI)?',
          '¿Qué preguntas le harías al PO sobre requisitos que quedaron ambiguos?',
        ],
        evaluates:
          'Que apliques técnicas de diseño de pruebas de forma sistemática y no solo por intuición.',
      },
      {
        id: 'bug-report-checkout',
        title: 'Bug report a partir de un escenario',
        duration: '30 min',
        statement: [
          'Mientras probás un e-commerce en staging (versión `2.14.0`, Chrome 128 en macOS), agregás dos remeras de 10.000 pesos cada una al carrito, aplicás el cupón `VERANO20` y el total muestra 16.000. Después cambiás la cantidad de una remera a 3 y el total pasa a 40.000, sin descuento, aunque el cupón sigue apareciendo como aplicado. Si recargás la página, el total vuelve a mostrar el descuento correcto.',
          'Escribí el bug report completo como lo cargarías en Jira o en la herramienta que uses.',
        ],
        requirements: [
          'Título corto y específico que describa el síntoma, no la causa supuesta.',
          'Pasos para reproducir numerados, con datos concretos.',
          'Resultado actual y resultado esperado, con el cálculo del total esperado.',
          'Entorno, versión, severidad y prioridad, justificando por qué difieren si es el caso.',
          'Mencionar qué evidencia adjuntarías (captura, video, request de red) y qué variaciones probaste para acotar el bug.',
        ],
        followUps: [
          '¿Qué otras pruebas harías para saber si el problema es del frontend o del backend?',
          '¿Cómo cambiarías la severidad si esto pasara en producción durante una promoción?',
        ],
        evaluates:
          'Que comuniques un defecto de forma clara, reproducible y accionable para el equipo de desarrollo.',
      },
      {
        id: 'login-automatizado-basico',
        title: 'Automatizar un login con Cypress o Playwright',
        duration: '45 min',
        statement: [
          'La página `/login` tiene un input de email con `data-testid="email"`, uno de contraseña con `data-testid="password"`, un botón `data-testid="submit"` y un contenedor `data-testid="error"` que aparece con el texto "Credenciales inválidas" ante un login fallido. Si el login es exitoso, la app redirige a `/dashboard` y muestra un saludo `data-testid="welcome"` con el texto "Hola, Ana". El usuario válido es `ana@example.com` con contraseña `Secreta123`.',
          'Escribí con Cypress o Playwright tres tests: login exitoso, contraseña incorrecta y email vacío (el botón queda deshabilitado). Podés practicar contra una página propia o un sitio de práctica que tenga un flujo similar.',
        ],
        requirements: [
          'Usar los atributos `data-testid` como selectores y no clases CSS ni XPath frágiles.',
          'No usar esperas fijas como `cy.wait(2000)` o `waitForTimeout`; apoyarse en las aserciones con reintento del framework.',
          'Tomar las credenciales de un fixture o variables de entorno, no hardcodeadas en el test.',
          'Cada test es independiente y puede correr solo o en cualquier orden.',
          'Verificar tanto la URL como el contenido visible después del login.',
        ],
        followUps: [
          '¿Cómo evitarías repetir el login por la UI en todos los demás tests de la suite?',
          '¿Qué harías si el equipo de desarrollo no quiere agregar atributos `data-testid`?',
          '¿Cómo organizarías estos tests con un Page Object o algo equivalente?',
        ],
        evaluates:
          'Que escribas tests de UI estables desde el principio, con buenos selectores y sin esperas arbitrarias.',
      },
    ],
    'semi-senior': [
      {
        id: 'flujo-login-checkout-e2e',
        title: 'Flujo E2E de login y checkout',
        duration: '60 min',
        statement: [
          'Una tienda tiene este flujo: login en `/login`, listado en `/products` con tarjetas `data-testid="product-card"` que contienen un botón "Agregar", un carrito en `/cart` con `data-testid="cart-total"` y un checkout en `/checkout` con campos de dirección y un botón "Confirmar compra". La confirmación muestra `data-testid="order-id"`. La API de productos es `GET /api/products` y la de órdenes es `POST /api/orders`.',
          'Automatizá con Cypress o Playwright el flujo completo de comprar dos productos y verificar que la orden se crea con el total correcto. Agregá un segundo test donde `POST /api/orders` responde 500 (interceptado) y verificá que la UI muestra un mensaje de error sin perder el carrito.',
        ],
        requirements: [
          'Hacer el login por API o con sesión guardada (`cy.session` o `storageState`) y no por la UI en cada test.',
          'Usar fixtures para los datos de productos y la dirección.',
          'Esperar las requests relevantes con `cy.intercept` y alias, o `page.waitForResponse`, en lugar de sleeps.',
          'Verificar el body de la request a `/api/orders` además de lo que muestra la UI.',
          'Encapsular las acciones de cada página en Page Objects o helpers reutilizables.',
          'Dejar el estado limpio para que los tests se puedan correr en paralelo.',
        ],
        followUps: [
          '¿Qué parte de este flujo cubrirías con tests de API en vez de E2E y por qué?',
          '¿Cómo generarías datos de prueba únicos para evitar colisiones entre corridas paralelas?',
          '¿Cómo lo correrías en CI y qué artefactos guardarías cuando falla?',
        ],
        evaluates:
          'Que diseñes una suite E2E mantenible, rápida y determinística, controlando red, sesión y datos.',
      },
      {
        id: 'tests-de-api-endpoint-usuarios',
        title: 'Tests de API para un endpoint de usuarios',
        duration: '45 min',
        statement: [
          'El endpoint `POST /api/users` recibe `{ "name": string, "email": string, "role": "admin" | "viewer" }`, requiere el header `Authorization: Bearer <token>` y responde 201 con `{ "id": string, "name", "email", "role", "createdAt" }`. Responde 400 si falta un campo o el email es inválido, 401 sin token, 403 si el token no es de un admin y 409 si el email ya existe. `GET /api/users/:id` devuelve el usuario creado o 404.',
          'Escribí la suite de tests de API con la herramienta que prefieras (Playwright `request`, Cypress `cy.request`, Supertest, Postman con Newman o REST Assured). Si no tenés el servicio, podés levantar un mock con json-server o MSW que cumpla el contrato.',
        ],
        requirements: [
          'Cubrir cada código de respuesta documentado con al menos un test.',
          'Validar el schema de la respuesta 201, no solo el status.',
          'Verificar el efecto: después de crear, el `GET` devuelve el mismo usuario.',
          'Generar emails únicos por corrida y limpiar los datos creados.',
          'Manejar los tokens de admin y viewer sin hardcodearlos en los tests.',
        ],
        followUps: [
          '¿Qué casos de seguridad agregarías, como que un viewer no pueda crear un admin?',
          '¿Cómo detectarías que el contrato de la API cambió sin que nadie avise?',
          '¿Qué diferencia hay entre estos tests y un contract test con Pact?',
        ],
        evaluates:
          'Que pruebes APIs de forma completa: contrato, códigos de error, efectos y autorización.',
      },
      {
        id: 'arreglar-test-flaky',
        title: 'Arreglar un test flaky',
        duration: '30 min',
        statement: [
          'Este test de Playwright falla cerca de una de cada cinco corridas en CI: `await page.goto("/orders"); await page.click("text=Filtrar"); await page.waitForTimeout(1000); const rows = await page.$$(".table tr"); expect(rows.length).toBe(5);`. La tabla se carga desde `GET /api/orders?status=open`, que tarda entre 300 ms y 2 s, y mientras carga muestra un spinner. La suite comparte una base de datos con otros tests que también crean órdenes.',
          'Identificá todas las causas posibles de flakiness y reescribí el test para que sea estable. Si usás Cypress, adaptá el mismo escenario.',
        ],
        requirements: [
          'Eliminar `waitForTimeout` y esperar la respuesta de la API o el estado de la UI.',
          'Usar locators con aserciones que reintentan, como `expect(locator).toHaveCount(5)`, en lugar de `$$` con conteo inmediato.',
          'Reemplazar el selector por texto y clase por uno más robusto (rol accesible o `data-testid`).',
          'Resolver la dependencia de datos compartidos: crear los datos propios del test o interceptar la respuesta.',
          'Explicar cada causa encontrada y cómo la ataca el cambio.',
        ],
        followUps: [
          '¿Cómo confirmarías que el test quedó estable antes de mergearlo?',
          '¿Qué política de reintentos en CI te parece razonable y cuándo esconde problemas reales?',
          '¿Cómo harías visible en el equipo cuáles tests son flaky?',
        ],
        evaluates:
          'Que diagnostiques las causas reales de un test inestable (timing, selectores y datos) y no las tapes con sleeps o reintentos.',
      },
    ],
    senior: [
      {
        id: 'k6-carga-checkout',
        title: 'Script de k6 con stages y thresholds',
        duration: '60 min',
        statement: [
          'Se viene una promoción y el negocio espera hasta 300 usuarios concurrentes en el checkout. Cada usuario hace: `POST /api/login` con email y contraseña (devuelve un token), `GET /api/products`, `POST /api/cart` con 1 a 3 productos al azar y `POST /api/orders`. El SLO acordado es p95 menor a 800 ms en `POST /api/orders`, p95 menor a 400 ms en el resto y menos de 1% de errores.',
          'Escribí un script de k6 que modele ese escenario con un ramp-up a 300 VUs en 5 minutos, 10 minutos sostenidos y un ramp-down de 2 minutos, con thresholds que hagan fallar la corrida si no se cumple el SLO. Si no tenés un servicio contra el que correrlo, alcanza con que el script sea correcto y lo valides contra un mock local.',
        ],
        requirements: [
          'Usar `stages` o un scenario `ramping-vus` con los tiempos pedidos.',
          'Definir thresholds por endpoint usando tags, no solo globales.',
          'Tomar los usuarios de prueba de un archivo con `SharedArray` para que cada VU use credenciales distintas.',
          'Agregar `check` sobre status y contenido de cada respuesta y `sleep` con think time realista.',
          'Agrupar las requests por paso del flujo para que el reporte sea legible.',
          'Parametrizar la URL base y los VUs con variables de entorno.',
        ],
        followUps: [
          '¿Qué diferencia hay entre un load test, un stress test, un spike test y un soak test, y cuál correrías primero?',
          '¿Usarías un modelo de VUs o de arrival rate para este caso? ¿Por qué?',
          'Si el p95 de órdenes da 1,2 s, ¿qué métricas del backend mirarías para encontrar el cuello de botella?',
          '¿Cómo lo integrarías en CI sin que sea lento ni golpee un entorno compartido?',
        ],
        evaluates:
          'Que traduzcas un requisito de negocio a una prueba de performance realista con criterios de aceptación automáticos.',
      },
      {
        id: 'estrategia-de-automatizacion',
        title: 'Diseñar la estructura de una suite de automatización',
        duration: '60 min',
        statement: [
          'Te suman a un equipo con una app web (login, catálogo, carrito, checkout y un panel de admin) que hoy tiene 400 tests E2E de Cypress en un único repo, tardan 50 minutos, fallan de forma intermitente cerca del 8% de las corridas y nadie confía en ellos. No hay tests de API y los datos de prueba dependen de una base de staging compartida.',
          'Armá en código la base de una suite nueva con Playwright o Cypress que muestre cómo resolverías esto: estructura de carpetas, configuración por entorno, fixtures para autenticación y datos, un helper para crear datos por API, dos tests E2E de ejemplo y dos tests de API de ejemplo. Acompañalo con un README corto con las decisiones tomadas.',
        ],
        requirements: [
          'Separar con claridad tests E2E, tests de API, page objects o componentes, y utilidades de datos.',
          'Crear los datos de cada test por API y limpiarlos, sin depender del estado previo de la base.',
          'Configurar paralelismo, reintentos acotados y captura de trace, video o screenshots en fallos.',
          'Permitir correr subconjuntos por tag (por ejemplo `@smoke` y `@regression`).',
          'Explicar en el README cómo migrarías gradualmente los 400 tests viejos.',
        ],
        followUps: [
          '¿Qué porcentaje de la cobertura actual moverías a API o a tests de componentes?',
          '¿Qué métricas usarías para mostrar al equipo que la suite nueva es más confiable?',
          '¿Cómo integrarías la suite en el pipeline para dar feedback en menos de 10 minutos?',
        ],
        evaluates:
          'Que diseñes arquitectura de testing y prioridades de inversión, no solo que escribas tests individuales.',
      },
      {
        id: 'contrato-y-paginacion-api',
        title: 'Testear paginación e idempotencia de una API',
        duration: '45 min',
        statement: [
          'El endpoint `GET /api/transactions?cursor=<c>&limit=<n>` devuelve `{ "items": [...], "nextCursor": string | null }` ordenado por `createdAt` descendente, con `limit` entre 1 y 100 (por defecto 20). El endpoint `POST /api/transactions` acepta un header `Idempotency-Key`: si se repite la misma key con el mismo body, debe devolver la misma transacción sin duplicarla; si se repite con otro body, debe responder 422.',
          'Escribí una suite automatizada que valide la paginación y la idempotencia, incluyendo qué pasa cuando se crean transacciones nuevas mientras alguien está paginando. Usá la herramienta de API testing que prefieras y un mock propio si no tenés el servicio.',
        ],
        requirements: [
          'Recorrer todas las páginas y verificar que no hay elementos duplicados ni faltantes.',
          'Probar los límites de `limit` (0, 1, 100, 101) y un cursor inválido.',
          'Verificar que crear transacciones durante la paginación no produce duplicados en las páginas siguientes.',
          'Probar requests concurrentes con la misma `Idempotency-Key` y verificar que se crea una sola transacción.',
          'Probar la misma key con un body distinto y verificar el 422.',
        ],
        followUps: [
          '¿Qué diferencias de comportamiento esperarías entre paginación por cursor y por offset al testear?',
          '¿Cuánto tiempo debería vivir una idempotency key y cómo lo testearías?',
          '¿Qué riesgos de negocio cubren estos tests en un sistema de pagos?',
        ],
        evaluates:
          'Que vayas más allá del camino feliz y pruebes propiedades sutiles de una API, como consistencia y concurrencia.',
      },
    ],
  },
  leetcode: {
    junior: [
      {
        slug: 'two-sum',
        title: 'Two Sum',
        difficulty: 'Easy',
        why: 'El problema más pedido en coding screens de SDET; entrena pasar de fuerza bruta a hash map.',
      },
      {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'Easy',
        why: 'Uso de stack con muchos casos de borde, ideal para mostrar que pensás como tester antes de codear.',
      },
      {
        slug: 'valid-anagram',
        title: 'Valid Anagram',
        difficulty: 'Easy',
        why: 'Conteo de caracteres con hash map, un ejercicio de strings que aparece seguido en entrevistas de QA automation.',
      },
      {
        slug: 'reverse-string',
        title: 'Reverse String',
        difficulty: 'Easy',
        why: 'Practica dos punteros in place, el típico warm-up de manipulación de strings para roles de testing.',
      },
      {
        slug: 'fizz-buzz',
        title: 'Fizz Buzz',
        difficulty: 'Easy',
        why: 'Simple, pero muy pedido para ver cómo estructurás condiciones y qué casos probarías.',
      },
      {
        slug: 'palindrome-number',
        title: 'Palindrome Number',
        difficulty: 'Easy',
        why: 'Obliga a pensar en negativos y ceros finales, el tipo de casos de borde que se espera que detecte un QA.',
      },
    ],
    'semi-senior': [
      {
        slug: 'contains-duplicate',
        title: 'Contains Duplicate',
        difficulty: 'Easy',
        why: 'Uso básico de sets, muy común para validar unicidad de datos en scripts de automatización.',
      },
      {
        slug: 'valid-palindrome',
        title: 'Valid Palindrome',
        difficulty: 'Easy',
        why: 'Combina normalización de strings y dos punteros, un clásico en screens de SDET.',
      },
      {
        slug: 'roman-to-integer',
        title: 'Roman to Integer',
        difficulty: 'Easy',
        why: 'Parseo con reglas y excepciones, bueno para practicar derivar casos de prueba desde una especificación.',
      },
      {
        slug: 'move-zeroes',
        title: 'Move Zeroes',
        difficulty: 'Easy',
        why: 'Manipulación de arrays in place manteniendo el orden, frecuente en entrevistas de automatización.',
      },
      {
        slug: 'group-anagrams',
        title: 'Group Anagrams',
        difficulty: 'Medium',
        why: 'Agrupar con claves calculadas en un hash map, útil para clasificar resultados o logs en herramientas de testing.',
      },
      {
        slug: 'longest-substring-without-repeating-characters',
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        why: 'El sliding window más pedido; es el Medium de strings que más aparece en screens de SDET.',
      },
    ],
    senior: [
      {
        slug: 'string-to-integer-atoi',
        title: 'String to Integer (atoi)',
        difficulty: 'Medium',
        why: 'Es casi un ejercicio de testing: el desafío está en enumerar y manejar todos los casos de borde de la entrada.',
      },
      {
        slug: 'string-compression',
        title: 'String Compression',
        difficulty: 'Medium',
        why: 'Manipulación in place con dos punteros y conteos de varios dígitos, muy pedido en screens de SDET senior.',
      },
      {
        slug: 'reverse-words-in-a-string',
        title: 'Reverse Words in a String',
        difficulty: 'Medium',
        why: 'Parseo y normalización de espacios, el tipo de procesamiento de texto que aparece al validar outputs.',
      },
      {
        slug: 'merge-intervals',
        title: 'Merge Intervals',
        difficulty: 'Medium',
        why: 'Ordenar y unir rangos, aplicable a analizar ventanas de tiempo en logs o resultados de performance.',
      },
      {
        slug: 'top-k-frequent-elements',
        title: 'Top K Frequent Elements',
        difficulty: 'Medium',
        why: 'Conteo con hash map y heap, como al reportar los tests o errores más frecuentes de una suite.',
      },
      {
        slug: 'subarray-sum-equals-k',
        title: 'Subarray Sum Equals K',
        difficulty: 'Medium',
        why: 'Prefix sums con hash map, un Medium de arrays frecuente que exige cuidar negativos y casos de borde.',
      },
    ],
  },
};
