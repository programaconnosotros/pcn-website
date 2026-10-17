import manifest from './manifest';

describe('manifest', () => {
  it('describes an installable standalone app with any and maskable icons', () => {
    const result = manifest();

    expect(result).toMatchObject({
      name: 'programaConNosotros',
      short_name: 'PCN',
      display: 'standalone',
    });
    expect(result.icons?.map((icon) => icon.purpose)).toEqual([
      'any',
      'any',
      'maskable',
      'maskable',
    ]);
    expect(result.shortcuts?.map((shortcut) => shortcut.url)).toEqual([
      '/eventos',
      '/conversaciones',
      '/cursos',
      '/lectura',
    ]);
  });
});
