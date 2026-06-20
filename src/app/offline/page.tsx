'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RotateCw, Award, Zap, Brain, CheckCircle2, XCircle, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
}

const TRIVIA_QUESTIONS: Question[] = [
  {
    q: '¿Cuál es el valor de `typeof null` en JavaScript?',
    options: ['"object"', '"null"', '"undefined"', '"string"'],
    answer: 0,
    explanation: 'Es un bug histórico en JavaScript que se ha mantenido por compatibilidad hacia atrás. Los valores se representaban en binario y el tipo objeto compartía el prefijo 000, al igual que null.',
  },
  {
    q: '¿Qué comando de Git se utiliza para deshacer commits locales pero manteniendo todos los cambios en tu directorio de trabajo?',
    options: [
      'git reset --soft HEAD~1',
      'git reset --hard HEAD~1',
      'git checkout HEAD~1',
      'git revert HEAD~1',
    ],
    answer: 0,
    explanation: '--soft deshace el commit pero deja tus archivos modificados listos en el área de preparación (stage). --hard borraría todo.',
  },
  {
    q: 'En el patrón de diseño Observador (Observer), ¿cuál es el rol principal del "Subject"?',
    options: [
      'Mantener una lista de suscriptores y notificarles cualquier cambio de estado.',
      'Clonar objetos complejos dinámicamente.',
      'Encapsular una petición o comando como un objeto.',
      'Interceptar y formatear peticiones entrantes.',
    ],
    answer: 0,
    explanation: 'El Subject (o Sujeto) mantiene el estado y los observadores suscritos, notificándoles mediante llamadas a sus métodos cuando su estado cambia.',
  },
  {
    q: '¿Qué característica distingue principalmente a una base de datos Relacional (SQL) de una No Relacional (NoSQL)?',
    options: [
      'Esquema estricto definido previamente y soporte completo ACID transaccional.',
      'Escalabilidad horizontal automatizada sin necesidad de llaves primarias.',
      'El uso obligatorio de WebSockets para procesar consultas rápidas.',
      'Que almacena los registros exclusivamente en archivos planos binarios.',
    ],
    answer: 0,
    explanation: 'Las bases de datos SQL se basan en esquemas relacionales bien estructurados y priorizan la integridad transaccional (ACID) por sobre esquemas dinámicos.',
  },
  {
    q: 'En TypeScript, ¿cuál es la diferencia clave entre el tipo `unknown` y el tipo `any`?',
    options: [
      '`unknown` es seguro porque te obliga a comprobar su tipo real antes de operar con él.',
      '`any` solo permite asignar strings o números de forma estática.',
      '`unknown` no permite asignarle ningún tipo de dato dinámico.',
      'Son idénticos y se compilan exactamente a la misma firma en JavaScript.',
    ],
    answer: 0,
    explanation: '`unknown` es la contraparte segura de `any`. Te permite asignar cualquier valor, pero te obliga a realizar una validación de tipo (type guarding) para poder usarlo.',
  },
  {
    q: '¿Qué complejidad temporal promedio (Big O) tiene la búsqueda binaria sobre un array previamente ordenado?',
    options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
    answer: 0,
    explanation: 'La búsqueda binaria divide a la mitad la sección de búsqueda en cada paso, lo que genera una progresión logarítmica O(log n).',
  },
  {
    q: '¿Qué significa el principio de Responsabilidad Única (S) en SOLID?',
    options: [
      'Una clase o módulo debe tener una sola, y solo una, razón para cambiar.',
      'La aplicación debe contar con un único servidor de base de datos primario.',
      'Cada función debe escribirse usando una sola línea de código recursivo.',
      'El estado global debe sincronizarse mediante un único gestor de estado.',
    ],
    answer: 0,
    explanation: 'Significa que cada clase o microservicio debe realizar una única tarea u operar bajo un único propósito específico, reduciendo el acoplamiento.',
  },
  {
    q: '¿Qué protocolo de red utiliza WebSockets por debajo para establecer la conexión inicial (Handshake)?',
    options: ['HTTP/HTTPS', 'SMTP', 'TCP directo sin cabeceras', 'SSH'],
    answer: 0,
    explanation: 'WebSockets utiliza una petición HTTP con la cabecera `Upgrade: websocket` para negociar el canal full-duplex y luego cambiar de protocolo.',
  },
  {
    q: '¿Cuál de los siguientes no es un hook nativo de React?',
    options: ['useFetch', 'useMemo', 'useCallback', 'useLayoutEffect'],
    answer: 0,
    explanation: '`useFetch` es un hook personalizado muy popular, pero no viene integrado nativamente en la biblioteca principal de React.',
  },
  {
    q: '¿Para qué sirve la cláusula SQL `HAVING`?',
    options: [
      'Para filtrar registros agregados creados por un GROUP BY.',
      'Para ordenar los registros de forma descendente en subconsultas.',
      'Para declarar llaves foráneas en sentencias CREATE TABLE.',
      'Para acelerar índices compuestos en motores PostgreSQL.',
    ],
    answer: 0,
    explanation: 'A diferencia de `WHERE` que filtra filas individuales antes del agrupamiento, `HAVING` filtra grupos enteros una vez agrupados.',
  },
  {
    q: '¿Qué es un "Closure" (clausura) en JavaScript?',
    options: [
      'Una función que recuerda y accede a variables de su entorno léxico externo.',
      'Un método de recolección de basura para cerrar conexiones.',
      'Una directiva para compilar scripts en segundo plano de manera síncrona.',
      'Un error en tiempo de ejecución por falta de corchetes de cierre.',
    ],
    answer: 0,
    explanation: 'Un closure se forma cuando una función interna retiene acceso al ámbito de su función contenedora, incluso después de que esta última ha retornado.',
  },
  {
    q: '¿Qué significa el código de estado HTTP 403?',
    options: [
      'Forbidden: El servidor entendió la petición pero se rehúsa a autorizarla.',
      'Unauthorized: Falta autenticación de credenciales válidas.',
      'Not Found: El recurso no se encuentra en el servidor.',
      'Bad Request: El servidor no pudo procesar la solicitud por sintaxis inválida.',
    ],
    answer: 0,
    explanation: 'El código 403 indica que tienes identidad confirmada pero no posees los permisos necesarios para acceder a dicho recurso. El 401 indica falta de autenticación.',
  },
];

