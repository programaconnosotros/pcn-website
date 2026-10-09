import {
  EMPTY_RECOMMENDATION_FORM,
  fieldLabel,
  formatDuration,
  missingToPublish,
  parseDuration,
  parseRecommendation,
  parseYoutubeId,
  slugify,
  toRecommendationForm,
  type RecommendationData,
} from './recommendation-schema';

const form = (values: Partial<typeof EMPTY_RECOMMENDATION_FORM>) => ({
  ...EMPTY_RECOMMENDATION_FORM,
  ...values,
});

const ok = (result: ReturnType<typeof parseRecommendation>) => {
  if (!result.success) throw new Error(result.error);
  return result;
};

describe('parseYoutubeId', () => {
  it.each([
    'https://www.youtube.com/watch?v=HqB3t7046QE',
    'https://youtube.com/watch?v=HqB3t7046QE&t=10s',
    'https://youtu.be/HqB3t7046QE?si=abc',
    'https://www.youtube.com/embed/HqB3t7046QE?si=x',
    'https://m.youtube.com/shorts/HqB3t7046QE',
    'https://www.youtube.com/live/HqB3t7046QE',
  ])('reads the id from %s', (url) => {
    expect(parseYoutubeId(url)).toBe('HqB3t7046QE');
  });

  it.each([
    'https://vimeo.com/123',
    'https://www.youtube.com/watch?v=short',
    'javascript:alert(1)',
    'no es un link',
    'https://evil.com/watch?v=HqB3t7046QE',
  ])('rejects %s', (url) => {
    expect(parseYoutubeId(url)).toBeNull();
  });
});

describe('durations', () => {
  it('parses minutes:seconds, hours and plain seconds', () => {
    expect(parseDuration('34:31')).toBe(2071);
    expect(parseDuration('1:02:03')).toBe(3723);
    expect(parseDuration('90')).toBe(90);
    expect(parseDuration('')).toBeNull();
  });

  it('formats them back', () => {
    expect(formatDuration(2071)).toBe('34:31');
    expect(formatDuration(3723)).toBe('1:02:03');
    expect(formatDuration(null)).toBe('');
  });
});

describe('slugify', () => {
  it('makes a URL-friendly slug without accents', () => {
    expect(slugify('Introducción a Next.js & React')).toBe('introduccion-a-next-js-react');
    expect(slugify('¡¡!!')).toBe('recomendacion');
    expect(slugify('a'.repeat(80))).toHaveLength(60);
  });
});

describe('parseRecommendation', () => {
  it('takes a video with its YouTube id, dropping the link and what members cannot set', () => {
    const { data, youtubeId } = ok(
      parseRecommendation(
        'VIDEO',
        form({
          url: 'https://youtu.be/HqB3t7046QE',
          title: '  AI Won’t Replace Craftsmanship ',
          isTalk: true,
          duration: '34:31',
          publishedAt: '2026-10-06',
          isMadeByCommunity: true,
        }),
      ),
    );
    expect(youtubeId).toBe('HqB3t7046QE');
    expect(data).toMatchObject({
      title: 'AI Won’t Replace Craftsmanship',
      url: null,
      isTalk: true,
      // Admin-only fields are ignored for members.
      durationSeconds: null,
      publishedAt: null,
      isMadeByCommunity: false,
      language: 'es',
    });
  });

  it('lets admins set every field the listing shows', () => {
    const { data } = ok(
      parseRecommendation(
        'VIDEO',
        form({
          url: 'https://youtu.be/HqB3t7046QE',
          title: 'Charla',
          duration: '34:31',
          publishedAt: '2026-10-06',
        }),
        { asAdmin: true },
      ),
    );
    expect(data.durationSeconds).toBe(2071);
    expect(data.publishedAt).toEqual(new Date('2026-10-06T00:00:00.000Z'));
  });

  it('requires a YouTube link for videos', () => {
    expect(parseRecommendation('VIDEO', form({ url: 'https://vimeo.com/1', title: 'x' }))).toEqual({
      success: false,
      error: 'El link tiene que ser de un video de YouTube',
    });
  });

  it('asks for what each kind needs', () => {
    expect(parseRecommendation('ARTICLE', form({ url: 'https://a.dev', title: 'x' }))).toEqual({
      success: false,
      error: 'Completá autor',
    });
    expect(parseRecommendation('BOOK', form({ author: 'Ana' }))).toEqual({
      success: false,
      error: 'Completá título',
    });
    expect(parseRecommendation('COURSE', form({ title: 'x', author: 'y' }))).toEqual({
      success: false,
      error: 'Completá web del curso',
    });
  });

  it('takes an article, with its site from the link and its categories', () => {
    const { data } = ok(
      parseRecommendation(
        'ARTICLE',
        form({
          url: 'https://www.addyosmani.com/blog/loop/',
          title: 'Loop Engineering',
          author: 'Addy Osmani',
          categories: 'IA, Programación',
          language: 'en',
          note: 'Muy bueno',
        }),
      ),
    );
    expect(data).toMatchObject({
      url: 'https://www.addyosmani.com/blog/loop/',
      source: 'addyosmani.com',
      categories: ['IA', 'Programación'],
      language: 'en',
      note: 'Muy bueno',
    });
  });

  it('rejects links and images that are not http(s)', () => {
    expect(
      parseRecommendation('ARTICLE', form({ url: 'javascript:alert(1)', title: 'x', author: 'y' })),
    ).toEqual({ success: false, error: 'El link tiene que empezar con https://' });
    expect(
      parseRecommendation(
        'BOOK',
        form({ title: 'x', author: 'y', imageUrl: 'data:image/png;base64,AAA' }),
        { asAdmin: true },
      ),
    ).toMatchObject({ success: false });
    expect(
      parseRecommendation('BOOK', form({ title: 'x', author: 'y', imageUrl: '//evil.com/a.png' }), {
        asAdmin: true,
      }),
    ).toMatchObject({ success: false });
  });

  it('takes a book with its ISBN normalized and its year', () => {
    const { data } = ok(
      parseRecommendation(
        'BOOK',
        form({
          title: 'Clean Code',
          author: 'Robert C. Martin',
          isbn: '0-13-235088-x',
          year: '2008',
        }),
      ),
    );
    expect(data).toMatchObject({ isbn: '013235088X', year: 2008, url: null });
  });

  it('takes a course without a language and normalizes its YouTube videos to embeds', () => {
    const { data } = ok(
      parseRecommendation(
        'COURSE',
        form({
          url: 'https://nextjs.org/learn',
          title: 'Next.js',
          author: 'Vercel',
          youtubeUrls:
            'https://www.youtube.com/watch?v=WlB2fzl1vO8\nhttps://www.youtube.com/embed/C-C4xoCj_Lw?si=x',
          hours: '12',
          isMadeByCommunity: true,
        }),
        { asAdmin: true },
      ),
    );
    expect(data).toMatchObject({
      language: null,
      hours: 12,
      isMadeByCommunity: true,
      youtubeUrls: [
        'https://www.youtube.com/embed/WlB2fzl1vO8',
        'https://www.youtube.com/embed/C-C4xoCj_Lw?si=x',
      ],
    });
    expect(
      parseRecommendation(
        'COURSE',
        form({ url: 'https://x.dev', title: 'x', author: 'y', youtubeUrls: 'https://vimeo.com/1' }),
        { asAdmin: true },
      ),
    ).toEqual({ success: false, error: 'No es un video de YouTube: https://vimeo.com/1' });
  });

  it('rejects malformed input', () => {
    expect(parseRecommendation('BOOK', { title: 'x'.repeat(201) })).toMatchObject({
      success: false,
      error: 'Máximo 200 caracteres',
    });
    expect(parseRecommendation('BOOK', { year: 'dos mil' })).toMatchObject({ success: false });
    expect(parseRecommendation('BOOK', 'nada')).toMatchObject({ success: false });
  });
});

