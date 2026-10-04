import robots from './robots';

describe('robots', () => {
  it('allows the site, keeps private and admin pages out and points to the sitemap', () => {
    const result = robots();
    const rules = result.rules as { userAgent: string; allow: string; disallow: string[] };

    expect(rules).toMatchObject({ userAgent: '*', allow: '/' });
    expect(rules.disallow).toEqual(
      expect.arrayContaining(['/api/', '/autenticacion/', '/eventos/*/editar']),
    );
    expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});
