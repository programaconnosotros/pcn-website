import { screen } from '@testing-library/react';
import { WorkPlacesClient } from '@/components/work-places/work-places-client';
import { listWorkPlaces } from '@/lib/work-places';
import { findSession } from '@/lib/session';
import { mockCookies } from '@/test/cookies';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import Loading from './loading';
import LugaresPage, { metadata } from './page';

jest.mock('next/headers', () => ({ cookies: jest.fn() }));
jest.mock('@/lib/work-places', () => ({ listWorkPlaces: jest.fn() }));
jest.mock('@/lib/session', () => ({ findSession: jest.fn() }));
jest.mock('@/components/work-places/work-places-client', () => ({
  WorkPlacesClient: jest.fn(() => <p>lugares</p>),
}));

describe('/lugares', () => {
  beforeEach(() => jest.mocked(listWorkPlaces).mockResolvedValue([{ id: 'wp1' }] as never));

  it('describes the page', () => {
    expect(metadata.description).toMatch(/wifi/);
  });

  it('hands the places to the list, without a viewer for visitors', async () => {
    mockCookies();
    await renderPage(LugaresPage());

    expect(screen.getByText('lugares')).toBeInTheDocument();
    expect(jest.mocked(WorkPlacesClient).mock.calls[0][0]).toEqual({
      places: [{ id: 'wp1' }],
      viewer: null,
    });
  });

  it('tells the list who is looking, and whether they are an admin', async () => {
    mockCookies({ sessionId: 's1' });
    jest.mocked(findSession).mockResolvedValue({ userId: 'u1', user: { role: 'ADMIN' } } as never);

    await renderPage(LugaresPage());

    expect(jest.mocked(WorkPlacesClient).mock.calls[0][0].viewer).toEqual({
      id: 'u1',
      isAdmin: true,
    });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
