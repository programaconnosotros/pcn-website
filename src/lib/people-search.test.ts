import { matchesPeopleQuery, personRowFilter, searchPeople } from './people-search';

const people = [
  { name: 'María Fernández', email: 'mafe@mail.com', job: 'QA @ Mercado Libre' },
  { name: 'Agustín Sánchez', email: 'agus@pcn.com', job: 'Dev @ Globant' },
  { name: 'Sancho Panza', email: 'sancho@mail.com', job: null },
];

const search = (query: string) =>
  searchPeople(people, query, {
    name: (person) => person.name,
    fields: (person) => [person.name, person.email, person.job],
  }).map((person) => person.name);

describe('matchesPeopleQuery', () => {
  it('matches any part of the name, ignoring case and accents', () => {
    expect(matchesPeopleQuery(['Agustín Sánchez'], 'sanchez')).toBe(true);
    expect(matchesPeopleQuery(['Agustín Sánchez'], 'TIN')).toBe(true);
    expect(matchesPeopleQuery(['Agustín Sánchez'], 'perez')).toBe(false);
  });

  it('needs every word, in any order and across fields', () => {
    expect(matchesPeopleQuery(['Agustín Sánchez', 'Globant'], 'globant agus')).toBe(true);
    expect(matchesPeopleQuery(['Agustín Sánchez', 'Globant'], 'globant maria')).toBe(false);
  });

  it('matches everything on an empty query', () => {
    expect(matchesPeopleQuery(['x'], '  ')).toBe(true);
  });
});

describe('searchPeople', () => {
  it('searches by email and job too', () => {
    expect(search('pcn.com')).toEqual(['Agustín Sánchez']);
    expect(search('mercado')).toEqual(['María Fernández']);
  });

  it('ranks names that start with the query first', () => {
    expect(search('sanc')).toEqual(['Sancho Panza', 'Agustín Sánchez']);
  });

  it('respects the limit', () => {
    expect(
      searchPeople(people, 'a', { name: (p) => p.name, fields: (p) => [p.name], limit: 2 }),
    ).toHaveLength(2);
  });
});

describe('personRowFilter', () => {
  it('searches every text of the row except id and image', () => {
    const row = {
      original: { id: 'abc', image: 'https://cdn/x.png', name: 'Ana', enterprise: 'Acme' },
    };
    expect(personRowFilter(row, 'name', 'ana acme')).toBe(true);
    expect(personRowFilter(row, 'name', 'cdn')).toBe(false);
  });
});
