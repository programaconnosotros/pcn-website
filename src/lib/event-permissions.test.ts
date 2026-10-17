import {
  canCreateEvents,
  canDeleteEvent,
  canEditEvent,
  canManageEventOrganizers,
} from './event-permissions';

const admin = { id: 'admin', role: 'ADMIN', isAmbassador: false };
const ambassador = { id: 'amb', role: 'REGULAR', isAmbassador: true };
const otherAmbassador = { id: 'amb-2', role: 'REGULAR', isAmbassador: true };
const regular = { id: 'reg', role: 'REGULAR', isAmbassador: false };

const ownEvent = { createdById: 'amb', organizers: [] };
const sharedEvent = { createdById: 'someone', organizers: [{ userId: 'amb' }] };
const foreignEvent = { createdById: 'someone', organizers: [{ userId: 'amb-2' }] };

describe('event permissions', () => {
  it('lets admins and ambassadors create events', () => {
    expect(canCreateEvents(admin)).toBe(true);
    expect(canCreateEvents(ambassador)).toBe(true);
    expect(canCreateEvents(regular)).toBe(false);
    expect(canCreateEvents(null)).toBe(false);
  });

  it('lets ambassadors edit the events they created or administer', () => {
    expect(canEditEvent(ambassador, ownEvent)).toBe(true);
    expect(canEditEvent(ambassador, sharedEvent)).toBe(true);
    expect(canEditEvent(ambassador, foreignEvent)).toBe(false);
    expect(canEditEvent(admin, foreignEvent)).toBe(true);
  });

  it('lets any user set as event admin edit it', () => {
    expect(canEditEvent({ ...ambassador, isAmbassador: false }, sharedEvent)).toBe(true);
    expect(canEditEvent(regular, { createdById: 'someone', organizers: [{ userId: 'reg' }] })).toBe(
      true,
    );
  });

  it('stops counting creators who are no longer ambassadors', () => {
    expect(canEditEvent(regular, { createdById: 'reg', organizers: [] })).toBe(false);
    expect(canDeleteEvent(regular, { createdById: 'reg', organizers: [] })).toBe(false);
  });

  it('only lets the ambassador who created an event delete it', () => {
    expect(canDeleteEvent(ambassador, ownEvent)).toBe(true);
    expect(canDeleteEvent(ambassador, sharedEvent)).toBe(false);
    expect(canDeleteEvent(otherAmbassador, ownEvent)).toBe(false);
    expect(canDeleteEvent(admin, foreignEvent)).toBe(true);
    expect(canManageEventOrganizers(ambassador, sharedEvent)).toBe(false);
  });

  it('keeps deleted events for admins only', () => {
    const deleted = { ...ownEvent, deletedAt: new Date() };
    expect(canEditEvent(ambassador, deleted)).toBe(false);
    expect(canDeleteEvent(ambassador, deleted)).toBe(false);
    expect(canEditEvent(admin, deleted)).toBe(true);
  });
});
