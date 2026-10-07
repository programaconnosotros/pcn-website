import { fillRowsClassName } from './video-grid';

describe('fillRowsClassName', () => {
  it('hides what would sit alone in the last row at two and at three columns', () => {
    // Four videos: two full rows of two; at three columns the fourth is left out.
    expect([0, 1, 2, 3].map((i) => fillRowsClassName(i, 4))).toEqual(['', '', '', 'lg:hidden']);
    // Three videos: one row of three; at two columns the third is left out.
    expect(fillRowsClassName(2, 3)).toBe('sm:max-lg:hidden');
    // Six fill every layout.
    expect([0, 1, 2, 3, 4, 5].every((i) => fillRowsClassName(i, 6) === '')).toBe(true);
  });
});
