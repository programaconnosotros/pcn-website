import { MIN_PROJECT_YEAR, projectMemberSchema, projectSchema } from './project-schema';

const project = {
  title: 'PCN Website',
  description: 'El sitio de la comunidad.',
  url: 'https://pcn.dev',
};

const messages = (input: unknown) =>
  projectSchema.safeParse(input).error?.issues.map((issue) => issue.message) ?? [];

const maxYear = new Date().getFullYear() + 1;

describe('projectSchema', () => {
  it('accepts a minimal project and fills the defaults', () => {
    const parsed = projectSchema.parse(project);
    expect(parsed).toMatchObject({
      techStack: [],
      isOpenSource: false,
      members: [],
      startYear: null,
      endYear: null,
      authorRole: null,
    });
    expect(parsed.repoUrl).toBeUndefined();
    expect(parsed.logoUrl).toBeUndefined();
  });

  it('parses years from numbers or strings and treats empty as none', () => {
    const parsed = projectSchema.parse({ ...project, startYear: '2020', endYear: 2021 });
    expect(parsed).toMatchObject({ startYear: 2020, endYear: 2021 });
    expect(projectSchema.parse({ ...project, startYear: '' }).startYear).toBeNull();
  });

  it.each([MIN_PROJECT_YEAR - 1, maxYear + 1, 2020.5, 'abc'])('rejects the year %p', (year) => {
    expect(messages({ ...project, startYear: year })).toEqual([
      `Ingresá un año entre ${MIN_PROJECT_YEAR} y ${maxYear}`,
    ]);
  });

  it('accepts the boundary years', () => {
    expect(projectSchema.safeParse({ ...project, startYear: MIN_PROJECT_YEAR }).success).toBe(true);
    expect(projectSchema.safeParse({ ...project, endYear: maxYear }).success).toBe(true);
  });

  it('rejects an end year before the start year', () => {
    expect(messages({ ...project, startYear: 2022, endYear: 2021 })).toEqual([
      'El año de cierre no puede ser anterior al de inicio',
    ]);
    expect(projectSchema.safeParse({ ...project, startYear: 2022, endYear: 2022 }).success).toBe(
      true,
    );
  });

  it('only accepts GitHub repository URLs', () => {
    expect(
      projectSchema.parse({ ...project, repoUrl: ' https://github.com/pcn/website ' }).repoUrl,
    ).toBe('https://github.com/pcn/website');
    expect(projectSchema.parse({ ...project, repoUrl: '' }).repoUrl).toBeUndefined();
    for (const repoUrl of [
      'http://github.com/pcn/website',
      'https://gitlab.com/pcn/website',
      'https://github.com/pcn',
      'no es url',
    ]) {
      expect(messages({ ...project, repoUrl })).toEqual([
        'Ingresá la URL de un repositorio de GitHub (https://github.com/usuario/repo)',
      ]);
    }
  });

  it('validates the project and logo URLs', () => {
    expect(messages({ ...project, url: 'pcn', logoUrl: 'logo' })).toEqual([
      'La URL del proyecto no es válida',
      'La URL del logo no es válida',
    ]);
    expect(projectSchema.parse({ ...project, logoUrl: '' }).logoUrl).toBeUndefined();
  });

  it('caps the team at 30 members', () => {
    const member = { memberName: 'Ana' };
    expect(messages({ ...project, members: Array(31).fill(member) })).toEqual([
      'Podés agregar hasta 30 compañeros',
    ]);
  });
});

describe('projectMemberSchema', () => {
  it('normalizes a missing user id and an empty role to null and trims the role', () => {
    expect(projectMemberSchema.parse({ memberName: 'Ana', role: '   ' })).toEqual({
      memberName: 'Ana',
      userId: null,
      role: null,
    });
    expect(projectMemberSchema.parse({ memberName: 'Ana', role: ' Backend ' }).role).toBe(
      'Backend',
    );
  });

  // BUG: the transform maps '' to null, but .cuid() runs first and rejects '', so an empty
  // user id never reaches it (the forms send null today, which hides it).
  it.failing('treats an empty user id as no linked user', () => {
    expect(projectMemberSchema.parse({ memberName: 'Ana', userId: '' }).userId).toBeNull();
  });

  it('rejects a short name and a long role', () => {
    expect(projectMemberSchema.safeParse({ memberName: 'A' }).success).toBe(false);
    expect(
      projectMemberSchema.safeParse({ memberName: 'Ana', role: 'a'.repeat(101) }).success,
    ).toBe(false);
  });
});
