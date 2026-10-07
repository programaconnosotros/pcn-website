import { EventEmitter } from 'node:events';
import { Client } from 'pg';
import { pgConfig, serverAcceptsTls } from '@/lib/database-url';

// Live updates for open pages: a write somewhere tells every server process through Postgres
// LISTEN/NOTIFY, and each process forwards it to its browsers over Server-Sent Events
// (/api/realtime). One dedicated connection per process both listens and notifies.

export const REALTIME_CHANNEL = 'pcn_realtime';
/** `feed` for anything new in the feed, `event:<id>` for an event's registrations. */
export const REALTIME_TOPIC = /^(feed|event:[A-Za-z0-9_-]{1,64})$/;
const RECONNECT_MS = 5_000;
// NOTIFY payloads must stay under 8000 bytes.
const MAX_PAYLOAD = 7_000;

export type RealtimeMessage = { topic: string; data?: Record<string, unknown> };

type Listener = (_message: RealtimeMessage) => void;

type State = {
  emitter: EventEmitter;
  client: Promise<Client> | null;
};

const globalState = globalThis as unknown as { pcnRealtime?: State };
const state: State = (globalState.pcnRealtime ??= { emitter: new EventEmitter(), client: null });
// One listener per open page; the default cap of 10 is a leak warning meant for other uses.
state.emitter.setMaxListeners(0);

const connect = async (): Promise<Client> => {
  const { pool, prefer } = pgConfig(process.env.DATABASE_URL);
  const ssl = prefer
    ? (await serverAcceptsTls(
        prefer.host,
        prefer.port,
        pool.connectionTimeoutMillis ?? 10_000,
      )) && {
        rejectUnauthorized: false,
      }
    : pool.ssl;
  const client = new Client({
    connectionString: pool.connectionString,
    ssl: ssl || false,
    connectionTimeoutMillis: pool.connectionTimeoutMillis,
  });
  const reset = (error?: Error) => {
    if (error) console.warn('[realtime] connection lost:', error.message);
    state.client = null;
    client.removeAllListeners();
    void client.end().catch(() => {});
    // Pages still listening get a connection back.
    if (state.emitter.listenerCount('message') > 0) {
      setTimeout(() => void ensureClient().catch(() => {}), RECONNECT_MS);
    }
  };
  client.on('error', reset);
  client.on('end', () => reset());
  client.on('notification', ({ channel, payload }) => {
    if (channel !== REALTIME_CHANNEL || !payload) return;
    try {
      state.emitter.emit('message', JSON.parse(payload) as RealtimeMessage);
    } catch {
      // Not ours, or truncated: ignore it.
    }
  });
  await client.connect();
  await client.query(`LISTEN ${REALTIME_CHANNEL}`);
  return client;
};

const ensureClient = () => {
  state.client ??= connect().catch((error: Error) => {
    state.client = null;
    throw error;
  });
  return state.client;
};

/** Listen to every message published from any process; returns the unsubscribe. */
export const subscribe = (listener: Listener) => {
  state.emitter.on('message', listener);
  void ensureClient().catch((error: Error) =>
    console.warn('[realtime] could not listen:', error.message),
  );
  return () => {
    state.emitter.off('message', listener);
  };
};

/** Tell every open page listening to `topic`. Best effort: it never fails the caller. */
export const publish = async (topic: string, data?: Record<string, unknown>): Promise<void> => {
  if (!REALTIME_TOPIC.test(topic)) return;
  const payload = JSON.stringify({ topic, data });
  if (payload.length > MAX_PAYLOAD) return publish(topic);
  try {
    const client = await ensureClient();
    await client.query('SELECT pg_notify($1, $2)', [REALTIME_CHANNEL, payload]);
  } catch (error) {
    console.warn('[realtime] could not publish:', error instanceof Error ? error.message : error);
  }
};
