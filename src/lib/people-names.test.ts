import { displayName, splitPeople } from './people-names';

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

describe('displayName', () => {
  it('capitalizes words longer than three letters', () => {
    expect(displayName('juan pablo de la fuente')).toBe('Juan Pablo de la Fuente');
    expect(displayName('ana lópez')).toBe('ana López');
    expect(displayName('álvaro núñez del valle')).toBe('Álvaro Núñez del Valle');
  });

  it('keeps the rest of each word, and names already capitalized, as typed', () => {
    expect(displayName('Agustín Sánchez')).toBe('Agustín Sánchez');
    expect(displayName('ronald mcDonald')).toBe('Ronald McDonald');
    expect(displayName('JOSE')).toBe('JOSE');
  });

  it('treats each side of a hyphen as its own word, and keeps apostrophes inside one', () => {
    expect(displayName('maría-josé  pérez')).toBe('María-José  Pérez');
    expect(displayName("dan o'connor")).toBe("dan O'connor");
    expect(displayName('')).toBe('');
  });
});
