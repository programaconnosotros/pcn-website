import { jobSchema } from './job-schema';

const job = {
  title: 'Frontend Dev',
  description: 'Buscamos alguien con React.',
  company: 'ACME',
  location: 'Remoto',
  type: 'full-time',
  tags: 'react, typescript, ,next',
};

describe('jobSchema', () => {
  it('splits comma-separated tags and defaults to available', () => {
    expect(jobSchema.parse(job)).toMatchObject({
      tags: ['react', 'typescript', 'next'],
      available: true,
    });
  });

  it('keeps tags given as a list', () => {
    expect(jobSchema.parse({ ...job, tags: ['go'] }).tags).toEqual(['go']);
  });

  it('requires at least one tag', () => {
    expect(jobSchema.safeParse({ ...job, tags: '' }).success).toBe(false);
    expect(jobSchema.safeParse({ ...job, tags: [] }).success).toBe(false);
  });

  it('accepts an empty website or a valid URL only', () => {
    expect(jobSchema.safeParse({ ...job, website: '' }).success).toBe(true);
    expect(jobSchema.safeParse({ ...job, website: 'https://acme.com' }).success).toBe(true);
    expect(jobSchema.safeParse({ ...job, website: 'acme' }).success).toBe(false);
  });

  it.each([
    ['title', 'ab', 'El título debe tener al menos 3 caracteres'],
    ['title', 'a'.repeat(201), 'El título no puede exceder 200 caracteres'],
    ['description', 'corta', 'La descripción debe tener al menos 10 caracteres'],
    ['company', 'A', 'El nombre de la empresa debe tener al menos 2 caracteres'],
    ['location', 'a'.repeat(101), 'La ubicación no puede exceder 100 caracteres'],
    ['type', '', 'El tipo de trabajo es requerido'],
  ])('rejects an invalid %s', (field, value, message) => {
    expect(jobSchema.safeParse({ ...job, [field]: value }).error?.issues[0].message).toBe(message);
  });
});
