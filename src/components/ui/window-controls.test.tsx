import { render } from '@testing-library/react';
import { WindowControls } from './window-controls';

describe('WindowControls', () => {
  it('draws the three PCN OS window keys as decoration, never round dots', () => {
    const { container } = render(<WindowControls />);
    const keys = container.firstElementChild!;
    expect(keys).toHaveAttribute('aria-hidden', 'true');
    expect(keys.children).toHaveLength(3);
    expect(container.querySelectorAll('svg')).toHaveLength(3);
    expect(container.innerHTML).not.toContain('rounded-full');
  });
});
