import { screen } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { fetchEvent } from '@/actions/events/fetch-event';
import { EventOrganizersManager } from '@/components/events/event-organizers-manager';
import { buildEvent } from '@/test/events';
import { buildSession, renderInPlatform } from '@/test/platform';
import OrganizersPage, { metadata } from './page';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/actions/events/fetch-event', () => ({ fetchEvent: jest.fn() }));
jest.mock('@/components/events/event-organizers-manager', () => ({
  EventOrganizersManager: jest.fn(() => <div data-testid="manager" />),
}));

const olga = { id: 'org-1', name: 'Olga', image: null };
const event = {
  ...buildEvent({ createdById: 'amb-1' }),
  organizers: [{ userId: 'org-1', user: olga }],
};
const params = { params: Promise.resolve({ id: 'e1' }) };

const sessionAs = (id: string, role: 'USER' | 'ADMIN' = 'USER', isAmbassador = false) => {
  const session = buildSession({ id, role });
  Object.assign(session.user, { isAmbassador });
  jest.mocked(getCurrentSession).mockResolvedValue(session);
};

beforeEach(() => jest.mocked(fetchEvent).mockResolvedValue(event as never));

describe('OrganizersPage', () => {
  it('sends people to the events list when the event is gone', async () => {
    jest.mocked(fetchEvent).mockResolvedValue(null);
    sessionAs('user-1', 'ADMIN');
    await expect(OrganizersPage(params)).rejects.toThrow(/^NEXT_REDIRECT:\/eventos$/);
  });

  it('sends anonymous visitors and members who do not manage it back to the event', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(null);
    await expect(OrganizersPage(params)).rejects.toThrow('NEXT_REDIRECT:/eventos/e1');
    sessionAs('someone');
    await expect(OrganizersPage(params)).rejects.toThrow('NEXT_REDIRECT:/eventos/e1');
  });

  it('shows an organizer the team without letting them change it', async () => {
    sessionAs('org-1');
    renderInPlatform(await OrganizersPage(params));

    expect(screen.getByText('1 organizadores')).toBeInTheDocument();
    expect(jest.mocked(EventOrganizersManager).mock.calls[0][0]).toEqual({
      eventId: 'e1',
      organizers: [olga],
      canManage: false,
    });
  });

  it('lets the ambassador who created the event manage the team', async () => {
    sessionAs('amb-1', 'USER', true);
    renderInPlatform(await OrganizersPage(params));
    expect(jest.mocked(EventOrganizersManager).mock.calls[0][0]).toMatchObject({
      canManage: true,
    });
  });

  it('has a tab title', () => {
    expect(metadata.title).toMatch(/organizadores/);
  });
});
