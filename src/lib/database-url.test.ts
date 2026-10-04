import { createServer, type Server } from 'node:net';
import { pgConfig, serverAcceptsTls } from './database-url';

describe('pgConfig', () => {
  it('asks the server about TLS when the URL has no sslmode, like Prisma 6', () => {
    const { pool, prefer } = pgConfig('postgresql://u:p@db.example.com:5433/pcn');
    expect(pool).toMatchObject({ connectionString: 'postgresql://u:p@db.example.com:5433/pcn' });
    expect(pool.ssl).toBe(false);
    expect(prefer).toEqual({ host: 'db.example.com', port: 5433 });
  });

  it('defaults to port 5432 and unwraps IPv6 hosts', () => {
    expect(pgConfig('postgresql://u:p@[::1]/pcn').prefer).toEqual({ host: '::1', port: 5432 });
  });

  it('honours sslmode and sslaccept', () => {
    const disabled = pgConfig('postgresql://u:p@db.example.com/x?sslmode=disable');
    expect(disabled.pool.ssl).toBe(false);
    expect(disabled).not.toHaveProperty('prefer');

    const required = pgConfig('postgresql://u:p@db.example.com/x?sslmode=require');
    expect(required.pool.ssl).toEqual({ rejectUnauthorized: false });
    expect(required).not.toHaveProperty('prefer');

    expect(
      pgConfig('postgresql://u:p@db.example.com/x?sslmode=require&sslaccept=strict').pool.ssl,
    ).toEqual({ rejectUnauthorized: true });

    expect(pgConfig('postgresql://u:p@db.example.com/x?sslmode=prefer').prefer).toBeDefined();
  });

  it("turns Prisma's pool parameters into pg's and drops them from the URL", () => {
    const { pool, schema } = pgConfig(
      'postgresql://u:p@db.example.com:6543/postgres?pgbouncer=true&connection_limit=3&pool_timeout=20&sslmode=require&schema=app&application_name=pcn',
    );
    expect(pool).toEqual({
      connectionString: 'postgresql://u:p@db.example.com:6543/postgres?application_name=pcn',
      ssl: { rejectUnauthorized: false },
      max: 3,
      connectionTimeoutMillis: 20_000,
    });
    expect(schema).toBe('app');
  });

  it('defaults to a 10 second pool timeout and no schema', () => {
    const config = pgConfig('postgresql://u:p@localhost/x');
    expect(config.pool.connectionTimeoutMillis).toBe(10_000);
    expect(config.pool.max).toBeGreaterThan(0);
    expect(config).not.toHaveProperty('schema');
  });

  it('leaves the pool without connection data when there is no URL (the Docker build)', () => {
    expect(pgConfig(undefined)).toEqual({ pool: {} });
  });
});

describe('serverAcceptsTls', () => {
  let server: Server | undefined;
  afterEach(() => server?.close());

  // A fake Postgres that answers the SSLRequest with `reply`.
  const listen = (reply: string) =>
    new Promise<number>((resolve) => {
      server = createServer((socket) =>
        socket.once('data', (data) => {
          expect(data.readInt32BE(0)).toBe(8);
          expect(data.readInt32BE(4)).toBe(80877103);
          socket.end(reply);
        }),
      ).listen(0, '127.0.0.1', () => {
        const address = server!.address();
        resolve(typeof address === 'object' && address ? address.port : 0);
      });
    });

  it('is true when the server answers S', async () => {
    const port = await listen('S');
    await expect(serverAcceptsTls('127.0.0.1', port, 1000)).resolves.toBe(true);
  });

  it('is false when the server answers N', async () => {
    const port = await listen('N');
    await expect(serverAcceptsTls('127.0.0.1', port, 1000)).resolves.toBe(false);
  });

  it('is false when nothing listens, so the real error shows up on connect', async () => {
    const port = await listen('N');
    await new Promise((resolve) => server!.close(resolve));
    server = undefined;
    await expect(serverAcceptsTls('127.0.0.1', port, 1000)).resolves.toBe(false);
  });
});
