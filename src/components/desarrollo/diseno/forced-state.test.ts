import { forceSelector, splitSelectorList } from './forced-state';

describe('forceSelector', () => {
  it('moves a hover state onto the forcing wrapper', () => {
    expect(forceSelector('.hover\\:text-pcnGreen:hover')).toBe(
      '[data-force-state="hover"] .hover\\:text-pcnGreen',
    );
  });

  it('maps focus-visible and focus-within to the focus state', () => {
    expect(forceSelector('.field-surface:focus-visible::placeholder')).toBe(
      '[data-force-state="focus"] .field-surface::placeholder',
    );
    expect(forceSelector('.group\\/field:focus-within .x')).toBe(
      '[data-force-state="focus"] .group\\/field .x',
    );
  });

  it('keeps other pseudo-classes and pseudo-elements', () => {
    expect(forceSelector('.field-surface:hover:not(:disabled)')).toBe(
      '[data-force-state="hover"] .field-surface:not(:disabled)',
    );
    expect(forceSelector('.hover\\:before\\:size-3:hover::before')).toBe(
      '[data-force-state="hover"] .hover\\:before\\:size-3::before',
    );
  });

  it('ignores escaped colons in class names', () => {
    expect(forceSelector('.focus\\:bg-x')).toBeNull();
    expect(forceSelector('.data-\\[state\\=active\\]\\:bg-x[data-state=active]')).toBeNull();
  });

  it('skips selectors that mix states or negate one', () => {
    expect(forceSelector('.a:hover:active')).toBeNull();
    expect(forceSelector('.a:not(:hover)')).toBeNull();
  });
});

describe('splitSelectorList', () => {
  it('splits on top-level commas only', () => {
    expect(splitSelectorList('.a:hover, .b:is(.c, .d):focus')).toEqual([
      '.a:hover',
      '.b:is(.c, .d):focus',
    ]);
  });
});
