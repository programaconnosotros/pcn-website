import { render } from '@testing-library/react';
import { technologies, toolchain } from './technologies';

describe('technologies', () => {
  it('lists the stack with a renderable logo for each', () => {
    expect(technologies.map((t) => t.name)).toContain('Next.js');
    for (const { icon: Icon } of technologies) {
      const { container, unmount } = render(<Icon />);
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });

  it('groups the toolchain by category without duplicates', () => {
    for (const group of toolchain) {
      expect(group.tools.length).toBeGreaterThan(0);
      expect(new Set(group.tools).size).toBe(group.tools.length);
    }
  });
});
