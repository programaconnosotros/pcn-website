// Helpers for the route-file tests of the (platform) pages (opengraph-image, loading).
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

/**
 * Stands in for `next/og`'s ImageResponse, keeping the element so tests can read the card:
 * `jest.mock('next/og', () => require('@/test/pages-a-l').nextOgMock);`
 */
export class FakeImageResponse {
  readonly element: ReactElement;
  readonly options: { width: number; height: number };

  constructor(element: ReactElement, options: { width: number; height: number }) {
    this.element = element;
    this.options = options;
  }
}
export const nextOgMock = { ImageResponse: FakeImageResponse };

/** Awaits an `opengraph-image` result and returns its options and visible text. */
export const readOgImage = async (image: unknown) => {
  const response = (await image) as FakeImageResponse;
  expect(response).toBeInstanceOf(FakeImageResponse);
  const text = renderToStaticMarkup(response.element)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
  return { options: response.options, text };
};

interface SectionImageModule {
  default: () => unknown;
  alt: string;
  size: { width: number; height: number };
  contentType: string;
}

/** The shared assertions for a section's static `opengraph-image.tsx`. */
export const describeSectionOgImage = (
  image: SectionImageModule,
  { path, title }: { path: string; title: string },
) => {
  describe('opengraph-image', () => {
    it('declares a 1200×630 PNG with the section name as alt text', () => {
      expect(image.size).toEqual({ width: 1200, height: 630 });
      expect(image.contentType).toBe('image/png');
      expect(image.alt).toBe(`${title} · programaConNosotros`);
    });

    it('renders the section terminal card', async () => {
      const { options, text } = await readOgImage(image.default());
      expect(options).toMatchObject({ width: 1200, height: 630 });
      expect(text).toContain(path ? `~/${path}` : '~');
      expect(text).toContain(title);
    });
  });
};
