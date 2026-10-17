import { render, screen } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { buildSession, renderInPlatform } from '@/test/platform';
import NewEventPage, { metadata } from './page';
import Loading from './loading';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/components/events/new-event-form', () => ({
  NewEventForm: () => <form aria-label="nuevo evento" />,
}));

const sessionAs = (role: 'USER' | 'ADMIN', isAmbassador = false) => {
  const session = buildSession({ role });
  Object.assign(session.user, { isAmbassador });
  jest.mocked(getCurrentSession).mockResolvedValue(session);
};

describe('NewEventPage', () => {
  it('sends anonymous visitors back to the events list', async () => {
    jest.mocked(getCurrentSession).mockResolvedValue(null);
    await expect(NewEventPage()).rejects.toThrow('NEXT_REDIRECT:/eventos');
  });

  it('sends members who cannot create events back to the events list', async () => {
    sessionAs('USER');
    await expect(NewEventPage()).rejects.toThrow('NEXT_REDIRECT:/eventos');
  });

  it.each([
    ['an admin', 'ADMIN' as const, false],
    ['an ambassador', 'USER' as const, true],
  ])('shows the form to %s', async (_label, role, isAmbassador) => {
    sessionAs(role, isAmbassador);
    renderInPlatform(await NewEventPage());

    expect(screen.getByRole('form', { name: 'nuevo evento' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toHaveTextContent('nuevo');
  });

  it('has a tab title', () => {
    expect(metadata.title).toBeTruthy();
  });

  it('loads with placeholders only', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
  });
});
