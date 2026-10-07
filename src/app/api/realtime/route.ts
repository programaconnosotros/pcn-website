import type { NextRequest } from 'next/server';
import { REALTIME_TOPIC, subscribe, type RealtimeMessage } from '@/lib/realtime';

// Server-Sent Events for live pages: `?topics=feed,event:<id>` streams the messages published on
// those topics (src/lib/realtime.ts). Only public signals go through here (something new in the
// feed, an event's availability changed), so it needs no session.

export const dynamic = 'force-dynamic';

const MAX_TOPICS = 5;
/** Comments keep proxies (CloudFront, kamal-proxy) from closing an idle stream. */
const HEARTBEAT_MS = 20_000;

export async function GET(request: NextRequest) {
  const topics = new Set(
    (request.nextUrl.searchParams.get('topics') ?? '')
      .split(',')
      .filter((topic) => REALTIME_TOPIC.test(topic))
      .slice(0, MAX_TOPICS),
  );
  if (topics.size === 0) return new Response('Missing topics', { status: 400 });

  const encoder = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };
      // Browsers reconnect after this long if the stream drops.
      send('retry: 5000\n\n');
      const unsubscribe = subscribe((message: RealtimeMessage) => {
        if (topics.has(message.topic)) send(`data: ${JSON.stringify(message)}\n\n`);
      });
      const heartbeat = setInterval(() => send(': ping\n\n'), HEARTBEAT_MS);
      cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
      request.signal.addEventListener('abort', () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      // Tells nginx-style proxies not to buffer the stream.
      'X-Accel-Buffering': 'no',
    },
  });
}
