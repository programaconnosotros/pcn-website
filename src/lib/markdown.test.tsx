import { render, screen } from '@testing-library/react';
import { Markdown, plainText } from './markdown';

describe('Markdown', () => {
  it('renders headings, lists, quotes, code and rules', () => {
    const { container } = render(
      <Markdown
        content={[
          '# Título',
          '',
          'Un párrafo',
          'en dos líneas',
          '',
          '- uno',
          '- dos',
          '',
          '1. primero',
          '2. segundo',
          '',
          '> una cita',
          '',
          '```ts',
          'const a = 1 < 2;',
          '```',
          '',
          '---',
        ].join('\n')}
      />,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('# Título');
    expect(container.querySelector('p')?.innerHTML).toContain('<br>');
    expect(container.querySelectorAll('ul li')).toHaveLength(2);
    expect(container.querySelectorAll('ol li')).toHaveLength(2);
    expect(container.querySelector('blockquote')).toHaveTextContent('una cita');
    expect(container.querySelector('pre')).toHaveAttribute('data-language', 'ts');
    expect(container.querySelector('pre code')).toHaveTextContent('const a = 1 < 2;');
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('formats inline code, bold, italics and links', () => {
    render(
      <Markdown content="Usá `pnpm`, **siempre** y _con calma_: [docs](https://pnpm.io) o https://nodejs.org." />,
    );

    expect(screen.getByText('pnpm', { selector: 'code' })).toBeInTheDocument();
    expect(screen.getByText('siempre', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('con calma', { selector: 'em' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute('href', 'https://pnpm.io');
    const bare = screen.getByRole('link', { name: 'https://nodejs.org' });
    expect(bare).toHaveAttribute('rel', 'noopener noreferrer nofollow ugc');
  });

  it('never renders HTML or unsafe links', () => {
    const { container } = render(
      <Markdown
        content={'<script>alert(1)</script> [x](javascript:alert(1)) <img src=x onerror=alert(1)>'}
      />,
    );

    expect(container.querySelector('script, img')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(container).toHaveTextContent('<script>alert(1)</script>');
    expect(container).toHaveTextContent('[x](javascript:alert(1))');
  });

  it('keeps snake_case and math asterisks as text', () => {
    const { container } = render(<Markdown content="usá my_var_name y 2*3*4" />);
    expect(container.querySelector('em')).toBeNull();
  });

  it('closes an unterminated code fence at the end', () => {
    const { container } = render(<Markdown content={'```\nsin cerrar'} />);
    expect(container.querySelector('pre')).toHaveTextContent('sin cerrar');
  });
});

describe('plainText', () => {
  it('drops the markdown syntax', () => {
    expect(plainText('# Hola\n**mundo** [link](https://a.b)\n```\ncode\n```\n> cita')).toBe(
      'Hola mundo link cita',
    );
  });
});
