import { createElement } from 'react';
import { sendEmails } from '@/lib/email';
import { emailUsers } from './email-users';

jest.mock('@/lib/email', () => ({ sendEmails: jest.fn(async () => 0) }));
jest.mock('@react-email/render', () => ({
  render: jest.fn(async (element: React.ReactElement) =>
    require('react-dom/server').renderToStaticMarkup(element),
  ),
}));

const greeting = (firstName: string) => createElement('p', null, `Hola ${firstName}`);

describe('emailUsers', () => {
  it('mails each address once, greeting each person by their escaped first name', async () => {
    await emailUsers(
      [
        { name: 'Ana López', email: 'ana@example.com' },
        { name: 'Ana Otra', email: 'ANA@example.com' },
        { name: '<b>Beto</b> Paz', email: 'beto@example.com' },
      ],
      'Asunto',
      greeting,
    );

    expect(sendEmails).toHaveBeenCalledWith([
      { to: 'ana@example.com', subject: 'Asunto', html: '<p>Hola Ana</p>' },
      { to: 'beto@example.com', subject: 'Asunto', html: '<p>Hola &lt;b&gt;Beto&lt;/b&gt;</p>' },
    ]);
  });

  it('sends nothing to nobody', async () => {
    expect(await emailUsers([], 'Asunto', greeting)).toBe(0);
    expect(sendEmails).not.toHaveBeenCalled();
  });

  it('never throws, counting everyone as failed when the email cannot be built', async () => {
    const broken = () => {
      throw new Error('boom');
    };

    expect(await emailUsers([{ name: 'Ana', email: 'ana@example.com' }], 'Asunto', broken)).toBe(1);
    expect(sendEmails).not.toHaveBeenCalled();
  });
});
