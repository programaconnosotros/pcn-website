import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import * as Aws from './AwsSVG';
import * as Docker from './DockerSVG';
import * as GitHubMark from './GitHubMarkSVG';
import * as GitHub from './GitHubSVG';
import * as Git from './GitSVG';
import * as Kamal from './KamalSVG';
import * as NextJs from './NextJsSVG';
import * as Postgresql from './PostgresqlSVG';
import * as Prisma from './PrismaSVG';
import * as ReactLogo from './ReactSVG';
import * as Tailwind from './TailwindSVG';
import * as Typescript from './TypescriptSVG';

const logos = Object.entries({
  ...Aws,
  ...Docker,
  ...GitHubMark,
  ...GitHub,
  ...Git,
  ...Kamal,
  ...NextJs,
  ...Postgresql,
  ...Prisma,
  ...ReactLogo,
  ...Tailwind,
  ...Typescript,
}) as [string, ComponentType<{ className?: string }>][];

describe('logos', () => {
  it.each(logos)('%s renders an svg', (_name, Logo) => {
    const { container } = render(<Logo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it.each(logos)('%s takes a className', (_name, Logo) => {
    const { container } = render(<Logo className="size-9" />);
    expect(container.querySelector('.size-9')).toBeInTheDocument();
  });
});
