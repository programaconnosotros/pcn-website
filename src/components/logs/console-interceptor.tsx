'use client';

import { useEffect } from 'react';
import { logClient } from '@/actions/logs/log-client';

// Función helper para serializar argumentos de forma segura
function safeStringify(arg: any): string {
  if (arg === null || arg === undefined) {
    return String(arg);
  }

  // Si es un elemento DOM, usar su representación como string
  if (arg instanceof HTMLElement || arg instanceof Element) {
    return `<${arg.tagName.toLowerCase()}${arg.id ? ` id="${arg.id}"` : ''}${arg.className ? ` class="${arg.className}"` : ''} />`;
  }

  // Si es un objeto, intentar serializarlo de forma segura
  if (typeof arg === 'object') {
    try {
      // Usar un replacer para manejar referencias circulares
      const seen = new WeakSet();
      return JSON.stringify(arg, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        // Si es un elemento DOM, convertirlo a string
        if (value instanceof HTMLElement || value instanceof Element) {
          return `<${value.tagName.toLowerCase()} />`;
        }
        return value;
      });
    } catch (error) {
      // Si falla la serialización, usar String() como fallback
      return String(arg);
    }
  }

  return String(arg);
}

export function ConsoleInterceptor({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Guardar las funciones originales
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalDebug = console.debug;

    // Interceptar console.log
    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      try {
        const message = args.map(safeStringify).join(' ');
        logClient({
          level: 'info',
          message,
          path: window.location.pathname,
          metadata: { args: args.length > 1 ? args : undefined },
        }).catch(() => {
          // Silenciar errores de logging
        });
      } catch (error) {
        // Silenciar errores de serialización
      }
    };

    // Interceptar console.warn
    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      try {
        const message = args.map(safeStringify).join(' ');
        logClient({
          level: 'warn',
          message,
          path: window.location.pathname,
          metadata: { args: args.length > 1 ? args : undefined },
        }).catch(() => {
          // Silenciar errores de logging
        });
      } catch (error) {
        // Silenciar errores de serialización
      }
    };

    // Interceptar console.error
    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      try {
        const message = args.map(safeStringify).join(' ');
        logClient({
          level: 'error',
          message,
          path: window.location.pathname,
          metadata: { args: args.length > 1 ? args : undefined },
        }).catch(() => {
          // Silenciar errores de logging
        });
      } catch (error) {
        // Silenciar errores de serialización
      }
    };

    // Interceptar console.debug
    console.debug = (...args: any[]) => {
      originalDebug.apply(console, args);
      try {
        const message = args.map(safeStringify).join(' ');
        logClient({
          level: 'debug',
          message,
          path: window.location.pathname,
          metadata: { args: args.length > 1 ? args : undefined },
        }).catch(() => {
          // Silenciar errores de logging
        });
      } catch (error) {
        // Silenciar errores de serialización
      }
    };

    // Cleanup: restaurar las funciones originales al desmontar
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.debug = originalDebug;
    };
  }, []);

  return <>{children}</>;
}
