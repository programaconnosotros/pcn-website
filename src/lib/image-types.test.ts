import { ALLOWED_IMAGE_TYPES, isAllowedImage } from './image-types';

describe('isAllowedImage', () => {
  it.each(ALLOWED_IMAGE_TYPES)('accepts %s', (type) => {
    expect(isAllowedImage({ type })).toBe(true);
  });

  it.each(['application/pdf', 'image/svg+xml', 'text/html', ''])('rejects %p', (type) => {
    expect(isAllowedImage({ type })).toBe(false);
  });
});
