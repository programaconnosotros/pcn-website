import { ADVISES_PER_PAGE, EVENTS_PER_PAGE } from './constants';

describe('constants', () => {
  it('pages listings with positive sizes', () => {
    expect(ADVISES_PER_PAGE).toBeGreaterThan(0);
    expect(EVENTS_PER_PAGE).toBe(8);
  });
});
