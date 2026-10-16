import { screen } from '@testing-library/react';
import { requireAdminPage } from '@/lib/admin';
import { countModerationQueues, listPendingReports } from '@/lib/content-reports';
import { renderPage } from '@/test/pages-m-z';
import ModerationPage, { metadata } from './page';

jest.mock('@/lib/admin', () => ({ requireAdminPage: jest.fn() }));
jest.mock('@/lib/content-reports', () => ({
  listPendingReports: jest.fn(),
  countModerationQueues: jest.fn(),
}));
jest.mock('@/actions/moderation/content-reports', () => ({ reviewReports: jest.fn() }));

describe('/admin/moderacion', () => {
  it('stays out of search engines', () => {
    expect(metadata).toMatchObject({ robots: { index: false, follow: false } });
  });

  it('is for admins, and links every review queue with its count', async () => {
    jest.mocked(listPendingReports).mockResolvedValue([]);
    jest
      .mocked(countModerationQueues)
      .mockResolvedValue({ reports: 0, photos: 3, recommendations: 1, proposals: 0 });

    await renderPage(ModerationPage());

    expect(requireAdminPage).toHaveBeenCalled();
    expect(screen.getByText('0 reportes pendientes')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /fotos\s*3/ })).toHaveAttribute(
      'href',
      '/galeria/pendientes',
    );
    expect(screen.getByRole('link', { name: /recomendaciones\s*1/ })).toHaveAttribute(
      'href',
      '/admin/recomendaciones',
    );
    expect(screen.getByText('No hay reportes pendientes')).toBeInTheDocument();
  });
});
