import { z } from 'zod';

// Corre en el navegador antes de hidratar. zod 4 prueba `new Function('')` en el primer parse de
// un objeto para decidir si compila validadores; la CSP (sin 'unsafe-eval') lo bloquea y aunque
// zod se recupera, el navegador lo reporta como violación de `script-src`. Sin JIT no prueba nada.
z.config({ jitless: true });
