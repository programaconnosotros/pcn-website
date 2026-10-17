import { render, screen } from '@testing-library/react';
import { HistoriaEvents } from '@/components/historia/historia-events';
import { HistoriaPeopleProvider } from '@/components/historia/historia-person';
import { getAdminUser } from '@/lib/admin';
import { getHistoriaEvents, type HistoriaEvent } from '@/lib/historia-events';
import { getIdentityMap } from '@/lib/identity-links';
import { renderInPlatform } from '@/test/platform';
import Loading from './loading';
import PCNStory, { metadata } from './page';

jest.mock('@/lib/admin', () => ({ getAdminUser: jest.fn() }));
jest.mock('@/lib/historia-events', () => ({ getHistoriaEvents: jest.fn() }));
jest.mock('@/lib/identity-links', () => ({ getIdentityMap: jest.fn() }));
jest.mock('@/components/historia/historia-person', () => ({
  HistoriaPeopleProvider: jest.fn(({ children }) => <>{children}</>),
  HistoriaTaggingBar: () => null,
  HistoriaPerson: ({ name, children }: { name: string; children?: React.ReactNode }) => (
    <span data-testid="person">{children ?? name}</span>
  ),
}));
jest.mock('@/components/historia/historia-events', () => ({
  HistoriaEvents: jest.fn(() => <ul aria-label="eventos" />),
}));
jest.mock('@/components/historia/historia-image', () => ({
  HistoriaImage: () => null,
  HistoriaGallery: () => null,
}));
jest.mock('@/components/historia/table-of-contents', () => ({ TableOfContents: () => null }));

const events = [{ id: 'evt-1' }] as unknown as HistoriaEvent[];
const links = { 'Agustín Sánchez': { id: 'u1', name: 'Agus', image: null } };

const renderPage = async () => renderInPlatform(await PCNStory());

describe('PCNStory', () => {
  beforeEach(() => {
    jest.mocked(getIdentityMap).mockResolvedValue(links as never);
    jest.mocked(getHistoriaEvents).mockResolvedValue(events);
    jest.mocked(getAdminUser).mockResolvedValue(null);
  });

  it('tells the story, tagging the founders and linking their profiles', async () => {
    await renderPage();
    expect(getIdentityMap).toHaveBeenCalledWith('historia');
    expect(jest.mocked(HistoriaPeopleProvider).mock.calls[0][0]).toMatchObject({
      links,
      isAdmin: false,
    });
    expect(screen.getByRole('heading', { name: /Comienzos en la UTN-FRT/ })).toBeInTheDocument();
    expect(screen.getAllByText('Agustín Sánchez').length).toBeGreaterThan(0);
  });

  it('shows the real events next to each era of flyers', async () => {
    await renderPage();
    const calls = jest.mocked(HistoriaEvents).mock.calls;
    expect(calls.length).toBeGreaterThan(1);
    for (const [props] of calls) {
      expect(props.events).toBe(events);
      expect(props.flyers.length).toBeGreaterThan(0);
    }
  });

  it('lets an admin tag people', async () => {
    jest.mocked(getAdminUser).mockResolvedValue({ id: 'admin' } as never);
    await renderPage();
    expect(jest.mocked(HistoriaPeopleProvider).mock.calls[0][0].isAdmin).toBe(true);
  });

  it('describes the page for social cards', () => {
    expect(metadata.openGraph).toMatchObject({ title: 'Nuestra historia | programaConNosotros' });
  });
});

describe('historia route files', () => {
  it('renders a loading skeleton', () => {
    const { container } = render(<Loading />);
    expect(container.firstChild).not.toBeNull();
  });
});
