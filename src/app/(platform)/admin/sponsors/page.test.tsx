import { screen, within } from '@testing-library/react';
import { requireAdminPage } from '@/lib/admin';
import { getSponsorClickReport } from '@/lib/sponsor-clicks-report';
import { renderInPlatform } from '@/test/platform';
import SponsorClicksPage, { metadata } from './page';

jest.mock('@/lib/admin', () => ({ requireAdminPage: jest.fn() }));
jest.mock('@/lib/sponsor-clicks-report', () => ({
  RECENT_DAYS: 30,
  getSponsorClickReport: jest.fn(),
}));

describe('/admin/sponsors', () => {
  it('is an admin page out of search results', () => {
    expect(metadata.title).toBe('sudo ls ~/admin/sponsors');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('shows how many clicks each sponsor got and where', async () => {
    jest.mocked(getSponsorClickReport).mockResolvedValue([
      {
        name: 'Acme',
        event: { id: 'e1', name: 'Meetup' },
        total: 9,
        recent: 4,
        lastClickAt: new Date('2026-10-05T15:00:00Z'),
        bySource: { evento: 9 },
      },
      {
        name: 'Dizenz',
        event: null,
        total: 7,
        recent: 3,
        lastClickAt: new Date('2026-10-02T15:00:00Z'),
        bySource: { inicio: 5, partners: 2 },
      },
      { name: 'Xetro', event: null, total: 0, recent: 0, lastClickAt: null, bySource: {} },
    ]);

    renderInPlatform(await SponsorClicksPage());

    expect(requireAdminPage).toHaveBeenCalled();
    expect(screen.getByText('16 clics en 3 sponsors')).toBeInTheDocument();
    const [, acme, dizenz, xetro] = screen.getAllByRole('row');
    expect(within(acme).getByRole('link', { name: 'evento: Meetup' })).toHaveAttribute(
      'href',
      '/eventos/e1',
    );
    expect(dizenz).toHaveTextContent('partner del sitio');
    expect(dizenz).toHaveTextContent('inicio 5 · partners 2');
    expect(xetro).toHaveTextContent('Xetro');
    expect(within(xetro).getAllByText('—')).toHaveLength(2);
  });

  it('sends everyone else away before reading anything', async () => {
    jest.mocked(requireAdminPage).mockRejectedValueOnce(new Error('NEXT_REDIRECT:/'));
    await expect(SponsorClicksPage()).rejects.toThrow('NEXT_REDIRECT:/');
    expect(getSponsorClickReport).not.toHaveBeenCalled();
  });
});
