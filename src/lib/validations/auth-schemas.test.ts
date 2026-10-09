import {
  ARGENTINA_PROVINCES,
  newPasswordSchema,
  signUpActionSchema,
  signUpSchema,
  signUpSchemaBase,
} from './auth-schemas';

const valid = {
  name: 'Ana Pérez',
  email: 'ana@example.com',
  password: 'secreta123',
  confirmPassword: 'secreta123',
  country: 'Argentina',
  province: 'Córdoba',
};

const issues = (result: {
  success: boolean;
  error?: { issues: { path: unknown[]; message: string }[] };
}) => result.error?.issues.map((issue) => [issue.path.join('.'), issue.message]) ?? [];

describe('newPasswordSchema', () => {
  it.each([
    ['1234567', false],
    ['12345678', true],
    ['a'.repeat(72), true],
    ['a'.repeat(73), false],
  ])('validates the length of %s', (password, ok) => {
    expect(newPasswordSchema.safeParse(password).success).toBe(ok);
  });

  it('requires a value', () => {
    expect(newPasswordSchema.safeParse(undefined).error?.issues[0].message).toBe(
      'Campo obligatorio',
    );
  });

  it('asks for the password, not for 8 characters, when the field is empty', () => {
    expect(newPasswordSchema.safeParse('').error?.issues.map((issue) => issue.message)).toEqual([
      'Campo obligatorio',
    ]);
  });
});

describe('signUpSchema', () => {
  it('accepts a valid sign-up', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('trims the name and rejects numbers or symbols in it', () => {
    expect(signUpSchema.parse({ ...valid, name: '  Ana  ' }).name).toBe('Ana');
    expect(signUpSchema.safeParse({ ...valid, name: 'Ana 2' }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(issues(signUpSchema.safeParse({ ...valid, email: 'ana' }))).toEqual([
      ['email', 'Correo electrónico inválido'],
    ]);
  });

  it('requires a province for Argentina only', () => {
    for (const province of [undefined, '', '   ']) {
      expect(issues(signUpSchemaBase.safeParse({ ...valid, province }))).toEqual([
        ['province', 'La provincia es requerida si el país es Argentina'],
      ]);
    }
    expect(
      signUpSchema.safeParse({ ...valid, country: 'Uruguay', province: undefined }).success,
    ).toBe(true);
  });

  it('requires matching passwords', () => {
    expect(issues(signUpSchema.safeParse({ ...valid, confirmPassword: 'otra12345' }))).toEqual([
      ['confirmPassword', 'Las contraseñas no coinciden'],
    ]);
  });

  it('requires a country', () => {
    expect(signUpSchema.safeParse({ ...valid, country: '' }).success).toBe(false);
  });
});

describe('signUpActionSchema', () => {
  it('accepts a redirect target', () => {
    expect(signUpActionSchema.parse({ ...valid, redirectTo: '/eventos' }).redirectTo).toBe(
      '/eventos',
    );
  });

  it('applies the province and password rules too', () => {
    expect(issues(signUpActionSchema.safeParse({ ...valid, province: ' ' }))).toEqual([
      ['province', 'La provincia es requerida si el país es Argentina'],
    ]);
    expect(issues(signUpActionSchema.safeParse({ ...valid, confirmPassword: 'x' }))).toEqual([
      ['confirmPassword', 'Las contraseñas no coinciden'],
    ]);
    expect(
      signUpActionSchema.safeParse({ ...valid, country: 'Chile', province: undefined }).success,
    ).toBe(true);
  });
});

describe('ARGENTINA_PROVINCES', () => {
  it('lists the 23 provinces', () => {
    expect(ARGENTINA_PROVINCES).toHaveLength(23);
  });
});
