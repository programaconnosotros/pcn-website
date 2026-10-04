import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { registerEvent } from '@/actions/events/register-event';
import { cancelRegistration } from '@/actions/events/cancel-registration';
import { deleteRegistration } from '@/actions/events/delete-registration';
import { checkEventCapacity } from '@/actions/events/check-event-capacity';
import { getEventRegistrations, getEventWaitlist } from '@/actions/events/get-event-registrations';
import { updateEvent } from '@/actions/events/update-event';
import { getWaitlistPosition } from '@/lib/event-waitlist';
import { actAs } from '@/test/db/fixtures';
import {
  createAdmin,
  createOrganizer,
  createTestEvent,
  createUser,
  createUsers,
  daysFromNow,
  queueSessions,
} from '@/test/db/content-fixtures';

// El email de promoción se renderiza con @react-email, que usa import() dinámico y Jest no lo
// corre; el envío ya está mockeado en setup.ts.
jest.mock('@react-email/render', () => ({ render: jest.fn().mockResolvedValue('<html></html>') }));

// Inscripciones, cupo y lista de espera contra Postgres real: el cupo se respeta aun con pedidos
// simultáneos (el evento se bloquea con FOR UPDATE) y las bajas promueven en orden de llegada.

const register = (eventId: string) => registerEvent(eventId, { skipRedirect: true });

const activeRegistrations = (eventId: string) =>
  prisma.eventRegistration.count({ where: { eventId, cancelledAt: null } });

/** Anota a cada usuario en orden (uno por vez, así el orden de llegada es claro). */
const registerInOrder = async (eventId: string, userIds: string[]) => {
  const results = [];
  for (const userId of userIds) {
    await actAs(userId);
    results.push(await register(eventId));
  }
  return results;
};

