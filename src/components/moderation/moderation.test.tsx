import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { reportContent, reviewReports } from '@/actions/moderation/content-reports';
import type { ReportGroup } from '@/lib/content-reports';
import { ReportButton } from './report-button';
import { ReportQueue } from './report-queue';

const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/actions/moderation/content-reports', () => ({
  reportContent: jest.fn(),
  reviewReports: jest.fn(),
}));

describe('ReportButton', () => {
  it('renders nothing when hidden', () => {
    const { container } = render(<ReportButton contentType="setup" contentId="s1" hidden />);
    expect(container).toBeEmptyDOMElement();
  });

  it('asks for a reason, sends the report and shows why it failed', async () => {
    jest
      .mocked(reportContent)
      .mockResolvedValueOnce({ success: false, error: 'Ya lo reportaste' })
      .mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<ReportButton contentType="forum_comment" contentId="c1" />);

    await user.click(screen.getByRole('button', { name: /reportar/ }));
    expect(
      screen.getByRole('heading', { name: 'Reportar respuesta del foro' }),
    ).toBeInTheDocument();
    const send = screen.getByRole('button', { name: 'reportar();' });
    expect(send).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Acoso o ataque a una persona' }));
    await user.type(screen.getByLabelText(/Contanos más/), 'Insulta');
    await user.click(send);
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya lo reportaste');

    await user.click(send);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(reportContent).toHaveBeenLastCalledWith({
      contentType: 'forum_comment',
      contentId: 'c1',
      reason: 'acoso',
      details: 'Insulta',
    });
  });
});

describe('ReportQueue', () => {
  const group = (overrides: Partial<ReportGroup> = {}): ReportGroup => ({
    contentType: 'forum_post',
    contentId: 'p1',
    content: { ownerId: 'u1', preview: 'Vendo cursos', href: '/foro/tema/p1' },
    reports: [
      {
        id: 'r1',
        reason: 'spam',
        details: 'Publicidad',
        createdAt: new Date('2026-10-01T12:00:00Z'),
        reporter: { id: 'u2', name: 'Ana' },
      },
    ],
    ...overrides,
  });

  it('says when there is nothing to review', () => {
    render(<ReportQueue groups={[]} />);
    expect(screen.getByText('No hay reportes pendientes')).toBeInTheDocument();
  });

  it('shows each reported thing with its reports and closes them', async () => {
    jest.mocked(reviewReports).mockResolvedValue({ success: true, count: 1 });
    const user = userEvent.setup();
    render(<ReportQueue groups={[group(), group({ contentId: 'gone', content: null })]} />);

    expect(screen.getAllByRole('link', { name: 'Vendo cursos' })[0]).toHaveAttribute(
      'href',
      '/foro/tema/p1',
    );
    expect(screen.getAllByText('Spam o publicidad')).toHaveLength(2);
    expect(screen.getAllByText('Publicidad')).toHaveLength(2);
    expect(screen.getByText(/ya no existe/)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'resuelto();' })[0]);
    await waitFor(() =>
      expect(reviewReports).toHaveBeenCalledWith({
        contentType: 'forum_post',
        contentId: 'p1',
        status: 'RESOLVED',
      }),
    );
    expect(refresh).toHaveBeenCalled();
    await user.click(screen.getAllByRole('button', { name: 'descartar();' })[1]);
    await waitFor(() =>
      expect(reviewReports).toHaveBeenLastCalledWith(
        expect.objectContaining({ contentId: 'gone', status: 'DISMISSED' }),
      ),
    );
  });
});
