import { extractedTestimonials } from '@/data/testimonios-extraidos';
import { getIdentityMap } from '@/lib/identity-links';
import { listExtractedTestimonials } from './extracted-testimonials';

jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));

describe('listExtractedTestimonials', () => {
  it('credits linked members to their profile and keeps the WhatsApp name otherwise', async () => {
    const [first, second] = extractedTestimonials;
    const user = { id: 'u1', name: 'Perfil', image: 'p.png' };
    jest.mocked(getIdentityMap).mockResolvedValue({ [first.member]: user } as never);

    const items = await listExtractedTestimonials();

    expect(getIdentityMap).toHaveBeenCalledWith('whatsapp');
    expect(items[0]).toEqual({
      id: first.id,
      body: first.content,
      user,
      source: first.conversation,
    });
    if (second && second.member !== first.member) {
      expect(items[1].user).toEqual({ id: null, name: second.member, image: null });
    }
  });
});
