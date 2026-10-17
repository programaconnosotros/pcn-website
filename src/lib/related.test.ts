import { keywords, rankRelated } from './related';

describe('keywords', () => {
  it('keeps meaningful words, lowercase and without accents', () => {
    expect([...keywords('Aprendé Programación con Node.js')]).toEqual(['programacion', 'node']);
  });

  it('drops short words and stopwords', () => {
    expect([...keywords('para el curso de la web')]).toEqual(['web']);
  });

  it('keeps symbols that are part of a language name', () => {
    expect([...keywords('Curso de C++ y F#')]).toEqual(['c++']);
  });
});

describe('rankRelated', () => {
  const items = [
    { id: 'a', text: 'Docker para principiantes' },
    { id: 'b', text: 'Kubernetes y Docker en producción' },
    { id: 'c', text: 'Diseño UX' },
    { id: 'd', text: 'Más Kubernetes' },
  ];

  it('ranks by shared keywords, most related first', () => {
    const ranked = rankRelated('Docker y Kubernetes', items, (item) => item.text);
    expect(ranked.map((item) => item.id)).toEqual(['b', 'a', 'd', 'c']);
  });

  it('keeps the original order on ties', () => {
    expect(rankRelated('nada en común', items, (item) => item.text)).toEqual(items);
  });

  it('handles an empty list', () => {
    expect(rankRelated('docker', [], String)).toEqual([]);
  });
});
