import { splitPeople } from './people-names';

describe('splitPeople', () => {
  it('splits commas, "y", "e", "&" and "and", dropping parentheses', () => {
    expect(splitPeople('Boris Cherny (Anthropic)')).toEqual(['Boris Cherny']);
    expect(splitPeople('Andrej Karpathy y Stephanie Zhan')).toEqual([
      'Andrej Karpathy',
      'Stephanie Zhan',
    ]);
    expect(splitPeople('Agustín Sánchez, Marcelo Núñez, Germán Navarro e Iván Taddei')).toEqual([
      'Agustín Sánchez',
      'Marcelo Núñez',
      'Germán Navarro',
      'Iván Taddei',
    ]);
    expect(splitPeople('Ana & Beto and Caro')).toEqual(['Ana', 'Beto', 'Caro']);
    expect(splitPeople(undefined)).toEqual([]);
  });
});