describe('registerEvent', () => {
  it('registers a logged-in user while there is room and redirects to the event', async () => {
    const event = await createTestEvent({ capacity: 2 });
    const user = await createUser();
    await actAs(user.id);

    await expect(registerEvent(event.id)).rejects.toThrow(
      `NEXT_REDIRECT:/eventos/${event.id}?registered=true`,
    );

    const row = await prisma.eventRegistration.findUniqueOrThrow({
      where: { eventId_userId: { eventId: event.id, userId: user.id } },
    });
    expect(row.cancelledAt).toBeNull();
  });

  it('notifies the admins of the new registration', async () => {
    const admin = await createAdmin();
    const event = await createTestEvent();
    const user = await createUser();
    await actAs(user.id);

    const result = await register(event.id);

    expect(result.status).toBe('registered');
    const notification = await prisma.notification.findFirstOrThrow({
      where: {
        userId: admin.id,
        type: 'event_registration_created',
        message: { contains: event.name },
      },
    });
    expect(JSON.parse(notification.metadata!)).toMatchObject({
      eventId: event.id,
      registrationId: (result as { registrationId: string }).registrationId,
      userEmail: user.email,
    });
  });

  it('rejects anonymous visitors without writing anything', async () => {
    const event = await createTestEvent();
    await actAs();

    await expect(register(event.id)).rejects.toThrow('Debes estar autenticado');
    expect(await prisma.eventRegistration.count({ where: { eventId: event.id } })).toBe(0);
  });

  it('rejects an expired or forged session', async () => {
    const event = await createTestEvent();
    const user = await createUser();
    await actAs(user.id);
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { expires: new Date(Date.now() - 1000) },
    });

    await expect(register(event.id)).rejects.toThrow('Sesión no válida');
    expect(await prisma.eventRegistration.count({ where: { eventId: event.id } })).toBe(0);
  });

  it('does not register to a soft-deleted or missing event', async () => {
    const deleted = await createTestEvent({ deletedAt: new Date() });
    const user = await createUser();
    await actAs(user.id);

    await expect(register(deleted.id)).rejects.toThrow('Evento no encontrado');
    await expect(register('no-existe')).rejects.toThrow('Evento no encontrado');
    expect(await prisma.eventRegistration.count({ where: { userId: user.id } })).toBe(0);
  });

  it('refuses events whose registration happens on an external site', async () => {
    const event = await createTestEvent({ externalRegistrationUrl: 'https://lu.ma/evento' });
    const user = await createUser();
    await actAs(user.id);

    await expect(register(event.id)).rejects.toThrow('sitio externo');
    expect(await activeRegistrations(event.id)).toBe(0);
  });

  it('refuses a second registration of the same user', async () => {
    const event = await createTestEvent();
    const user = await createUser();
    await actAs(user.id);
    await register(event.id);

    await expect(register(event.id)).rejects.toThrow('Ya estás registrado');
    expect(await prisma.eventRegistration.count({ where: { eventId: event.id } })).toBe(1);
  });

  it('keeps a single registration when the same user registers twice at once', async () => {
    const event = await createTestEvent({ capacity: 10 });
    const user = await createUser();
    await queueSessions([user.id, user.id]);

    const results = await Promise.allSettled([register(event.id), register(event.id)]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect(await prisma.eventRegistration.count({ where: { eventId: event.id } })).toBe(1);
    expect(await prisma.eventWaitlistEntry.count({ where: { eventId: event.id } })).toBe(0);
  });

  it('reactivates a cancelled registration instead of creating another row', async () => {
    const event = await createTestEvent();
    const user = await createUser();
    await actAs(user.id);
    const first = await register(event.id);
    await cancelRegistration({ eventId: event.id });

    const second = await register(event.id);

    expect(second).toEqual(first);
    const rows = await prisma.eventRegistration.findMany({ where: { eventId: event.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0].cancelledAt).toBeNull();
  });

  it('sends people to the waitlist once the capacity is reached, with their position', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const [a, b, c] = await createUsers(3);

    const results = await registerInOrder(event.id, [a.id, b.id, c.id]);

    expect(results.map((r) => r.status)).toEqual(['registered', 'waitlisted', 'waitlisted']);
    expect(results.slice(1).map((r) => (r as { position: number }).position)).toEqual([1, 2]);
    expect(await activeRegistrations(event.id)).toBe(1);
    expect(await getWaitlistPosition(event.id, c.id)).toBe(2);
    expect(await getWaitlistPosition(event.id, a.id)).toBeNull();
  });

  it('sends everyone to the waitlist when the event is marked as full by hand', async () => {
    const event = await createTestEvent({ markedAsFull: true });
    const user = await createUser();
    await actAs(user.id);

    await expect(register(event.id)).resolves.toMatchObject({ status: 'waitlisted', position: 1 });
    expect(await activeRegistrations(event.id)).toBe(0);
  });

  it('refuses to put the same user twice on the waitlist', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const [a, b] = await createUsers(2);
    await registerInOrder(event.id, [a.id, b.id]);

    await expect(register(event.id)).rejects.toThrow('Ya estás en la lista de espera');
    expect(await prisma.eventWaitlistEntry.count({ where: { eventId: event.id } })).toBe(1);
  });

  it('never goes over capacity when two people race for the last spot', async () => {
    const event = await createTestEvent({ capacity: 2 });
    const [first, a, b] = await createUsers(3);
    await registerInOrder(event.id, [first.id]);
    await queueSessions([a.id, b.id]);

    const results = await Promise.all([register(event.id), register(event.id)]);

    expect(results.map((r) => r.status).sort()).toEqual(['registered', 'waitlisted']);
    expect(await activeRegistrations(event.id)).toBe(2);
    expect(await prisma.eventWaitlistEntry.count({ where: { eventId: event.id } })).toBe(1);
  });

  it('gives the spots to exactly `capacity` people out of many simultaneous requests', async () => {
    // Cinco a la vez: cada transacción espera el lock del evento dentro del timeout de Prisma (5 s)
    // aun con la máquina cargada.
    const event = await createTestEvent({ capacity: 2 });
    const users = await createUsers(5);
    await queueSessions(users.map((u) => u.id));

    const results = await Promise.all(users.map(() => register(event.id)));

    const registered = results.filter((r) => r.status === 'registered');
    const waitlisted = results.filter((r) => r.status === 'waitlisted');
    expect(registered).toHaveLength(2);
    expect(waitlisted).toHaveLength(3);
    expect(waitlisted.map((r) => (r as { position: number }).position).sort()).toEqual([1, 2, 3]);
    expect(await activeRegistrations(event.id)).toBe(2);
  });

  it('does not accept registrations to an event that already ended', async () => {
    const event = await createTestEvent({ date: daysFromNow(-30) });
    const user = await createUser();
    await actAs(user.id);

    await expect(register(event.id)).rejects.toThrow();
    expect(await activeRegistrations(event.id)).toBe(0);
  });
});

