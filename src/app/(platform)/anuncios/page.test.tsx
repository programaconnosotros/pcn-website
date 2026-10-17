import { render } from '@testing-library/react';
import {
  fetchAllAnnouncements,
  fetchAnnouncements,
} from '@/actions/announcements/get-announcements';
import { getEventsForSelect } from '@/actions/announcements/get-events-for-select';
import { AnnouncementsWrapper } from '@/components/announcements/announcements-wrapper';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import Loading from './loading';
import AnunciosPage, { metadata } from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/announcements/get-announcements', () => ({
  fetchAnnouncements: jest.fn(),
  fetchAllAnnouncements: jest.fn(),
}));
jest.mock('@/actions/announcements/get-events-for-select', () => ({
  getEventsForSelect: jest.fn(),
}));
jest.mock('@/components/announcements/announcements-wrapper', () => ({
  AnnouncementsWrapper: jest.fn(() => null),
}));

const published = [{ id: 'a1', title: 'Publicado' }];
const all = [...published, { id: 'a2', title: 'Borrador' }];
const events = [{ id: 'e1', name: 'Meetup' }];

const wrapperProps = () => jest.mocked(AnnouncementsWrapper).mock.calls[0][0];

describe('AnunciosPage', () => {
  beforeEach(() => {
    jest.mocked(fetchAnnouncements).mockResolvedValue(published as never);
    jest.mocked(fetchAllAnnouncements).mockResolvedValue(all as never);
    jest.mocked(getEventsForSelect).mockResolvedValue(events as never);
  });

  it('has a terminal tab title and a readable share card', () => {
    expect(metadata.title).toBe('ls ~/anuncios');
    expect(metadata.openGraph).toMatchObject({
      title: 'Anuncios | programaConNosotros',
      url: expect.stringMatching(/\/anuncios$/),
    });
  });

  it('shows anonymous visitors only the published announcements', async () => {
    mockCookies();
    render(await AnunciosPage());

    expect(findSession).not.toHaveBeenCalled();
    expect(fetchAllAnnouncements).not.toHaveBeenCalled();
    expect(getEventsForSelect).not.toHaveBeenCalled();
    expect(wrapperProps()).toEqual({ announcements: published, events: [], isAdmin: false });
  });

  it('shows members only the published announcements', async () => {
    mockCookies({ sessionId: 's1' });
    jest.mocked(findSession).mockResolvedValue({ user: { role: 'USER' } } as never);
    render(await AnunciosPage());

    expect(findSession).toHaveBeenCalledWith('s1');
    expect(wrapperProps()).toEqual({ announcements: published, events: [], isAdmin: false });
  });

  it('treats an expired session as anonymous', async () => {
    mockCookies({ sessionId: 'gone' });
    jest.mocked(findSession).mockResolvedValue(null);
    render(await AnunciosPage());

    expect(wrapperProps()).toMatchObject({ isAdmin: false, announcements: published });
  });

  it('gives admins every announcement, drafts included, and the events to link', async () => {
    mockCookies({ sessionId: 's1' });
    jest.mocked(findSession).mockResolvedValue({ user: { role: 'ADMIN' } } as never);
    render(await AnunciosPage());

    expect(fetchAnnouncements).not.toHaveBeenCalled();
    expect(wrapperProps()).toEqual({ announcements: all, events, isAdmin: true });
  });
});

describe('anuncios loading', () => {
  it('renders only placeholders', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
  });
});
