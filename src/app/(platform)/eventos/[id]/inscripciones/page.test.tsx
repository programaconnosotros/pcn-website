import { render, screen, within } from '@testing-library/react';
import { fetchEvent } from '@/actions/events/fetch-event';
import {
  getEventRegistrations,
  getEventWaitlist,
  type EventRegistrationRow,
} from '@/actions/events/get-event-registrations';
import { RegistrationsDataTable } from '@/components/events/registrations-data-table';
import { getEventManager } from '@/lib/event-access';
import { buildEvent } from '@/test/events';
import { buildSession, renderInPlatform } from '@/test/platform';
import EventRegistrationsPage, { generateMetadata } from './page';
import Loading from './loading';

jest.mock('@/lib/event-access', () => ({ getEventManager: jest.fn() }));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: { eventBroadcast: { findMany: jest.fn(async () => []) } },
}));
jest.mock('@/actions/events/fetch-event', () => ({ fetchEvent: jest.fn() }));
jest.mock('@/actions/events/get-event-registrations', () => ({
  getEventRegistrations: jest.fn(),
  getEventWaitlist: jest.fn(),
}));
jest.mock('@/actions/events/event-broadcast', () => ({
  getBroadcastAudienceCounts: jest.fn(async () => ({
    confirmados: 2,
    'lista-de-espera': 1,
    todos: 3,
  })),
}));
jest.mock('@/components/events/event-broadcast-form', () => ({
  EventBroadcastForm: () => <p>broadcast</p>,
}));
jest.mock('@/components/events/registrations-data-table', () => ({
  RegistrationsDataTable: jest.fn(() => <div data-testid="registrations" />),
}));

const params = { params: Promise.resolve({ id: 'e1' }) };

const row = (overrides: Partial<EventRegistrationRow>) =>
  ({
    id: 'r',
    cancelledAt: null,
    career: null,
    studyPlace: null,
    jobTitle: null,
    enterprise: null,
    ...overrides,
  }) as EventRegistrationRow;

const stat = (label: string) => screen.getByText(label).parentElement!;

const asManager = () =>
  jest.mocked(getEventManager).mockResolvedValue(buildSession().user as never);

describe('EventRegistrationsPage', () => {
  it('sends people who do not manage the event back to it', async () => {
    jest.mocked(getEventManager).mockResolvedValue(null as never);
    await expect(EventRegistrationsPage(params)).rejects.toThrow('NEXT_REDIRECT:/eventos/e1');
  });

  it('sends managers to the events list when the event is gone', async () => {
    asManager();
    jest.mocked(fetchEvent).mockResolvedValue(null);
    await expect(EventRegistrationsPage(params)).rejects.toThrow(/^NEXT_REDIRECT:\/eventos$/);
  });

  it('summarizes active registrations, students, professionals and the waitlist', async () => {
    asManager();
    jest.mocked(fetchEvent).mockResolvedValue(buildEvent({ capacity: 30 }) as never);
    const registrations = [
      row({ id: 'r1', career: 'Sistemas', studyPlace: 'UTN' }),
      row({ id: 'r2', jobTitle: 'Dev', enterprise: 'Acme' }),
      row({ id: 'r3', career: 'Sistemas' }),
      row({ id: 'r4', jobTitle: 'Dev', enterprise: 'Acme', cancelledAt: new Date() }),
    ];
    jest.mocked(getEventRegistrations).mockResolvedValue(registrations);
    jest.mocked(getEventWaitlist).mockResolvedValue([
      {
        id: 'w1',
        position: 1,
        name: 'Wanda',
        email: 'wanda@example.com',
        createdAt: new Date('2030-05-01T12:00:00Z'),
      },
    ] as never);
    renderInPlatform(await EventRegistrationsPage(params));

    expect(stat('activas')).toHaveTextContent('3');
    expect(stat('activas').parentElement).toHaveTextContent('1 cancelada');
    expect(stat('estudiantes').parentElement).toHaveTextContent('1');
    expect(stat('profesionales').parentElement).toHaveTextContent('1');
    expect(stat('en espera').parentElement).toHaveTextContent('cupo: 30');
    const waitlist = screen.getByText(/lista de espera · 1/).closest('section')!;
    expect(within(waitlist).getByText('Wanda')).toBeInTheDocument();
    expect(within(waitlist).getByText('wanda@example.com')).toBeInTheDocument();
    expect(screen.getByText(/inscripciones · 4 total/)).toBeInTheDocument();
    expect(jest.mocked(RegistrationsDataTable).mock.calls[0][0]).toEqual({ data: registrations });
  });

  it('hides the waitlist when nobody is waiting and says the event has no capacity', async () => {
    asManager();
    jest.mocked(fetchEvent).mockResolvedValue(buildEvent() as never);
    jest
      .mocked(getEventRegistrations)
      .mockResolvedValue([
        row({ cancelledAt: new Date() }),
        row({ id: 'r2', cancelledAt: new Date() }),
      ]);
    jest.mocked(getEventWaitlist).mockResolvedValue([]);
    renderInPlatform(await EventRegistrationsPage(params));

    expect(screen.queryByText(/lista de espera/)).not.toBeInTheDocument();
    expect(stat('activas').parentElement).toHaveTextContent('2 canceladas');
    expect(stat('en espera').parentElement).toHaveTextContent('sin cupo');
  });

  it('has a tab title and a loading placeholder', async () => {
    expect((await generateMetadata()).title).toMatch(/inscripciones/);
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
  });
});
