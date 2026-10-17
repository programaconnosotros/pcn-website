import { formatDuration, galleryQuery, parseGalleryFilter } from './gallery-filters';

describe('gallery filters', () => {
  it('reads the filters from the URL, ignoring unknown types', () => {
    expect(parseGalleryFilter({ tipo: 'videos', evento: 'e1', persona: 'u1' })).toEqual({
      type: 'videos',
      eventId: 'e1',
      userId: 'u1',
    });
    expect(parseGalleryFilter({ tipo: 'trabajando' }).type).toBe('trabajando');
    expect(parseGalleryFilter({ tipo: 'gifs' })).toEqual({
      type: 'todo',
      eventId: undefined,
      userId: undefined,
    });
  });

  it('writes them back, leaving out the defaults', () => {
    expect(galleryQuery({ type: 'todo' })).toBe('');
    expect(galleryQuery({ type: 'fotos', eventId: 'e1' })).toBe('?tipo=fotos&evento=e1');
    expect(galleryQuery(parseGalleryFilter({ persona: 'u1' }))).toBe('?persona=u1');
  });

  it('formats video durations', () => {
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(750)).toBe('12:30');
    expect(formatDuration(3723)).toBe('1:02:03');
  });
});
