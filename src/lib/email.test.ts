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
  sendEmails,
  RESEND_BATCH_TIMEOUT_MS,
  EmailQuotaError,
} from './email';
import { reportEmailQuotaExceeded } from '@/lib/system-alerts';
import { EMAIL_UNAVAILABLE_MESSAGE } from '@/lib/email-unavailable';

jest.mock('nodemailer');
jest.mock('@/lib/system-alerts', () => ({ reportEmailQuotaExceeded: jest.fn() }));
jest.mock('resend', () => ({ Resend: jest.fn() }));

const sendMail = jest.fn();
const resendSend = jest.fn();
const resendBatchSend = jest.fn();
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
  resendBatchSend.mockReset().mockResolvedValue({ data: { data: [] }, error: null });
  (Resend as unknown as jest.Mock).mockImplementation(() => ({
    emails: { send: resendSend },
    batch: { send: resendBatchSend },
  }));
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('getSender', () => {
  it('uses the no-reply address of the site by default', () => {
    expect(getSender()).toEqual({
      name: 'programaConNosotros',
      address: 'no-reply@programaconnosotros.com',
    });
  });

  it('can be changed with EMAIL_FROM', () => {
    process.env.EMAIL_FROM = 'hola@programaconnosotros.com';

    expect(getSender()).toEqual({
      name: 'programaConNosotros',
      address: 'hola@programaconnosotros.com',
    });
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
      from: 'programaConNosotros <no-reply@programaconnosotros.com>',
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

  it('alerts the admins and tells the user it is being fixed when the plan runs out of quota', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    resendSend.mockResolvedValue({
      data: null,
      error: { name: 'monthly_quota_exceeded', message: 'Monthly quota reached', statusCode: 429 },
    });

    const sending = sendEmail(message);

    await expect(sending).rejects.toBeInstanceOf(EmailQuotaError);
    await expect(sending).rejects.toThrow(EMAIL_UNAVAILABLE_MESSAGE);
    expect(reportEmailQuotaExceeded).toHaveBeenCalledWith('Monthly quota reached');
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
      from: { name: 'programaConNosotros', address: 'no-reply@programaconnosotros.com' },
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

describe('sendEmails', () => {
  const many = (count: number) =>
    Array.from({ length: count }, (_, i) => ({ ...message, to: `user${i}@example.com` }));

  it('sends through the Resend batch API, 100 at a time, counting the failed batches', async () => {
    process.env.RESEND_API_KEY = 're_test';
    resendBatchSend
      .mockResolvedValueOnce({ data: { data: [] }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'rate limited' } })
      .mockRejectedValueOnce('boom');

    expect(await sendEmails(many(250))).toBe(150);

    expect(resendBatchSend).toHaveBeenCalledTimes(3);
    expect(resendBatchSend.mock.calls[0][0]).toHaveLength(100);
    expect(resendBatchSend.mock.calls[0][0][0]).toEqual({
      from: 'programaConNosotros <no-reply@programaconnosotros.com>',
      ...message,
      to: 'user0@example.com',
    });
    expect(resendBatchSend.mock.calls[2][0]).toHaveLength(50);
  });

  it('stops sending when the Resend plan runs out of quota', async () => {
    process.env.RESEND_API_KEY = 're_test';
    resendBatchSend
      .mockResolvedValueOnce({ data: { data: [] }, error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { name: 'daily_quota_exceeded', message: 'quota', statusCode: 429 },
      });

    expect(await sendEmails(many(350))).toBe(250);
    expect(resendBatchSend).toHaveBeenCalledTimes(2);
    expect(reportEmailQuotaExceeded).toHaveBeenCalledWith('quota');
  });

  it('gives up on a batch Resend does not answer in time and goes on', async () => {
    jest.useFakeTimers();
    try {
      process.env.RESEND_API_KEY = 're_test';
      resendBatchSend
        .mockReturnValueOnce(new Promise(() => {}))
        .mockResolvedValueOnce({ data: { data: [] }, error: null });

      const sending = sendEmails(many(150));
      await jest.advanceTimersByTimeAsync(RESEND_BATCH_TIMEOUT_MS);

      expect(await sending).toBe(100);
      expect(resendBatchSend).toHaveBeenCalledTimes(2);
    } finally {
      jest.useRealTimers();
    }
  });

  it('sends one by one through the local SMTP host, never throwing', async () => {
    sendMail.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('550'));

    expect(await sendEmails(many(2))).toBe(1);
    expect(Resend).not.toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalledTimes(2);
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
