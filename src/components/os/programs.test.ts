import { GENERIC_PROGRAM, OS_PROGRAMS, findProgramForPath, visiblePrograms } from './programs';

describe('findProgramForPath', () => {
  it('matches the home only exactly', () => {
    expect(findProgramForPath('/').id).toBe('inicio');
    expect(findProgramForPath('/?ref=x').id).toBe('inicio');
    expect(findProgramForPath('').id).toBe('inicio');
  });

  it('matches a program route and its subpages, ignoring query and hash', () => {
    expect(findProgramForPath('/feed').id).toBe('feed');
    expect(findProgramForPath('/feed/123?x=1#c').id).toBe('feed');
  });

  it('does not match a route that only shares a prefix', () => {
    expect(findProgramForPath('/feedback-xyz')).toBe(GENERIC_PROGRAM);
  });

  it('prefers the longest matching route', () => {
    const nested = OS_PROGRAMS.find((program) =>
      OS_PROGRAMS.some((other) => other !== program && program.url.startsWith(`${other.url}/`)),
    );
    if (nested) expect(findProgramForPath(`${nested.url}/x`).id).toBe(nested.id);
  });

  it('falls back to the generic program', () => {
    expect(findProgramForPath('/no-existe')).toBe(GENERIC_PROGRAM);
  });
});

describe('visiblePrograms', () => {
  it('hides hidden programs and admin-only ones for members', () => {
    const member = visiblePrograms(false);
    const admin = visiblePrograms(true);
    expect(member.some((program) => program.hidden || program.adminOnly)).toBe(false);
    expect(admin.some((program) => program.hidden)).toBe(false);
    expect(admin.length).toBeGreaterThanOrEqual(member.length);
    if (OS_PROGRAMS.some((program) => program.adminOnly && !program.hidden))
      expect(admin.length).toBeGreaterThan(member.length);
  });
});
