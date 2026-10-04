import { screen } from '@testing-library/react';
import { faqs } from '@/data/faqs';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import FAQPage, { metadata } from './page';

jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

describe('/preguntas-frecuentes', () => {
  it('is titled like a man page and shares a readable card', () => {
    expect(metadata.title).toBe('man pcn');
    expect(metadata.openGraph).toMatchObject({
      title: 'Preguntas frecuentes | programaConNosotros',
    });
  });

  it('numbers every question with its answer', async () => {
    await renderPage(FAQPage());

    expect(screen.getByText(`${faqs.length} preguntas`)).toBeInTheDocument();
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(faqs.length);
    expect(headings[0]).toHaveTextContent(`01 ${faqs[0].question}`);
    expect(screen.getByText(faqs.at(-1)!.answer)).toBeInTheDocument();
  });

  it('uses the FAQ section card for link previews', async () => {
    expect(alt).toBe('preguntas-frecuentes · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'preguntas-frecuentes' });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
