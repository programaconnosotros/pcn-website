import { fireEvent, render } from '@testing-library/react';
import { MemberPhoto } from './member-photo';

describe('MemberPhoto', () => {
  it('asks the image optimizer for a thumbnail at 1x and 2x, loaded lazily', () => {
    const { container } = render(
      <MemberPhoto src="https://cdn.example.net/big.jpg" optimize size={40} />,
    );
    const img = container.querySelector('img')!;

    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('alt', '');
    expect(img.getAttribute('src')).toContain('/_next/image?url=');
    const srcSet = img.getAttribute('srcset')!;
    // Two candidates, not one per breakpoint: it's shown at one size.
    expect(srcSet.split(', ')).toHaveLength(2);
    expect(srcSet).toMatch(/w=48&q=75 1x/);
    expect(srcSet).toMatch(/w=96&q=75 2x/);
  });

  it('shows other hosts as a plain lazy image', () => {
    const { container } = render(
      <MemberPhoto src="https://lh3.googleusercontent.com/a/x" size={40} />,
    );
    const img = container.querySelector('img')!;

    expect(img).toHaveAttribute('src', 'https://lh3.googleusercontent.com/a/x');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).not.toHaveAttribute('srcset');
  });

  it('gets out of the way when the photo fails to load', () => {
    const { container } = render(<MemberPhoto src="/broken.png" size={40} />);
    const img = container.querySelector('img')!;

    fireEvent.error(img);

    expect(img).toHaveStyle({ display: 'none' });
  });
});
