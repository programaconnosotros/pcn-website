import nodemailer from 'nodemailer';
import {
  CODE_EXPIRATION_MINUTES,
  RATE_LIMIT_SECONDS,
  checkRateLimit,
  generateVerificationCode,
  getCodeExpirationDate,
  getEmailTransporter,
  getSender,
  sendEmail,
} from './email';

jest.mock('nodemailer');

const sendMail = jest.fn();
const ORIGINAL_ENV = process.env;

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, SMTP_HOST: 'localhost', SMTP_PORT: '1025', SMTP_USER: '' };
  sendMail.mockReset().mockResolvedValue({});
  (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('getSender', () => {
  it('uses a default address when there is no SMTP account (local MailHog)', () => {
    expect(getSender()).toEqual({
      name: 'Agus de PCN',
      address: 'no-reply@programaconnosotros.com',
    });
  });

  it('uses the authenticated SMTP account as the address (Gmail in production)', () => {
    process.env.SMTP_USER = 'pcn@gmail.com';

    expect(getSender()).toEqual({ name: 'Agus de PCN', address: 'pcn@gmail.com' });
  });
});

describe('sendEmail', () => {
  it('sends from a sender that includes an address', async () => {
    await sendEmail({ to: 'user@example.com', subject: 'Hola', html: '<p>hola</p>' });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { name: 'Agus de PCN', address: 'no-reply@programaconnosotros.com' },
        to: 'user@example.com',
      }),
    );
  });

  it('turns a transport failure into a user-facing error', async () => {
    sendMail.mockRejectedValue(new Error('550 Invalid syntax in MAIL command'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      sendEmail({ to: 'user@example.com', subject: 'Hola', html: '<p>hola</p>' }),
    ).rejects.toThrow('Error al enviar el email');
  });
});

describe('getEmailTransporter', () => {
  const createTransport = () => nodemailer.createTransport as jest.Mock;

  it("doesn't send anything with the json transport (e2e, dev without mail)", () => {
    process.env.EMAIL_TRANSPORT = 'json';

    getEmailTransporter();

    expect(createTransport()).toHaveBeenCalledWith({ jsonTransport: true });
  });

  it('connects to the local SMTP host without credentials', () => {
    process.env.SMTP_PORT = '2525';

    getEmailTransporter();

    expect(createTransport()).toHaveBeenCalledWith({
      host: 'localhost',
      port: 2525,
      secure: false,
    });
  });

  it('defaults the local port to 1025 and authenticates when credentials are set', () => {
    delete process.env.SMTP_PORT;
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';

    getEmailTransporter();

    expect(createTransport()).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,
      auth: { user: 'user', pass: 'pass' },
    });
  });

  it('uses Gmail without an SMTP host', () => {
    delete process.env.SMTP_HOST;
    process.env.SMTP_USER = 'pcn@gmail.com';
    process.env.SMTP_PASS = 'secret';

    getEmailTransporter();

    expect(createTransport()).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'pcn@gmail.com', pass: 'secret' },
    });
  });

  it('refuses Gmail without credentials', () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PASS;

    expect(() => getEmailTransporter()).toThrow('SMTP credentials not configured');
  });
});

describe('sendEmail configuration errors', () => {
  it('says the credentials are missing', async () => {
    delete process.env.SMTP_HOST;
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendEmail({ to: 'a@b.c', subject: 's', html: 'h' })).rejects.toThrow(
      'Error de configuración: Las credenciales de email no están configuradas',
    );
  });

  it('handles failures that are not Errors', async () => {
    sendMail.mockRejectedValue('boom');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendEmail({ to: 'a@b.c', subject: 's', html: 'h' })).rejects.toThrow(
      'Error al enviar el email',
    );
    expect(consoleError).toHaveBeenCalledWith('Failed to send email:', 'Unknown error');
  });
});

describe('generateVerificationCode', () => {
  it('returns six digits', () => {
    for (let i = 0; i < 50; i++) expect(generateVerificationCode()).toMatch(/^[1-9]\d{5}$/);
  });
});

describe('getCodeExpirationDate', () => {
  it('expires in 15 minutes', () => {
    jest.useFakeTimers({ now: new Date('2026-10-04T12:00:00Z') });

    expect(getCodeExpirationDate()).toEqual(new Date('2026-10-04T12:15:00Z'));
    expect(CODE_EXPIRATION_MINUTES).toBe(15);
    jest.useRealTimers();
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => jest.useFakeTimers({ now: new Date('2026-10-04T12:00:00Z') }));
  afterEach(() => jest.useRealTimers());

  it('lets the first code through', () => {
    expect(checkRateLimit(null)).toBe(0);
  });

  it('returns the seconds left within the minute', () => {
    expect(checkRateLimit(new Date('2026-10-04T11:59:40Z'))).toBe(RATE_LIMIT_SECONDS - 20);
  });

  it('lets a code through exactly a minute later', () => {
    expect(checkRateLimit(new Date('2026-10-04T11:59:00Z'))).toBe(0);
  });
});
