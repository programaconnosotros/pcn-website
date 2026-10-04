import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import * as Aws from './AwsSVG';
import * as Docker from './DockerSVG';
import * as GitHubMark from './GitHubMarkSVG';
import * as GitHub from './GitHubSVG';
import * as Git from './GitSVG';
import * as Kamal from './KamalSVG';
import * as LinkedIn from './LinkedInSVG';
import * as NextJs from './NextJsSVG';
import * as Postgresql from './PostgresqlSVG';
import * as Prisma from './PrismaSVG';
import * as ReactLogo from './ReactSVG';
import * as Tailwind from './TailwindSVG';
import * as Typescript from './TypescriptSVG';
import * as XLogo from './XLogoSVG';
import * as CSharp from './programming-languages/CSharpSVG';
import * as Cplusplus from './programming-languages/CplusplusSVG';
import * as Go from './programming-languages/GoSVG';
import * as Java from './programming-languages/JavaSVG';
import * as Javascript from './programming-languages/JavascriptSVG';
import * as Php from './programming-languages/PhpSVG';
import * as Python from './programming-languages/PythonSVG';
import * as Ruby from './programming-languages/RubySVG';
import * as Rust from './programming-languages/RustSVG';
import * as Swift from './programming-languages/SwiftSVG';
import * as TypeScriptLang from './programming-languages/TypeScriptSVG';
import { LogoContainer } from './LogoContainer';

const languages = {
  ...CSharp,
  ...Cplusplus,
  ...Go,
  ...Java,
  ...Javascript,
  ...Php,
  ...Python,
  ...Ruby,
  ...Rust,
  ...Swift,
  ...TypeScriptLang,
};

const logos = Object.entries({
  ...Aws,
  ...Docker,
  ...GitHubMark,
  ...GitHub,
  ...Git,
  ...Kamal,
  ...LinkedIn,
  ...NextJs,
  ...Postgresql,
  ...Prisma,
  ...ReactLogo,
  ...Tailwind,
  ...Typescript,
  ...XLogo,
  ...languages,
}) as [string, ComponentType<{ className?: string }>][];

describe('logos', () => {
  it.each(logos)('%s renders an svg', (_name, Logo) => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  const withoutClassName = new Set(['LinkedInSVG', 'XLogoSVG', ...Object.keys(languages)]);
  it.each(logos.filter(([name]) => !withoutClassName.has(name)))(
    '%s takes a className',
    (_name, Logo) => {
      const { container } = render(<Logo className="size-9" />);
      expect(container.querySelector('.size-9')).toBeInTheDocument();
    },
  );

  it('LogoContainer wraps its children', () => {
    const { getByText, container } = render(
      <LogoContainer className="extra">
        <span>logo</span>
      </LogoContainer>,
    );
    expect(getByText('logo')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('extra');
  });
});
