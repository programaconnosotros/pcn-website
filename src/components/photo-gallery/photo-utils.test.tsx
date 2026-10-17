import { formatPhotoDate, padIndex, photoCaption, photoFileName } from './photo-utils';
import { toDateTimeInput } from './date-input';

describe('photo utils', () => {
  const takenAt = new Date(2024, 6, 30, 18, 5);

  it('formats dates for captions and datetime inputs', () => {
    expect(formatPhotoDate(takenAt)).toBe('2024-07-30');
    expect(toDateTimeInput(takenAt)).toBe('2024-07-30T18:05');
  });

  it('names downloads after the public file or the upload date and id', () => {
    expect(photoFileName({ id: 'x', src: '/fotos/meetup.jpg', takenAt })).toBe('meetup.jpg');
    expect(photoFileName({ id: 'x', src: '/', takenAt })).toBe('');
    expect(photoFileName({ id: 'abcdef123456', src: 'gallery/v.mp4', takenAt })).toBe(
      'pcn-2024-07-30-123456.mp4',
    );
  });

  it('captions with the description, the event or a default', () => {
    const base = { id: 'x', src: 's', takenAt, description: null, event: null };
    expect(photoCaption({ ...base, description: 'Brindis' })).toBe('Brindis');
    expect(photoCaption({ ...base, event: { name: 'Meetup' } })).toBe('Meetup');
    expect(photoCaption(base)).toBe('Foto de la comunidad');
  });

  it('pads indexes to the width of the total', () => {
    expect(padIndex(7, 94)).toBe('07');
    expect(padIndex(7, 120)).toBe('007');
  });
});
