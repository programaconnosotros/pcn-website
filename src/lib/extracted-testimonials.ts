import { extractedTestimonials } from '@/data/testimonios-extraidos';
import { getIdentityMap } from '@/lib/identity-links';

/** Where an extracted testimonial came from. */
export type TestimonialSource = { title: string; date: string; hash: string; href: string };

/** A testimonial as the home and /testimonios show it, written on the site or extracted. */
export type TestimonialItem = {
  id: string;
  body: string;
  /** `id` is null for a WhatsApp member nobody linked to a profile yet. */
  user: { id: string | null; name: string; image: string | null };
  /** Set when it was extracted from a conversation. */
  source?: TestimonialSource;
};

/** The extracted testimonials, newest first, credited to the linked profiles. */
export const listExtractedTestimonials = async (): Promise<TestimonialItem[]> => {
  const profiles = await getIdentityMap('whatsapp');
  return extractedTestimonials.map((testimonial) => {
    const linked = profiles[testimonial.member];
    return {
      id: testimonial.id,
      body: testimonial.content,
      user: linked
        ? { id: linked.id, name: linked.name, image: linked.image }
        : { id: null, name: testimonial.member, image: null },
      source: testimonial.conversation,
    };
  });
};
