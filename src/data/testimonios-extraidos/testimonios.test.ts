import { conversations } from '@/data/whatsapp-conversations';
import { members } from '@/data/whatsapp-conversations/members';
import { extractedTestimonials, rawExtractedTestimonials } from '.';

describe('extracted testimonials data', () => {
  it('points every testimonial at an existing conversation, newest first', () => {
    expect(extractedTestimonials).toHaveLength(rawExtractedTestimonials.length);
    const dates = extractedTestimonials.map(({ conversation }) => conversation.date);
    expect(dates).toEqual([...dates].sort().reverse());
    for (const { conversation } of extractedTestimonials) {
      expect(conversation.href).toMatch(/^\/conversaciones\?c=[0-9a-f]{7}$/);
    }
  });

  it('credits members who took part in that conversation', () => {
    const names = new Set(members.map(({ name }) => name));
    for (const testimonial of rawExtractedTestimonials) {
      expect(names.has(testimonial.member)).toBe(true);
      const conversation = conversations.find(
        ({ date, title }) => date === testimonial.date && title === testimonial.title,
      );
      expect(conversation?.participants).toContain(testimonial.member);
    }
  });

  it('uses unique auto- ids and short paraphrases, not quotes', () => {
    const ids = rawExtractedTestimonials.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { id, content } of rawExtractedTestimonials) {
      expect(id).toMatch(/^auto-[0-9a-f]{7}-[a-z0-9-]+$/);
      expect(content.length).toBeLessThan(400);
      expect(content).not.toMatch(/^["“«]/);
    }
  });
});
