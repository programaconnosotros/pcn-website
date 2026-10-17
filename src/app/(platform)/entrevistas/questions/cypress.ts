import type { InterviewQuestion, Seniority } from './types';

export const cypressQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'cypress',
      question: '¿Qué es Cypress y en qué se diferencia de Selenium?',
      answer:
        'Es un framework de testing E2E y de componentes para aplicaciones web escrito en JavaScript. A diferencia de Selenium, que controla el navegador desde afuera vía WebDriver, Cypress corre dentro del mismo navegador que la aplicación. Eso le da acceso directo al DOM, a la red y esperas automáticas, con un runner interactivo que permite ver cada paso.',
    },
    {
      topic: 'cypress',
      question: '¿Cómo se estructura un test básico en Cypress?',
      answer:
        'Se usa la sintaxis de Mocha: `describe` agrupa, `it` define cada test y hooks como `beforeEach` preparan el estado. Dentro se encadenan comandos como `cy.visit()`, `cy.get()`, `.type()`, `.click()` y aserciones con `.should()`. Los archivos van por defecto en `cypress/e2e/` con extensión `.cy.js` o `.cy.ts`.',
    },
    {
      topic: 'cypress',
      question: '¿Qué diferencia hay entre `cy.get()` y `cy.contains()`?',
      answer:
        '`cy.get()` busca elementos por un selector CSS, como `[data-cy="submit"]`. `cy.contains()` busca un elemento por su texto visible, y opcionalmente se le pasa un selector para acotar. Cypress recomienda atributos dedicados como `data-cy` o `data-testid` para que los tests no se rompan con cambios de estilo.',
    },
    {
      topic: 'cypress',
      question:
        '¿Por qué no hace falta agregar esperas como `cy.wait(2000)` en la mayoría de los casos?',
      answer:
        'Porque Cypress reintenta automáticamente las consultas y aserciones hasta que se cumplen o vence el timeout (4 segundos por defecto). Si un elemento todavía no apareció, `cy.get()` lo sigue buscando. Las esperas fijas hacen los tests lentos y flaky; si hay que esperar una request, se usa un alias de `cy.intercept()`.',
    },
    {
      topic: 'cypress',
      question: '¿Qué son las fixtures y cómo se usan?',
      answer:
        'Son archivos con datos estáticos, normalmente JSON en `cypress/fixtures/`. Se cargan con `cy.fixture("user.json")` para usarlos en el test o se pasan como respuesta mockeada a `cy.intercept()` con `{ fixture: "user.json" }`. Sirven para tener datos de prueba consistentes y separados del código.',
    },
    {
      topic: 'cypress',
      question: '¿Cuál es la diferencia entre `cypress open` y `cypress run`?',
      answer:
        '`cypress open` abre el Test Runner interactivo, donde elegís navegador y specs y ves la app con el log de comandos y time travel; se usa al desarrollar. `cypress run` ejecuta los tests en modo headless desde la terminal, ideal para CI, y puede grabar videos y screenshots de las fallas.',
    },
  ],
  'semi-senior': [
    {
      topic: 'cypress',
      question:
        '¿Los comandos de Cypress son promesas? ¿Por qué no podés usar `async/await` con ellos?',
      answer:
        'No. Los comandos `cy.*` no se ejecutan en el momento: se encolan y Cypress los corre después, en orden, con reintentos. Devuelven un chainer, no una promesa, así que `await` no funciona y guardar el resultado en una variable (`const el = cy.get(...)`) no da el elemento. Para usar un valor se usa `.then()`, alias con `.as()` o aserciones encadenadas.',
    },
    {
      topic: 'cypress',
      question: '¿Cómo funciona la retry-ability y qué comandos se reintentan y cuáles no?',
      answer:
        'Las queries (`get`, `find`, `contains`, `its`) y las aserciones se reintentan juntas hasta pasar o vencer el timeout. Las acciones como `click()` o `type()` no se reintentan, porque tienen efectos. Por eso conviene que la última query antes de la aserción sea la que realmente cambia, y no partir cadenas largas con `.then()` que cortan el reintento.',
    },
    {
      topic: 'cypress',
      question: '¿Para qué sirve `cy.intercept()`? Dá ejemplos de uso.',
      answer:
        'Permite espiar o modificar requests de red. Se puede esperar una request con un alias (`cy.intercept("GET", "/api/users").as("users")` y luego `cy.wait("@users")`), stubear respuestas con un body o fixture, y simular errores o demoras con `statusCode: 500` o `delay`. También se puede verificar el body o los headers de la request enviada.',
    },
    {
      topic: 'cypress',
      question: '¿Qué son los custom commands y cuándo conviene crearlos?',
      answer:
        'Son comandos propios definidos con `Cypress.Commands.add()` en `cypress/support/commands`, que se usan como `cy.login()`. Conviene crearlos para acciones repetidas en muchos tests, como login por API o crear datos. Con TypeScript hay que declarar sus tipos, y no conviene abusar: para lógica simple una función común puede ser más clara.',
    },
    {
      topic: 'cypress',
      question: '¿Qué hace `cy.session()` y por qué mejora la velocidad de la suite?',
      answer:
        'Cachea y restaura el estado de sesión (cookies, `localStorage` y `sessionStorage`) entre tests. La primera vez ejecuta el login; las siguientes restaura la sesión guardada, con una función `validate` opcional para chequear que siga válida. Así se evita repetir el login por UI en cada test, manteniendo el aislamiento que da `testIsolation`.',
    },
    {
      topic: 'cypress',
      question: '¿Cómo se configura Cypress para distintos entornos?',
      answer:
        'La configuración vive en `cypress.config.ts` con `defineConfig`, separada en `e2e` y `component`, donde se define `baseUrl`, timeouts y `setupNodeEvents`. Para distintos entornos se usan variables de entorno (`Cypress.env()` o `CYPRESS_*`), flags como `--config` y `--env`, o se arma la config dentro de `setupNodeEvents` según un parámetro. Los secretos no se commitean en el archivo.',
    },
  ],
  senior: [
    {
      topic: 'cypress',
      question: '¿Cuáles son las limitaciones de la arquitectura de Cypress y cómo las sorteás?',
      answer:
        'Al correr dentro del navegador no soporta múltiples pestañas ni controlar varios navegadores a la vez; para links con `target="_blank"` se remueve el atributo o se verifica el `href`. Para navegar a otro dominio en un mismo test se usa `cy.origin()`. No hay soporte para Safari real (solo WebKit experimental), y para acceder al sistema de archivos o a la base se usan tasks con `cy.task()` en Node.',
    },
    {
      topic: 'cypress',
      question: '¿Qué es `cy.task()` y para qué lo usarías en una suite grande?',
      answer:
        'Ejecuta código en el proceso de Node definido en `setupNodeEvents`, fuera del navegador. Sirve para sembrar o resetear la base de datos, leer archivos, consultar colas o servicios internos y generar datos antes de un test. Es la forma de crear estado rápido sin pasar por la UI, que es clave para tests independientes y veloces.',
    },
    {
      topic: 'cypress',
      question: '¿Cómo paralelizarías la suite de Cypress en CI?',
      answer:
        'Con Cypress Cloud se usa `cypress run --record --parallel` en varias máquinas y Cloud balancea los specs por duración histórica, además de dar analytics, detección de flaky tests y Spec Prioritization. Sin Cloud se puede dividir los specs manualmente o con herramientas de sharding entre jobs de CI. En ambos casos los tests tienen que ser independientes y los specs de tamaño parecido.',
    },
    {
      topic: 'cypress',
      question: '¿Qué es el component testing en Cypress y cuándo lo preferís sobre E2E?',
      answer:
        'Monta un componente aislado (React, Vue, Angular, Svelte) en un navegador real con `cy.mount()`, usando el bundler del proyecto. Es más rápido que un E2E y permite probar estados y props difíciles de alcanzar desde la app completa. Lo prefiero para lógica de UI y variantes de componentes, y dejo el E2E para flujos completos de usuario e integración con el backend.',
    },
    {
      topic: 'cypress',
      question: '¿Qué malas prácticas ves seguido en suites de Cypress y cómo las corregirías?',
      answer:
        'Esperas fijas con `cy.wait(ms)`, selectores frágiles por clase, tests que dependen del orden, hacer login por UI en cada test y visitar sitios externos que no controlamos. También usar `.then()` donde alcanza con una aserción, o asignar valores de comandos a variables. Las corregiría con aliases de `cy.intercept()`, `data-cy`, estado creado por API o `cy.task()`, `cy.session()` y lint con `eslint-plugin-cypress`.',
    },
    {
      topic: 'cypress',
      question:
        'Un test pasa localmente pero falla de forma intermitente en CI. ¿Cómo lo investigás?',
      answer:
        'Reviso los screenshots, videos y logs de la corrida (o el Test Replay de Cypress Cloud) para ver el estado del DOM y la red en la falla. Las causas típicas son requests más lentas en CI, animaciones, datos compartidos entre jobs paralelos o diferencias de viewport y recursos. Lo corrijo esperando aliases de red y aserciones sobre el estado real, aislando datos, y uso `retries` solo como red de contención mientras arreglo la causa.',
    },
  ],
};