describe('checkEventCapacity', () => {
  it('counts only active registrations against the capacity', async () => {
    const event = await createTestEvent({ capacity: 2 });
    const [a, b] = await createUsers(2);
    await registerInOrder(event.id, [a.id, b.id]);
    expect(await checkEventCapacity(event.id)).toMatchObject({ available: false, current: 2 });

    await actAs(a.id);
    await cancelRegistration({ eventId: event.id });
    // La baja promovió a nadie (no había lista de espera): queda un lugar
    expect(await checkEventCapacity(event.id)).toMatchObject({
      available: true,
      current: 1,
      capacity: 2,
      message: 'Quedan 1 lugares disponibles.',
    });
  });

  it('reports events without capacity as available and hides deleted ones', async () => {
    const open = await createTestEvent();
    const deleted = await createTestEvent({ deletedAt: new Date(), capacity: 5 });

    expect(await checkEventCapacity(open.id)).toEqual({
      available: true,
      current: 0,
      capacity: null,
    });
    expect(await checkEventCapacity(deleted.id)).toEqual({
      available: false,
      message: 'Evento no encontrado',
    });
  });
});

describe('cancelRegistration and waitlist promotion', () => {
  it('promotes the first in line when someone cancels, and emails them', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const [a, b, c] = await createUsers(3);
    await registerInOrder(event.id, [a.id, b.id, c.id]);

    await actAs(a.id);
    await expect(cancelRegistration({ eventId: event.id })).resolves.toEqual({
      success: true,
      status: 'cancelled_registration',
    });

    const active = await prisma.eventRegistration.findMany({
      where: { eventId: event.id, cancelledAt: null },
    });
    expect(active.map((r) => r.userId)).toEqual([b.id]);
    const entryB = await prisma.eventWaitlistEntry.findFirstOrThrow({
      where: { eventId: event.id, userId: b.id },
    });
    expect(entryB.promotedAt).not.toBeNull();
    expect(await getWaitlistPosition(event.id, c.id)).toBe(1);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: b.email, subject: expect.stringContaining(event.name) }),
    );
  });

  it('promotes in arrival order, skipping whoever left the waitlist', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const [a, b, c, d] = await createUsers(4);
    await registerInOrder(event.id, [a.id, b.id, c.id, d.id]);

    // B sale de la lista: C queda primera y D segunda
    await actAs(b.id);
    await expect(cancelRegistration({ eventId: event.id })).resolves.toMatchObject({
      status: 'cancelled_waitlist',
    });
    expect(await getWaitlistPosition(event.id, c.id)).toBe(1);
    expect(await getWaitlistPosition(event.id, d.id)).toBe(2);

    await actAs(a.id);
    await cancelRegistration({ eventId: event.id });
    await actAs(c.id);
    await cancelRegistration({ eventId: event.id });

    const active = await prisma.eventRegistration.findMany({
      where: { eventId: event.id, cancelledAt: null },
    });
    expect(active.map((r) => r.userId)).toEqual([d.id]);
    expect((sendEmail as jest.Mock).mock.calls.map(([arg]) => arg.to)).toEqual([c.email, d.email]);
  });

  it('a person who rejoins the waitlist goes to the back of the line', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const [a, b, c] = await createUsers(3);
    await registerInOrder(event.id, [a.id, b.id, c.id]);

    await actAs(b.id);
    await cancelRegistration({ eventId: event.id });
    await expect(register(event.id)).resolves.toMatchObject({ status: 'waitlisted', position: 2 });
    expect(await getWaitlistPosition(event.id, c.id)).toBe(1);
  });

  it('does not promote anyone when the event is marked as full or already ended', async () => {
    const full = await createTestEvent({ capacity: 1 });
    const [a, b] = await createUsers(2);
    await registerInOrder(full.id, [a.id, b.id]);
    await prisma.event.update({ where: { id: full.id }, data: { markedAsFull: true } });

    await actAs(a.id);
    await cancelRegistration({ eventId: full.id });

    expect(await activeRegistrations(full.id)).toBe(0);
    expect(await getWaitlistPosition(full.id, b.id)).toBe(1);

    const ended = await createTestEvent({ capacity: 1 });
    const [c, d] = await createUsers(2);
    await registerInOrder(ended.id, [c.id, d.id]);
    await prisma.event.update({ where: { id: ended.id }, data: { date: daysFromNow(-1) } });
    await actAs(c.id);
    await cancelRegistration({ eventId: ended.id });
    expect(await activeRegistrations(ended.id)).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('frees exactly one spot when two people cancel at the same time', async () => {
    const event = await createTestEvent({ capacity: 2 });
    const [a, b, c, d, e] = await createUsers(5);
    await registerInOrder(event.id, [a.id, b.id, c.id, d.id, e.id]);
    await queueSessions([a.id, b.id]);

    await Promise.all([
      cancelRegistration({ eventId: event.id }),
      cancelRegistration({ eventId: event.id }),
    ]);

    const active = await prisma.eventRegistration.findMany({
      where: { eventId: event.id, cancelledAt: null },
      orderBy: { userId: 'asc' },
    });
    expect(active.map((r) => r.userId).sort()).toEqual([c.id, d.id].sort());
    expect(await getWaitlistPosition(event.id, e.id)).toBe(1);
  });

  it('rejects anonymous users and users with nothing to cancel', async () => {
    const event = await createTestEvent();
    await actAs();
    await expect(cancelRegistration({ eventId: event.id })).rejects.toThrow('No autorizado');

    const user = await createUser();
    await actAs(user.id);
    await expect(cancelRegistration({ eventId: event.id })).rejects.toThrow(
      'Inscripción no encontrada o ya cancelada',
    );
    await expect(cancelRegistration({ eventId: 'no-existe' })).rejects.toThrow(
      'Evento no encontrado',
    );
  });

  it("cannot cancel someone else's registration by passing its id", async () => {
    const event = await createTestEvent();
    const [owner, intruder] = await createUsers(2);
    await actAs(owner.id);
    const { registrationId } = (await register(event.id)) as { registrationId: string };

    await actAs(intruder.id);
    await expect(cancelRegistration({ eventId: event.id, registrationId })).rejects.toThrow(
      'Inscripción no encontrada',
    );
    const row = await prisma.eventRegistration.findUniqueOrThrow({ where: { id: registrationId } });
    expect(row.cancelledAt).toBeNull();
  });
});

