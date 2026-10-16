import { formatEventWhen, formatEventWhere } from './event-notices';

describe('formatEventWhen', () => {
  it('reads the date and time in Argentina', () => {
    expect(formatEventWhen(new Date('2026-08-15T18:00:00.000Z'))).toMatch(
      /sábado, 15 de agosto de 2026.*15:00/,
    );
  });
});

describe('formatEventWhere', () => {
  it('says online, the known parts of the place, or that it is to be confirmed', () => {
    expect(formatEventWhere({ isOnline: true, city: 'Tucumán' })).toBe('online');
    expect(
      formatEventWhere({ isOnline: false, placeName: 'Aula 1', address: null, city: 'Tucumán' }),
    ).toBe('Aula 1, Tucumán');
    expect(formatEventWhere({ isOnline: false })).toBe('a confirmar');
  });
});
