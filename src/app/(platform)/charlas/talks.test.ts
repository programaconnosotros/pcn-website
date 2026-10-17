import { existsSync } from 'node:fs';
import path from 'node:path';
import { talks } from './talks';

describe('lightning talks', () => {
  it('have a name, a speaker, a valid date and local images that exist', () => {
    for (const talk of talks) {
      expect(talk.name.trim()).not.toBe('');
      expect(talk.speakerName.trim()).not.toBe('');
      expect(Number.isNaN(talk.date.getTime())).toBe(false);
      for (const image of [talk.portrait, ...(talk.slides ?? [])].filter(Boolean) as string[]) {
        if (image.startsWith('/'))
          expect([image, existsSync(path.join(process.cwd(), 'public', image))]).toEqual([
            image,
            true,
          ]);
      }
    }
  });
});
