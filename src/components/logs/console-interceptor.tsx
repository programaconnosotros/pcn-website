'use client';

import { useEffect } from 'react';
import { logClient } from '@/actions/logs/log-client';

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
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      logClient({
        level: 'info',
        message,
        path: window.location.pathname,
        metadata: { args: args.length > 1 ? args : undefined },
      }).catch(() => {
        // Silenciar errores de logging
      });
    };

    // Interceptar console.warn
    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      logClient({
        level: 'warn',
        message,
        path: window.location.pathname,
        metadata: { args: args.length > 1 ? args : undefined },
      }).catch(() => {
        // Silenciar errores de logging
      });
    };

    // Interceptar console.error
    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      logClient({
        level: 'error',
        message,
        path: window.location.pathname,
        metadata: { args: args.length > 1 ? args : undefined },
      }).catch(() => {
        // Silenciar errores de logging
      });
    };

    // Interceptar console.debug
    console.debug = (...args: any[]) => {
      originalDebug.apply(console, args);
      const message = args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
        .join(' ');
      logClient({
        level: 'debug',
        message,
        path: window.location.pathname,
        metadata: { args: args.length > 1 ? args : undefined },
      }).catch(() => {
        // Silenciar errores de logging
      });
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