export default function OfflinePage() {
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [triviaStarted, setTriviaStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const activeQuestion = TRIVIA_QUESTIONS[currentIdx];

  const handleRetry = () => {
    setCheckingConnection(true);
    setTimeout(() => {
      if (navigator.onLine) {
        window.location.href = '/';
      } else {
        setCheckingConnection(false);
      }
    }, 1200);
  };

  const handleAnswer = (optionIdx: number) => {
    if (answered) return;
    setSelectedOpt(optionIdx);
    setAnswered(true);
    if (optionIdx === activeQuestion.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setAnswered(false);
    setCurrentIdx((prev) => prev + 1);
  };

  const resetTrivia = () => {
    setCurrentIdx(0);
    setScore(0);
    setSelectedOpt(null);
    setAnswered(false);
    setTriviaStarted(true);
  };

  const getRank = () => {
    const ratio = score / TRIVIA_QUESTIONS.length;
    if (ratio === 1) return '10x Fullstack Wizard 🧙‍♂️';
    if (ratio >= 0.8) return 'Senior Architect 🚀';
    if (ratio >= 0.5) return 'Semi-Senior Developer 💻';
    return 'Junior Apprentice 👶';
  };

  const getRankColor = () => {
    const ratio = score / TRIVIA_QUESTIONS.length;
    if (ratio === 1) return 'from-violet-400 to-indigo-400';
    if (ratio >= 0.8) return 'from-emerald-400 to-teal-400';
    if (ratio >= 0.5) return 'from-amber-400 to-orange-400';
    return 'from-rose-400 to-red-400';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-8 text-zinc-50 font-sans selection:bg-violet-500 selection:text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-emerald-600/5 blur-[130px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
        {/* Offline Alert Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800">
            <WifiOff className="h-8 w-8 text-zinc-400 animate-pulse" />
            <div className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-zinc-950 bg-rose-500" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            ¿Sin conexión a internet?
          </h1>
          <p className="mt-2 max-w-md text-zinc-400 text-sm md:text-base">
            No te preocupes. Todo el contenido cacheado sigue disponible. Mientras vuelve tu señal, ¡pon a prueba tus conocimientos de ingeniería de software!
          </p>

          <div className="mt-5 flex gap-4">
            <Button
              onClick={handleRetry}
              disabled={checkingConnection}
              className="bg-zinc-800 text-zinc-200 border border-zinc-700 hover:bg-zinc-700 h-10 px-5 gap-2 transition-all active:scale-95"
            >
              <RotateCw className={`h-4 w-4 ${checkingConnection ? 'animate-spin' : ''}`} />
              {checkingConnection ? 'Comprobando...' : 'Reintentar conexión'}
            </Button>
          </div>
        </div>

        {/* Dynamic Space */}
        <div className="mt-10 w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6 md:p-8">
          {!triviaStarted ? (
            /* Pantalla de bienvenida Trivia */
            <div className="flex flex-col items-center text-center py-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 mb-4 border border-violet-500/20">
                <Brain className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold">Dev Trivia Offline</h2>
              <p className="mt-2 text-zinc-400 text-sm max-w-sm">
                Un cuestionario de {TRIVIA_QUESTIONS.length} preguntas desafiantes sobre Git, Javascript, bases de datos y patrones de diseño.
              </p>
              <Button
                onClick={() => setTriviaStarted(true)}
                className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium h-11 px-8 gap-2 active:scale-95 transition-all shadow-lg shadow-violet-500/10"
              >
                <Play className="h-4 w-4 fill-white" />
                Comenzar juego
              </Button>
            </div>
          ) : currentIdx < TRIVIA_QUESTIONS.length ? (
            /* Pantalla de juego activo */
            <div>
              {/* Progreso */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-mono text-zinc-500 tracking-wider">
                  PREGUNTA {currentIdx + 1} DE {TRIVIA_QUESTIONS.length}
                </span>
                <span className="text-xs font-mono bg-violet-500/15 text-violet-400 px-2.5 py-1 rounded-full border border-violet-500/20 flex items-center gap-1.5">
                  <Zap className="h-3 w-3 fill-violet-400" />
                  Score: {score}
                </span>
              </div>

              {/* Barra de progreso visual */}
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / TRIVIA_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Pregunta */}
              <h3 className="text-lg font-semibold md:text-xl leading-relaxed text-zinc-200">
                {activeQuestion.q}
              </h3>

              {/* Opciones */}
              <div className="mt-6 grid grid-cols-1 gap-3">
                {activeQuestion.options.map((option, idx) => {
                  let btnStyle = 'border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-700';
                  
                  if (answered) {
                    if (idx === activeQuestion.answer) {
                      // Correcta
                      btnStyle = 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
                    } else if (idx === selectedOpt) {
                      // Seleccionada incorrecta
                      btnStyle = 'border-rose-500/30 bg-rose-500/10 text-rose-400';
                    } else {
                      // No seleccionadas
                      btnStyle = 'border-zinc-800/40 bg-zinc-900/10 text-zinc-600 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={answered}
                      className={`flex items-center justify-between w-full p-4 rounded-xl border text-left text-sm md:text-base font-medium transition-all duration-200 ${btnStyle} active:scale-[0.99]`}
                    >
                      <span>{option}</span>
                      {answered && idx === activeQuestion.answer && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 ml-2" />
                      )}
                      {answered && idx === selectedOpt && idx !== activeQuestion.answer && (
                        <XCircle className="h-5 w-5 text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explicación / Siguiente */}
              {answered && (
                <div className="mt-6 border-t border-zinc-800 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-4 text-xs md:text-sm text-zinc-400 leading-relaxed mb-5">
                    <strong className="text-zinc-200 block mb-1">
                      {selectedOpt === activeQuestion.answer ? '🎉 ¡Correcto!' : '❌ Incorrecto'}
                    </strong>
                    {activeQuestion.explanation}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleNext}
                      className="bg-violet-600 hover:bg-violet-500 text-white font-medium h-10 px-6 gap-2"
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Pantalla final - Resultados */
            <div className="flex flex-col items-center text-center py-6">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-amber-400 mb-5">
                <Award className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-bold">¡Trivia Completada!</h2>
              
              <div className="mt-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
                <p className="text-sm text-zinc-500 font-mono tracking-wider uppercase">Puntaje Obtenido</p>
                <div className="text-4xl md:text-5xl font-extrabold text-white mt-1">
                  {score} <span className="text-lg md:text-xl text-zinc-500 font-normal">/ {TRIVIA_QUESTIONS.length}</span>
                </div>
                <div className={`mt-3 text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent ${getRankColor()}`}>
                  {getRank()}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Button
                  onClick={resetTrivia}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-medium h-10 px-6 transition-all active:scale-95"
                >
                  Jugar de nuevo
                </Button>
                <Button
                  onClick={() => setTriviaStarted(false)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 h-10 px-6 transition-all active:scale-95"
                >
                  Volver
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-zinc-600 font-mono">
          programaConNosotros PWA • Hecho con 💜 para la comunidad
        </p>
      </div>
    </div>
  );
}
