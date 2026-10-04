import { revalidateTag } from 'next/cache';
import { checkCachedRead, cached, expireModels, modelTag } from './cache';

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

  it('passes the arguments through and tags the entry with its tables', async () => {
    const fn = jest.fn(async (a: number, b: string) => `${b}${a}`);
    const read = cached('test-args', fn, { models: ['Event', 'Talk'] });

    await expect(read(1, 'x')).resolves.toBe('x1');
    expect(fn).toHaveBeenCalledWith(1, 'x');
  });

  it('warns when an entry is too big for the data cache, and still returns it', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const big = 'x'.repeat(2 * 1024 * 1024 + 1);
    const read = cached('test-big', async () => big, { models: ['Event'] });

    await expect(read()).resolves.toBe(big);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[cache] test-big is'));
    warn.mockRestore();
  });

  it('keeps nulls and plain objects that are not dates', async () => {
    const read = cached('test-plain', async () => ({ a: null, b: { c: 1 } }), {
      models: ['Event'],
    });

    await expect(read()).resolves.toEqual({ a: null, b: { c: 1 } });
  });

  it("refuses tables that writes don't expire", () => {
    expect(() => cached('test-uncached', async () => 1, { models: ['PageVisit'] })).toThrow(
      /PageVisit/,
    );
  });
});

describe('checkCachedRead', () => {
  let warn: jest.SpyInstance;
  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  it('does nothing outside a cached read', () => {
    checkCachedRead(['User']);
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns once per table a cached read uses without declaring it', async () => {
    const read = cached(
      'test-tracking',
      async () => {
        checkCachedRead(['Event', 'User']);
        checkCachedRead(['User']);
        return 1;
      },
      { models: ['Event'] },
    );

    await read();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith("[cache] test-tracking reads User but isn't tagged with it");
  });

  it("doesn't track reads in production", async () => {
    const env = process.env as Record<string, string | undefined>;
    const original = env.NODE_ENV;
    env.NODE_ENV = 'production';
    try {
      const read = cached(
        'test-production',
        async () => {
          checkCachedRead(['User']);
          return 1;
        },
        { models: ['Event'] },
      );
      await expect(read()).resolves.toBe(1);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      env.NODE_ENV = original;
    }
  });
});

describe('modelTag', () => {
  it('prefixes the table name', () => {
    expect(modelTag('Event')).toBe('db:Event');
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

  it('stays quiet when called outside a request (scripts, the seed)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.mocked(revalidateTag).mockImplementation(() => {
      throw new Error('Invariant: static generation store missing in revalidateTag db:Event');
    });

    expireModels(['Event', 'Talk']);

    // Stops at the first table: none can be expired without a store.
    expect(revalidateTag).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    jest.mocked(revalidateTag).mockReset();
  });

  it('logs any other failure and keeps expiring the rest', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.mocked(revalidateTag).mockImplementationOnce(() => {
      throw new Error('during render');
    });

    expireModels(['Event', 'Talk']);

    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith("[cache] couldn't expire Event:", expect.any(Error));
    warn.mockRestore();
  });

  it('logs failures that are not Errors', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.mocked(revalidateTag).mockImplementationOnce(() => {
      throw 'boom';
    });

    expireModels(['Event']);

    expect(warn).toHaveBeenCalledWith("[cache] couldn't expire Event:", 'boom');
    warn.mockRestore();
  });
});