describe('deleteRegistration (event managers)', () => {
  it('lets an organizer remove a registration, which promotes the next in line', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const organizer = await createOrganizer(event.id);
    const [a, b] = await createUsers(2);
    const [{ registrationId }] = (await registerInOrder(event.id, [a.id, b.id])) as {
      registrationId: string;
    }[];

    await actAs(organizer.id);
    await expect(deleteRegistration(registrationId)).resolves.toEqual({ success: true });

    expect(await prisma.eventRegistration.findUnique({ where: { id: registrationId } })).toBeNull();
    const active = await prisma.eventRegistration.findMany({
      where: { eventId: event.id, cancelledAt: null },
    });
    expect(active.map((r) => r.userId)).toEqual([b.id]);
  });

  it('removing an already cancelled registration does not promote anyone', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const admin = await createAdmin();
    const [a, b, c] = await createUsers(3);
    await registerInOrder(event.id, [a.id, b.id, c.id]);
    await actAs(a.id);
    await cancelRegistration({ eventId: event.id }); // B promovida
    const cancelled = await prisma.eventRegistration.findFirstOrThrow({
      where: { eventId: event.id, userId: a.id },
    });

    await actAs(admin.id);
    await deleteRegistration(cancelled.id);

    expect(await activeRegistrations(event.id)).toBe(1);
    expect(await getWaitlistPosition(event.id, c.id)).toBe(1);
  });

  it('rejects regular users and organizers of other events', async () => {
    const event = await createTestEvent();
    const other = await createTestEvent();
    const otherOrganizer = await createOrganizer(other.id);
    const [attendee, regular] = await createUsers(2);
    await actAs(attendee.id);
    const { registrationId } = (await register(event.id)) as { registrationId: string };

    await actAs(regular.id);
    await expect(deleteRegistration(registrationId)).rejects.toThrow('No tienes permisos');
    await actAs(otherOrganizer.id);
    await expect(deleteRegistration(registrationId)).rejects.toThrow('No tienes permisos');
    await actAs();
    await expect(deleteRegistration(registrationId)).rejects.toThrow('No autorizado');

    expect(
      await prisma.eventRegistration.findUnique({ where: { id: registrationId } }),
    ).not.toBeNull();
  });

  it('reports a missing registration', async () => {
    const admin = await createAdmin();
    await actAs(admin.id);
    await expect(deleteRegistration('no-existe')).rejects.toThrow('Inscripción no encontrada');
  });
});

