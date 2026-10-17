import { workPlaceSchema } from './work-place-schema';

const place = {
  name: 'Café Tortoni',
  city: 'Buenos Aires',
  address: '',
  googleMapsUrl: '',
  wifi: 4,
  plugs: 3,
  calls: 2,
  foodQuality: null,
  foodVariety: null,
  notes: '',
  photoUrl: '',
};

const messages = (input: unknown) =>
  workPlaceSchema.safeParse(input).error?.issues.map((issue) => issue.message) ?? [];

describe('workPlaceSchema', () => {
  it('accepts a place without food, turning empty texts into null', () => {
    expect(workPlaceSchema.parse(place)).toMatchObject({
      address: null,
      googleMapsUrl: null,
      notes: null,
      photoUrl: null,
      foodQuality: null,
    });
  });

  it('asks for every 1–5 score', () => {
    expect(messages({ ...place, wifi: 0, calls: 6 })).toEqual([
      'Elegí un puntaje',
      'El puntaje va de 1 a 5',
    ]);
  });

  it('only takes Google Maps links and https photos', () => {
    expect(messages({ ...place, googleMapsUrl: 'https://evil.dev/maps' })).toEqual([
      'Tiene que ser un link de Google Maps',
    ]);
    expect(messages({ ...place, googleMapsUrl: 'https://maps.app.goo.gl/abc' })).toEqual([]);
    expect(messages({ ...place, photoUrl: 'javascript:alert(1)' })).toEqual([
      'La foto tiene que ser una URL https',
    ]);
  });
});