describe('missingToPublish', () => {
  const empty: RecommendationData = {
    ...ok(parseRecommendation('BOOK', form({ title: 't', author: 'a' }))).data,
    title: '',
    author: null,
  };

  it('lists what a video needs before it shows up', () => {
    expect(missingToPublish('VIDEO', { ...empty, title: 'Charla' })).toEqual([
      'canal',
      'publicado',
      'duración',
    ]);
    expect(
      missingToPublish('VIDEO', {
        ...empty,
        title: 'Charla',
        source: 'Manfred',
        publishedAt: new Date(),
        durationSeconds: 60,
      }),
    ).toEqual([]);
  });

  it('lists what articles, books and courses need', () => {
    expect(missingToPublish('ARTICLE', { ...empty, title: 'x' })).toEqual([
      'autor',
      'descripción',
      'link',
      'sitio',
      'categoría',
      'fecha',
    ]);
    expect(missingToPublish('BOOK', { ...empty, title: 'x', author: 'y' })).toEqual([
      'descripción',
      'categorías',
    ]);
    expect(
      missingToPublish('COURSE', {
        ...empty,
        title: 'x',
        author: 'y',
        description: 'z',
        youtubeUrls: ['https://www.youtube.com/embed/x'],
      }),
    ).toEqual([]);
  });
});

describe('toRecommendationForm', () => {
  it('turns an item back into the form, rebuilding a video’s link', () => {
    const values = toRecommendationForm({
      kind: 'VIDEO',
      slug: 'HqB3t7046QE',
      url: null,
      title: 'Charla',
      author: 'Javi',
      coauthors: [],
      source: 'Manfred',
      categories: [],
      language: 'en',
      publishedAt: new Date('2026-10-06T00:00:00.000Z'),
      year: null,
      imageUrl: null,
      isbn: null,
      durationSeconds: 2071,
      hours: null,
      youtubeUrls: [],
      description: '',
      isTalk: true,
      isMadeByCommunity: false,
      acceptDonations: false,
      note: null,
    });
    expect(values).toMatchObject({
      url: 'https://www.youtube.com/watch?v=HqB3t7046QE',
      publishedAt: '2026-10-06',
      duration: '34:31',
      language: 'en',
      isTalk: true,
      note: '',
    });
    expect(ok(parseRecommendation('VIDEO', values, { asAdmin: true })).data).toMatchObject({
      durationSeconds: 2071,
      source: 'Manfred',
    });
  });
});

describe('fieldLabel', () => {
  it('names a field the way each kind calls it', () => {
    expect(fieldLabel('VIDEO', 'source')).toBe('canal');
    expect(fieldLabel('ARTICLE', 'source')).toBe('sitio');
    expect(fieldLabel('COURSE', 'author')).toBe('lo dicta');
  });
});