describe('getEventRegistrations and getEventWaitlist', () => {
  it('lists every registration (cancelled too) and the waitlist in promotion order', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const organizer = await createOrganizer(event.id);
    const [a, b, c] = await createUsers(3);
    await registerInOrder(event.id, [a.id, b.id, c.id]);

    await actAs(organizer.id);
    const registrations = await getEventRegistrations(event.id);
    const waitlist = await getEventWaitlist(event.id);

    expect(registrations.map((r) => r.email)).toEqual([a.email]);
    expect(waitlist.map((w) => [w.position, w.email])).toEqual([
      [1, b.email],
      [2, c.email],
    ]);

    await actAs(a.id);
    await cancelRegistration({ eventId: event.id });
    await actAs(organizer.id);
    const after = await getEventRegistrations(event.id);
    expect(after.map((r) => [r.email, r.cancelledAt === null])).toEqual(
      expect.arrayContaining([
        [a.email, false],
        [b.email, true],
      ]),
    );
  });

  it('is only for whoever manages the event', async () => {
    const event = await createTestEvent();
    const other = await createTestEvent();
    const [regular, otherOrganizer] = [await createUser(), await createOrganizer(other.id)];

    for (const userId of [regular.id, otherOrganizer.id, undefined]) {
      await actAs(userId);
      await expect(getEventRegistrations(event.id)).rejects.toThrow('No autorizado');
      await expect(getEventWaitlist(event.id)).rejects.toThrow('No autorizado');
    }
  });

  it('stops working for organizers once the event is soft-deleted (admins still can)', async () => {
    const event = await createTestEvent();
    const organizer = await createOrganizer(event.id);
    const admin = await createAdmin();
    await prisma.event.update({ where: { id: event.id }, data: { deletedAt: new Date() } });

    await actAs(organizer.id);
    await expect(getEventRegistrations(event.id)).rejects.toThrow('No autorizado');
    await actAs(admin.id);
    await expect(getEventRegistrations(event.id)).resolves.toEqual([]);
  });
});

describe('updateEvent frees spots for the waitlist', () => {
  it('promotes people in order when the capacity grows', async () => {
    const event = await createTestEvent({ capacity: 1 });
    const organizer = await createOrganizer(event.id);
    const [a, b, c, d] = await createUsers(4);
    await registerInOrder(event.id, [a.id, b.id, c.id, d.id]);

    await actAs(organizer.id);
    await expect(
      updateEvent(event.id, {
        name: event.name,
        description: event.description,
        date: event.date.toISOString(),
        city: 'Ciudad',
        address: 'Calle Falsa 123',
        placeName: 'Lugar',
        capacity: 3,
      }),
    ).rejects.toThrow(`NEXT_REDIRECT:/eventos/${event.id}`);

    const active = await prisma.eventRegistration.findMany({
      where: { eventId: event.id, cancelledAt: null },
    });
    expect(active.map((r) => r.userId).sort()).toEqual([a.id, b.id, c.id].sort());
    expect(await getWaitlistPosition(event.id, d.id)).toBe(1);
    expect((sendEmail as jest.Mock).mock.calls.map(([arg]) => arg.to)).toEqual([b.email, c.email]);
  });
});
