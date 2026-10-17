import { NextRequest } from 'next/server';
import { subscribe, type RealtimeMessage } from '@/lib/realtime';
import { GET } from './route';

jest.mock('@/lib/realtime', () => ({
  ...jest.requireActual('@/lib/realtime'),
  subscribe: jest.fn(),
}));

const request = (query: string, controller = new AbortController()) =>
  new NextRequest(`http://localhost/api/realtime${query}`, { signal: controller.signal });

describe('GET /api/realtime', () => {
  it('needs at least one valid topic', async () => {
    expect((await GET(request(''))).status).toBe(400);
    expect((await GET(request('?topics=nada,event:'))).status).toBe(400);
  });

  it('streams the messages of its topics as server-sent events until the page leaves', async () => {
    const unsubscribe = jest.fn();
    let listener: (_message: RealtimeMessage) => void = () => {};
    jest.mocked(subscribe).mockImplementation((fn) => {
      listener = fn;
      return unsubscribe;
    });
    const controller = new AbortController();
    const response = await GET(request('?topics=feed,event:e1,basura', controller));

    expect(response.headers.get('Content-Type')).toBe('text/event-stream; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toBe('no-store, no-transform');
    const reader = response.body!.getReader();
    const read = async () => new TextDecoder().decode((await reader.read()).value);

    expect(await read()).toBe('retry: 5000\n\n');
    listener({ topic: 'event:e2' });
    listener({ topic: 'event:e1', data: { n: 1 } });
    expect(await read()).toBe(`data: ${JSON.stringify({ topic: 'event:e1', data: { n: 1 } })}\n\n`);

    controller.abort();
    expect(unsubscribe).toHaveBeenCalled();
    expect((await reader.read()).done).toBe(true);
  });
});
