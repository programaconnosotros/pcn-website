import { screen } from '@testing-library/react';
import { PartnersSection } from '@/components/home/partners-section';
import { PARTNER_CONTACT_URL } from '@/data/partners';
import { expectOnlyPlaceholders, renderPage } from '@/test/pages-m-z';
import Loading from './loading';
import Image, { alt } from './opengraph-image';
import Partners, { metadata } from './page';

jest.mock('@/components/home/partners-section', () => ({
  PartnersSection: jest.fn(() => <p>logos</p>),
}));
jest.mock('@/lib/og/section-cards', () => require('@/test/pages-m-z').mockSectionCards());
jest.mock('@/lib/og/terminal-card', () => require('@/test/pages-m-z').mockTerminalCard());

describe('/partners', () => {
  it('has its title and share cards', () => {
    expect(metadata.title).toBe('ls ~/partners');
    expect(metadata.openGraph).toMatchObject({ title: 'Partners | programaConNosotros' });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('lists the partners without the home heading and invites new ones', async () => {
    await renderPage(Partners());

    expect(screen.getByText('logos')).toBeInTheDocument();
    expect(jest.mocked(PartnersSection).mock.calls[0][0]).toEqual({ showHeading: false });
    const join = screen.getByRole('link', { name: /sumate como partner/ });
    expect(join).toHaveAttribute('href', PARTNER_CONTACT_URL);
    expect(join).toHaveAttribute('target', '_blank');
    expect(join).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses the partners section card for link previews', async () => {
    expect(alt).toBe('partners · programaConNosotros');
    await expect(Image()).resolves.toEqual({ section: 'partners' });
  });

  it('shows only placeholders while loading', () => {
    expectOnlyPlaceholders(<Loading />);
  });
});
