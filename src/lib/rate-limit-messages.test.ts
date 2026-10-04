import {
  actionErrorMessage,
  formatWait,
  getRateLimitMessage,
  parseRateLimitError,
  rateLimitDigest,
  rateLimitMessage,
} from './rate-limit-messages';

describe('formatWait', () => {
  it.each([
    [1, '1 segundo'],
    [45, '45 segundos'],
    [60, '1 minuto'],
    [61, '2 minutos'],
    [540, '9 minutos'],
    [3600, '1 hora'],
    [7200, '2 horas'],
  ])('formats %i seconds as "%s"', (seconds, text) => {
    expect(formatWait(seconds)).toBe(text);
  });
});

describe('rateLimitMessage', () => {
  it('says what was limited, why, and how long to wait', () => {
    expect(rateLimitMessage('comment', 300)).toBe(
      'Estás comentando muy seguido. Para evitar spam hay un límite de comentarios: vas a poder comentar de nuevo en 5 minutos.',
    );
    expect(rateLimitMessage('signIn', 30)).toContain('Para proteger tu cuenta');
    expect(rateLimitMessage('signIn', 30)).toContain('30 segundos');
  });
});

describe('parseRateLimitError', () => {
  it('reads the digest, which is what reaches the browser in production', () => {
    const error = Object.assign(new Error('An error occurred in the Server Components render.'), {
      digest: rateLimitDigest('upload', 120),
    });

    expect(parseRateLimitError(error)).toEqual({ name: 'upload', waitSeconds: 120 });
  });

  it('reads the message in development', () => {
    expect(parseRateLimitError(new Error('RATE_LIMIT:verifyCode:90'))).toEqual({
      name: 'verifyCode',
      waitSeconds: 90,
    });
  });

  it('ignores other errors and unknown forms', () => {
    expect(parseRateLimitError(new Error('Evento lleno'))).toBeNull();
    expect(parseRateLimitError(new Error('RATE_LIMIT:nope:10'))).toBeNull();
    expect(parseRateLimitError(null)).toBeNull();
    expect(getRateLimitMessage('boom')).toBeNull();
  });
});

describe('actionErrorMessage', () => {
  const productionError = (digest: string) =>
    Object.assign(
      new Error(
        'An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details.',
      ),
      { digest },
    );

  it('explains a rate limit even in production', () => {
    expect(actionErrorMessage(productionError(rateLimitDigest('createContent', 1800)), 'x')).toBe(
      rateLimitMessage('createContent', 1800),
    );
  });

  it("never shows Next's generic production message", () => {
    expect(actionErrorMessage(productionError('12345'), 'No se pudo guardar', true)).toBe(
      'No se pudo guardar',
    );
  });

  it('shows the action message only when asked to', () => {
    expect(actionErrorMessage(new Error('El evento está lleno'), 'Error', true)).toBe(
      'El evento está lleno',
    );
    expect(actionErrorMessage(new Error('El evento está lleno'), 'Error')).toBe('Error');
  });
});

describe('rateLimitMessage for every form', () => {
  it.each([
    ['signIn', 'inicio de sesión'],
    ['signUp', 'cuentas'],
    ['sendCode', 'códigos'],
    ['verifyCode', 'adivinar'],
    ['createContent', 'publicar'],
    ['comment', 'comentar'],
    ['editContent', 'ediciones'],
    ['eventRegistration', 'cupos'],
    ['upload', 'subir'],
    ['photoDownload', 'descargar'],
    ['log', 'registros'],
    ['pageVisit', 'visitas'],
  ] as const)('explains the %s limit and the wait', (name, word) => {
    const message = rateLimitMessage(name, 120);
    expect(message).toContain(word);
    expect(message).toContain('2 minutos');
  });

  it('round-trips a digest into its message', () => {
    expect(getRateLimitMessage({ digest: rateLimitDigest('upload', 3600) })).toContain('1 hora');
  });

  it('never shows the minified React error Next 16 sends instead of the message', () => {
    const next16 = new Error(
      'Minified React error #441; visit https://react.dev/errors/441 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.',
    );

    expect(actionErrorMessage(next16, 'No se pudo guardar', true)).toBe('No se pudo guardar');
  });
});
