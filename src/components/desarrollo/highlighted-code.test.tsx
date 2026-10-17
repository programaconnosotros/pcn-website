import { render } from '@testing-library/react';
import { createHighlighter } from 'shiki';
import { HighlightedCode } from './highlighted-code';

jest.mock('shiki', () => ({ createHighlighter: jest.fn() }));

const codeToHtml = jest.fn(
  (code: string, { lang }: { lang: string }) => `<pre class="${lang}">${code}</pre>`,
);

describe('HighlightedCode', () => {
  beforeAll(() => {
    jest.mocked(createHighlighter).mockResolvedValue({ codeToHtml } as never);
  });

  it.each([
    ['ts', 'ts'],
    ['sh', 'bash'],
    ['tree', 'text'],
    ['cobol', 'text'],
  ])('highlights "%s" as %s', async (lang, expected) => {
    const { container } = render(await HighlightedCode({ code: 'x = 1', lang }));

    expect(codeToHtml).toHaveBeenLastCalledWith('x = 1', { lang: expected, theme: 'vitesse-dark' });
    expect(container.querySelector(`pre.${expected}`)).toHaveTextContent('x = 1');
  });

  it('creates the highlighter only once for many blocks', async () => {
    await HighlightedCode({ code: 'a', lang: 'ts' });
    await HighlightedCode({ code: 'b', lang: 'ts' });
    // Already created by the first test; clearMocks reset the count.
    expect(createHighlighter).not.toHaveBeenCalled();
    expect(codeToHtml).toHaveBeenCalledTimes(2);
  });
});
