import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ImageResponse } from 'next/og';
import { renderTerminalCard } from './terminal-card';

jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation(function (
    this: { element: ReactElement; options: unknown },
    element: ReactElement,
    options: unknown,
  ) {
    this.element = element;
    this.options = options;
  }),
}));

const render = async (props: Parameters<typeof renderTerminalCard>[0]) => {
  const response = (await renderTerminalCard(props)) as unknown as {
    element: ReactElement;
    options: { width: number; height: number; fonts: { name: string; weight: number }[] };
  };
  return { ...response, html: renderToStaticMarkup(response.element) };
};

describe('renderTerminalCard', () => {
  it('renders the path, command, title, description and the site footer', async () => {
    const { html, options } = await render({
      path: 'eventos',
      command: 'cat evento.md',
      title: 'Meetup   de\n otoño',
      description: 'Una   noche de charlas',
      meta: ['3 de mayo'],
    });
    expect(ImageResponse).toHaveBeenCalledTimes(1);
    expect(options).toMatchObject({ width: 1200, height: 630 });
    expect(options.fonts.map(({ weight }) => weight)).toEqual([400, 700]);
    expect(html).toContain('~/eventos');
    expect(html).toContain('cat evento.md');
    expect(html).toContain('Meetup de otoño');
    expect(html).toContain('Una noche de charlas');
    expect(html).toContain('3 de mayo');
    expect(html).toContain('programaconnosotros.com');
    expect(html).toContain('font-size:72px');
  });

  it('shrinks long titles and truncates very long text', async () => {
    const { html } = await render({ path: 'p'.repeat(60), command: 'ls', title: 't'.repeat(120) });
    expect(html).toContain(`${'t'.repeat(89)}…`);
    expect(html).toContain('font-size:50px');
    expect(html).toContain(`~/${'p'.repeat(45)}…`);
  });

  it('uses a mid size for medium titles', async () => {
    const { html } = await render({ path: '', command: 'ls', title: 'x'.repeat(40) });
    expect(html).toContain('font-size:60px');
  });

  it('drops the footer address when three chips fill it and caps chips at three', async () => {
    const { html } = await render({
      path: '',
      command: 'ls',
      title: 'Home',
      meta: ['uno', 'dos', 'tres', 'cuatro', 'una etiqueta muy pero muy larga'],
    });
    expect(html).toContain('tres');
    expect(html).not.toContain('cuatro');
    expect(html).not.toContain('programaconnosotros.com');
  });

  it('truncates long chips', async () => {
    const { html } = await render({
      path: '',
      command: 'ls',
      title: 'Home',
      meta: ['una etiqueta muy pero muy larga'],
    });
    expect(html).toContain('una etiqueta muy pero…');
  });

  it('shows the avatar photo and a shorter description beside it', async () => {
    const { html } = await render({
      path: 'perfil/ana',
      command: 'whoami',
      title: 'Ana',
      description: 'd'.repeat(200),
      avatar: { src: 'data:image/png;base64,AAA', initials: 'A' },
    });
    expect(html).toContain('src="data:image/png;base64,AAA"');
    expect(html).toContain(`${'d'.repeat(99)}…`);
  });

  it('falls back to the initials without a photo', async () => {
    const { html } = await render({
      path: 'perfil/ana',
      command: 'whoami',
      title: 'Ana',
      avatar: { src: null, initials: 'AB' },
    });
    expect(html).not.toContain('<img');
    expect(html).toContain('>AB</div>');
  });
});
