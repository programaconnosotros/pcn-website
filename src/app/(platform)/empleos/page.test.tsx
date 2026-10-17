import { screen } from '@testing-library/react';
import { getCurrentSession } from '@/actions/auth/get-current-session';
import { listOpenJobOffers } from '@/lib/job-offers';
import { expectOnlyPlaceholders, renderPage, sessionRow } from '@/test/pages-m-z';
import Loading from './loading';
import EmpleosPage, { metadata } from './page';

jest.mock('@/actions/auth/get-current-session', () => ({ getCurrentSession: jest.fn() }));
jest.mock('@/lib/job-offers', () => ({ listOpenJobOffers: jest.fn() }));
jest.mock('@/actions/job-offers/job-offers', () => ({}));

describe('/empleos', () => {
  it('describes the board', () => {
    expect(metadata.description).toMatch(/Búsquedas laborales/);
  });

  it('lists the open offers and lets members post one', async () => {
    jest.mocked(listOpenJobOffers).mockResolvedValue([]);
    jest.mocked(getCurrentSession).mockResolvedValue(sessionRow());

    await renderPage(EmpleosPage());

    expect(screen.getByText('0 ofertas abiertas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /publicarOferta/ })).toBeInTheDocument();
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
