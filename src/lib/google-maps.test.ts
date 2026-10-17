import {
  googleMapsEmbedUrl,
  googleMapsQuery,
  googleMapsSearchUrl,
  isGoogleMapsUrl,
} from './google-maps';

describe('isGoogleMapsUrl', () => {
  it.each([
    'https://www.google.com/maps?q=-26.844408,-65.22264',
    'https://www.google.com/maps/place/UTN-FRT/@-26.84,-65.22,17z',
    'https://google.com.ar/maps/search/UTN',
    'https://maps.google.com/?q=UTN',
    'https://maps.google.com.ar/maps?q=UTN',
    'https://maps.app.goo.gl/AbCdEf123',
    'https://goo.gl/maps/AbCdEf123',
    '  https://www.google.com/maps  ',
  ])('accepts %s', (url) => {
    expect(isGoogleMapsUrl(url)).toBe(true);
  });

  it.each([
    '',
    'no es una url',
    'https://www.google.com/search?q=utn',
    'https://goo.gl/AbCdEf',
    'https://evil.example/maps?q=1,2',
    'https://maps.google.com.evil.example/',
    'javascript:alert(1)',
    'ftp://maps.google.com/',
  ])('rejects %s', (url) => {
    expect(isGoogleMapsUrl(url)).toBe(false);
  });
});

describe('googleMapsQuery', () => {
  it('reads the q parameter', () => {
    expect(googleMapsQuery('https://www.google.com/maps?q=-26.844408,-65.22264')).toBe(
      '-26.844408,-65.22264',
    );
    expect(googleMapsQuery('https://maps.google.com/?q=UTN+FRT')).toBe('UTN FRT');
  });

  it('reads the query parameter of a search link', () => {
    expect(
      googleMapsQuery(
        'https://www.google.com/maps/search/?api=1&query=Bernardino%20Rivadavia%201050',
      ),
    ).toBe('Bernardino Rivadavia 1050');
  });

  it('prefers the pin of a shared place over the viewport', () => {
    expect(
      googleMapsQuery(
        'https://www.google.com/maps/place/UTN-FRT/@-26.8,-65.2,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d-26.844408!4d-65.22264',
      ),
    ).toBe('-26.844408,-65.22264');
  });

  it('falls back to the place name', () => {
    expect(googleMapsQuery('https://www.google.com/maps/place/UTN+-+FRT/@-26.8,-65.2,17z')).toBe(
      'UTN - FRT',
    );
  });

  it('falls back to the viewport centre', () => {
    expect(googleMapsQuery('https://www.google.com/maps/@-26.8444,-65.2226,17z')).toBe(
      '-26.8444,-65.2226',
    );
  });

  it('returns null for short links and non-Maps URLs', () => {
    expect(googleMapsQuery('https://maps.app.goo.gl/AbCdEf123')).toBeNull();
    expect(googleMapsQuery('https://goo.gl/maps/AbCdEf123')).toBeNull();
    expect(googleMapsQuery('https://evil.example/maps?q=1,2')).toBeNull();
    expect(googleMapsQuery('https://www.google.com/maps')).toBeNull();
  });
});

describe('googleMapsEmbedUrl', () => {
  it('embeds what the link points to', () => {
    expect(googleMapsEmbedUrl('https://www.google.com/maps?q=-26.844408,-65.22264')).toBe(
      'https://www.google.com/maps?q=-26.844408%2C-65.22264&z=15&output=embed',
    );
  });

  it('falls back to the address for short links', () => {
    expect(googleMapsEmbedUrl('https://maps.app.goo.gl/AbCdEf123', 'UTN-FRT, Tucumán')).toBe(
      'https://www.google.com/maps?q=UTN-FRT%2C%20Tucum%C3%A1n&z=15&output=embed',
    );
  });

  it('returns null with nothing to show', () => {
    expect(googleMapsEmbedUrl('https://maps.app.goo.gl/AbCdEf123')).toBeNull();
    expect(googleMapsEmbedUrl(null, '  ')).toBeNull();
  });
});

describe('googleMapsSearchUrl', () => {
  it('builds a search link', () => {
    expect(googleMapsSearchUrl('UTN-FRT, Tucumán')).toBe(
      'https://www.google.com/maps/search/?api=1&query=UTN-FRT%2C%20Tucum%C3%A1n',
    );
  });
});
