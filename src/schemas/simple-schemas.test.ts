import { adviseSchema } from './advise-schema';
import { announcementSchema } from './announcement-schema';
import { SETUP_IMAGE_TYPES, SETUP_MAX_BYTES, setupSchema } from './setup-schema';
import { testimonialSchema } from './testimonial-schema';

const firstMessage = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0].message;

describe('adviseSchema', () => {
  it.each([
    ['a'.repeat(9), 'Tenés que escribir al menos 10 caracteres'],
    ['a'.repeat(1001), 'Podés escribir 1000 caracteres como máximo'],
  ])('rejects content out of bounds', (content, message) => {
    expect(firstMessage(adviseSchema.safeParse({ content }))).toBe(message);
  });

  it('accepts content at the bounds', () => {
    expect(adviseSchema.safeParse({ content: 'a'.repeat(10) }).success).toBe(true);
    expect(adviseSchema.safeParse({ content: 'a'.repeat(1000) }).success).toBe(true);
  });
});

describe('announcementSchema', () => {
  const announcement = {
    title: 'Nuevo meetup',
    content: 'Este sábado hay meetup.',
    category: 'eventos',
  };

  it('defaults to published and not pinned', () => {
    expect(announcementSchema.parse(announcement)).toMatchObject({
      pinned: false,
      published: true,
    });
  });

  it('accepts a linked event or none', () => {
    expect(announcementSchema.safeParse({ ...announcement, eventId: null }).success).toBe(true);
    expect(announcementSchema.parse({ ...announcement, eventId: 'e1' }).eventId).toBe('e1');
  });

  it.each([
    ['title', 'ab', 'El título debe tener al menos 3 caracteres'],
    ['content', 'a'.repeat(5001), 'El contenido no puede exceder 5000 caracteres'],
    ['category', '', 'La categoría es requerida'],
  ])('rejects an invalid %s', (field, value, message) => {
    expect(firstMessage(announcementSchema.safeParse({ ...announcement, [field]: value }))).toBe(
      message,
    );
  });
});

describe('setupSchema', () => {
  it('trims the title and description', () => {
    expect(
      setupSchema.parse({ title: '  Mi setup  ', description: '  Dos monitores y un gato  ' }),
    ).toEqual({ title: 'Mi setup', description: 'Dos monitores y un gato' });
  });

  it('counts the length after trimming', () => {
    expect(
      firstMessage(setupSchema.safeParse({ title: '  ab  ', description: 'a'.repeat(10) })),
    ).toBe('El título tiene que tener al menos 3 caracteres');
    expect(
      firstMessage(setupSchema.safeParse({ title: 'abc', description: 'a'.repeat(1501) })),
    ).toBe('La descripción puede tener 1500 caracteres como máximo');
  });

  it('accepts the usual photo formats up to 10MB', () => {
    expect(SETUP_IMAGE_TYPES).toContain('image/webp');
    expect(SETUP_MAX_BYTES).toBe(10 * 1024 * 1024);
  });
});

describe('testimonialSchema', () => {
  it('requires at least 10 characters', () => {
    expect(testimonialSchema.safeParse({ body: 'a'.repeat(10) }).success).toBe(true);
    expect(firstMessage(testimonialSchema.safeParse({ body: 'corto' }))).toBe(
      'El testimonio debe tener al menos 10 caracteres',
    );
  });
});
