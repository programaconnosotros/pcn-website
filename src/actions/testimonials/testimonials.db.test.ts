import prisma from '@/lib/prisma';
import { createTestimonial } from '@/actions/testimonials/create-testimonial';
import { updateTestimonial } from '@/actions/testimonials/update-testimonial';
import { deleteTestimonial } from '@/actions/testimonials/delete-testimonial';
import { toggleFeatured } from '@/actions/testimonials/toggle-featured';
import { fetchTestimonial } from '@/actions/testimonials/fetch-testimonial';
import { fetchTestimonials } from '@/actions/testimonials/fetch-testimonials';
import { fetchFeaturedTestimonials } from '@/actions/testimonials/fetch-featured-testimonials';
import { actAs } from '@/test/db/fixtures';
import { expiredModel, quickUser, uid } from '@/test/db/actions-fixtures';

// Testimonios contra Postgres real, incluidas las notificaciones que reciben los admins.

const makeTestimonial = (
  userId: string,
  overrides: { featured?: boolean; createdAt?: Date } = {},
) =>
  prisma.testimonial.create({
    data: { userId, body: `Un testimonio sincero ${uid()}`, ...overrides },
  });

const notificationsFor = (userId: string, testimonialId: string) =>
  prisma.notification.findMany({
    where: { userId, metadata: { contains: testimonialId } },
  });

describe('createTestimonial', () => {
  it('stores the testimonial for the session user and notifies every admin', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const author = await quickUser({ name: 'Autora Testimonio' });
    await actAs(author.id);
    const body = `PCN me ayudó a conseguir trabajo ${uid()}`;

    await createTestimonial({ body });

    const [testimonial] = await prisma.testimonial.findMany({ where: { body } });
    expect(testimonial).toMatchObject({ userId: author.id, featured: false });
    const [notification] = await notificationsFor(admin.id, testimonial.id);
    expect(notification).toMatchObject({
      type: 'testimonial_created',
      read: false,
      message: 'Autora Testimonio ha creado un nuevo testimonio',
    });
    expect(JSON.parse(notification.metadata!)).toEqual({
      testimonialId: testimonial.id,
      userId: author.id,
      userName: 'Autora Testimonio',
    });
    // Los usuarios comunes no reciben la notificación
    expect(await notificationsFor(author.id, testimonial.id)).toHaveLength(0);
    expect(expiredModel('Testimonial')).toBe(true);
  });

  it('rejects a short body and anonymous visitors without writing', async () => {
    const author = await quickUser();
    await actAs(author.id);
    await expect(createTestimonial({ body: 'corto' })).rejects.toThrow();

    await actAs();
    await expect(createTestimonial({ body: 'Un testimonio anónimo' })).rejects.toThrow(
      'Debes estar autenticado para crear un testimonio',
    );
    expect(await prisma.testimonial.count({ where: { userId: author.id } })).toBe(0);
  });
});

describe('updateTestimonial', () => {
  it('lets the author edit the body and notifies the admins', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const author = await quickUser();
    const testimonial = await makeTestimonial(author.id, { featured: true });
    await actAs(author.id);

    await updateTestimonial(testimonial.id, { body: 'Texto actualizado del testimonio' });

    const stored = await prisma.testimonial.findUniqueOrThrow({ where: { id: testimonial.id } });
    expect(stored).toMatchObject({ body: 'Texto actualizado del testimonio', featured: true });
    expect((await notificationsFor(admin.id, testimonial.id)).map((n) => n.type)).toEqual([
      'testimonial_updated',
    ]);
  });

  it('lets an admin edit it without notifying anyone', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const author = await quickUser();
    const testimonial = await makeTestimonial(author.id);
    await actAs(admin.id);

    await updateTestimonial(testimonial.id, { body: 'Corregido por un admin' });

    expect(
      (await prisma.testimonial.findUniqueOrThrow({ where: { id: testimonial.id } })).body,
    ).toBe('Corregido por un admin');
    expect(await notificationsFor(admin.id, testimonial.id)).toHaveLength(0);
  });

  it('forbids another regular user', async () => {
    const author = await quickUser();
    const other = await quickUser();
    const testimonial = await makeTestimonial(author.id);
    await actAs(other.id);

    await expect(
      updateTestimonial(testimonial.id, { body: 'Texto de otra persona' }),
    ).rejects.toThrow('No tienes permisos para editar este testimonio');
    expect(
      (await prisma.testimonial.findUniqueOrThrow({ where: { id: testimonial.id } })).body,
    ).toBe(testimonial.body);
  });

  it('fails for a testimonial that does not exist or without a session', async () => {
    const user = await quickUser();
    await actAs(user.id);
    await expect(updateTestimonial('no-existe', { body: 'Un texto válido' })).rejects.toThrow(
      'Testimonio no encontrado',
    );
    await actAs();
    await expect(updateTestimonial('no-existe', { body: 'Un texto válido' })).rejects.toThrow(
      'No autorizado',
    );
  });
});

