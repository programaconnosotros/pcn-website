import { render } from '@testing-library/react';
import { fetchPublicTalks } from '@/actions/talks/fetch-public-talks';
import { CharlasAdminWrapper } from '@/components/talks/charlas-admin-wrapper';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import Loading from './loading';
import Talks, { metadata } from './page';
import { testVideos } from '@/test/recommendations';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/actions/talks/fetch-public-talks', () => ({ fetchPublicTalks: jest.fn() }));
jest.mock('@/lib/recommendations', () => require('@/test/recommendations').mockRecommendations());
jest.mock('@/components/talks/charlas-admin-wrapper', () => ({
  CharlasAdminWrapper: jest.fn(() => null),
}));

const talks = [{ id: 't1', title: 'Testing en serio' }];
const externalTalks = testVideos.filter((video) => video.isTalk);
const wrapperProps = () => jest.mocked(CharlasAdminWrapper).mock.calls[0][0];

describe('Talks page', () => {
  beforeEach(() => {
    jest.mocked(fetchPublicTalks).mockResolvedValue(talks as never);
  });

  it('has a terminal tab title and a readable share card', () => {
    expect(metadata.title).toBe('ls ~/charlas');
    expect(metadata.openGraph).toMatchObject({
      title: 'Charlas técnicas | programaConNosotros',
      url: expect.stringMatching(/\/charlas$/),
    });
  });

  it('lists the public talks without admin tools for anonymous visitors', async () => {
    mockCookies();
    render(await Talks());

    expect(findSession).not.toHaveBeenCalled();
    expect(wrapperProps()).toEqual({ talks, externalTalks, isAdmin: false });
  });

  it('keeps admin tools away from members', async () => {
    mockCookies({ sessionId: 's1' });
    jest.mocked(findSession).mockResolvedValue({ user: { role: 'USER' } } as never);
    render(await Talks());

    expect(findSession).toHaveBeenCalledWith('s1');
    expect(wrapperProps()).toEqual({ talks, externalTalks, isAdmin: false });
  });

  it('turns on the admin tools for admins', async () => {
    mockCookies({ sessionId: 's1' });
    jest.mocked(findSession).mockResolvedValue({ user: { role: 'ADMIN' } } as never);
    render(await Talks());

    expect(wrapperProps()).toEqual({ talks, externalTalks, isAdmin: true });
  });

  it('treats an expired session as anonymous', async () => {
    mockCookies({ sessionId: 'gone' });
    jest.mocked(findSession).mockResolvedValue(null);
    render(await Talks());

    expect(wrapperProps()).toEqual({ talks, externalTalks, isAdmin: false });
  });
});

describe('charlas loading', () => {
  it('renders only placeholders', () => {
    const { container } = render(<Loading />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(container).toHaveTextContent('');
  });
});
