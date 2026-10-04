import { existsSync } from 'node:fs';
import path from 'node:path';
import { faqs } from './faqs';
import { PARTNER_CONTACT_URL, partners } from './partners';
import { WHATSAPP_GROUP_URL } from './whatsapp-group';

const publicFile = (src: string) => existsSync(path.join(process.cwd(), 'public', src));

describe('partners', () => {
  it('have unique names, https sites and logos that exist in public/', () => {
    const names = partners.map((partner) => partner.name);
    expect(new Set(names).size).toBe(names.length);
    for (const partner of partners) {
      expect(partner.url).toMatch(/^https:\/\//);
      expect(publicFile(partner.logo)).toBe(true);
      expect(['empresa', 'organizacion']).toContain(partner.kind);
      if (partner.brandColor) expect(partner.brandColor).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('links to a WhatsApp contact', () => {
    expect(PARTNER_CONTACT_URL).toMatch(/^https:\/\/wa\.me\/\d+$/);
  });
});

describe('faqs', () => {
  it('have unique questions with answers, and some are featured on the home', () => {
    const questions = faqs.map((faq) => faq.question);
    expect(new Set(questions).size).toBe(questions.length);
    expect(faqs.every((faq) => faq.answer.trim().length > 0)).toBe(true);
    expect(faqs.some((faq) => faq.featured)).toBe(true);
  });
});

describe('WHATSAPP_GROUP_URL', () => {
  it('is a WhatsApp group invite', () => {
    expect(WHATSAPP_GROUP_URL).toMatch(/^https:\/\/chat\.whatsapp\.com\/\w+$/);
  });
});
