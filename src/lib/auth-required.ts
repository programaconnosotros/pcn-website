// Sin imports de servidor: lo usan tanto las actions como los componentes de cliente.

const AUTH_REQUIRED = 'AUTH_REQUIRED';

/**
 * Lo lanza una server action cuando quien la llama no tiene una sesión válida (nunca entró, o la
 * sesión venció o se cerró en otra pestaña con la página ya abierta). En producción Next no le
 * pasa el mensaje al navegador pero sí el `digest`, así la UI puede mandarla a iniciar sesión en
 * vez de mostrar un error.
 */
export class AuthRequiredError extends Error {
  readonly digest = AUTH_REQUIRED;

  constructor() {
    super(AUTH_REQUIRED);
    this.name = 'AuthRequiredError';
  }
}

/** Si `error` es un `AuthRequiredError`, ya sea el original o el que llega al navegador. */
export const isAuthRequiredError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;
  const { digest, message } = error as { digest?: unknown; message?: unknown };
  return digest === AUTH_REQUIRED || message === AUTH_REQUIRED;
};
