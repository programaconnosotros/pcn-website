import { osTabTitle, tabSlug, tabTitle, tabTitleSubject } from './tab-title';

describe('tabSlug', () => {
  it('drops accents and punctuation', () => {
    expect(tabSlug('Juan Pérez')).toBe('juan-perez');
    expect(tabSlug('PCN Meetup #5 — Noviembre!')).toBe('pcn-meetup-5-noviembre');
  });

  it('cuts long names at a word boundary', () => {
    expect(tabSlug('Designing Data-Intensive Applications and more', 24)).toBe(
      'designing-data-intensive',
    );
  });

  it('never returns an empty slug', () => {
    expect(tabSlug('¡¿?!')).toBe('untitled');
  });
});

describe('tabTitle', () => {
  it('builds shell commands', () => {
    expect(tabTitle.ls('eventos')).toBe('ls ~/eventos');
    expect(tabTitle.cat('consejos', 'Ana Gómez')).toBe('cat ~/consejos/ana-gomez');
    expect(tabTitle.sudo('usuarios')).toBe('sudo ls ~/usuarios');
  });
});

describe('tabTitleSubject', () => {
  it('returns what a nested path points at', () => {
    expect(tabTitleSubject('cat ~/eventos/pcn-meetup-5 · pcn')).toBe('pcn-meetup-5');
    expect(tabTitleSubject('vim ~/eventos/*/editar · pcn')).toBe('editar');
  });

  it('ignores top-level listings and plain commands', () => {
    expect(tabTitleSubject('ls ~/eventos · pcn')).toBeNull();
    expect(tabTitleSubject('git log · pcn')).toBeNull();
    expect(tabTitleSubject('programaConNosotros:~$')).toBeNull();
    expect(tabTitleSubject(null)).toBeNull();
  });
});

describe('osTabTitle', () => {
  it('follows the focused window', () => {
    expect(osTabTitle('ls ~/eventos · pcn', 'Eventos')).toBe('ls ~/eventos · pcn-os');
    expect(osTabTitle('programaConNosotros:~$', 'Inicio')).toBe('pcn-os:~$');
    expect(osTabTitle(null, 'Series y películas')).toBe('cd ~/series-y-peliculas · pcn-os');
  });
});

describe('tabSlug edge cases', () => {
  it('keeps a slug that fits exactly', () => {
    expect(tabSlug('abcd', 4)).toBe('abcd');
  });

  it('cuts right before a dash without dropping the last word', () => {
    expect(tabSlug('hola mundo cruel', 10)).toBe('hola-mundo');
  });

  it('cuts mid-word when the last dash is too early', () => {
    expect(tabSlug('ab supercalifragilistico', 10)).toBe('ab-superca');
    expect(tabSlug('supercalifragilistico', 8)).toBe('supercal');
  });
});

describe('tabTitle commands', () => {
  it('builds every command', () => {
    expect(tabTitle.open('galeria', 'Foto del meetup')).toBe('open ~/galeria/foto-del-meetup');
    expect(tabTitle.vim('eventos/1/editar')).toBe('vim ~/eventos/1/editar');
    expect(tabTitle.touch('eventos/nuevo')).toBe('touch ~/eventos/nuevo');
    expect(tabTitle.sudo('usuarios')).toBe('sudo ls ~/usuarios');
  });
});
