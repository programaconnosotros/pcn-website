import { FRASES } from './frases';
import { fraseAt, photoAt, PHOTOS, remainingMs, ROTATION_MS, slotAt } from './scene';

describe('motivación', () => {
  it('has unique, non-empty quotes, each with an author', () => {
    const texts = FRASES.map((frase) => frase.text);
    expect(new Set(texts).size).toBe(texts.length);
    for (const frase of FRASES) {
      expect(frase.text.trim()).not.toBe('');
      expect(frase.author.trim()).not.toBe('');
    }
  });

  it('changes the quote and the photo every 5 minutes, the same for everyone', () => {
    const start = 1_000 * ROTATION_MS;
    expect(slotAt(start)).toBe(slotAt(start + ROTATION_MS - 1));
    expect(slotAt(start + ROTATION_MS)).toBe(slotAt(start) + 1);
    expect(fraseAt(slotAt(start))).not.toEqual(fraseAt(slotAt(start + ROTATION_MS)));
    expect(photoAt(slotAt(start))).not.toBe(photoAt(slotAt(start + ROTATION_MS)));
  });

  it('cycles through every quote and photo', () => {
    expect(fraseAt(FRASES.length)).toBe(fraseAt(0));
    expect(photoAt(PHOTOS.length)).toBe(photoAt(0));
    expect(photoAt(-1)).toBe(PHOTOS.at(-1));
  });

  it('counts down to the next change', () => {
    expect(remainingMs(7 * ROTATION_MS)).toBe(ROTATION_MS);
    expect(remainingMs(7 * ROTATION_MS + 60_000)).toBe(ROTATION_MS - 60_000);
  });
});
