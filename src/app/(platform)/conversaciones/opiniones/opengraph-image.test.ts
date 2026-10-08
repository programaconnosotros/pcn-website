import { technologyTimelines } from '@/data/opiniones-tecnologia';
import { readOgImage } from '@/test/pages-a-l';
import Image, { alt, size } from './opengraph-image';
import TwitterImage from './twitter-image';

jest.mock('next/og', () => require('@/test/pages-a-l').nextOgMock);

describe('/conversaciones/opiniones card', () => {
  it('has its own title, path and counts', async () => {
    const { options, text } = await readOgImage(Image());
    expect(options).toMatchObject(size);
    expect(alt).toBe('Qué opina la comunidad de cada tecnología · programaConNosotros');
    expect(text).toContain('~/conversaciones/opiniones');
    expect(text).toContain('Qué opina la comunidad de cada tecnología');
    const timelines = technologyTimelines.filter(({ opinions }) => opinions.length > 0);
    expect(text).toContain(`${timelines.length} tecnologías`);
  });

  it('is the same card on Twitter', () => {
    expect(TwitterImage).toBe(Image);
  });
});
