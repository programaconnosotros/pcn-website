import { getImageProps } from 'next/image';
import type { SyntheticEvent } from 'react';

// A broken photo leaves whatever sits under it (the initials) showing, without re-rendering.
const hide = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.style.display = 'none';
};

const className = 'absolute inset-0 size-full object-cover';

/**
 * A member's photo filling its (relative, sized) parent, loaded only when it nears the viewport.
 * Allowed hosts go through the image optimizer at the size it's shown (1x and 2x), so a 40px
 * avatar downloads a thumbnail of a few KB instead of the multi-MB original that was uploaded;
 * any other host gets a lazy plain <img>. `getImageProps` gives next/image's srcset without its
 * component state, which matters with a thousand photos on the page, and a fixed width keeps
 * that srcset to two entries instead of one per breakpoint.
 */
export function MemberPhoto({
  src,
  optimize,
  size,
}: {
  src: string;
  optimize?: boolean;
  /** The largest width it's shown at, in CSS pixels. */
  size: number;
}) {
  if (optimize) {
    const {
      props: { style: _style, ...props },
    } = getImageProps({ src, alt: '', width: size, height: size });
    // eslint-disable-next-line @next/next/no-img-element -- next/image props, from getImageProps
    return <img {...props} alt="" className={className} onError={hide} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={className}
      onError={hide}
    />
  );
}
