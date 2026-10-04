import { fireEvent, render } from '@testing-library/react';
import { mockRouter } from '@/test/dom';
import { PhotoKeyboardNav } from './photo-keyboard-nav';

describe('PhotoKeyboardNav', () => {
  it('prefetches the neighbours and steps with the arrows', () => {
    render(<PhotoKeyboardNav previousHref="/galeria/a" nextHref="/galeria/c" />);

    expect(mockRouter.prefetch).toHaveBeenCalledWith('/galeria/a');
    expect(mockRouter.prefetch).toHaveBeenCalledWith('/galeria/c');

    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    expect(mockRouter.push).toHaveBeenLastCalledWith('/galeria/a', { scroll: false });
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(mockRouter.push).toHaveBeenLastCalledWith('/galeria/c', { scroll: false });
    fireEvent.keyDown(document.body, { key: 'Enter' });
    expect(mockRouter.push).toHaveBeenCalledTimes(2);
  });

  it('ignores the arrows with modifiers, while typing or at the ends', () => {
    render(
      <>
        <PhotoKeyboardNav previousHref={null} nextHref="/galeria/c" />
        <input aria-label="campo" />
      </>,
    );

    expect(mockRouter.prefetch).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    fireEvent.keyDown(document.body, { key: 'ArrowRight', metaKey: true });
    fireEvent.keyDown(document.querySelector('input')!, { key: 'ArrowRight' });

    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
