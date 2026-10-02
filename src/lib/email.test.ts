import nodemailer from 'nodemailer';
import { getSender, sendEmail } from './email';

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
