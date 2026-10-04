import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { BlockedAddressError, createSafeFetch, isPrivateAddress, safeFetch } from './safe-fetch';

// Servers reales en 127.0.0.1. `safeFetch` los bloquea por ser loopback; para probar el resto
// (redirects, tope de bytes) se usa una variante que solo bloquea una IP "interna" de mentira.
const servers: Server[] = [];
const listen = (handler: Parameters<typeof createServer>[1]) =>
  new Promise<string>((resolve) => {
    const server = createServer(handler);
    servers.push(server);
    server.listen(0, '127.0.0.1', () =>
      resolve(`http://127.0.0.1:${(server.address() as AddressInfo).port}`),
    );
  });

afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => new Promise((r) => s.close(r))));
});

// Deja pasar loopback para poder hablar con los servers del test
const localFetch = createSafeFetch((address) => address === '10.9.9.9');

describe('isPrivateAddress', () => {
  it.each([
    '127.0.0.1',
    '10.0.0.5',
    '172.16.0.1',
    '172.31.255.255',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '224.0.0.1',
    '::1',
    '::',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
    '::ffff:169.254.169.254',
  ])('blocks %s', (address) => {
    expect(isPrivateAddress(address)).toBe(true);
  });

  it.each(['93.184.216.34', '8.8.8.8', '172.32.0.1', '100.128.0.1', '2606:4700::1111'])(
    'allows %s',
    (address) => {
      expect(isPrivateAddress(address)).toBe(false);
    },
  );
});

describe('safeFetch', () => {
  it.each([
    'http://127.0.0.1:1/',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://10.0.0.5/',
  ])('refuses to connect to %s', async (url) => {
    await expect(safeFetch(url)).rejects.toThrow('apunta a una dirección interna');
  });

  it('refuses hostnames that resolve to loopback, checked when the socket connects', async () => {
    const url = await listen((_req, res) => res.end('secreto'));
    const port = new URL(url).port;

    await expect(safeFetch(`http://localhost:${port}/`)).rejects.toThrow(
      'apunta a una dirección interna',
    );
  });

  it.each(['file:///etc/passwd', 'ftp://example.com/', 'gopher://127.0.0.1:6379/_INFO'])(
    'refuses the %s scheme',
    async (url) => {
      await expect(safeFetch(url)).rejects.toThrow('Protocolo no permitido');
    },
  );

  it('blocks a redirect to an internal address', async () => {
    const url = await listen((_req, res) => {
      res.writeHead(302, { location: 'http://169.254.169.254/latest/meta-data/' });
      res.end();
    });

    await expect(safeFetch(url)).rejects.toThrow('apunta a una dirección interna');
  });

  it('follows public redirects and returns the headers', async () => {
    const url = await listen((req, res) => {
      if (req.url === '/') {
        res.writeHead(301, { location: '/final' });
        return res.end();
      }
      res.writeHead(200, { 'x-frame-options': 'DENY' });
      res.end('ok');
    });

    const response = await localFetch(url);

    expect(response).toMatchObject({ status: 200, ok: true, url: `${url}/final`, body: null });
    expect(response.headers.get('x-frame-options')).toBe('DENY');
  });

  it('stops after too many redirects', async () => {
    const url = await listen((_req, res) => {
      res.writeHead(302, { location: '/' });
      res.end();
    });

    await expect(localFetch(url, { maxRedirects: 2 })).rejects.toThrow('Demasiados redirects');
  });

  it('reads the body up to maxBytes and drops anything bigger', async () => {
    const url = await listen((req, res) =>
      res.end(req.url === '/small' ? 'abc' : 'x'.repeat(5000)),
    );

    expect((await localFetch(`${url}/small`, { maxBytes: 100 })).body?.toString()).toBe('abc');
    expect((await localFetch(`${url}/big`, { maxBytes: 100 })).body).toBeNull();
  });

  it('gives up on a server that never answers', async () => {
    const url = await listen(() => {});

    await expect(localFetch(url, { timeoutMs: 100 })).rejects.toThrow();
  });

  it('connects to a hostname whose addresses are all allowed', async () => {
    const url = await listen((_req, res) => res.end('hola'));
    const port = new URL(url).port;

    const response = await localFetch(`http://localhost:${port}/`, { maxBytes: 100 });

    expect(response.body?.toString()).toBe('hola');
  });

  it('fails when the hostname does not resolve', async () => {
    await expect(localFetch('http://pcn.invalid/')).rejects.toThrow();
  });

  it("doesn't read the body of an error response", async () => {
    const url = await listen((_req, res) => {
      res.writeHead(404);
      res.end('no está');
    });

    const response = await localFetch(url, { maxBytes: 100 });

    expect(response).toMatchObject({ status: 404, ok: false, body: null });
  });

  it('drops a streamed body once it passes maxBytes', async () => {
    const url = await listen((_req, res) => {
      // Sin content-length: el tope se controla mientras llegan los chunks.
      res.writeHead(200, { 'transfer-encoding': 'chunked' });
      res.write('x'.repeat(60));
      setTimeout(() => res.end('y'.repeat(60)), 20);
    });

    expect((await localFetch(url, { maxBytes: 100 })).body).toBeNull();
  });

  it('joins repeated headers', async () => {
    const url = await listen((_req, res) => {
      res.setHeader('set-cookie', ['a=1', 'b=2']);
      res.end();
    });

    expect((await localFetch(url)).headers.get('set-cookie')).toBe('a=1, b=2');
  });

  it('sends the extra headers it is given', async () => {
    let received: string | undefined;
    const url = await listen((req, res) => {
      received = req.headers['x-test'] as string;
      res.end();
    });

    await localFetch(url, { headers: { 'x-test': 'yes' } });

    expect(received).toBe('yes');
  });
});

describe('BlockedAddressError', () => {
  it('names the host in the message', () => {
    expect(new BlockedAddressError('db.internal').message).toBe(
      'db.internal apunta a una dirección interna',
    );
  });
});
