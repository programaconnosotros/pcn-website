import nodemailer from 'nodemailer';
import { Resend } from 'resend';
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
jest.mock('resend', () => ({ Resend: jest.fn() }));

const sendMail = jest.fn();
const resendSend = jest.fn();
const ORIGINAL_ENV = process.env;
const message = { to: 'user@example.com', subject: 'Hola', html: '<p>hola</p>' };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV, SMTP_HOST: 'localhost', SMTP_PORT: '1025' };
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.EMAIL_TRANSPORT;
  sendMail.mockReset().mockResolvedValue({});
  resendSend.mockReset().mockResolvedValue({ data: { id: 'email-1' }, error: null });
  (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
  (Resend as unknown as jest.Mock).mockImplementation(() => ({ emails: { send: resendSend } }));
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('getSender', () => {
  it('uses the no-reply address of the site by default', () => {
    expect(getSender()).toEqual({
      name: 'Agus de PCN',
      address: 'no-reply@programaconnosotros.com',
    });
  });

  it('can be changed with EMAIL_FROM', () => {
    process.env.EMAIL_FROM = 'hola@programaconnosotros.com';

    expect(getSender()).toEqual({ name: 'Agus de PCN', address: 'hola@programaconnosotros.com' });
  });
});

describe('sendEmail with Resend (production)', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 're_test';
    delete process.env.SMTP_HOST;
  });

  it('sends through the Resend API with the key and a "Name <address>" sender', async () => {
    await sendEmail(message);

    expect(Resend).toHaveBeenCalledWith('re_test');
    expect(resendSend).toHaveBeenCalledWith({
      from: 'Agus de PCN <no-reply@programaconnosotros.com>',
      ...message,
    });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it('turns an error answered by Resend into a user-facing error', async () => {
    resendSend.mockResolvedValue({ data: null, error: { message: 'Domain not verified' } });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendEmail(message)).rejects.toThrow('Error al enviar el email');
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to send email:',
      'Resend: Domain not verified',
    );
  });

  it('turns a network failure into a user-facing error', async () => {
    resendSend.mockRejectedValue(new Error('fetch failed'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendEmail(message)).rejects.toThrow('Error al enviar el email');
  });

  it('never reaches Resend in the e2e suite, even with a key', async () => {
    process.env.EMAIL_TRANSPORT = 'json';

    await sendEmail(message);

    expect(resendSend).not.toHaveBeenCalled();
    expect(nodemailer.createTransport).toHaveBeenCalledWith({ jsonTransport: true });
  });
});

describe('sendEmail without Resend (local MailHog)', () => {
  it('sends through the local SMTP host from a sender with an address', async () => {
    await sendEmail(message);

    expect(Resend).not.toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledWith({
      from: { name: 'Agus de PCN', address: 'no-reply@programaconnosotros.com' },
      ...message,
    });
  });

  it('turns a transport failure into a user-facing error', async () => {
    sendMail.mockRejectedValue(new Error('550 Invalid syntax in MAIL command'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendEmail(message)).rejects.toThrow('Error al enviar el email');
  });

  it('says email is not configured when there is neither Resend nor an SMTP host', async () => {
    delete process.env.SMTP_HOST;
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendEmail(message)).rejects.toThrow(
      'Error de configuración: el envío de emails no está configurado',
    );
  });

  it('handles failures that are not Errors', async () => {
    sendMail.mockRejectedValue('boom');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(sendEmail(message)).rejects.toThrow('Error al enviar el email');
    expect(consoleError).toHaveBeenCalledWith('Failed to send email:', 'Unknown error');
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

  it('defaults the local port to 1025', () => {
    delete process.env.SMTP_PORT;

    getEmailTransporter();

    expect(createTransport()).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  });

  it('refuses to send without an SMTP host (Gmail is gone)', () => {
    delete process.env.SMTP_HOST;

    expect(() => getEmailTransporter()).toThrow('Email not configured');
    expect(createTransport()).not.toHaveBeenCalled();
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
