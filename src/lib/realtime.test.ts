import { EventEmitter } from 'node:events';
import { Client } from 'pg';
import { publish, subscribe } from './realtime';

jest.mock('@/lib/database-url', () => ({
  pgConfig: () => ({ pool: { connectionString: 'postgres://db/pcn', ssl: false } }),
  serverAcceptsTls: jest.fn(),
}));
jest.mock('pg', () => {
  class FakeClient
    extends (jest.requireActual('node:events') as typeof import('node:events')).EventEmitter
  {
    static instances: FakeClient[] = [];
    connect = jest.fn(async () => {});
    query = jest.fn(async () => ({}));
    end = jest.fn(async () => {});
    constructor() {
      super();
      FakeClient.instances.push(this);
    }
  }
  return { Client: FakeClient };
});

type Fake = EventEmitter & { connect: jest.Mock; query: jest.Mock; end: jest.Mock };
const instances = () => (Client as unknown as { instances: Fake[] }).instances;
const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('realtime', () => {
  it('listens on one connection and hands every notification to the subscribers', async () => {
    const listener = jest.fn();
    const unsubscribe = subscribe(listener);
    await flush();

    const [client] = instances();
    expect(client.query).toHaveBeenCalledWith('LISTEN pcn_realtime');
    client.emit('notification', {
      channel: 'pcn_realtime',
      payload: JSON.stringify({ topic: 'feed', data: { title: 'hola' } }),
    });
    client.emit('notification', { channel: 'other', payload: '{}' });
    client.emit('notification', { channel: 'pcn_realtime', payload: 'no json' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ topic: 'feed', data: { title: 'hola' } });

    unsubscribe();
    client.emit('notification', { channel: 'pcn_realtime', payload: '{"topic":"feed"}' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('publishes valid topics through pg_notify, small enough for Postgres', async () => {
    await publish('event:abc', { n: 1 });
    const [client] = instances();
    expect(client.query).toHaveBeenCalledWith('SELECT pg_notify($1, $2)', [
      'pcn_realtime',
      JSON.stringify({ topic: 'event:abc', data: { n: 1 } }),
    ]);

    client.query.mockClear();
    await publish('nope; DROP');
    expect(client.query).not.toHaveBeenCalled();

    await publish('feed', { title: 'x'.repeat(10_000) });
    expect(client.query).toHaveBeenCalledWith('SELECT pg_notify($1, $2)', [
      'pcn_realtime',
      JSON.stringify({ topic: 'feed' }),
    ]);
  });

  it('opens a new connection after losing one while someone listens', async () => {
    jest.useFakeTimers();
    subscribe(jest.fn());
    const before = instances().length;
    instances().at(-1)!.emit('error', new Error('boom'));
    jest.advanceTimersByTime(5_000);
    jest.useRealTimers();
    await flush();
    expect(instances().length).toBe(before + 1);
  });

  it('never throws when publishing fails', async () => {
    instances().at(-1)!.query.mockRejectedValueOnce(new Error('down'));
    await expect(publish('feed')).resolves.toBeUndefined();
  });
});
