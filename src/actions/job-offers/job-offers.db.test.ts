import prisma from '@/lib/prisma';
import { listOpenJobOffers } from '@/lib/job-offers';
import { actAs } from '@/test/db/fixtures';
import { quickUser } from '@/test/db/actions-fixtures';
import type { JobOfferInput } from '@/schemas/job-offer-schema';
import { createJobOffer, deleteJobOffer, setJobOfferAvailable, updateJobOffer } from './job-offers';

// /empleos against a real Postgres: posting, editing, closing and deleting offers, and which ones
// the board lists.

const offer = (overrides: Partial<JobOfferInput> = {}): JobOfferInput => ({
  title: 'Frontend developer',
  company: 'Acme',
  location: 'Córdoba',
  type: 'full-time',
  modality: 'hibrido',
  seniority: 'semi-senior',
  description: 'Buscamos alguien con ganas de construir producto con React.',
  tags: ['React', 'TypeScript', 'React'],
  applyUrl: 'rrhh@acme.dev',
  ...overrides,
});

const listedIds = async () => (await listOpenJobOffers()).map(({ id }) => id);

it('lets a member post an offer and lists only open ones with an author', async () => {
  const member = await quickUser();
  const legacy = await prisma.jobOffers.create({
    data: {
      title: 'Seed',
      company: 'Fake',
      description: 'Sin autor',
      location: 'x',
      type: 'Full-time',
      available: true,
      tags: [],
    },
  });
  await actAs(member.id);

  const { id } = await createJobOffer(offer());
  expect(await prisma.jobOffers.findUniqueOrThrow({ where: { id } })).toMatchObject({
    authorId: member.id,
    available: true,
    tags: ['React', 'TypeScript'],
    modality: 'hibrido',
  });
  const ids = await listedIds();
  expect(ids).toContain(id);
  expect(ids).not.toContain(legacy.id);

  await expect(createJobOffer(offer({ applyUrl: 'http://inseguro.dev' }))).rejects.toThrow(
    /link https o un email/,
  );
  await actAs();
  await expect(createJobOffer(offer())).rejects.toThrow('Debes estar autenticado');
});

it('lets only the author or an admin edit, close and delete it', async () => {
  const [author, other, admin] = [
    await quickUser(),
    await quickUser(),
    await quickUser({ role: 'ADMIN' }),
  ];
  await actAs(author.id);
  const { id } = await createJobOffer(offer());

  await actAs(other.id);
  await expect(updateJobOffer(id, offer({ title: 'Otro' }))).rejects.toThrow(/Solo quien publicó/);
  await expect(deleteJobOffer(id)).rejects.toThrow(/Solo quien publicó/);

  await actAs(author.id);
  await updateJobOffer(
    id,
    offer({ title: 'Backend developer', applyUrl: 'https://acme.dev/jobs' }),
  );
  expect(await prisma.jobOffers.findUniqueOrThrow({ where: { id } })).toMatchObject({
    title: 'Backend developer',
    applyUrl: 'https://acme.dev/jobs',
  });
  await setJobOfferAvailable(id, false);
  expect(await listedIds()).not.toContain(id);
  await setJobOfferAvailable(id, true);
  expect(await listedIds()).toContain(id);

  await actAs(admin.id);
  await deleteJobOffer(id);
  expect(await prisma.jobOffers.findUnique({ where: { id } })).toBeNull();
});

it('tells every other member about a new offer', async () => {
  const [author, reader] = [await quickUser(), await quickUser()];
  await actAs(author.id);

  const { id } = await createJobOffer(offer({ title: 'Backend developer', company: 'Globex' }));

  const notification = await prisma.notification.findFirstOrThrow({
    where: { userId: reader.id, type: 'job_offer_created' },
  });
  expect(notification).toMatchObject({
    title: 'Nueva oferta de empleo',
    message: 'Backend developer en Globex.',
  });
  expect(JSON.parse(notification.metadata!)).toEqual({
    jobOfferId: id,
    href: '/empleos?q=Backend%20developer',
  });
  expect(
    await prisma.notification.count({ where: { userId: author.id, type: 'job_offer_created' } }),
  ).toBe(0);
});
