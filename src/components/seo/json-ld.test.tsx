import { render } from '@testing-library/react';
import { JsonLd, serializeJsonLd, website } from './json-ld';

describe('JsonLd', () => {
  it('renders the data as a JSON-LD block', () => {
    const { container } = render(<JsonLd data={{ '@type': 'Thing', name: 'x' }} />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    expect(JSON.parse(script.textContent!)).toEqual({ '@type': 'Thing', name: 'x' });
  });

  it("escapes text that could close the script tag, so a member's title can't inject HTML", () => {
    const json = serializeJsonLd({ headline: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('</script>');
    expect(JSON.parse(json).headline).toBe('</script><script>alert(1)</script>');
  });

  it('describes the site as published by the community, spelled programaConNosotros', () => {
    expect(website['@graph'][0]).toMatchObject({
      '@type': 'Organization',
      name: 'programaConNosotros',
    });
    expect(website['@graph'][1]).toMatchObject({ '@type': 'WebSite', inLanguage: 'es' });
  });
});