describe('deleteTestimonial', () => {
  it('lets the author delete it and notifies the admins', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const author = await quickUser();
    const testimonial = await makeTestimonial(author.id);
    await actAs(author.id);

    await deleteTestimonial(testimonial.id);

    expect(await prisma.testimonial.findUnique({ where: { id: testimonial.id } })).toBeNull();
    expect((await notificationsFor(admin.id, testimonial.id)).map((n) => n.type)).toEqual([
      'testimonial_deleted',
    ]);
  });

  it('lets an admin delete it without notifying', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const author = await quickUser();
    const testimonial = await makeTestimonial(author.id);
    await actAs(admin.id);

    await deleteTestimonial(testimonial.id);

    expect(await prisma.testimonial.findUnique({ where: { id: testimonial.id } })).toBeNull();
    expect(await notificationsFor(admin.id, testimonial.id)).toHaveLength(0);
  });

  it('forbids another regular user', async () => {
    const author = await quickUser();
    const other = await quickUser();
    const testimonial = await makeTestimonial(author.id);
    await actAs(other.id);

    await expect(deleteTestimonial(testimonial.id)).rejects.toThrow(
      'No tienes permisos para eliminar este testimonio',
    );
    expect(await prisma.testimonial.findUnique({ where: { id: testimonial.id } })).not.toBeNull();
  });

  it('is removed in cascade when its author is deleted', async () => {
    const author = await quickUser();
    const testimonial = await makeTestimonial(author.id);

    await prisma.user.delete({ where: { id: author.id } });

    expect(await prisma.testimonial.findUnique({ where: { id: testimonial.id } })).toBeNull();
  });
});

describe('toggleFeatured', () => {
  it('lets an admin feature and unfeature a testimonial', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    const testimonial = await makeTestimonial((await quickUser()).id);
    await actAs(admin.id);

    await toggleFeatured(testimonial.id);
    expect(
      (await prisma.testimonial.findUniqueOrThrow({ where: { id: testimonial.id } })).featured,
    ).toBe(true);
    await toggleFeatured(testimonial.id);
    expect(
      (await prisma.testimonial.findUniqueOrThrow({ where: { id: testimonial.id } })).featured,
    ).toBe(false);
  });

  it('forbids the author and anonymous visitors', async () => {
    const author = await quickUser();
    const testimonial = await makeTestimonial(author.id);

    await actAs(author.id);
    await expect(toggleFeatured(testimonial.id)).rejects.toThrow(
      'Solo los administradores pueden marcar testimonios como destacados',
    );
    await actAs();
    await expect(toggleFeatured(testimonial.id)).rejects.toThrow('No autorizado');
    expect(
      (await prisma.testimonial.findUniqueOrThrow({ where: { id: testimonial.id } })).featured,
    ).toBe(false);
  });

  it('fails for a testimonial that does not exist', async () => {
    const admin = await quickUser({ role: 'ADMIN' });
    await actAs(admin.id);

    await expect(toggleFeatured('no-existe')).rejects.toThrow('Testimonio no encontrado');
  });
});

describe('testimonial listings', () => {
  it('fetchFeaturedTestimonials returns the three newest featured ones', async () => {
    const user = await quickUser();
    const future = Date.now() + 365 * 86_400_000;
    const featured = [];
    for (let i = 0; i < 4; i++) {
      featured.push(
        await makeTestimonial(user.id, { featured: true, createdAt: new Date(future + i * 1000) }),
      );
    }
    await makeTestimonial(user.id, { featured: false, createdAt: new Date(future + 10_000) });

    const result = await fetchFeaturedTestimonials();

    expect(result.map((t) => t.id)).toEqual([featured[3].id, featured[2].id, featured[1].id]);
    expect(result[0].user).toEqual({ id: user.id, name: user.name, image: null });
  });

  it('fetchTestimonials lists all of them newest first', async () => {
    const user = await quickUser();
    const older = await makeTestimonial(user.id, { createdAt: new Date('2021-01-01') });
    const newer = await makeTestimonial(user.id, { createdAt: new Date('2021-01-02') });

    const result = await fetchTestimonials();

    const ids = result.map((t) => t.id);
    expect(ids.indexOf(newer.id)).toBeLessThan(ids.indexOf(older.id));
    const dates = result.map((t) => t.createdAt.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it('fetchTestimonial returns one with its public author, or null', async () => {
    const user = await quickUser();
    const testimonial = await makeTestimonial(user.id);

    await expect(fetchTestimonial(testimonial.id)).resolves.toMatchObject({
      id: testimonial.id,
      body: testimonial.body,
      user: { id: user.id, name: user.name, image: null },
    });
    await expect(fetchTestimonial('no-existe')).resolves.toBeNull();
  });
});
