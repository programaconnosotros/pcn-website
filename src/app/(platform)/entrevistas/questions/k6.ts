import type { InterviewQuestion, Seniority } from './types';

export const k6Questions: Record<Seniority, InterviewQuestion[]> = {
  junior: [
    {
      topic: 'performance',
      question:
        '¿Qué diferencia hay entre una prueba de carga, de estrés, de spike, de soak y un smoke test?',
      answer:
        'Smoke valida con carga mínima que el script y el sistema funcionan. Load mide el comportamiento con la carga esperada; stress sube por encima de esa carga para encontrar el punto de quiebre; spike aplica un pico brusco y corto. Soak mantiene una carga normal durante horas para detectar memory leaks o degradación en el tiempo.',
    },
    {
      topic: 'k6',
      question: '¿Qué es k6 y cuál es la estructura básica de un script?',
      answer:
        'Es una herramienta open source de Grafana para pruebas de performance, donde los tests se escriben en JavaScript y el motor corre en Go. Un script exporta un objeto `options` con la configuración (VUs, duración, thresholds) y una función `export default function` que cada usuario virtual ejecuta en loop. Se corre con `k6 run script.js`.',
    },
    {
      topic: 'k6',
      question: '¿Qué es un virtual user (VU) y qué es una iteración?',
      answer:
        "Un VU es un usuario simulado que ejecuta el script de forma concurrente con los demás, con su propio estado y cookies. Una iteración es una ejecución completa de la `default function`; cada VU repite iteraciones mientras dure la prueba. Por ejemplo, `vus: 10, duration: '1m'` son 10 usuarios iterando durante un minuto.",
    },
    {
      topic: 'k6',
      question: '¿Qué diferencia hay entre `check` y `thresholds`?',
      answer:
        "`check` valida algo de una respuesta, como `res.status === 200`, y registra el porcentaje de éxito, pero no hace fallar la prueba por sí solo. `thresholds` son criterios de aprobación sobre métricas, definidos en `options`, por ejemplo `http_req_duration: ['p(95)<500']`; si no se cumplen, k6 termina con código de salida distinto de cero. Se combinan con un threshold sobre la métrica `checks`.",
    },
    {
      topic: 'performance',
      question:
        '¿Qué significa el p95 de `http_req_duration` y por qué se usa en lugar del promedio?',
      answer:
        'El p95 es el valor por debajo del cual está el 95% de las requests: si es 400 ms, solo un 5% tardó más. El promedio esconde los casos lentos, porque muchas requests rápidas compensan unas pocas muy lentas que igual afectan a usuarios reales. Por eso se miran percentiles como p95 y p99 junto con la tasa de errores `http_req_failed`.',
    },
    {
      topic: 'k6',
      question: '¿Para qué se usa `sleep` en un script de k6?',
      answer:
        'Simula el think time, el tiempo que un usuario real tarda entre acciones (leer, completar un formulario). Sin `sleep`, cada VU dispara requests sin pausa y genera una carga mucho mayor y menos realista que la de un usuario. Conviene usar valores variables, por ejemplo `sleep(Math.random() * 3 + 1)`, para no sincronizar a todos los VUs.',
    },
  ],
  'semi-senior': [
    {
      topic: 'k6',
      question: '¿Para qué sirven `setup` y `teardown` en k6?',
      answer:
        '`setup()` corre una sola vez antes de la prueba y lo que devuelve se pasa como argumento a la `default function` de todos los VUs; se usa, por ejemplo, para obtener un token o crear datos. `teardown(data)` corre una vez al final para limpiar. El código en el init context (fuera de las funciones) se ejecuta por cada VU y solo sirve para cargar archivos e imports, no para hacer requests.',
    },
    {
      topic: 'k6',
      question: '¿Qué son los scenarios y los executors en k6?',
      answer:
        'Los scenarios permiten definir en `options.scenarios` varias cargas independientes en una misma prueba, cada una con su función, tags y executor. El executor define cómo se genera la carga: `ramping-vus` sube y baja la cantidad de VUs por etapas, `constant-vus` mantiene un número fijo, y `constant-arrival-rate` o `ramping-arrival-rate` fijan iteraciones por segundo. Así se puede modelar, por ejemplo, navegación y checkout con perfiles distintos en paralelo.',
    },
    {
      topic: 'performance',
      question: '¿Qué diferencia hay entre un modelo de carga abierto y uno cerrado?',
      answer:
        'En el modelo cerrado (`constant-vus`, `ramping-vus`) hay un número fijo de usuarios y cada uno empieza una nueva iteración cuando termina la anterior, así que si el sistema se pone lento llegan menos requests. En el abierto (`constant-arrival-rate`) las iteraciones arrancan a un ritmo fijo sin importar cuánto tarden, como pasa con tráfico real de internet. El abierto es mejor para medir throughput objetivo y no oculta la degradación.',
    },
    {
      topic: 'k6',
      question: '¿Cómo usarías datos de prueba, como una lista de usuarios, en k6?',
      answer:
        "Con `SharedArray` en el init context: `new SharedArray('users', () => JSON.parse(open('./users.json')))`. La función se ejecuta una vez y el array se comparte en memoria entre todos los VUs en modo solo lectura, en lugar de duplicarse por VU. Después cada VU elige un registro, por ejemplo con `exec.vu.idInTest` para no repetir usuarios.",
    },
    {
      topic: 'performance',
      question: '¿Qué es la correlación de datos y cómo la harías en k6?',
      answer:
        "Es capturar valores dinámicos de una respuesta (un token, un ID, un CSRF token) y reutilizarlos en las requests siguientes, en vez de usar valores fijos grabados. En k6 se extraen con `res.json('token')`, `res.html().find()` o expresiones regulares, y se pasan en headers o en el body del próximo request. Sin correlación, el flujo falla o testea un camino irreal, por ejemplo siempre el mismo recurso cacheado.",
    },
    {
      topic: 'k6',
      question: '¿Cómo integrarías k6 en un pipeline de CI?',
      answer:
        'Se corre con la acción oficial o la imagen Docker de k6 en el pipeline, apuntando a un entorno de staging. Los thresholds actúan como gate: si `p(95)` o `http_req_failed` superan el límite, k6 sale con código de error y el job falla. En cada PR conviene un smoke o una carga corta, y las pruebas largas (stress, soak) programadas, exportando resultados a Grafana o como artifact para comparar entre versiones.',
    },
  ],
  senior: [
    {
      topic: 'performance',
      question:
        'Corriste una prueba de carga y el p99 se dispara a partir de cierta cantidad de usuarios. ¿Cómo encontrarías el cuello de botella?',
      answer:
        'Primero confirmar que el generador de carga no es el límite (CPU y red de la máquina de k6, warnings de `dropped_iterations`). Después correlacionar la métrica de latencia con la observabilidad del sistema: CPU, memoria, GC, pools de conexiones, locks y queries lentas en la base, saturación de colas o servicios externos. Buscar el recurso que se satura primero, cambiar una sola variable a la vez y volver a medir, idealmente con tracing distribuido para ver dónde se va el tiempo.',
    },
    {
      topic: 'performance',
      question: '¿Cómo diseñarías una estrategia de performance testing para un producto?',
      answer:
        'Arrancar por objetivos de negocio convertidos en SLOs medibles (por ejemplo, p95 < 300 ms y < 0,1% de errores con 500 req/s). Modelar la carga desde datos reales de producción: flujos más usados, mezcla de requests y picos. Definir qué pruebas se corren y cuándo (smoke en cada PR, load antes de cada release, stress y soak periódicos), con thresholds como criterios de aceptación y resultados guardados para detectar regresiones a lo largo del tiempo.',
    },
    {
      topic: 'performance',
      question: '¿Qué hace que un entorno de pruebas de performance sea representativo?',
      answer:
        'Que tenga una infraestructura proporcional a producción (tamaño de instancias, réplicas, configuración de autoscaling y límites), volúmenes de datos realistas en la base y las mismas capas de cache, CDN y balanceo. Las dependencias externas se aíslan con mocks que simulen latencias reales para no testear ni castigar a terceros. Si el entorno es más chico, hay que documentarlo y no extrapolar resultados de forma lineal.',
    },
    {
      topic: 'performance',
      question: '¿Qué es la coordinated omission y cómo afecta a los resultados de una prueba?',
      answer:
        'Ocurre cuando el generador de carga espera a que el sistema responda antes de mandar la siguiente request: si el sistema se traba, se dejan de enviar requests justo en el peor momento y esas latencias nunca se miden. El resultado son percentiles optimistas que no reflejan lo que vivirían usuarios reales que siguen llegando. En k6 se mitiga con executors de modelo abierto como `constant-arrival-rate`, que mantienen el ritmo de llegada y reportan `dropped_iterations` si no alcanzan los VUs.',
    },
    {
      topic: 'k6',
      question:
        '¿Cómo dimensionarías los VUs para un escenario con `constant-arrival-rate` de 200 iteraciones por segundo?',
      answer:
        'Aplicando la ley de Little: VUs necesarios ≈ tasa de llegada × duración de una iteración. Si una iteración tarda 1,5 s (requests más think time), hacen falta unos 300 VUs; se configura `preAllocatedVUs` con ese valor y `maxVUs` con margen para cuando el sistema se degrade. Si aparecen `dropped_iterations`, faltan VUs o el sistema ya no sostiene esa tasa, y eso también es un hallazgo.',
    },
    {
      topic: 'k6',
      question: '¿Cómo analizarías y reportarías resultados de k6 más allá del resumen de consola?',
      answer:
        'Exportando métricas a un backend de series de tiempo (Prometheus remote write, InfluxDB o Grafana Cloud k6) para ver la evolución durante la prueba junto con las métricas del sistema en los mismos dashboards. Usar tags y `group` para separar latencias por endpoint o flujo, y métricas custom (`Trend`, `Counter`, `Rate`) para medir cosas de negocio. El reporte debe comparar contra el baseline y los SLOs, explicar el punto de saturación y recomendar acciones, no solo pegar números.',
    },
  ],
};
