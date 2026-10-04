import { revalidateTag } from 'next/cache';
import { cached, expireModels } from './cache';

describe('cached', () => {
  it('returns Dates as Dates after the JSON round trip', async () => {
    const date = new Date('2026-10-04T12:00:00Z');
    const read = cached('test-dates', async (id: string) => ({ id, date, nested: [{ date }] }), {
      models: ['Event'],
    });
    const result = await read('e1');
    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.getTime()).toBe(date.getTime());
    expect(result.nested[0].date).toBeInstanceOf(Date);
  });

  it("refuses tables that writes don't expire", () => {
    expect(() => cached('test-uncached', async () => 1, { models: ['PageVisit'] })).toThrow(
      /PageVisit/,
    );
  });
});

describe('expireModels', () => {
  beforeEach(() => jest.mocked(revalidateTag).mockClear());

  it('expires the tag of each table right away', () => {
    expireModels(['Event', 'Talk']);
    expect(revalidateTag).toHaveBeenCalledWith('db:Event', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith('db:Talk', { expire: 0 });
  });

  it('skips tracking and session tables', () => {
    expireModels(['PageVisit', 'Session']);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
