import { fullTextQuery } from './full-text';

describe('fullTextQuery', () => {
  it('turns every word into a required prefix, without accents or punctuation', () => {
    expect(fullTextQuery('¿Programación en CI/CD?')).toEqual({
      prefixes: 'programacion:* & en:* & ci:* & cd:*',
      text: 'programacion en ci cd',
      typos: true,
    });
  });

  it('only tolerates typos from four characters on', () => {
    expect(fullTextQuery('git')?.typos).toBe(false);
    expect(fullTextQuery('reakt')?.typos).toBe(true);
  });

  it('has nothing to search for in punctuation alone', () => {
    expect(fullTextQuery(' ¿?! ')).toBeNull();
  });
});
