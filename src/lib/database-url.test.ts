import { pgConfig } from './database-url';

describe('pgConfig', () => {
  it('connects to a local database without TLS', () => {
    const { pool } = pgConfig('postgresql://postgres@localhost:5432/pcn');
    expect(pool).toMatchObject({
      connectionString: 'postgresql://postgres@localhost:5432/pcn',
      ssl: false,
    });
  });

  it('treats a docker-compose service name as local', () => {
    expect(pgConfig('postgresql://u:p@database:5432/pcn').pool.ssl).toBe(false);
  });

  it('uses TLS without verifying the certificate for a remote host, like Prisma 6', () => {
    const { pool } = pgConfig('postgresql://u:p@aws-0-us-east-2.pooler.supabase.com:6543/postgres');
    expect(pool.ssl).toEqual({ rejectUnauthorized: false });
  });

  it('honours sslmode and sslaccept', () => {
    expect(pgConfig('postgresql://u:p@db.example.com/x?sslmode=disable').pool.ssl).toBe(false);
    expect(pgConfig('postgresql://u:p@localhost/x?sslmode=require').pool.ssl).toEqual({
      rejectUnauthorized: false,
    });
    expect(
      pgConfig('postgresql://u:p@db.example.com/x?sslmode=require&sslaccept=strict').pool.ssl,
    ).toEqual({ rejectUnauthorized: true });
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
