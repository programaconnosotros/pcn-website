import type { InterviewQuestion, Seniority } from './types';

export const playwrightQuestions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'playwright',
      question: '¿Qué es Playwright y qué ventajas tiene para testing end-to-end?',
      answer:
        'Es un framework de Microsoft para automatizar navegadores (Chromium, Firefox y WebKit) con una sola API. Playwright Test trae su propio runner con fixtures, paralelismo, reportes y assertions integradas. Se destaca por el auto-waiting, el aislamiento entre tests y herramientas como el trace viewer y codegen.',
    },
    {
      topic: 'playwright',
      question:
        '¿Qué es un locator y por qué conviene usar `page.getByRole()` en vez de selectores CSS?',
      answer:
        'Un locator es una forma de encontrar elementos que se resuelve de forma lazy cada vez que se usa, así siempre apunta al DOM actual. `getByRole()`, `getByLabel()` o `getByText()` buscan como lo haría un usuario o un lector de pantalla, por lo que los tests son más resilientes a cambios de estructura o de clases CSS. Además, empujan a que la app sea accesible.',
    },
    {
      topic: 'playwright',
      question: '¿Qué es el auto-waiting de Playwright?',
      answer:
        'Antes de ejecutar una acción como `click()` o `fill()`, Playwright espera automáticamente a que el elemento esté adjunto al DOM, visible, estable, habilitado y que reciba eventos. Esto evita tener que escribir esperas manuales o `waitForTimeout`, que son la fuente principal de tests lentos y flaky.',
    },
    {
      topic: 'playwright',
      question:
        '¿Qué diferencia hay entre `expect(await locator.isVisible()).toBe(true)` y `await expect(locator).toBeVisible()`?',
      answer:
        'La primera evalúa el estado una sola vez y falla si en ese instante el elemento todavía no apareció. La segunda es una web-first assertion: reintenta automáticamente hasta que la condición se cumple o vence el timeout. Por eso siempre conviene usar las assertions sobre locators como `toBeVisible()`, `toHaveText()` o `toHaveURL()`.',
    },
    {
      topic: 'playwright',
      question: '¿Qué diferencia hay entre `browser`, `context` y `page`?',
      answer:
        '`browser` es la instancia del navegador, costosa de levantar. Un `context` es como un perfil incógnito aislado, con sus propias cookies y storage; Playwright crea uno nuevo por test para que no compartan estado. Una `page` es una pestaña dentro de un context.',
    },
    {
      topic: 'playwright',
      question: '¿Para qué sirve codegen y cuándo lo usarías?',
      answer:
        '`npx playwright codegen <url>` abre un navegador y genera el código del test a medida que interactuás con la página, eligiendo locators recomendados. Es útil para arrancar rápido o descubrir qué locator usar, pero el código generado se revisa y se refactoriza: no reemplaza diseñar buenos tests.',
    },
  ],
  'semi-senior': [
    {
      topic: 'playwright',
      question: '¿Qué son los fixtures en Playwright Test y cómo crearías uno propio?',
      answer:
        'Son dependencias que el runner inyecta en cada test, como `page`, `context` o `request`, con setup y teardown automáticos. Se crean con `test.extend()`, definiendo una función que prepara el recurso, lo entrega con `await use(valor)` y después limpia. Sirven para compartir cosas como un page object o un usuario logueado sin repetir código ni usar `beforeEach` por todos lados.',
    },
    {
      topic: 'playwright',
      question: '¿Cómo evitarías hacer login por la UI en cada test?',
      answer:
        "Con `storageState`: un setup project (o global setup) se loguea una vez y guarda cookies y localStorage con `context.storageState({ path })`. Después los tests se configuran con `use: { storageState: 'auth.json' }` y arrancan ya autenticados. Para distintos roles se guarda un archivo por rol, y conviene loguearse por API cuando sea posible para que sea más rápido.",
    },
    {
      topic: 'playwright',
      question: '¿Cómo mockearías una respuesta de la API en un test con `page.route`?',
      answer:
        "Se intercepta la URL con `page.route('**/api/users', route => route.fulfill({ json: [...] }))` antes de navegar. También se puede usar `route.continue()` para modificar la request o `route.abort()` para simular errores de red. Sirve para probar estados difíciles de reproducir (errores 500, listas vacías) y desacoplar el test del backend, a costa de no validar la integración real.",
    },
    {
      topic: 'playwright',
      question: '¿Cómo harías tests de API con Playwright?',
      answer:
        'Con el fixture `request` (un `APIRequestContext`), que permite hacer `request.get()`, `request.post()`, etc., y validar con `expect(response).toBeOK()` y el body JSON. Se usa para testear endpoints directamente o para preparar datos antes de un test de UI (crear un usuario, sembrar registros) mucho más rápido que por la interfaz. Comparte cookies con el context si se usa `page.request`.',
    },
    {
      topic: 'playwright',
      question: '¿Qué son los projects en `playwright.config.ts` y para qué los usarías?',
      answer:
        "Son configuraciones con nombre que corren los mismos tests (o un subconjunto) con opciones distintas. El uso típico es multi-browser: un project para Chromium, otro para Firefox y otro para WebKit, o emular dispositivos móviles con `devices['iPhone 13']`. También sirven para un setup project del que otros dependen vía `dependencies`, por ejemplo para autenticación.",
    },
    {
      topic: 'playwright',
      question: '¿Cómo usarías el trace viewer para investigar un test que falla en CI?',
      answer:
        "Se configura `trace: 'on-first-retry'` para que grabe un trace cuando un test se reintenta, y se sube como artifact del pipeline. Con `npx playwright show-trace trace.zip` (o trace.playwright.dev) se ve cada acción con snapshots del DOM antes y después, la consola, los requests de red y el código fuente. Permite entender qué vio el navegador en el momento del fallo sin reproducirlo localmente.",
    },
  ],
  senior: [
    {
      topic: 'playwright',
      question:
        '¿Cómo funciona el paralelismo en Playwright y cómo escalarías una suite grande con sharding?',
      answer:
        'Playwright corre archivos en paralelo en varios workers (procesos), cada uno con su propio browser; con `fullyParallel: true` también paraleliza los tests dentro de un archivo. Para escalar más allá de una máquina se usa `--shard=1/4` en distintos jobs de CI y después se combinan los reportes blob con `merge-reports`. La condición es que los tests sean independientes: datos propios por test y nada de estado compartido entre ellos.',
    },
    {
      topic: 'playwright',
      question: 'Tenés una suite con muchos tests flaky. ¿Cómo lo encararías?',
      answer:
        'Primero medir: identificar los flaky con los reportes y retries (`retries: 2` en CI los marca como flaky en vez de ocultarlos). Las causas típicas son esperas manuales, assertions no web-first, dependencia del orden o de datos compartidos, y backends inestables. Se corrige la causa raíz (locators robustos, aislamiento de datos, mockear servicios externos), se ponen en cuarentena con `test.fixme` los que no se pueden arreglar ya, y los retries quedan como red de seguridad, no como solución.',
    },
    {
      topic: 'playwright',
      question:
        '¿Cómo implementarías visual regression testing con Playwright y qué problemas trae?',
      answer:
        'Con `await expect(page).toHaveScreenshot()`, que compara contra un snapshot de referencia y falla si la diferencia supera `maxDiffPixels` o `threshold`. Los problemas son el ruido: fuentes y renderizado distintos por sistema operativo, animaciones, fechas o datos dinámicos. Se mitiga generando los snapshots en el mismo entorno que CI (por ejemplo, en Docker), enmascarando zonas con `mask`, desactivando animaciones y actualizando con `--update-snapshots` de forma revisada.',
    },
    {
      topic: 'playwright',
      question: '¿Qué diferencias hay entre Playwright y Cypress y cuándo elegirías cada uno?',
      answer:
        'Cypress corre dentro del navegador junto a la app, lo que da buena DX y debugging, pero históricamente limitó multi-tab, múltiples dominios y navegadores (no soporta WebKit). Playwright controla el navegador desde afuera vía protocolo, soporta Chromium, Firefox y WebKit, varios contexts y pestañas, y paralelismo gratis en su runner. Elegiría Playwright para suites grandes, cross-browser o flujos complejos, y Cypress si el equipo ya tiene una inversión fuerte o valora su component testing y su UI interactiva.',
    },
    {
      topic: 'playwright',
      question: '¿Cómo organizarías una suite E2E grande para que sea mantenible?',
      answer:
        'Con page objects o, mejor, fixtures que exponen page objects y datos de prueba listos, así los tests leen como flujos de negocio. Datos creados por API y aislados por test, configuración por entorno con `baseURL`, y tags (`@smoke`, `@critical`) para filtrar con `--grep`. También definir qué va a E2E y qué no: pocos tests de flujos críticos y el resto cubierto con tests de unidad, integración o API, siguiendo la pirámide.',
    },
    {
      topic: 'playwright',
      question:
        '¿Cómo integrarías Playwright en el pipeline de CI para que sea rápido y confiable?',
      answer:
        'Usando la imagen Docker oficial o `npx playwright install --with-deps` con cache de los browsers, `workers` ajustados a la máquina y sharding en paralelo. Correr un set de smoke en cada PR y la suite completa en merge o de forma nocturna, con `forbidOnly: true` y `retries` solo en CI. Publicar el reporte HTML y los traces como artifacts, y apuntar los tests contra un entorno efímero o preview con datos controlados.',
    },
  ],
};
